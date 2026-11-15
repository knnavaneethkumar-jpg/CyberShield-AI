import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  Trash2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Download, 
  PhoneCall, 
  Zap, 
  Lock, 
  ExternalLink,
  Shield,
  HelpCircle
} from 'lucide-react';
import { chatWithCyberBot, ChatMessage } from '../services/geminiService';
import { FormattedMessage } from '../components/FormattedMessage';
import { Language } from '../types';


function offlineCyberBotAnswer(question: string): { content: string; threatLevel: 'safe' | 'suspicious' | 'dangerous' | 'info'; suggestedFollowUps: string[] } {
  const q = question.toLowerCase();
  if (/whatsapp|forwarded|forward.*scam|is this.*scam|bank|kyc|delivery|parcel|courier|prize|lottery|phishing|suspicious link/.test(q)) {
    return {
      threatLevel: 'suspicious',
      content: `## CyberBot offline guidance: check for a scam\n\nI couldn't reach the live AI service, but these checks are useful immediately:\n\n1. **Don't tap the message link** or download an attachment.\n2. **Check the exact domain** carefully. Shortened links, misspellings, unexpected subdomains, and unrelated domains are warning signs.\n3. **Verify independently** using the organisation's official app or a website/phone number you find yourself—not contact details in the message.\n4. **Treat urgency and payment requests cautiously**, especially KYC updates, parcel fees, prizes, account suspension, or requests for OTPs.\n5. **Never share passwords, OTPs, recovery codes, or card details.** Block/report the sender if fraudulent.\n\nA forwarded message or a suspicious-looking URL alone is not conclusive proof. Paste the message with personal information removed and I can help review the warning signs when the service is available.\n\n**Bottom line:** don't act through the message; verify through an official channel.`,
      suggestedFollowUps: ['I already clicked the link. What should I do?', 'I entered my password on a fake website', 'How do I inspect a suspicious URL?']
    };
  }
  if (/clicked|opened.*link|downloaded|installed.*apk|malware/.test(q)) {
    return {
      threatLevel: 'suspicious',
      content: `## Immediate steps after clicking a suspicious link\n\n- Close the page. Don't install anything or grant permissions.\n- If you downloaded a file, don't open it; delete it and run your device's built-in security scan.\n- If you entered a password, change it from a trusted device through the official site and sign out other sessions. Change any reused passwords too.\n- If you shared bank/card details or an OTP, contact your bank through its official app/number immediately.\n- Review recent account sign-ins, enable MFA/passkeys, and report the message.\n\nOpening a page alone doesn't always mean the device is compromised; downloads and information entered affect the risk.`,
      suggestedFollowUps: ['I entered credentials', 'How do I check Android app permissions?', 'How do I report a phishing message?']
    };
  }
  if (/password|credential|otp|account.*compromis/.test(q)) {
    return {
      threatLevel: 'dangerous',
      content: `## Protect the account now\n\n1. Use a trusted device and open the official app/site directly.\n2. Change the exposed password immediately; change it anywhere else you reused it.\n3. Sign out all other sessions and revoke unfamiliar app access.\n4. Enable MFA or a passkey and check recovery email/phone settings.\n5. If banking details or an OTP were exposed, call the bank using its official number.\n\nDo not share the actual password, OTP, recovery code, or API key here.`,
      suggestedFollowUps: ['How do I enable MFA?', 'How do I check active sessions?', 'How can I report a cyber fraud in India?']
    };
  }
  if (/accessibility|android|apk|permission/.test(q)) {
    return {
      threatLevel: 'suspicious',
      content: `## Android permissions and suspicious APKs\n\nAccessibility access can let an app read screen content and interact with controls. Malicious apps may abuse it to observe activity or automate actions. SMS access can expose verification messages. These permissions have legitimate uses too, so a permission alone doesn't prove malware.\n\nOpen Android Settings and review Accessibility, SMS, Notification access, Device admin apps, and “Display over other apps.” Disable access for apps you don't recognise, uninstall suspicious sideloaded apps, run Play Protect, and install updates. Never grant permissions just because a pop-up insists you must.`,
      suggestedFollowUps: ['What should I do after installing a suspicious APK?', 'How can I report a scam?', 'How does URL phishing detection work?']
    };
  }
  return {
    threatLevel: 'info',
    content: `## CyberBot quick guidance (offline)\n\nThe live Gemini service is temporarily unreachable, so this answer is a built-in safety response—not a live AI analysis.\n\nI can help with phishing links, suspicious SMS/WhatsApp messages, account recovery, password security, Android permissions, and incident response. Share the question or suspicious message with passwords, OTPs, account numbers, and private tokens removed.\n\nFor now: don't open unknown links, install unexpected files, send money under pressure, or disclose verification codes. Verify requests independently through an official channel.`,
    suggestedFollowUps: ['How can I tell if a WhatsApp forward is a scam?', 'What if I entered credentials on a fake site?', 'Explain dangerous Android permissions']
  };
}

