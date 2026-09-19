import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Mic,
  MicOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  User,
  RotateCcw,
  ShieldAlert,
  MapPin,
  Truck,
  Check
} from 'lucide-react';
import { askKrishiAi } from '../services/geminiService';
import { processNaturalQuery, getAssistantMetaForRole, resolveRole } from '../services/nluService';
import { locationService } from '../services/locationService';
import { i18n } from '../services/i18nService';
import { store } from '../services/store';

export default function KrishiAiModal({
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

  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'response' | 'action'
  const [speechSupported, setSpeechSupported] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(() => locationService.getLocationContext());
  const [statusNotice, setStatusNotice] = useState('');
  const [pendingConfirmationAction, setPendingConfirmationAction] = useState(null);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const unsubLoc = locationService.subscribe(loc => setCurrentLocation(loc || locationService.getLocationContext()));
    const unsubLang = i18n.subscribe(lang => setCurrentLang(lang));

    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
    return () => {
      unsubLoc();
      unsubLang();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  // Auto-scroll chat to bottom when messages or processing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isHi = currentLang === 'hi';

  // 1. "TAP TO ASK" VOICE FLOW (LISTENING -> PROCESSING -> RESPONSE -> ACTION)
  const handleStartListening = () => {
    setStatusNotice('');
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setStatusNotice(
        isHi
          ? 'इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। कृपया नीचे लिखकर पूछें।'
          : 'Speech recognition is not supported in this browser. Please type below.'
      );
      inputRef.current?.focus();
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = i18n.getSpeechRecognitionLang();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setVoiceState('listening');
        setStatusNotice(
          isHi
            ? `सुन रहा हूँ (${assistantMeta.name})... माइक में स्पष्ट बोलें`
            : `Listening (${assistantMeta.englishName})... Speak your query clearly.`
        );
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        setVoiceState('processing');
        setStatusNotice(isHi ? 'समझ रहा हूँ...' : 'Processing speech...');
        if (transcript && transcript.trim()) {
          handleExecuteQuery(transcript.trim(), true);
        } else {
          setVoiceState('idle');
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        setVoiceState('idle');
        if (event.error === 'not-allowed') {
          setStatusNotice(
            isHi
              ? 'माइक की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक ऑन करें या लिखकर पूछें।'
              : 'Microphone access was denied. Please allow microphone in browser or type below.'
          );
        } else if (event.error === 'no-speech') {
          setStatusNotice(
            isHi
              ? 'कोई आवाज़ नहीं मिली। कृपया दोबारा माइक दबाकर बोलें।'
              : 'No speech detected. Please tap the mic and speak again.'
          );
        } else {
          setStatusNotice(
            isHi
              ? `आवाज़ पहचान में रुकावट (${event.error})। कृपया नीचे लिखकर पूछें।`
              : `Speech error (${event.error}). Please type your query below.`
          );
        }
        inputRef.current?.focus();
      };

      recognition.onend = () => {
        if (voiceState === 'listening') {
          setVoiceState('idle');
        }
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech initialization notice:', e);
      setVoiceState('idle');
      setStatusNotice(
        isHi
          ? 'माइक प्रारंभ नहीं हो सका। कृपया लिखकर प्रश्न पूछें।'
          : 'Unable to start speech. Please type your query below.'
      );
      inputRef.current?.focus();
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
    }
    setVoiceState('idle');
  };

  // 2. CORE QUERY PROCESSOR (USED BY BOTH TYPED ASK & VOICE FLOW)
  const handleExecuteQuery = async (queryText, isVoice = false) => {
    const cleanQuery = (queryText || '').trim();

    if (!cleanQuery) {
      setStatusNotice(isHi ? 'कृपया कोई सवाल लिखें या बोलें।' : 'Please enter or speak a question.');
      inputRef.current?.focus();
      return;
    }

    setStatusNotice('');
    setInputText('');

    // A. Add User message to chat stream
    const userMsgId = `user_${Date.now()}`;
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text: cleanQuery,
      isVoice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setStatusNotice(isHi ? 'प्रक्रिया चल रही है...' : 'Processing query...');

    try {
      // B. Process Natural Language Understanding (NLU) with active Role & Location Context
      const roleContext = {
        role: activeRole,
        currentUser,
        currentView
      };

      const nluResult = processNaturalQuery(cleanQuery, defaultCropId, currentLocation, roleContext);

      // C. Supplementary AI context from Gemini / grounded agronomy knowledge base
      let aiExplanation = null;
      let aiSource = null;
      try {
        if (cleanQuery.length > 3 && nluResult.intentType !== 'buy') {
          const aiRes = await askKrishiAi(cleanQuery, {
            cropId: nluResult.cropId || defaultCropId,
            location: currentLocation
          });
          if (aiRes && aiRes.text) {
            aiExplanation = aiRes.text;
            aiSource = aiRes.source;
          }
        }
      } catch (geminiErr) {
        console.warn('AI fallback used platform records directly', geminiErr);
      }

      // D. Add Assistant message to chat stream
      const assistantMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: nluResult.answer,
        understoodSummary: nluResult.understoodSummary,
        intent: nluResult.intent,
        intentType: nluResult.intentType,
        crop: nluResult.crop,
        action: nluResult.action,
        requiresConfirmation: nluResult.requiresConfirmation,
        aiExplanation,
        aiSource,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMessage]);
      setVoiceState('response');

      // If user voice query was a safe direct navigation command, execute it safely
      if (isVoice && nluResult.action && !nluResult.requiresConfirmation && nluResult.intentType === 'navigation') {
        setStatusNotice(
          isHi
            ? `कार्यवाही हो रही है: ${nluResult.action.label || ''}`
            : `Executing action: ${nluResult.action.label || ''}`
        );
        setTimeout(() => {
          handleActionClick(nluResult.action, false);
        }, 1200);
      } else {
        setStatusNotice(isHi ? 'पूरा हुआ' : 'Completed');
        setTimeout(() => {
          setStatusNotice('');
          setVoiceState('idle');
        }, 2000);
      }
    } catch (err) {
      console.error('Error processing query:', err);
      const errorMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Unable to process query directly at this moment. Benchmark platform records:\n• Wheat: ₹28.00/kg\n• Mustard: ₹58.00/kg\n• Rice: ₹42.00/kg\n• Potato: ₹18.50/kg`,
        understoodSummary: 'Platform Reference Data',
        intent: 'Reference Lookup',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
      setVoiceState('idle');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // 3. TYPED ASK HANDLER
  const handleAskSubmit = (e) => {
    if (e) e.preventDefault();
    if (isProcessing) return;
    handleExecuteQuery(inputText, false);
  };

  // 4. ACTION BUTTON NAVIGATION WITH SAFETY GATE
  const handleActionClick = (action, requiresConfirmation = false) => {
    if (requiresConfirmation || action?.isHighRisk) {
      setPendingConfirmationAction(action);
      return;
    }

    if (onNavigate && action?.targetView) {
      onNavigate(action.targetView, action.params);
      onClose();
    }
  };

  const handleConfirmHighRiskAction = () => {
    if (pendingConfirmationAction && onNavigate) {
      onNavigate(pendingConfirmationAction.targetView, pendingConfirmationAction.params);
      setPendingConfirmationAction(null);
      onClose();
    }
  };

  // 5. CLEAR CHAT
  const handleClearChat = () => {
    setMessages([]);
    setStatusNotice('');
    setInputText('');
  };

  const safeDistrictOrState = currentLocation?.district || currentLocation?.state || 'India';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col h-[88vh] max-h-[760px]">
        
        {/* Header with Role-Specific Branding */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-800 to-emerald-900 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">
                  {assistantMeta.name} / {assistantMeta.englishName}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {assistantMeta.badge}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-200/90 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-300" />
                  {safeDistrictOrState}
                </span>
                <span>•</span>
                <span>Role: <strong className="capitalize text-white">{activeRole}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors text-xs flex items-center gap-1"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
              title="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* High Risk Confirmation Modal Alert */}
        {pendingConfirmationAction && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 shrink-0 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                Explicit Confirmation Required
              </span>
              <p className="text-xs text-amber-800">
                You requested a high-risk operation: "{pendingConfirmationAction.params?.actionQuery || 'Irreversible action'}". Are you sure you want to proceed?
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setPendingConfirmationAction(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmHighRiskAction}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-2xs"
                >
                  Confirm &amp; Execute
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Notice Banner */}
        {statusNotice && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs font-semibold text-amber-900 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{statusNotice}</span>
            </div>
            <button onClick={() => setStatusNotice('')} className="text-amber-700 hover:text-amber-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chat Message Scroll Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          
          {/* Welcome Card if no messages */}
          {messages.length === 0 && (
            <div className="space-y-4 py-2">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {assistantMeta.name} ({assistantMeta.englishName})
                    </h4>
                    <p className="text-xs text-slate-500">{assistantMeta.subtitle}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {assistantMeta.welcomeMessage}
                </p>
              </div>

              {/* Preset Role-Specific Query Chips */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isHi ? 'सुझाए गए प्रश्न (दबाकर या बोलकर पूछें):' : 'Tap to ask or speak naturally:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {assistantMeta.quickPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteQuery(item.query, false)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-800 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 text-left"
                    >
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Render Chat Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2.5 shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200/80 text-slate-900 rounded-bl-none'
                }`}
              >
                {/* User Message Header */}
                {msg.sender === 'user' && msg.isVoice && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-200 font-bold uppercase">
                    <Mic className="w-3 h-3" />
                    <span>Captured from Speech / बोलकर पूछा गया</span>
                  </div>
                )}

                {/* Assistant Understood Badge */}
                {msg.sender === 'assistant' && msg.understoodSummary && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{msg.understoodSummary}</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                  {msg.text}
                </div>

                {/* Supplementary Agronomy / AI Explanation */}
                {msg.aiExplanation && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 text-xs space-y-1 mt-2">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-emerald-700">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Agricultural Intelligence
                      </span>
                      {msg.aiSource && (
                        <span className="font-semibold text-emerald-600 truncate max-w-[200px]">
                          {msg.aiSource}
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-line leading-relaxed font-medium">
                      {msg.aiExplanation}
                    </p>
                  </div>
                )}

                {/* Safe Interactive Action Button */}
                {msg.action && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleActionClick(msg.action, msg.requiresConfirmation)}
                      className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all ${
                        msg.requiresConfirmation || msg.action.isHighRisk
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-brand-600 hover:bg-brand-700 text-white'
                      }`}
                    >
                      <span>{msg.action.label || 'View in Platform'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Timestamp */}
                <div className={`text-[10px] text-right font-medium ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-2xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-500 font-semibold pl-1">
                  {isHi ? 'डेटा विश्लेषित किया जा रहा है...' : 'Analyzing platform intelligence...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Voice Trigger */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleAskSubmit} className="flex items-center gap-2">
            
            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={voiceState === 'listening' ? handleStopListening : handleStartListening}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-sm ${
                voiceState === 'listening'
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title={
                voiceState === 'listening'
                  ? (isHi ? 'सुनना बंद करें' : 'Stop Listening')
                  : (isHi ? `बोलने के लिए दबाएं (${assistantMeta.name})` : `Tap to Speak (${assistantMeta.englishName})`)
              }
            >
              {voiceState === 'listening' ? (
                <MicOff className="w-5 h-5 text-amber-300" />
              ) : (
                <Mic className="w-5 h-5 text-amber-300" />
              )}
            </button>

            {/* Query Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  voiceState === 'listening'
                    ? (isHi ? 'माइक में बोलें...' : 'Listening to your speech...')
                    : (isHi ? `बोलें या लिखें: e.g. ${assistantMeta.quickPrompts[0]?.label || 'आज आलू का क्या भाव है?'}` : `Speak or type a query...`)
                }
                className="w-full pl-4 pr-10 py-3 rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="w-12 h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 text-white flex items-center justify-center transition-all shrink-0 shadow-sm disabled:cursor-not-allowed"
              title="Send Query"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Footer note */}
          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
            <span>Powered by Context-Aware Krishi NLU &amp; Agmarknet Records</span>
            <span>Role Context: <strong className="capitalize text-slate-600">{activeRole}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}
