import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Mic,
  MicOff,
  Volume2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  User,
  RotateCcw
} from 'lucide-react';
import { askKrishiAi } from '../services/geminiService';
import { processNaturalQuery } from '../services/nluService';

export default function KrishiAiModal({
  isOpen,
  onClose,
  defaultCropId = 'wheat',
  onNavigate = null
}) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'processing'
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechLang, setSpeechLang] = useState('hi-IN'); // 'hi-IN' or 'en-IN'
  const [statusNotice, setStatusNotice] = useState('');

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check browser SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
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

  // 1. "TAP TO ASK" VOICE FLOW
  const handleStartListening = () => {
    setStatusNotice('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setStatusNotice('Speech recognition is not supported in this browser. Please type your query in the box below.');
      inputRef.current?.focus();
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = speechLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setVoiceState('listening');
        setStatusNotice('');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceState('idle');
        if (transcript && transcript.trim()) {
          // Execute processing directly for the captured speech
          handleExecuteQuery(transcript.trim(), true);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setVoiceState('idle');
        if (event.error === 'not-allowed') {
          setStatusNotice('Microphone access was denied. Please allow microphone permission or type your question below.');
        } else if (event.error === 'no-speech') {
          setStatusNotice('No speech was detected. Please tap the microphone and speak again, or type below.');
        } else {
          setStatusNotice('Speech capture was interrupted. You can type your question below.');
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
      console.error('Speech initialization error:', e);
      setVoiceState('idle');
      setStatusNotice('Unable to initialize voice recognition. Please type your question below.');
      inputRef.current?.focus();
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState('idle');
  };

  // 2. CORE QUERY PROCESSOR (USED BY BOTH TYPED ASK & VOICE FLOW)
  const handleExecuteQuery = async (queryText, isVoice = false) => {
    const cleanQuery = (queryText || '').trim();

    if (!cleanQuery) {
      setStatusNotice('Please enter or speak a question to ask Krishi AI.');
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

    try {
      // B. Process Natural Language Understanding (NLU) against agricultural records
      const nluResult = processNaturalQuery(cleanQuery, defaultCropId);

      // C. Supplementary AI context from Gemini / grounded local engine if relevant
      let aiExplanation = null;
      try {
        if (cleanQuery.length > 5 && nluResult.intentType !== 'buy') {
          const aiRes = await askKrishiAi(cleanQuery, { cropId: nluResult.cropId || defaultCropId });
          if (aiRes && aiRes.text) {
            aiExplanation = aiRes.text;
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
        aiExplanation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error processing query:', err);
      // Friendly fallback message
      const errorMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `I had trouble connecting to the live analytics service. However, based on platform benchmark records:\n• Wheat Reference Price: ₹28.00/kg\n• Mustard Reference Price: ₹58.00/kg\n• Rice Reference Price: ₹32.00/kg\n\nAll reference rates are based on regional mandi market records.`,
        understoodSummary: 'Platform Reference Data',
        intent: 'Reference Lookup',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
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

  // 4. ACTION BUTTON NAVIGATION (Navigates when explicitly clicked)
  const handleActionClick = (action) => {
    if (onNavigate && action?.targetView) {
      onNavigate(action.targetView, action.params);
      onClose();
    }
  };

  // 5. CLEAR CHAT
  const handleClearChat = () => {
    setMessages([]);
    setStatusNotice('');
    setInputText('');
  };

  // Preset prompt chips matching test queries
  const presetQueries = [
    { label: 'What is the wheat price?', query: 'What is the wheat price?', emoji: '🌾' },
    { label: 'गेहूँ का प्राइस क्या है?', query: 'गेहूँ का प्राइस क्या है?', emoji: '💰' },
    { label: 'gehu ka rate kya hai?', query: 'gehu ka rate kya hai?', emoji: '📊' },
    { label: 'mere area mein wheat ka price batao', query: 'mere area mein wheat ka price batao', emoji: '📍' },
    { label: 'mujhe 100 quintal wheat chahiye', query: 'mujhe 100 quintal wheat chahiye', emoji: '🛒' },
    { label: 'मेरे पास 5000 किलो गेहूं है, buyer चाहिए', query: 'मेरे पास 5000 किलो गेहूं है, मुझे buyer चाहिए', emoji: '🤝' },
    { label: 'ट्रक बुकिंग कैसे करें', query: 'ट्रक बुकिंग कैसे करें', emoji: '🚚' },
    { label: 'Which crop has high demand?', query: 'Which crop has high demand?', emoji: '📈' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col h-[88vh] max-h-[760px] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-800 to-emerald-900 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">Krishi AI Assistant</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Voice + Chat
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Ask in Hindi, Hinglish, or English • Reference Market Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                title="Clear conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50">
          
          {/* Welcome / Empty State */}
          {messages.length === 0 && (
            <div className="space-y-4">
              {/* Tap to Ask Hero Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-brand-50/80 to-white border border-brand-200/80 text-center space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-brand-600" />
                    Speech Recognition
                  </span>
                  <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-200 text-[11px]">
                    <button
                      onClick={() => setSpeechLang('hi-IN')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                        speechLang === 'hi-IN' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      हिन्दी / Hinglish
                    </button>
                    <button
                      onClick={() => setSpeechLang('en-IN')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                        speechLang === 'en-IN' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Main Tap to Ask Button */}
                <div className="py-2 flex flex-col items-center">
                  {voiceState === 'listening' ? (
                    <button
                      onClick={handleStopListening}
                      className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse transition-all scale-105"
                      title="Listening... Tap to Stop"
                    >
                      <MicOff className="w-7 h-7" />
                    </button>
                  ) : (
                    <button
                      onClick={handleStartListening}
                      className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all"
                      title="Tap to speak"
                    >
                      <Mic className="w-7 h-7" />
                    </button>
                  )}

                  <div className="mt-2.5">
                    {voiceState === 'listening' ? (
                      <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                        <span>Listening... Speak now in Hindi or English</span>
                      </div>
                    ) : (
                      <div className="text-slate-800 font-extrabold text-sm">
                        🎤 Tap to Ask (or type your question below)
                      </div>
                    )}
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Works with Hindi, Hinglish, and English queries
                    </span>
                  </div>
                </div>
              </div>

              {/* Prompt Suggestion Chips */}
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-2 px-1">
                  Example questions (Tap to ask):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {presetQueries.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteQuery(item.query, false)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-brand-50 hover:text-brand-800 text-slate-700 border border-slate-200 hover:border-brand-300 transition-all text-left flex items-center gap-1.5 shadow-2xs font-medium"
                    >
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Messages List */}
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {/* User Question Bubble */}
              {msg.sender === 'user' && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-slate-900 text-white p-3.5 rounded-2xl rounded-tr-xs shadow-xs space-y-1">
                    <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
                      <span className="font-semibold flex items-center gap-1">
                        {msg.isVoice ? (
                          <>
                            <Mic className="w-3 h-3 text-emerald-400" />
                            <span>You said:</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-slate-400" />
                            <span>You asked:</span>
                          </>
                        )}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                      "{msg.text}"
                    </p>
                  </div>
                </div>
              )}

              {/* Assistant Reply Card */}
              {msg.sender === 'assistant' && (
                <div className="flex justify-start">
                  <div className="max-w-[92%] bg-white border border-emerald-200/80 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{msg.understoodSummary || 'Agricultural Intelligence Response'}</span>
                      </span>
                      {msg.intent && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 shrink-0">
                          {msg.intent}
                        </span>
                      )}
                    </div>

                    {/* Formatted Reply Body */}
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                      {msg.text}
                    </div>

                    {/* Supplementary AI Context if available */}
                    {msg.aiExplanation && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                        <span className="font-bold text-slate-900 block flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5 text-brand-600" />
                          Market Context:
                        </span>
                        <p className="text-slate-600 leading-relaxed">{msg.aiExplanation}</p>
                      </div>
                    )}

                    {/* Optional Feature Action Button */}
                    {msg.action && (
                      <div className="pt-1">
                        <button
                          onClick={() => handleActionClick(msg.action)}
                          className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors group"
                        >
                          <span>{msg.action.label}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <span className="text-[10px] text-slate-400 block text-center mt-1">
                          Click to navigate to the module (or continue chatting below)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Processing / Loading State */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-xs flex items-center gap-3 text-slate-700 text-xs sm:text-sm">
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                <div className="space-y-0.5">
                  <span className="font-bold block text-slate-900">Processing inquiry...</span>
                  <span className="text-xs text-slate-500">Grounded against platform reference mandi data</span>
                </div>
              </div>
            </div>
          )}

          {/* User-friendly Notice / Error Banner if any */}
          {statusNotice && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{statusNotice}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Listening Active Overlay Banner */}
        {voiceState === 'listening' && (
          <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              <span className="font-bold">Listening now... Speak your question</span>
            </div>
            <button
              onClick={handleStopListening}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors"
            >
              Stop Listening
            </button>
          </div>
        )}

        {/* Persistent Input & Ask Controls */}
        <form onSubmit={handleAskSubmit} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              speechLang === 'hi-IN'
                ? "सवाल पूछें (उदा: गेहूं का प्राइस बताओ, मुझे 100 क्विंटल चाहिए)..."
                : "Type your question (e.g. What is the wheat price?)..."
            }
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium"
            disabled={isProcessing}
          />

          {/* Microphone / Tap to Ask Button */}
          <button
            type="button"
            onClick={voiceState === 'listening' ? handleStopListening : handleStartListening}
            disabled={isProcessing}
            className={`p-2.5 rounded-xl border transition-all ${
              voiceState === 'listening'
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                : 'bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border-slate-200'
            }`}
            title={voiceState === 'listening' ? "Stop listening" : "Tap to speak (Voice Search)"}
          >
            {voiceState === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Ask Button */}
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
}
