import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Ban, 
  Bot, 
  Copy, 
  Check, 
  X, 
  Globe2, 
  Radio, 
  Smartphone, 
  Send, 
  Share2, 
  Fingerprint, 
  Activity,
  Flag,
  Server,
  Crosshair,
  Lock,
  MessageSquareWarning,
  ExternalLink
} from 'lucide-react';
import { useScamAlert } from '../contexts/ScamAlertContext';

interface ScammerDossierModalProps {
  onOpenChat?: (query: string, context: string) => void;
}

export const ScammerDossierModal: React.FC<ScammerDossierModalProps> = ({ onOpenChat }) => {
  const { 
    selectedScammerDossier, 
    closeScammerDossier, 
    blockSender, 
    reportScammer 
  } = useScamAlert();

  const [copiedBroadcast, setCopiedBroadcast] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportResult, setReportResult] = useState<string | null>(null);

  if (!selectedScammerDossier) return null;

  const item = selectedScammerDossier;
  const scammer = item.scammer;
  const isWhatsApp = item.source === 'whatsapp';
  const isSMS = item.source === 'sms';

  const handleCopyBroadcast = () => {
    const text = `🚨 CYBERSHIELD SCAMMER ALERT: Beware of fake messages from "${item.sender}" (${scammer?.name || 'Known Scammer'}). They are sending fake ${item.source.toUpperCase()} messages: "${item.rawMessage}". Do NOT transfer funds or click any links!`;
    navigator.clipboard.writeText(text);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 3000);
  };

  const handleReport = async () => {
    setReporting(true);
    try {
      const res = await reportScammer(item.id);
      if (res.success) {
        setReportResult(res.incidentRef);
      }
    } finally {
      setReporting(false);
    }
  };

  const handleChatWithCyberBot = () => {
    if (onOpenChat) {
      onOpenChat(
        `Provide an intelligence countermeasure strategy against this scammer: ${scammer?.name || 'Scammer'} (${item.sender}). They sent: "${item.rawMessage}"`,
        `Scammer Profile: ${scammer?.name} (${scammer?.threatGroup || 'Cyber Syndicate'}). Location/Carrier: ${scammer?.estimatedLocation || 'Spoofed'}. Target: ${scammer?.targetAsset || 'Funds'}. Risk: ${item.riskScore}%.`
      );
    }
    closeScammerDossier();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeScammerDossier}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="relative z-10 w-full max-w-5xl max-h-[92vh] bg-slate-950 text-white rounded-3xl shadow-2xl border-2 border-accent-red/70 flex flex-col overflow-hidden backdrop-blur-2xl ring-4 ring-accent-red/20"
        >
          {/* Pulsing Emergency Beacon Stripe */}
          <div className="h-2 w-full bg-gradient-to-r from-accent-red via-amber-400 to-accent-red animate-pulse" />

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-accent-red/20 via-slate-900 to-slate-950 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 sm:p-3 bg-accent-red/25 text-accent-red rounded-2xl border border-accent-red/50 shadow-lg animate-pulse">
                <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black tracking-widest text-accent-red uppercase px-2 py-0.5 rounded bg-accent-red/20 border border-accent-red/30 flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-ping" />
                    FAST SCAMMER ALERT
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isWhatsApp 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : isSMS 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' 
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  }`}>
                    {item.source.toUpperCase()} NOTIFICATION
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {item.riskScore}% RISK
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-1">
                  {scammer?.name || 'Scammer Threat Profile'}
                </h2>
                <p className="text-xs text-white/60 font-mono flex items-center gap-1.5 mt-0.5">
                  <Fingerprint className="w-3.5 h-3.5 text-accent-teal" />
                  Scammer Identifier: <strong className="text-white">{item.sender}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={closeScammerDossier}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              title="Close Dossier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Horizontal Split Dossier Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column (5 cols): Scammer Identity, Routing & Community Threat */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Geo-Routing & Carrier */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-accent-teal" />
                    Estimated Geo-Routing & Network
                  </span>
                  <p className="text-xs font-semibold text-white">
                    {scammer?.estimatedLocation || 'Spoofed Cloud IP Gateway'}
                  </p>
                  <p className="text-[11px] text-white/60 font-mono">
                    Carrier / Route: <strong className="text-accent-teal">{scammer?.carrierOrRouting || 'Disposable Virtual SIM'}</strong>
                  </p>
                </div>

                {/* Target Asset in Jeopardy */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-accent-red" />
                    Target Asset in Jeopardy
                  </span>
                  <p className="text-xs font-semibold text-accent-red">
                    {scammer?.targetAsset || 'Emergency Bank Wire / Personal Data'}
                  </p>
                  <p className="text-[11px] text-white/60 font-mono">
                    Syndicate: <strong className="text-white">{scammer?.threatGroup || 'Transnational Phishing Ring'}</strong>
                  </p>
                </div>

                {/* Global Community Threat Status */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      Global Community Threat Level
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {scammer?.globalReportsCount || 487} Victims Flagged
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-accent-red h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, item.riskScore)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/50 font-mono pt-0.5">
                    <span>Status: <strong className="text-accent-red">{scammer?.status || 'ACTIVE_SYNDICATE'}</strong></span>
                    <span>Reputation: {scammer?.reputationScore || 98}/100 Confirmed</span>
                  </div>
                </div>

                {/* Immediate AI Defense Instruction */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Immediate Defense Instruction:</strong>
                    <p className="text-white/80 leading-relaxed text-[11px]">
                      {item.recommendedAction}
                    </p>
                  </div>
                </div>

              </div>

              {/* Right Column (7 cols): Intercepted Payload, Tactics & Feedback */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* The Scammer's Intercepted Notification & Payload */}
                <div className="p-4 rounded-2xl bg-black/50 border border-accent-red/30 space-y-2.5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <MessageSquareWarning className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">Original Fake Message from Scammer:</span>
                    </div>
                    <span className="px-2 py-0.5 bg-accent-red/20 text-accent-red border border-accent-red/30 text-[10px] font-mono font-bold uppercase rounded-lg">
                      Intercepted
                    </span>
                  </div>

                  <blockquote className="p-3 rounded-xl bg-black/70 border border-white/10 text-xs font-mono text-white/90 leading-relaxed italic select-all">
                    "{item.rawMessage}"
                  </blockquote>

                  <div>
                    <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider block mb-1.5">
                      Scammer Deception & Evasion Tactics Detected:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {(scammer?.tactics || item.reasons).map((tactic, idx) => (
                        <li key={idx} className="text-[11px] text-white/80 flex items-start gap-1.5 bg-white/[0.03] p-2 rounded-xl border border-white/5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-red shrink-0 mt-1" />
                          <span>{tactic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Global Report Feedback Banner */}
                {reportResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Reported to Global Cybercrime Blacklist Registry! Ref: {reportResult}</span>
                    </div>
                    <span className="text-[10px] text-white/60 font-mono">Synced</span>
                  </motion.div>
                )}

              </div>

            </div>
          </div>

          {/* Action Center Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Report Scammer Button */}
              <button
                onClick={handleReport}
                disabled={reporting || scammer?.reported || !!reportResult}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-red/20 hover:bg-accent-red/30 border border-accent-red/40 text-accent-red font-bold text-xs transition-all disabled:opacity-50"
              >
                <Flag className="w-3.5 h-3.5" />
                {scammer?.reported || reportResult ? 'Reported to NC3' : reporting ? 'Broadcasting Report...' : 'Report Scammer Globally'}
              </button>

              {/* Block & Quarantine Button */}
              <button
                onClick={() => blockSender(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                  item.blocked
                    ? 'bg-white/10 border-white/20 text-white/60'
                    : 'bg-white/5 hover:bg-white/10 border-white/20 text-white'
                }`}
              >
                <Ban className="w-3.5 h-3.5 text-accent-red" />
                {item.blocked ? 'Scammer Blocked' : 'Block Number'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Copy Broadcast Card for WhatsApp/Family */}
              <button
                onClick={handleCopyBroadcast}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs transition-all"
                title="Copy warning message to forward to family or friends"
              >
                {copiedBroadcast ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {copiedBroadcast ? 'Warning Copied!' : 'Share Alert to Family'}
              </button>

              {/* Ask CyberBot to Counter */}
              <button
                onClick={handleChatWithCyberBot}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-accent-teal to-accent-purple text-slate-950 font-black text-xs transition-all hover:opacity-95 shadow-md shadow-accent-teal/20"
              >
                <Bot className="w-3.5 h-3.5 text-slate-950" />
                Ask CyberBot
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