interface ChatbotPageProps {
  language: Language;
  onNavigate?: (page: string) => void;
  initialQuery?: string;
  securityContext?: string;
}

export const ChatbotPage: React.FC<ChatbotPageProps> = ({
  language,
  onNavigate,
  initialQuery,
  securityContext
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState(false);

  const initialBotMessage: ChatMessage = {
    id: 'page-welcome-msg',
    role: 'assistant',
    content: `**Welcome to CyberBot — AI Security Intelligence Engine.**\n\nI am your dedicated cybersecurity copilot. You can consult me to:\n- **Triage Suspicious Messages & Links**: Paste SMS texts, emails, or domains for real-time scam verification.\n- **APK & Malware Analysis**: Learn if specific permissions or packages pose surveillance or exfiltration risks.\n- **Emergency Incident Response**: Get immediate, step-by-step containment instructions if you suspect credential theft, ransomware, or identity fraud.\n\nWhat security inquiry can I assist you with today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    threatLevel: 'info',
    suggestedFollowUps: [
      "How can I tell if a WhatsApp forward is a scam?",
      "What should I do immediately after entering credentials on a fake site?",
      "Explain what Android Accessibility permission does in malware"
    ]
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialBotMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

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
        suggestedFollowUps: response.suggestedFollowUps
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('[CyberBot]', err);
      // Always give the user a useful local safety answer if the API/network is down.
      // This is clearly labelled as offline guidance, not a model prediction.
      const fallback = offlineCyberBotAnswer(query);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-offline-${Date.now()}`,
          role: 'assistant',
          content: `${fallback.content}\n\n---\n*Offline guidance: live Gemini response unavailable right now.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          threatLevel: fallback.threatLevel,
          suggestedFollowUps: fallback.suggestedFollowUps
        }
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
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

  const handleExportChat = () => {
    const transcript = messages.map(m => `[${m.timestamp}] ${m.role === 'user' ? 'USER' : 'CYBERBOT'}:\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cybershield-security-consult-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const scenarioPrompts = [
    {
      title: "🚨 Clicked Suspicious Link",
      desc: "Emergency triage after clicking a phishing link",
      prompt: "I accidentally clicked a suspicious link from an unknown SMS on my mobile device. What emergency containment steps must I follow right now to prevent data theft?"
    },
    {
      title: "💳 Fake Bank / KYC SMS",
      desc: "Identify banking phishing patterns",
      prompt: "I got a text: 'Dear customer, your bank account is suspended due to pending KYC verification. Click http://bit.ly/bank-auth to update in 24h.' Is this safe or a scam?"
    },
    {
      title: "📦 Delivery Package Scam",
      desc: "Fake courier & customs fee scam",
      prompt: "I received a message claiming I have an undelivered parcel and must pay a $2 re-delivery charge via a link. How do parcel tracking scams work and what are the red flags?"
    },
    {
      title: "🛡️ Dangerous APK Permissions",
      desc: "Understand high-risk Android access",
      prompt: "An app I downloaded from outside the Play Store asks for 'Accessibility Services' and 'Read SMS'. Why is this dangerous and what could it do to my device?"
    },
    {
      title: "🔑 Compromised Password",
      desc: "Actions if credentials leaked",
      prompt: "I discovered one of my online account passwords was found in a data breach. What is the safest way to rotate my passwords and protect my other logins?"
    },
    {
      title: "🔗 Check a Suspicious URL",
      desc: "Understand common phishing URL signals",
      prompt: "How can I identify a phishing URL? Explain IP-address hosts, shortened links, suspicious subdomains, HTTPS, and what a URL ML score can and cannot prove."
    }
  ];

  return (
    <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-accent-teal/10 rounded-2xl border border-accent-teal/30 shadow-[0_0_20px_rgba(0,209,193,0.2)]">
            <Bot className="w-9 h-9 text-accent-teal" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                CyberBot <span className="bg-gradient-to-r from-accent-teal to-accent-purple bg-clip-text text-transparent">AI Assistant</span>
              </h1>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-accent-teal/15 text-accent-teal border border-accent-teal/30 font-bold">
                Online & Guarding
              </span>
            </div>
            <p className="text-white/60 text-sm mt-1">
              Your 24/7 AI Cybersecurity Copilot for scam verification, link triage, and incident response.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportChat}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all"
            title="Download conversation log"
          >
            <Download className="w-4 h-4 text-accent-teal" />
            <span>Export Log</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-accent-red/10 text-white/80 hover:text-accent-red border border-white/10 hover:border-accent-red/30 text-xs font-medium transition-all"
            title="Reset conversation"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Chat</span>
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent-teal/10 hover:bg-accent-teal/20 text-accent-teal border border-accent-teal/30 text-xs font-bold transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>Go to Scanner</span>
            </button>
          )}
        </div>
      </div>

      {exportNotice && (
        <div className="mb-4 p-3 bg-accent-green/10 border border-accent-green/30 rounded-xl text-xs text-accent-green flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          Security transcript saved to your downloads.
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Security Scenarios & Triage Guide */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Incident Scenarios Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-4">
              <Zap className="w-4 h-4 text-accent-teal" />
              <span>Instant Incident Triage</span>
            </div>
            <div className="space-y-2.5">
              {scenarioPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="w-full text-left p-3 rounded-xl bg-black/40 hover:bg-accent-teal/10 border border-white/5 hover:border-accent-teal/30 transition-all group"
                >
                  <div className="font-semibold text-xs text-white group-hover:text-accent-teal flex items-center justify-between">
                    <span>{item.title}</span>
                    <span className="text-[10px] text-accent-teal opacity-0 group-hover:opacity-100 transition-opacity">Ask →</span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Containment Checklist */}
          <div className="bg-accent-red/5 border border-accent-red/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-accent-red font-bold text-xs uppercase tracking-wider mb-3">
              <ShieldAlert className="w-4 h-4" />
              <span>Active Breach Containment</span>
            </div>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red mt-1.5 shrink-0" />
                <span><strong>Disconnect:</strong> Turn off Wi-Fi and Mobile Data immediately if malware was downloaded.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red mt-1.5 shrink-0" />
                <span><strong>Never Share OTP:</strong> Real bank officials will NEVER ask for SMS OTPs over phone or chat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red mt-1.5 shrink-0" />
                <span><strong>Freeze Cards:</strong> If financial info was entered, lock cards instantly via your bank app.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-red mt-1.5 shrink-0" />
                <span><strong>Revoke Permissions:</strong> In Android Settings, check Apps with <em>Accessibility</em> or <em>Overlay</em> access.</span>
              </li>
            </ul>
          </div>

          {/* Explanatory AI Callout */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white/50 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent-teal shrink-0" />
            <p className="leading-relaxed">
              CyberBot leverages CyberShield's explainable neural checks to decode obfuscated threat indicators in plain language.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-h-[620px]">
          {/* Chat Window Top Bar */}
          <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent-green shadow-[0_0_10px_rgba(46,204,113,0.6)]" />
              <div>
                <span className="text-sm font-bold text-white">Live Threat Intelligence Chat</span>
                <span className="text-xs text-white/40 block">Powered by Gemini 3.8 Flash • Real-time Threat Analysis</span>
              </div>
            </div>
            <div className="text-xs font-mono text-accent-teal/80 bg-accent-teal/10 px-3 py-1 rounded-full border border-accent-teal/20">
              Session Active
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[540px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-accent-teal/25 to-accent-purple/25 border border-accent-teal/40 text-white shadow-lg'
                      : 'bg-white/5 border border-white/10 text-white/90 shadow-xl'
                  }`}
                >
                  {/* Bot Threat Level Badge */}
                  {msg.role === 'assistant' && msg.threatLevel && msg.threatLevel !== 'info' && (
                    <div className="mb-3 flex items-center gap-2">
                      {msg.threatLevel === 'dangerous' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent-red/20 border border-accent-red/40 text-accent-red text-xs font-bold uppercase tracking-wider">
                          <ShieldAlert className="w-4 h-4" />
                          Critical Risk Detected
                        </span>
                      )}
                      {msg.threatLevel === 'suspicious' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent-yellow/20 border border-accent-yellow/40 text-accent-yellow text-xs font-bold uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4" />
                          Suspicious Activity Detected
                        </span>
                      )}
                      {msg.threatLevel === 'safe' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent-green/20 border border-accent-green/40 text-accent-green text-xs font-bold uppercase tracking-wider">
                          <ShieldCheck className="w-4 h-4" />
                          Verified Safe / Low Threat
                        </span>
                      )}
                    </div>
                  )}

                  {/* Formatted Content */}
                  <FormattedMessage content={msg.content} />

                  {/* Action Bar */}
                  {msg.role === 'assistant' && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleSpeech(msg.id, msg.content)}
                          title={speakingId === msg.id ? "Stop voice" : "Read aloud"}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                            speakingId === msg.id ? 'bg-accent-teal/20 text-accent-teal animate-pulse' : 'hover:bg-white/10 text-white/50'
                          }`}
                        >
                          {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span className="text-[11px]">{speakingId === msg.id ? 'Stop' : 'Listen'}</span>
                        </button>

                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy response"
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-accent-green" />
                              <span className="text-[11px] text-accent-green">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.role === 'user' && (
                    <span className="block mt-2 text-[11px] text-white/40 text-right">
                      {msg.timestamp}
                    </span>
                  )}
                </div>

                {/* Follow-up suggestion pills */}
                {msg.role === 'assistant' && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 max-w-[90%]">
                    {msg.suggestedFollowUps.map((suggest, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(suggest)}
                        className="text-left text-xs px-3 py-1.5 rounded-full bg-accent-teal/10 hover:bg-accent-teal/20 text-accent-teal border border-accent-teal/30 hover:border-accent-teal/60 transition-all cursor-pointer"
                      >
                        + {suggest}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* AI Analysis Spinner */}
            {loading && (
              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl max-w-[60%]">
                <div className="w-5 h-5 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-accent-teal font-mono tracking-wider animate-pulse">
                  Analyzing threat patterns & indicators...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-4 bg-slate-900/90 border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              <input
                ref={inputRef}
                id="cyberbot-page-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask CyberBot anything or paste a suspicious SMS / URL / APK permission..."
                disabled={loading}
                className="flex-1 bg-black/60 border border-white/15 focus:border-accent-teal rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-accent-teal transition-all"
              />
              <button
                id="cyberbot-page-submit-btn"
                type="submit"
                disabled={!input.trim() || loading}
                className="px-5 py-3.5 bg-gradient-to-r from-accent-teal to-accent-purple text-primary rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
              >
                <span>Send</span>
                <Send className="w-4 h-4 text-primary" />
              </button>
            </form>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/40 px-1">
              <span>CyberBot provides explainable AI defensive guidance. Always verify sensitive matters with official institutions.</span>
              <span className="hidden sm:inline">Press <strong>Enter</strong> to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
