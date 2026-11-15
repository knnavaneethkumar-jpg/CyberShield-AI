import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  Check, 
  Trash2, 
  Ban, 
  Bot, 
  ExternalLink, 
  X, 
  Smartphone, 
  Zap, 
  Volume2, 
  VolumeX,
  Sparkles, 
  CheckCircle2, 
  Send,
  Radio,
  Play,
  Eye,
  Flag,
  Globe2,
  Fingerprint
} from 'lucide-react';
import { useScamAlert } from '../contexts/ScamAlertContext';
import { MessageSource } from '../types';

interface ScamCenterModalProps {
  onOpenChat?: (query: string, context: string) => void;
}

export const ScamCenterModal: React.FC<ScamCenterModalProps> = ({ onOpenChat }) => {
  const { 
    notifications, 
    unreadCount, 
    isScamCenterOpen, 
    setIsScamCenterOpen,
    isNotificationPermissionGranted,
    requestBrowserNotificationPermission,
    isSentinelActive,
    setIsSentinelActive,
    fastAlertSirenEnabled,
    setFastAlertSirenEnabled,
    markAllAsRead,
    deleteNotification,
    blockSender,
    simulateIncomingScam,
    interceptMessage,
    openScammerDossier
  } = useScamAlert();

  const [activeTab, setActiveTab] = useState<'all' | 'whatsapp' | 'sms' | 'simulator'>('all');
  const [customInput, setCustomInput] = useState('');
  const [customSource, setCustomSource] = useState<MessageSource>('whatsapp');
  const [customSender, setCustomSender] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simulatedFeedback, setSimulatedFeedback] = useState<string | null>(null);

  if (!isScamCenterOpen) return null;

  const filtered = notifications.filter(n => {
    if (activeTab === 'whatsapp') return n.source === 'whatsapp';
    if (activeTab === 'sms') return n.source === 'sms';
    return true;
  });

  const handleSimulate = async (preset: 'whatsapp_family' | 'whatsapp_job' | 'sms_bank' | 'sms_delivery' | 'whatsapp_otp') => {
    setSimulating(true);
    setSimulatedFeedback(null);
    try {
      const res = await simulateIncomingScam(preset);
      setSimulatedFeedback(`Fast notification triggered! ${res.threatType} (${res.riskScore}% risk)`);
      setTimeout(() => setSimulatedFeedback(null), 4000);
    } finally {
      setSimulating(false);
    }
  };

  const handleInterceptCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setSimulating(true);
    try {
      const res = await interceptMessage(
        customInput.trim(),
        customSource,
        customSender.trim() || (customSource === 'whatsapp' ? '+1 555-0199' : 'SMS-NOTICE')
      );
      if (res.isScam) {
        setSimulatedFeedback(`Scam intercepted! Fast notification sent to your device.`);
      } else {
        setSimulatedFeedback(`Message analyzed: No obvious scam patterns detected.`);
      }
      setCustomInput('');
      setTimeout(() => setSimulatedFeedback(null), 4000);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsScamCenterOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-slate-950 text-white rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden backdrop-blur-2xl ring-4 ring-accent-red/10"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-gradient-to-r from-accent-red/10 via-slate-900 to-accent-teal/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent-red/20 text-accent-red rounded-xl border border-accent-red/30 shadow-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold">Fast Scam Notification Sentinel</h2>
                  <span className="text-[10px] bg-accent-red/30 text-accent-red px-2 py-0.5 rounded-full font-mono font-bold">
                    {unreadCount} Unread
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  Real-time AI detection for fake WhatsApp & SMS phishing notifications
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsScamCenterOpen(false)}
              className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Sentinel & Notification Permission Status Bar */}
          <div className="px-5 py-3 border-b border-white/10 bg-black/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-ping ${isSentinelActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="font-semibold text-white/80">
                Sentinel Status: <strong className={isSentinelActive ? 'text-emerald-400' : 'text-amber-400'}>
                  {isSentinelActive ? 'ACTIVE (Real-Time Interception ON)' : 'STANDBY'}
                </strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Fast Siren Alert Toggle */}
              <button
                onClick={() => setFastAlertSirenEnabled(!fastAlertSirenEnabled)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  fastAlertSirenEnabled
                    ? 'bg-accent-red/20 border-accent-red/40 text-accent-red'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                }`}
                title="Toggle instant high-priority audio siren warning for incoming scam alerts"
              >
                {fastAlertSirenEnabled ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{fastAlertSirenEnabled ? 'Fast Siren ON' : 'Fast Siren OFF'}</span>
              </button>

              {!isNotificationPermissionGranted ? (
                <button
                  onClick={requestBrowserNotificationPermission}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal font-bold border border-accent-teal/40 transition-all shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Enable Push Alerts
                </button>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Push Active
                </span>
              )}

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex px-5 pt-3 gap-2 border-b border-white/10 bg-slate-900/50 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'all'
                  ? 'border-accent-teal text-accent-teal'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'whatsapp'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              WhatsApp Scams ({notifications.filter(n => n.source === 'whatsapp').length})
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'sms'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              SMS Phishing ({notifications.filter(n => n.source === 'sms').length})
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'border-accent-purple text-accent-purple'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-accent-purple" />
              Test & Simulate Influx
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4 text-sm">
            {simulatedFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-accent-teal/20 border border-accent-teal/40 text-accent-teal flex items-center gap-2 text-xs font-bold"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{simulatedFeedback}</span>
              </motion.div>
            )}

            {/* TAB: SIMULATOR & INTERCEPTOR */}
            {activeTab === 'simulator' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-accent-purple/10 border border-accent-purple/30">
                  <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-purple" />
                    Fast Notification Simulator
                  </h3>
                  <p className="text-xs text-white/60">
                    Test the speed and accuracy of CyberShield's real-time detection. Click any real-world preset below to simulate an incoming scam notification from WhatsApp or SMS.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                    Instant Simulation Presets
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleSimulate('whatsapp_family')}
                      disabled={simulating}
                      className="p-3.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5" />
                          Fake WhatsApp "Hi Mom" Scam
                        </span>
                        <Play className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-white/50 line-clamp-2">
                        "Hi Dad, my phone broke, transfer $950 to this urgent account..."
                      </p>
                    </button>

                    <button
                      onClick={() => handleSimulate('whatsapp_job')}
                      disabled={simulating}
                      className="p-3.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5" />
                          Fake WhatsApp Job Syndicate
                        </span>
                        <Play className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-white/50 line-clamp-2">
                        "Work from home rating videos! Earn $300-$800 daily on Telegram..."
                      </p>
                    </button>

                    <button
                      onClick={() => handleSimulate('sms_bank')}
                      disabled={simulating}
                      className="p-3.5 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5" />
                          Fake Bank KYC Suspension SMS
                        </span>
                        <Play className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-white/50 line-clamp-2">
                        "URGENT: Your bank debit card will be blocked within 12 hours..."
                      </p>
                    </button>

                    <button
                      onClick={() => handleSimulate('sms_delivery')}
                      disabled={simulating}
                      className="p-3.5 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5" />
                          Fake FedEx Parcel Address Phishing
                        </span>
                        <Play className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-white/50 line-clamp-2">
                        "Package held at hub due to unpaid redelivery fee of $2.45..."
                      </p>
                    </button>
                  </div>
                </div>

                {/* Custom Message Interceptor */}
                <form onSubmit={handleInterceptCustom} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Live Message / Notification Interceptor
                  </h4>
                  <p className="text-[11px] text-white/50">
                    Paste any suspicious message received on WhatsApp or SMS to test instantaneous detection:
                  </p>
                  
                  <div className="flex gap-2">
                    <select
                      value={customSource}
                      onChange={(e) => setCustomSource(e.target.value as MessageSource)}
                      className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-accent-teal"
                    >
                      <option value="whatsapp" className="bg-slate-900 text-white">WhatsApp</option>
                      <option value="sms" className="bg-slate-900 text-white">SMS Text</option>
                      <option value="notification" className="bg-slate-900 text-white">Push Alert</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Sender (e.g. +91 98765 43210 or BANK-ALERT)"
                      value={customSender}
                      onChange={(e) => setCustomSender(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent-teal font-mono"
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Paste message text here (e.g. 'Your account has been locked. Click http://...')"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-accent-teal font-mono"
                  />

                  <button
                    type="submit"
                    disabled={simulating || !customInput.trim()}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-teal to-accent-purple text-slate-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-950" />
                    Intercept & Trigger Fast Notification
                  </button>
                </form>
              </div>
            )}

            {/* LIST OF INTERCEPTED NOTIFICATIONS */}
            {activeTab !== 'simulator' && (
              filtered.length === 0 ? (
                <div className="py-16 text-center text-white/40 space-y-3">
                  <ShieldAlert className="w-12 h-12 mx-auto text-white/20" />
                  <p className="text-sm font-semibold">No scam notifications in this category.</p>
                  <p className="text-xs">Your WhatsApp and SMS streams are safe!</p>
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-accent-teal font-bold transition-colors"
                  >
                    Run a Simulation Test
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filtered.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        !item.read
                          ? 'bg-accent-red/5 border-accent-red/40 ring-1 ring-accent-red/20'
                          : 'bg-white/[0.03] border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            item.source === 'whatsapp'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : item.source === 'sms'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                            {item.source.toUpperCase()}
                          </span>
                          <span className="text-[10px] bg-accent-red/20 text-accent-red px-2 py-0.5 rounded-full font-mono font-bold">
                            {item.riskScore}% RISK
                          </span>
                          <span className="text-xs font-bold text-white">
                            {item.threatType}
                          </span>
                          {item.blocked && (
                            <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                              Sender Blocked
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-white/40">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-white/70 mb-2 font-mono gap-1">
                        <span>
                          From: <strong className="text-white">{item.sender}</strong> ({item.senderName})
                        </span>
                        {item.scammer && (
                          <span className="text-[11px] text-accent-teal flex items-center gap-1 font-sans">
                            <Globe2 className="w-3 h-3 text-accent-teal" />
                            {item.scammer.estimatedLocation}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-mono text-white/90 bg-black/40 p-2.5 rounded-lg border border-white/5 mb-2.5">
                        "{item.rawMessage}"
                      </p>

                      <ul className="space-y-1 mb-3">
                        {item.reasons.map((r, i) => (
                          <li key={i} className="text-[11px] text-accent-red/90 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-accent-red" />
                            {r}
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <span className="text-[11px] text-amber-300/80 italic">
                          Action: {item.recommendedAction}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Inspect Scammer Dossier */}
                          <button
                            onClick={() => {
                              openScammerDossier(item);
                              setIsScamCenterOpen(false);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-accent-red/20 hover:bg-accent-red/30 text-accent-red text-[11px] font-bold border border-accent-red/40 transition-colors flex items-center gap-1 cursor-pointer"
                            title="View full Scammer Dossier & alert intelligence"
                          >
                            <Eye className="w-3 h-3" />
                            Scammer Dossier
                          </button>

                          {!item.blocked && (
                            <button
                              onClick={() => blockSender(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-accent-red/15 hover:bg-accent-red/25 text-accent-red text-[11px] font-bold border border-accent-red/30 transition-colors flex items-center gap-1"
                            >
                              <Ban className="w-3 h-3" />
                              Block
                            </button>
                          )}

                          {onOpenChat && (
                            <button
                              onClick={() => {
                                onOpenChat(
                                  `Analyze this ${item.source.toUpperCase()} scam: "${item.rawMessage}"`,
                                  `Scam Threat: ${item.threatType} (${item.riskScore}%). Sender: ${item.sender}`
                                );
                                setIsScamCenterOpen(false);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-accent-teal/15 hover:bg-accent-teal/25 text-accent-teal text-[11px] font-bold border border-accent-teal/30 transition-colors flex items-center gap-1"
                            >
                              <Bot className="w-3 h-3" />
                              Explain
                            </button>
                          )}

                          <button
                            onClick={() => deleteNotification(item.id)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-accent-red transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
