import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  MessageSquare, 
  X, 
  Bot, 
  Ban, 
  ExternalLink,
  Smartphone,
  CheckCircle,
  BellRing,
  Fingerprint,
  Radio,
  Eye
} from 'lucide-react';
import { useScamAlert } from '../contexts/ScamAlertContext';

interface FastScamAlertPopupProps {
  onOpenChat?: (query: string, context: string) => void;
}

export const FastScamAlertPopup: React.FC<FastScamAlertPopupProps> = ({ onOpenChat }) => {
  const { activeAlert, dismissActiveAlert, blockSender, markAsRead, openScammerDossier } = useScamAlert();

  if (!activeAlert) return null;

  const handleInspectScammer = () => {
    openScammerDossier(activeAlert);
    dismissActiveAlert();
  };

  const handleExplain = () => {
    if (onOpenChat) {
      onOpenChat(
        `Explain this fake ${activeAlert.source.toUpperCase()} scam: "${activeAlert.rawMessage}"`,
        `Detected Fake ${activeAlert.source.toUpperCase()} Scam: ${activeAlert.threatType} (${activeAlert.riskScore}% risk). Sender: ${activeAlert.sender}`
      );
    }
    markAsRead(activeAlert.id);
    dismissActiveAlert();
  };

  const handleBlock = () => {
    blockSender(activeAlert.id);
    dismissActiveAlert();
  };

  const isWhatsApp = activeAlert.source === 'whatsapp';
  const isSMS = activeAlert.source === 'sms';
  const scammer = activeAlert.scammer;

  return (
    <AnimatePresence>
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.96 }}
          transition={{ type: 'spring', damping: 22, stiffness: 340 }}
          className="w-full max-w-6xl bg-slate-950/95 text-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-accent-red/85 p-3.5 sm:p-4 pointer-events-auto backdrop-blur-2xl ring-4 ring-accent-red/20 overflow-hidden relative"
        >
          {/* Pulsing Alert Scanline Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent-red via-amber-400 to-accent-red animate-pulse" />

          {/* Horizontal Layout Container */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 pt-0.5">
            
            {/* Left Section: Threat Icon, Alert Badge & Scammer ID */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2.5 sm:p-3 bg-accent-red/25 text-accent-red rounded-xl sm:rounded-2xl border border-accent-red/50 animate-pulse shadow-lg shadow-accent-red/25">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-accent-red uppercase px-2 py-0.5 rounded bg-accent-red/20 border border-accent-red/30 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-ping" />
                    FAST SCAMMER ALERT
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isWhatsApp 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isSMS 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  }`}>
                    {activeAlert.source.toUpperCase()}
                  </span>
                  <span className="text-[9px] sm:text-[10px] bg-accent-red/30 text-accent-red border border-accent-red/40 px-2 py-0.5 rounded-full font-mono font-bold">
                    {activeAlert.riskScore}% RISK
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate max-w-[240px] sm:max-w-xs">
                    {scammer?.name || `${activeAlert.threatType} Threat`}
                  </h3>
                  <span className="text-[11px] text-white/50 font-mono hidden sm:inline">
                    • {activeAlert.sender}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section: Intercepted Message & Quick Defense in Horizontal Flow */}
            <div className="flex-1 min-w-0 px-0 lg:px-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-black/40 p-2 sm:p-2.5 rounded-xl border border-white/10 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-accent-teal shrink-0">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span className="text-[11px] text-white/70 font-semibold">{scammer?.estimatedLocation || 'Spoofed Gateway'}:</span>
                </div>
                <div className="text-white/90 truncate italic text-[11px] flex-1">
                  "{activeAlert.rawMessage}"
                </div>
                <div className="text-[10px] text-amber-300/90 font-sans font-medium shrink-0 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  ⚡ {activeAlert.recommendedAction}
                </div>
              </div>
            </div>

            {/* Right Section: Horizontal Action Buttons & Dismiss */}
            <div className="flex items-center justify-end gap-2 shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-white/10">
              <button
                onClick={handleInspectScammer}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-accent-red hover:bg-accent-red/90 text-white font-black text-xs transition-all shadow-md shadow-accent-red/30 cursor-pointer shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Dossier</span>
              </button>

              <button
                onClick={handleBlock}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-colors shrink-0"
              >
                <Ban className="w-3.5 h-3.5 text-accent-red" />
                <span>{activeAlert.blocked ? 'Blocked' : 'Block'}</span>
              </button>

              <button
                onClick={handleExplain}
                className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-accent-teal/20 hover:bg-accent-teal/30 border border-accent-teal/40 text-accent-teal font-bold text-xs transition-colors shrink-0"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI</span>
              </button>

              <button
                onClick={dismissActiveAlert}
                className="p-1.5 sm:p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
