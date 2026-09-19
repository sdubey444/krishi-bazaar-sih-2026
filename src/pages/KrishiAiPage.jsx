import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
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
  ArrowLeft,
  Truck,
  ShieldCheck,
  Package,
  Layers,
  Check
} from 'lucide-react';
import { askKrishiAi } from '../services/geminiService';
import { processNaturalQuery, getAssistantMetaForRole, resolveRole } from '../services/nluService';
import { locationService } from '../services/locationService';
import { i18n } from '../services/i18nService';
import { store } from '../services/store';

export default function KrishiAiPage({
  setCurrentView,
  currentUser = null,
  onNavigate = null,
  defaultCropId = 'wheat'
}) {
  const activeRole = currentUser?.role || resolveRole({ currentUser });
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isHi = currentLang === 'hi';

  // 1. VOICE RECOGNITION (LISTENING -> PROCESSING -> RESPONSE -> ACTION)
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
              : `Voice error (${event.error}). Please type below.`
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
      console.warn('Voice initialization notice:', e);
      setVoiceState('idle');
      setStatusNotice(
        isHi
          ? 'माइक प्रारंभ नहीं हो सका। कृपया लिखकर प्रश्न पूछें।'
          : 'Unable to start speech. Please type your query.'
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

  // 2. QUERY PROCESSOR
  const handleExecuteQuery = async (queryText, isVoice = false) => {
    const cleanQuery = (queryText || '').trim();

    if (!cleanQuery) {
      setStatusNotice(isHi ? 'कृपया कोई सवाल लिखें या बोलें।' : 'Please enter or speak a question.');
      inputRef.current?.focus();
      return;
    }

    setStatusNotice('');
    setInputText('');

    const userMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: cleanQuery,
      isVoice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setStatusNotice(isHi ? 'प्रक्रिया चल रही है...' : 'Processing query...');

    try {
      // Role Context Aware NLU Engine
      const roleContext = {
        role: activeRole,
        currentUser,
        currentView: `${activeRole}-dashboard`
      };

      const nluResult = processNaturalQuery(cleanQuery, defaultCropId, currentLocation, roleContext);

      // Supplementary Gemini Insight if applicable
      let aiExplanation = null;
      let aiSource = null;
      try {
        if (cleanQuery.length > 3 && nluResult.intentType !== 'buy') {
          const aiRes = await askKrishiAi(cleanQuery, {
            cropId: nluResult.cropId || defaultCropId,
            location: currentLocation
          });
          if (aiRes?.text) {
            aiExplanation = aiRes.text;
            aiSource = aiRes.source;
          }
        }
      } catch (geminiErr) {
        console.warn('AI fallback used platform records directly', geminiErr);
      }

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

      // Execute safe navigation if voice command and safe
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
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // 3. ACTION DISPATCHER
  const handleActionClick = (action, requiresConfirmation = false) => {
    if (requiresConfirmation || action?.isHighRisk) {
      setPendingConfirmationAction(action);
      return;
    }

    if (action?.targetView) {
      if (onNavigate) {
        onNavigate(action.targetView, action.params);
      } else if (setCurrentView) {
        setCurrentView(action.targetView);
      }
    }
  };

  const handleConfirmHighRiskAction = () => {
    if (pendingConfirmationAction) {
      if (onNavigate) {
        onNavigate(pendingConfirmationAction.targetView, pendingConfirmationAction.params);
      } else if (setCurrentView) {
        setCurrentView(pendingConfirmationAction.targetView);
      }
      setPendingConfirmationAction(null);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setStatusNotice('');
    setInputText('');
  };

  const handleBackToDashboard = () => {
    const target =
      activeRole === 'farmer'
        ? 'farmer-dashboard'
        : activeRole === 'buyer'
        ? 'buyer-dashboard'
        : activeRole === 'logistics'
        ? 'logistics-dashboard'
        : activeRole === 'admin'
        ? 'admin-dashboard'
        : 'landing';
    setCurrentView(target);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-brand-800 via-brand-900 to-emerald-950 text-white shadow-md border-b border-brand-700/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToDashboard}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg tracking-tight">
                  {assistantMeta.name} / {assistantMeta.englishName}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/30">
                  {assistantMeta.badge}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 hidden sm:block">
                {assistantMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-200 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentLocation?.district || currentLocation?.state || 'India'}</span>
            </div>

            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Alert */}
      {pendingConfirmationAction && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 shrink-0 flex items-start gap-3 max-w-5xl mx-auto w-full">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
              Explicit Confirmation Required
            </span>
            <p className="text-xs text-amber-800">
              You requested an operation: "{pendingConfirmationAction.params?.actionQuery || 'Irreversible action'}". Are you sure you want to proceed?
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
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm"
              >
                Confirm &amp; Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Notice Banner */}
      {statusNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs font-semibold text-amber-900 flex items-center justify-between shrink-0 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <button onClick={() => setStatusNotice('')} className="text-amber-700 hover:text-amber-900">
            &times;
          </button>
        </div>
      )}

      {/* Main Conversation Stream */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 overflow-y-auto space-y-4">
        {/* Welcome Card if chat empty */}
        {messages.length === 0 && (
          <div className="space-y-4 py-2">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900">
                    {assistantMeta.name} ({assistantMeta.englishName})
                  </h2>
                  <p className="text-xs text-slate-500">{assistantMeta.subtitle}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {assistantMeta.welcomeMessage}
              </p>
            </div>

            {/* Role-Specific Quick Suggested Prompts */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {isHi ? 'सुझाए गए प्रश्न / बोलकर या दबाकर पूछें:' : 'Suggested questions (Tap to speak or query):'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {assistantMeta.quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteQuery(item.query, false)}
                    className="p-3 rounded-2xl bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-800 text-xs font-bold shadow-2xs transition-all flex items-center gap-2.5 text-left group"
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-9 h-9 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 space-y-2.5 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
              }`}
            >
              {msg.sender === 'user' && msg.isVoice && (
                <div className="flex items-center gap-1 text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                  <Mic className="w-3 h-3" />
                  <span>Captured from Speech / बोलकर पूछा गया</span>
                </div>
              )}

              {msg.sender === 'assistant' && msg.understoodSummary && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{msg.understoodSummary}</span>
                </div>
              )}

              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                {msg.text}
              </div>

              {msg.aiExplanation && (
                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs space-y-1 mt-2">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-emerald-700">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Agricultural Intelligence
                    </span>
                    {msg.aiSource && (
                      <span className="font-semibold text-emerald-600 truncate max-w-[220px]">
                        {msg.aiSource}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-line leading-relaxed font-medium">
                    {msg.aiExplanation}
                  </p>
                </div>
              )}

              {msg.action && (
                <div className="pt-2">
                  <button
                    onClick={() => handleActionClick(msg.action, msg.requiresConfirmation)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
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

              <div className={`text-[10px] text-right font-medium ${msg.sender === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-9 h-9 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 font-semibold pl-1">
                {isHi ? 'कृषि डेटा विश्लेषित किया जा रहा है...' : 'Analyzing platform intelligence...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input & Voice Control Bar */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleExecuteQuery(inputText, false); }} className="flex items-center gap-2.5">
            {/* Mic Button */}
            <button
              type="button"
              onClick={voiceState === 'listening' ? handleStopListening : handleStartListening}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-md ${
                voiceState === 'listening'
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title={
                voiceState === 'listening'
                  ? (isHi ? 'सुनना बंद करें' : 'Stop Listening')
                  : (isHi ? 'बोलने के लिए दबाएं' : 'Tap to Speak')
              }
            >
              {voiceState === 'listening' ? (
                <MicOff className="w-5 h-5 text-amber-300" />
              ) : (
                <Mic className="w-5 h-5 text-amber-300" />
              )}
            </button>

            {/* Input Bar */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  voiceState === 'listening'
                    ? (isHi ? 'माइक में बोलें...' : 'Listening to speech...')
                    : (isHi ? `बोलें या लिखें: e.g. ${assistantMeta.quickPrompts[0]?.label || 'आज का भाव क्या है?'}` : `Speak or type a query...`)
                }
                className="w-full pl-4 pr-4 py-3 rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="w-12 h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 text-white flex items-center justify-center transition-all shrink-0 shadow-md disabled:cursor-not-allowed"
              title="Send Query"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
            <span>Powered by Context-Aware Krishi NLU &amp; Agmarknet Intelligence</span>
            <span>Role Context: <strong className="text-slate-600 capitalize">{activeRole}</strong> ({assistantMeta.name})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
