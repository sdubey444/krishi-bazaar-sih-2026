import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, X, Send, Loader2, Bot, ShieldAlert, CheckCircle2, Keyboard } from 'lucide-react';
import { askKrishiAi } from '../services/geminiService';
import { processNaturalQuery, processConversation, getAssistantMetaForRole, resolveRole } from '../services/nluService';
import { locationService } from '../services/locationService';
import { i18n } from '../services/i18nService';
import { store } from '../services/store';

/**
 * KrishiVoiceOverlay
 * A small, Siri-style listening indicator anchored near the bottom of the screen.
 * It replaces the previous large "assistant modal" activation UX:
 *   Tap Krishi AI -> listening indicator -> speech-to-text -> NLU/AI intent
 *   -> safe structured website action -> concise response -> indicator disappears.
 *
 * All NLP / AI / role context / website-action logic is preserved by reusing the
 * same services the large modal used (nluService, geminiService, store).
 */
export default function KrishiVoiceOverlay({
  isOpen,
  onClose,
  defaultCropId = 'wheat',
  onNavigate = null,
  currentUser = null,
  currentRole = null,
  currentView = 'landing'
}) {
  const activeRole = currentRole || currentUser?.role || resolveRole({ currentUser, currentView });
  const [currentLang, setCurrentLang] = useState(() => i18n.getLanguage());
  const assistantMeta = getAssistantMetaForRole(activeRole, currentLang);
  const isHi = currentLang === 'hi';

  // 'listening' | 'processing' | 'response' | 'error' | 'text'
  const [phase, setPhase] = useState('listening');
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [inputText, setInputText] = useState('');
  const [pendingConfirmationAction, setPendingConfirmationAction] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(() => locationService.getLocationContext());

  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const dismissTimerRef = useRef(null);

  useEffect(() => {
    const unsubLoc = locationService.subscribe(loc => setCurrentLocation(loc || locationService.getLocationContext()));
    const unsubLang = i18n.subscribe(lang => setCurrentLang(lang));
    return () => {
      unsubLoc();
      unsubLang();
    };
  }, []);

  const clearDismissTimer = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  };

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    clearDismissTimer();
    stopRecognition();
    if (onClose) onClose();
  }, [onClose, stopRecognition]);

  // ============================================================
  // CORE QUERY PROCESSOR (shared by voice + text fallback)
  // ============================================================
  const executeQuery = useCallback(async (queryText, isVoice) => {
    const cleanQuery = (queryText || '').trim();
    if (!cleanQuery) {
      setPhase('listening');
      return;
    }

    setTranscript(cleanQuery);
    setInputText('');
    setPhase('processing');
    setResponseText('');

    try {
      const roleContext = { role: activeRole, currentUser, currentView };

      // Multi-step commands ("X aur Y", "Hindi kar do aur marketplace kholo")
      const convo = processConversation(cleanQuery, defaultCropId, currentLocation, roleContext);
      if (convo.isMultiStep) {
        const answers = [];
        let finalNavigation = null;
        let pendingConfirm = null;

        for (const step of convo.steps) {
          const res = step.result;
          if (!res) continue;

          // Language changes apply immediately and update the whole UI
          if (res.intent === 'CHANGE_LANGUAGE' && res.langCode) {
            i18n.setLanguage(res.langCode);
            if (res.answer) answers.push(res.answer);
            continue;
          }

          // A confirmation-gated step pauses the chain for explicit approval
          if (res.action && (res.requiresConfirmation || res.action.isHighRisk)) {
            pendingConfirm = res.action;
            if (res.answer) answers.push(res.answer);
            continue;
          }

          // Remember the last real navigation to perform after the chain
          if (res.action && res.action.targetView && res.action.targetView !== 'change_language') {
            finalNavigation = res.action;
          }
          if (res.answer) answers.push(res.answer);
        }

        setResponseText(answers.join('\n\n') || (isHi ? 'हो गया।' : 'Done.'));

        if (pendingConfirm) {
          setPendingConfirmationAction(pendingConfirm);
          setPhase('response');
          return;
        }

        setPhase('response');
        dismissTimerRef.current = setTimeout(() => {
          if (finalNavigation && onNavigate) onNavigate(finalNavigation.targetView, finalNavigation.params);
          handleClose();
        }, 1600);
        return;
      }

      const nluResult = processNaturalQuery(cleanQuery, defaultCropId, currentLocation, roleContext);

      // Language change is a safe, immediate action — apply and confirm without leaving the page
      if (nluResult.intent === 'CHANGE_LANGUAGE' && nluResult.langCode) {
        i18n.setLanguage(nluResult.langCode);
        setResponseText(nluResult.answer);
        setPhase('response');
        dismissTimerRef.current = setTimeout(handleClose, 2200);
        return;
      }

      // Supplementary grounded AI context (non-blocking for buy intents)
      let aiExplanation = null;
      try {
        if (cleanQuery.length > 3 && nluResult.intentType !== 'buy') {
          const aiRes = await askKrishiAi(cleanQuery, {
            cropId: nluResult.cropId || defaultCropId,
            location: currentLocation
          });
          if (aiRes && aiRes.text) aiExplanation = aiRes.text;
        }
      } catch (geminiErr) {
        console.warn('[v0] AI fallback used platform records directly', geminiErr);
      }

      const concise = nluResult.answer || aiExplanation || (isHi ? 'समझ गया।' : 'Got it.');
      setResponseText(concise);

      // High-risk actions require explicit confirmation via the small panel
      if (nluResult.action && (nluResult.requiresConfirmation || nluResult.action.isHighRisk)) {
        setPendingConfirmationAction(nluResult.action);
        setPhase('response');
        return;
      }

      // Safe direct navigation action -> execute then dismiss
      if (nluResult.action && nluResult.intentType === 'navigation' && nluResult.action.targetView) {
        setPhase('response');
        dismissTimerRef.current = setTimeout(() => {
          if (onNavigate) onNavigate(nluResult.action.targetView, nluResult.action.params);
          handleClose();
        }, 1400);
        return;
      }

      // Informational response -> show briefly then dismiss
      setPhase('response');
      dismissTimerRef.current = setTimeout(() => {
        handleClose();
      }, 4200);
    } catch (err) {
      console.error('[v0] Voice query error:', err);
      setResponseText(
        isHi
          ? 'माफ़ करें, अभी समझ नहीं पाया। कृपया दोबारा बोलें या लिखें।'
          : 'Sorry, I could not process that. Please try again or type below.'
      );
      setPhase('error');
    }
  }, [activeRole, currentUser, currentView, defaultCropId, currentLocation, isHi, onNavigate, handleClose]);

  // ============================================================
  // START SPEECH RECOGNITION (auto on open)
  // ============================================================
  const startListening = useCallback(() => {
    clearDismissTimer();
    setResponseText('');
    setTranscript('');
    setPendingConfirmationAction(null);

    const SpeechRecognition =
      typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setPhase('text');
      setResponseText(
        isHi
          ? 'इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। कृपया लिखकर पूछें।'
          : 'Voice input is unavailable in this browser. Please type your request.'
      );
      setTimeout(() => inputRef.current?.focus(), 120);
      return;
    }

    try {
      stopRecognition();
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = i18n.getSpeechRecognitionLang();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => setPhase('listening');

      recognition.onresult = (event) => {
        let interim = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += chunk;
          else interim += chunk;
        }
        if (interim) setTranscript(interim);
        if (finalText && finalText.trim()) {
          executeQuery(finalText.trim(), true);
        }
      };

      recognition.onerror = (event) => {
        console.warn('[v0] Speech recognition notice:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPhase('text');
          setResponseText(
            isHi
              ? 'माइक की अनुमति नहीं मिली। कृपया नीचे लिखकर पूछें।'
              : 'Microphone permission denied. Please type your request below.'
          );
          setTimeout(() => inputRef.current?.focus(), 120);
        } else if (event.error === 'no-speech') {
          setPhase('text');
          setResponseText(
            isHi
              ? 'कोई आवाज़ नहीं मिली। दोबारा माइक दबाएँ या लिखें।'
              : 'No speech detected. Tap the mic again or type below.'
          );
        } else {
          setPhase('text');
          setResponseText(
            isHi
              ? 'आवाज़ पहचान में रुकावट। कृपया लिखकर पूछें।'
              : 'Voice recognition failed. Please type your request below.'
          );
        }
      };

      recognition.onend = () => {
        // If listening ended without producing a final result, fall back to text.
        setPhase(prev => {
          if (prev === 'listening') {
            setTimeout(() => inputRef.current?.focus(), 120);
            return 'text';
          }
          return prev;
        });
      };

      recognition.start();
    } catch (e) {
      console.warn('[v0] Speech init notice:', e);
      setPhase('text');
      setResponseText(
        isHi
          ? 'माइक शुरू नहीं हो सका। कृपया लिखकर पूछें।'
          : 'Unable to start microphone. Please type your request below.'
      );
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isHi, executeQuery, stopRecognition]);

  // Auto-activate listening the moment the overlay opens
  useEffect(() => {
    if (isOpen) {
      setInputText('');
      startListening();
    } else {
      clearDismissTimer();
      stopRecognition();
      setPhase('listening');
      setTranscript('');
      setResponseText('');
      setPendingConfirmationAction(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Escape closes the overlay
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  // ============================================================
  // HIGH-RISK CONFIRMATION (agentic buy/sell + risky navigation)
  // ============================================================
  const handleConfirmAction = () => {
    const action = pendingConfirmationAction;
    if (!action) return;
    const params = action.params || {};

    if (action.targetView === 'confirm_agentic_buy' && action.isAgenticAction) {
      try {
        const newOrder = store.createOrder({
          produce: params.cropName || 'Wheat',
          quantity: params.quantity || 500,
          totalQuantity: params.quantity || 500,
          unit: params.unit || 'kg',
          allocations: params.allocations || [],
          status: 'Confirmed',
          buyerId: currentUser?.id,
          buyerName: currentUser?.name || 'AI Buyer',
          destination: currentUser?.location || 'Prayagraj'
        });
        setResponseText(
          isHi
            ? `ऑर्डर पूरा हुआ — ${params.cropName || 'Produce'} ${(params.quantity || 500).toLocaleString()} किलो। ऑर्डर ID: ${newOrder.id}`
            : `Order placed — ${params.cropName || 'Produce'} ${(params.quantity || 500).toLocaleString()} kg. Order ID: ${newOrder.id}`
        );
      } catch (e) {
        console.error('[v0] Agentic buy error:', e);
      }
      setPendingConfirmationAction(null);
      setPhase('response');
      dismissTimerRef.current = setTimeout(handleClose, 3200);
      return;
    }

    if (action.targetView === 'confirm_agentic_sell' && action.isAgenticAction) {
      try {
        const newListing = store.addListing({
          produce: params.cropName || 'Wheat',
          cropId: params.cropId || 'wheat',
          quantity: params.quantity || 500,
          pricePerKg: params.pricePerKg || 28,
          unit: params.unit || 'kg',
          qualityGrade: params.qualityGrade || 'Grade A',
          location: params.location || currentUser?.location || 'Prayagraj',
          farmerId: currentUser?.id,
          farmerName: currentUser?.name || 'Farmer',
          fpoName: currentUser?.organization || 'FPO'
        });
        setResponseText(
          isHi
            ? `लिस्टिंग बन गई — ${params.cropName || 'Produce'} ₹${params.pricePerKg || 28}/किलो। ID: ${newListing.id}`
            : `Listing created — ${params.cropName || 'Produce'} ₹${params.pricePerKg || 28}/kg. ID: ${newListing.id}`
        );
      } catch (e) {
        console.error('[v0] Agentic sell error:', e);
      }
      setPendingConfirmationAction(null);
      setPhase('response');
      dismissTimerRef.current = setTimeout(handleClose, 3200);
      return;
    }

    // Risky navigation
    if (onNavigate && action.targetView) {
      onNavigate(action.targetView, action.params);
    }
    setPendingConfirmationAction(null);
    handleClose();
  };

  const handleTextSubmit = (e) => {
    if (e) e.preventDefault();
    if (phase === 'processing') return;
    executeQuery(inputText, false);
  };

  if (!isOpen) return null;

  const roleLine = `${assistantMeta.name} / ${assistantMeta.englishName}`;

  const statusLabel = (() => {
    if (phase === 'listening') return isHi ? 'सुन रहा हूँ…' : 'Listening…';
    if (phase === 'processing') return isHi ? 'समझ रहा हूँ…' : 'Thinking…';
    if (phase === 'text') return isHi ? 'लिखकर पूछें' : 'Type your request';
    if (phase === 'error') return isHi ? 'दोबारा कोशिश करें' : 'Try again';
    return isHi ? 'तैयार' : 'Done';
  })();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:pb-8"
      role="dialog"
      aria-label={roleLine}
    >
      {/* Transparent click-catcher so the page stays visible behind the small indicator */}
      <button
        type="button"
        aria-label={isHi ? 'बंद करें' : 'Close'}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] cursor-default"
      />

      <div className="relative w-full max-w-md animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/20 overflow-hidden">
          {/* Compact header */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-bold text-slate-500 truncate">{roleLine}</span>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              aria-label={isHi ? 'बंद करें' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 pb-5 pt-1">
            {/* Listening / processing visual */}
            {(phase === 'listening' || phase === 'processing') && (
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {phase === 'listening' && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                      <span className="absolute -inset-1 rounded-full bg-emerald-500/10 animate-pulse" />
                    </>
                  )}
                  <span className="relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
                    {phase === 'processing'
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <Mic className="w-5 h-5" />}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-slate-900">{statusLabel}</p>
                    {phase === 'listening' && <SiriWave />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {transcript
                      ? `"${transcript}"`
                      : (isHi ? 'बोलिए — जैसे "मार्केटप्लेस खोलो"' : 'Speak — e.g. "Open marketplace"')}
                  </p>
                </div>
              </div>
            )}

            {/* Response / confirmation / error */}
            {(phase === 'response' || phase === 'error') && (
              <div className="space-y-3">
                {transcript && (
                  <p className="text-xs text-slate-400 truncate">{isHi ? 'आपने कहा' : 'You said'}: "{transcript}"</p>
                )}
                <div className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">{responseText}</p>
                </div>

                {pendingConfirmationAction && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-black uppercase tracking-wide">
                        {isHi ? 'पुष्टि आवश्यक' : 'Confirmation required'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setPendingConfirmationAction(null); handleClose(); }}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                      >
                        {isHi ? 'रद्द करें' : 'Cancel'}
                      </button>
                      <button
                        onClick={handleConfirmAction}
                        className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isHi ? 'पुष्टि करें' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                )}

                {!pendingConfirmationAction && (
                  <button
                    onClick={startListening}
                    className="text-xs font-bold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {isHi ? 'फिर से बोलें' : 'Ask again'}
                  </button>
                )}
              </div>
            )}

            {/* Text fallback */}
            {phase === 'text' && (
              <div className="space-y-3">
                {responseText && <p className="text-xs text-slate-500 leading-relaxed">{responseText}</p>}
                <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                  <span className="text-slate-400 shrink-0"><Keyboard className="w-4 h-4" /></span>
                  <input
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                        handleTextSubmit(e);
                      }
                    }}
                    placeholder={isHi ? 'जैसे: मेरे orders दिखाओ' : 'e.g. Show my orders'}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="shrink-0 w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors"
                    aria-label={isHi ? 'भेजें' : 'Send'}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <button
                  onClick={startListening}
                  className="text-xs font-bold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  {isHi ? 'माइक से बोलें' : 'Use microphone'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small animated Siri-style wave bars */
function SiriWave() {
  return (
    <span className="flex items-end gap-0.5 h-4" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-0.5 rounded-full bg-emerald-500 animate-[siriwave_1s_ease-in-out_infinite]"
          style={{ height: '100%', animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </span>
  );
}
