import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  X, 
  Send, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { chatWithCyberBot, ChatMessage } from '../services/geminiService';
import { FormattedMessage } from './FormattedMessage';
import { Language } from '../types';

interface CyberBotWidgetProps {
  language: Language;
  onOpenFullPage?: () => void;
  initialQuery?: string;
  securityContext?: string;
}

export const CyberBotWidget: React.FC<CyberBotWidgetProps> = ({
  language,
  onOpenFullPage,
  initialQuery,
  securityContext
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const initialBotMessage: ChatMessage = {
    id: 'welcome-msg',
    role: 'assistant',
    content: `**CyberBot Security Grid Online.**\n\nI am your AI threat defense advisor. You can paste suspicious SMS messages, verify questionable URLs, ask about malicious Android APK permissions, or get immediate emergency advice if you suspect you've been targeted by a scam.\n\nHow can I protect you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    threatLevel: 'info',
    suggestedFollowUps: [
      "Is this SMS asking for OTP a scam?",
      "I clicked an unknown link. What should I do?",
      "How do I recognize malicious APK files?"
    ]
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialBotMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, loading]);

  // Handle external initial query if passed
  useEffect(() => {
    if (initialQuery) {
      setIsOpen(true);
      setIsMinimized(false);
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Stop speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithCyberBot(
        newHistory.map(m => ({ role: m.role, content: m.content })),
        language,
        securityContext
      );

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        threatLevel: response.threatLevel,
        suggestedFollowUps: response.suggestedFollowUps,
        degraded: response.degraded,
        fallbackReason: response.fallbackReason
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: "Failed to connect to the cyber intelligence node. Please verify your connection and try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          threatLevel: 'suspicious'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSpeech = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      // Strip markdown symbols for clearer speech
      const cleanText = text.replace(/[*#`_-]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  const handleClear = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages([initialBotMessage]);
  };

  const quickPrompts = [
    { label: "🚨 Clicked Phishing Link", prompt: "I accidentally clicked a suspicious link from an unknown SMS. What immediate actions must I take to secure my device and accounts?" },
    { label: "🔍 Check Bank SMS", prompt: "I received an SMS: 'Your bank account will be blocked today unless you update KYC immediately at http://bit.ly/bank-secure'. Is this legitimate or phishing?" },
    { label: "🛡️ Dangerous Permissions", prompt: "What Android app permissions are the most dangerous and commonly abused by spy apps (e.g. Accessibility, SMS, Overlay)?" }
  ];

  return (
    <aside aria-label="CyberBot AI Security Assistant" className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 max-w-[calc(100vw-2rem)]">
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="cyberbot-launcher-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center gap-3 bg-gradient-to-r from-accent-teal via-accent-teal to-accent-purple text-primary p-3.5 sm:p-4 rounded-2xl shadow-[0_0_25px_rgba(0,209,193,0.4)] hover:shadow-[0_0_35px_rgba(0,209,193,0.6)] transition-all cursor-pointer font-bold"
          >
            <div className="relative">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-green rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-green rounded-full border border-primary" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-black tracking-wider uppercase leading-none">CyberBot AI</span>
              <span className="text-[10px] opacity-80 leading-tight font-medium">Security Copilot</span>
            </div>
            <div className="hidden group-hover:block absolute right-full mr-3 px-3 py-1.5 bg-slate-900/90 text-accent-teal text-xs rounded-lg border border-accent-teal/30 whitespace-nowrap shadow-lg backdrop-blur-md pointer-events-none">
              Chat with Security AI
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="cyberbot-widget-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '560px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="w-[calc(100vw-2rem)] sm:w-[400px] max-w-[420px] bg-slate-950/95 backdrop-blur-2xl border border-accent-teal/30 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative p-2 bg-accent-teal/10 rounded-xl border border-accent-teal/30">
                  <Bot className="w-5 h-5 text-accent-teal" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent-green rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">CyberBot AI</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-teal/15 text-accent-teal border border-accent-teal/30 font-semibold">
                      v3.8
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                    <span>Active Defense Network</span>
                  </div>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-1">
                {onOpenFullPage && !isMinimized && (
                  <button
                    id="cyberbot-fullscreen-btn"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenFullPage();
                    }}
                    title="Open Full Page"
                    className="p-1.5 text-white/60 hover:text-accent-teal hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  id="cyberbot-minimize-btn"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Restore" : "Minimize"}
                  className="p-1.5 text-white/60 hover:text-accent-teal hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>

                <button
                  id="cyberbot-close-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-1.5 text-white/60 hover:text-accent-red hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Content (when not minimized) */}
            {!isMinimized && (
              <>
                {/* Quick Toolbar */}
                <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs text-white/50">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-accent-teal" />
                    Explainable Security AI
                  </span>
                  <button
                    onClick={handleClear}
                    title="Clear Conversation"
                    className="flex items-center gap-1 hover:text-accent-red transition-colors text-[11px]"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl p-3.5 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-accent-teal/20 to-accent-purple/20 border border-accent-teal/40 text-white shadow-md'
                            : 'bg-white/5 border border-white/10 text-white/90 shadow-lg'
                        }`}
                      >
                        {/* Threat Level Badge for Bot */}
                        {msg.role === 'assistant' && msg.threatLevel && msg.threatLevel !== 'info' && (
                          <div className="mb-2.5 flex items-center gap-1.5">
                            {msg.threatLevel === 'dangerous' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-red/20 border border-accent-red/40 text-accent-red text-xs font-bold uppercase tracking-wider">
                                <ShieldAlert className="w-3 h-3" />
                                High Threat Alert
                              </span>
                            )}
                            {msg.threatLevel === 'suspicious' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-yellow/20 border border-accent-yellow/40 text-accent-yellow text-xs font-bold uppercase tracking-wider">
                                <AlertTriangle className="w-3 h-3" />
                                Warning / Caution
                              </span>
                            )}
                            {msg.threatLevel === 'safe' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-green/20 border border-accent-green/40 text-accent-green text-xs font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-3 h-3" />
                                Safe / Low Risk
                              </span>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <FormattedMessage content={msg.content} />
                        {msg.role === 'assistant' && msg.degraded && (
                          <div className="mt-3 rounded-lg border border-accent-yellow/30 bg-accent-yellow/10 px-3 py-2 text-xs text-accent-yellow">
                            Gemini is temporarily unavailable; this is CyberBot’s offline safety guidance. {msg.fallbackReason === 'rate_limited' ? 'The API quota/rate limit was reached.' : ''}
                          </div>
                        )}

                        {/* Actions footer for bot messages */}
                        {msg.role === 'assistant' && (
                          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                            <span>{msg.timestamp}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleSpeech(msg.id, msg.content)}
                                title={speakingId === msg.id ? "Stop voice" : "Read aloud"}
                                className={`p-1 rounded hover:bg-white/10 transition-colors ${
                                  speakingId === msg.id ? 'text-accent-teal animate-pulse' : 'text-white/50'
                                }`}
                              >
                                {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                title="Copy answer"
                                className="p-1 rounded hover:bg-white/10 transition-colors text-white/50"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-accent-green" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {msg.role === 'user' && (
                          <span className="block mt-1 text-[10px] text-white/40 text-right">
                            {msg.timestamp}
                          </span>
                        )}
                      </div>

                      {/* Suggested Follow-ups */}
                      {msg.role === 'assistant' && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 max-w-[88%]">
                          {msg.suggestedFollowUps.map((suggest, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(suggest)}
                              className="text-left text-[11px] px-2.5 py-1 rounded-full bg-accent-teal/10 hover:bg-accent-teal/20 text-accent-teal border border-accent-teal/30 transition-all"
                            >
                              + {suggest}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {loading && (
                    <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl max-w-[70%]">
                      <div className="w-4 h-4 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-accent-teal font-mono animate-pulse">
                        Scanning threat database...
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts Drawer (if only welcome message) */}
                {messages.length <= 1 && (
                  <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02]">
                    <p className="text-[11px] font-bold text-white/40 mb-1.5 uppercase tracking-wider">
                      Quick Incident Scenarios
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {quickPrompts.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(item.prompt)}
                          className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-accent-teal/10 text-white/80 hover:text-accent-teal border border-white/5 hover:border-accent-teal/30 transition-all flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          <span className="text-[10px] text-accent-teal font-mono">Ask →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center gap-2 shrink-0"
                >
                  <input
                    ref={inputRef}
                    id="cyberbot-input-field"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about a scam, link, or security alert..."
                    disabled={loading}
                    className="flex-1 bg-black/50 border border-white/15 focus:border-accent-teal rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-accent-teal transition-all"
                  />
                  <button
                    id="cyberbot-send-btn"
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2.5 bg-gradient-to-r from-accent-teal to-accent-purple text-primary rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold shadow-md shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-primary" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
