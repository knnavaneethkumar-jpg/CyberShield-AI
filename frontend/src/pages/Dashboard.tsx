import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, MessageSquare, Link as LinkIcon, Shield, Loader2, AlertCircle, CheckCircle2, ThumbsUp, ThumbsDown, Bot, Settings, AlertTriangle, Bell, BellRing, Smartphone, Zap, Radio, Play, Sparkles, Ban, Trash2, Eye } from 'lucide-react';
import { Button, Card, Input, TextArea } from '../components/UI';
import { Translation, ScanType, ScanResult, UserSettings, DEFAULT_USER_SETTINGS } from '../types';
import { RiskMeter } from '../components/RiskMeter';
import { AILoader } from '../components/AILoader';
import { explainScan } from '../services/geminiService';
import { loadUserSettings, playAlertSynth } from '../services/settingsService';
import { Info, ShieldAlert, ListChecks, Terminal, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useScamAlert } from '../contexts/ScamAlertContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ThreatHistory } from '../components/ThreatHistory';

interface DashboardProps {
  t: Translation;
  onOpenChat?: (query: string, context: string) => void;
  onNavigate?: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ t, onOpenChat, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<ScanType | 'history' | 'sentinel'>('app');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    interceptMessage, 
    simulateIncomingScam, 
    isSentinelActive, 
    setIsSentinelActive,
    isNotificationPermissionGranted,
    requestBrowserNotificationPermission,
    blockSender,
    deleteNotification,
    openScammerDossier
  } = useScamAlert();

  const [userSettings, setUserSettings] = useState<UserSettings>({
    ...DEFAULT_USER_SETTINGS,
    userId: user?.uid || 'anonymous'
  });

  useEffect(() => {
    async function fetchSettings() {
      if (user) {
        const s = await loadUserSettings(user.uid, user.isDemo);
        setUserSettings(s);
      }
    }
    fetchSettings();
  }, [user]);

  const handleScan = async () => {
    // Validation
    if (activeTab === 'history') return;
    if (activeTab !== 'app' && !inputValue.trim()) {
      setError(activeTab === 'message' ? 'Please enter a message to scan' : 'Please enter a URL to scan');
      return;
    }
    
    setError(null);
    setIsScanning(true);
    setResult(null);
    setFeedback(null);
    
    const scanInput = activeTab === 'app' ? 'SuspiciousApp.apk' : inputValue;

    try {
      const aiResult = await explainScan(activeTab, scanInput, user?.uid);
      const newResult: ScanResult = {
        score: aiResult.riskScore,
        type: aiResult.classification,
        threatLabel: aiResult.classification === 'Safe' ? 'Verified Secure' : 
                     aiResult.classification === 'Suspicious' ? 'Potential Threat' : 'Dangerous Threat',
        explanation: aiResult.explanation,
        details: aiResult.riskFactors,
        whyFlagged: aiResult.whyFlagged,
        riskFactors: aiResult.riskFactors,
        recommendedActions: aiResult.recommendedActions,
        detailedLog: aiResult.detailedLog,
        timestamp: new Date().toISOString(),
        mlModelAvailable: aiResult.mlModelAvailable,
        mlPrediction: aiResult.mlPrediction,
        mlRiskScore: aiResult.mlRiskScore,
        mlModality: aiResult.mlModality
      };
      
      setResult(newResult);

      // Play alert tone if audio alert enabled in Settings
      if (userSettings.soundAlerts) {
        if (aiResult.classification === 'Dangerous') {
          playAlertSynth('critical');
        } else if (aiResult.classification === 'Suspicious') {
          playAlertSynth('warning');
        } else {
          playAlertSynth('success');
        }
      }

      // If message scan detected high-risk scam, trigger fast scam notification alert
      if (activeTab === 'message' && (aiResult.classification === 'Dangerous' || aiResult.riskScore >= 70)) {
        const isWa = inputValue.toLowerCase().includes('whatsapp') || inputValue.toLowerCase().includes('mum') || inputValue.toLowerCase().includes('dad') || inputValue.toLowerCase().includes('telegram');
        interceptMessage(inputValue, isWa ? 'whatsapp' : 'sms', isWa ? '+1 (555) 019-2834' : 'SMS-ALERT');
      }

      // Save to Firestore if user is authenticated
      if (user) {
        try {
          await addDoc(collection(db, 'users', user.uid, 'scans'), {
            userId: user.uid,
            type: activeTab,
            input: scanInput,
            riskScore: aiResult.riskScore,
            classification: aiResult.classification,
            explanation: aiResult.explanation,
            whyFlagged: aiResult.whyFlagged,
            riskFactors: aiResult.riskFactors,
            recommendedActions: aiResult.recommendedActions,
            detailedLog: aiResult.detailedLog,
            timestamp: serverTimestamp()
          });
        } catch (dbError) {
          console.error("Failed to save scan history:", dbError);
        }
      }
      
      setIsScanning(false);
    } catch (err) {
      console.error(err);
      setError("AI Analysis failed. Please try again.");
      setIsScanning(false);
    }
  };

  const tabs = [
    { id: 'app', label: t.appScan, icon: Upload },
    { id: 'message', label: t.messageScan, icon: MessageSquare },
    { id: 'sentinel', label: 'Scam Sentinel (WhatsApp & SMS)', icon: BellRing },
    { id: 'link', label: t.linkScan, icon: LinkIcon },
    ...(user ? [{ id: 'history', label: 'History', icon: History }] : []),
  ];

  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-accent-teal to-accent-purple bg-clip-text text-transparent">{t.dashboard}</h1>
        <p className="text-white/50 mb-3">Select a scan type and let our AI protect you.</p>
        
        {/* Active Engine Calibration Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
          <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
          <span>AI Sensitivity: <strong className="text-white capitalize">{userSettings.sensitivity}</strong></span>
          <span className="text-white/20">•</span>
          <button 
            onClick={() => onNavigate?.('settings')}
            className="text-accent-teal hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Settings className="w-3 h-3" />
            Configure Settings
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-teal/10 border border-accent-teal/20 text-xs text-white/70">
          <span className={`w-2 h-2 rounded-full ${result?.mlModelAvailable ? 'bg-accent-teal animate-pulse' : 'bg-white/30'}`} />
          <span>
            Unified ML Model: <strong className="text-white">
              {result?.mlModelAvailable ? `${result.mlModality?.toUpperCase()} ${result.mlRiskScore?.toFixed(1)}% ${result.mlPrediction}` : 'Backend model not loaded'}
            </strong>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Tabs */}
        <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as ScanType);
                setResult(null);
                setInputValue('');
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-accent-teal to-accent-purple text-primary font-bold shadow-[0_0_20px_rgba(0,209,193,0.3)]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Input Area */}
        <Card className="p-8 border-white/20 relative overflow-hidden min-h-[400px] flex flex-col justify-center bg-primary/40 backdrop-blur-md">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="relative z-10"
              >
                <AILoader t={t} text={t.scanning} />
              </motion.div>
            ) : activeTab === 'history' ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <History className="w-5 h-5 text-accent-teal" />
                  Threat History
                </h2>
                <ThreatHistory />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 relative z-10"
              >
                {activeTab === 'app' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Left: Upload & Drag Drop (5 cols) */}
                    <div 
                      className="lg:col-span-5 border-2 border-dashed border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:border-accent-teal/50 transition-colors cursor-pointer group bg-white/[0.02] flex flex-col items-center justify-center min-h-[300px]"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <div className="inline-flex p-4 bg-accent-teal/10 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-accent-teal" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold mb-1 text-white">Drag & drop your file here</h3>
                      <p className="text-white/40 text-xs mb-4">Supports APK, EXE, DMG (Max 50MB)</p>
                      <input 
                        type="file" 
                        className="hidden" 
                        id="file-upload" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setInputValue(e.target.files[0].name);
                            setError(null);
                          }
                        }}
                      />
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById('file-upload')?.click();
                        }}
                      >
                        Browse Files
                      </Button>
                      {inputValue && (
                        <div className="mt-4 px-3 py-1.5 rounded-lg bg-accent-teal/15 text-accent-teal text-xs font-mono border border-accent-teal/30 truncate max-w-full">
                          Target: {inputValue}
                        </div>
                      )}
                    </div>

                    {/* Right: Horizontal App Security Features & Preset Simulator (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-4 bg-black/40 p-4 sm:p-5 rounded-2xl border border-white/10">
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-accent-teal flex items-center gap-1.5 font-mono">
                            <Shield className="w-3.5 h-3.5" />
                            Deep App Binary Analysis Features
                          </h4>
                          <span className="text-[10px] bg-accent-teal/15 text-accent-teal border border-accent-teal/30 px-2 py-0.5 rounded-full font-mono">
                            Active Engine
                          </span>
                        </div>

                        {/* Horizontal Features Pipeline */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-left">
                            <span className="text-[9px] uppercase font-bold text-white/40 block">Phase 1</span>
                            <span className="text-xs font-bold text-white block">Manifest</span>
                            <span className="text-[10px] text-white/50">Permissions</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-left">
                            <span className="text-[9px] uppercase font-bold text-white/40 block">Phase 2</span>
                            <span className="text-xs font-bold text-white block">Signatures</span>
                            <span className="text-[10px] text-white/50">Keystore audit</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-left">
                            <span className="text-[9px] uppercase font-bold text-white/40 block">Phase 3</span>
                            <span className="text-xs font-bold text-white block">Sandbox</span>
                            <span className="text-[10px] text-white/50">C2 Beaconing</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-left">
                            <span className="text-[9px] uppercase font-bold text-white/40 block">Phase 4</span>
                            <span className="text-xs font-bold text-white block">Threat Score</span>
                            <span className="text-[10px] text-accent-teal font-mono">Explainable AI</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Test Simulated APK Files */}
                      <div>
                        <span className="text-xs text-white/60 block mb-2 font-medium">Or simulate analyzing real-world sample packages:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setInputValue('WhatsApp_Pink_Update_v2.4.apk (Fake theme APK requesting READ_SMS, SYSTEM_ALERT_WINDOW, RECEIVE_BOOT_COMPLETED)');
                              setError(null);
                            }}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-accent-red/10 border border-white/10 hover:border-accent-red/30 text-left transition-all text-xs group cursor-pointer"
                          >
                            <span className="font-bold text-accent-red block group-hover:underline">WhatsApp_Pink.apk</span>
                            <span className="text-[10px] text-white/50">Fake WhatsApp theme with SMS spyware</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInputValue('SBI_YONO_Lite_Passbook.apk (Phishing app disguised as Indian public sector bank app exfiltrating credentials)');
                              setError(null);
                            }}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-accent-red/10 border border-white/10 hover:border-accent-red/30 text-left transition-all text-xs group cursor-pointer"
                          >
                            <span className="font-bold text-accent-red block group-hover:underline">SBI_YONO_Fake.apk</span>
                            <span className="text-[10px] text-white/50">Banking credential harvester trojan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInputValue('Fast_Phone_Booster_Pro.apk (Adware & background cryptocurrency miner abusing wake-lock and accessibility service)');
                              setError(null);
                            }}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-400/10 border border-white/10 hover:border-amber-400/30 text-left transition-all text-xs group cursor-pointer"
                          >
                            <span className="font-bold text-amber-300 block group-hover:underline">Phone_Booster_Pro.apk</span>
                            <span className="text-[10px] text-white/50">Cryptominer abusing accessibility service</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInputValue('Google_Photos_Backup_Clean.apk (Verified official signed package with standard storage permissions)');
                              setError(null);
                            }}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-accent-green/10 border border-white/10 hover:border-accent-green/30 text-left transition-all text-xs group cursor-pointer"
                          >
                            <span className="font-bold text-accent-green block group-hover:underline">Photos_Clean_Signed.apk</span>
                            <span className="text-[10px] text-white/50">Legitimate benchmark sample package</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'message' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-white/70">Paste Message Content (WhatsApp, SMS, or Notification)</label>
                      <span className="text-xs text-accent-teal flex items-center gap-1 font-mono">
                        <Zap className="w-3 h-3" /> Fast Notification Enabled
                      </span>
                    </div>
                    <TextArea 
                      placeholder="Paste SMS, WhatsApp chat, or notification text here..."
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        if (e.target.value.trim()) setError(null);
                      }}
                      className={error ? 'border-accent-red/50 focus:border-accent-red focus:ring-accent-red/20' : ''}
                    />

                    {/* Quick Test Presets */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-white/50">Simulate Scam:</span>
                      <button
                        type="button"
                        onClick={() => setInputValue('Hi Mum, I dropped my phone in water and this is my temporary WhatsApp number. Please transfer $850 for my emergency car repair: BSB 062-000 Acc 12984928 urgently! Don\'t call.')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                      >
                        WhatsApp "Hi Mum"
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputValue('Part-time job rating YouTube videos! Earn $300-$800 daily working from home. Join our Telegram manager: https://t.me/vip_rating_jobs_bot to claim bonus.')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                      >
                        WhatsApp Job Scam
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputValue('URGENT: Your HDFC/SBI bank account and debit card will be blocked within 12 hours due to pending KYC. Click to verify PAN: http://sbi-kyc-verify.top/login')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors cursor-pointer"
                      >
                        Bank KYC SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputValue('FedEx: Parcel #FX-928419 held at local hub due to unpaid redelivery fee of $2.45. Click to update address: http://fedx-secure-portal.xyz/fee')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors cursor-pointer"
                      >
                        FedEx Parcel SMS
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'sentinel' && (
                  <div className="space-y-6">
                    {/* Sentinel Header */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-accent-red/15 via-slate-900 to-accent-teal/15 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-accent-red/20 text-accent-red rounded-xl border border-accent-red/40 animate-pulse">
                          <BellRing className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-white flex items-center gap-2">
                            Real-Time WhatsApp & SMS Scam Sentinel
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                              ONLINE
                            </span>
                          </h3>
                          <p className="text-xs text-white/60 mt-0.5">
                            Automatically triggers instant push & audio notifications upon intercepting fake messages from WhatsApp or SMS.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isNotificationPermissionGranted && (
                          <button
                            onClick={requestBrowserNotificationPermission}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-teal text-slate-950 font-bold text-xs hover:bg-accent-teal/90 transition-colors shadow-lg"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            Enable Browser Push
                          </button>
                        )}
                        <button
                          onClick={() => setIsSentinelActive(!isSentinelActive)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                            isSentinelActive
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : 'bg-white/10 border-white/20 text-white/60'
                          }`}
                        >
                          {isSentinelActive ? 'Sentinel Active' : 'Sentinel Paused'}
                        </button>
                      </div>
                    </div>

                    {/* Simulation Triggers Grid */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3 flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-accent-purple" />
                        Test Fast Notification Trigger
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                          type="button"
                          onClick={() => simulateIncomingScam('whatsapp_family')}
                          className="p-3.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-left transition-all group"
                        >
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                            <Smartphone className="w-3.5 h-3.5" />
                            Fake WhatsApp
                          </span>
                          <p className="text-[11px] text-white/50 line-clamp-2">
                            "Hi Dad, phone broke, transfer $950..."
                          </p>
                          <span className="text-[10px] text-accent-teal font-mono mt-2 inline-block group-hover:underline">
                            Trigger Fast Alert →
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => simulateIncomingScam('whatsapp_job')}
                          className="p-3.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-left transition-all group"
                        >
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                            <Smartphone className="w-3.5 h-3.5" />
                            WhatsApp Job Scam
                          </span>
                          <p className="text-[11px] text-white/50 line-clamp-2">
                            "Earn $300-$800 daily rating videos..."
                          </p>
                          <span className="text-[10px] text-accent-teal font-mono mt-2 inline-block group-hover:underline">
                            Trigger Fast Alert →
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => simulateIncomingScam('sms_bank')}
                          className="p-3.5 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 text-left transition-all group"
                        >
                          <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                            <Smartphone className="w-3.5 h-3.5" />
                            Fake Bank SMS
                          </span>
                          <p className="text-[11px] text-white/50 line-clamp-2">
                            "Account suspended, verify PAN..."
                          </p>
                          <span className="text-[10px] text-accent-teal font-mono mt-2 inline-block group-hover:underline">
                            Trigger Fast Alert →
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => simulateIncomingScam('sms_delivery')}
                          className="p-3.5 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 text-left transition-all group"
                        >
                          <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                            <Smartphone className="w-3.5 h-3.5" />
                            FedEx Parcel SMS
                          </span>
                          <p className="text-[11px] text-white/50 line-clamp-2">
                            "Parcel held for $2.45 redelivery..."
                          </p>
                          <span className="text-[10px] text-accent-teal font-mono mt-2 inline-block group-hover:underline">
                            Trigger Fast Alert →
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Intercepted Notifications Stream */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">
                          Intercepted Scam Notifications ({notifications.length})
                        </h4>
                        <span className="text-[10px] text-white/40">
                          Stored locally & protected
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                  n.source === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {n.source}
                                </span>
                                <span className="text-[10px] bg-accent-red/20 text-accent-red px-1.5 py-0.5 rounded font-mono font-bold">
                                  {n.riskScore}% RISK
                                </span>
                                <strong className="text-white">{n.threatType}</strong>
                                <span className="text-white/40 text-[10px]">
                                  From {n.sender}
                                </span>
                              </div>
                              <p className="text-[11px] text-white/80 font-mono line-clamp-1">
                                "{n.rawMessage}"
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => openScammerDossier(n)}
                                className="px-2.5 py-1 rounded bg-accent-red/20 hover:bg-accent-red/30 text-accent-red text-[11px] font-bold border border-accent-red/30 transition-colors flex items-center gap-1 cursor-pointer"
                                title="View Scammer Intelligence Dossier & Alert"
                              >
                                <Eye className="w-3 h-3" />
                                Scammer
                              </button>
                              <button
                                onClick={() => blockSender(n.id)}
                                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-white/80 text-[11px] font-bold transition-colors"
                              >
                                {n.blocked ? 'Blocked' : 'Block'}
                              </button>
                              {onOpenChat && (
                                <button
                                  onClick={() => onOpenChat(`Explain scam: ${n.rawMessage}`, `Threat: ${n.threatType}`)}
                                  className="px-2.5 py-1 rounded bg-accent-teal/15 hover:bg-accent-teal/25 text-accent-teal text-[11px] font-bold transition-colors"
                                >
                                  Explain
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(n.id)}
                                className="p-1 text-white/40 hover:text-white"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'link' && (
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-white/70">Enter URL</label>
                    <Input 
                      placeholder="https://example.com/suspicious-page"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        if (e.target.value.trim()) setError(null);
                      }}
                      className={error ? 'border-accent-red/50 focus:border-accent-red focus:ring-accent-red/20' : ''}
                    />
                  </div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-accent-red text-sm bg-accent-red/10 p-3 rounded-lg border border-accent-red/20"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}

                {activeTab !== 'sentinel' && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      glow 
                      className={`w-full sm:w-64 bg-gradient-to-r from-accent-teal to-accent-purple hover:opacity-90 transition-all duration-300 ${inputValue.trim() || activeTab === 'app' ? 'animate-pulse-glow' : 'opacity-50'}`}
                      onClick={handleScan}
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      {t.scanNow}
                    </Button>
                    {inputValue && (
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full sm:w-32 border-white/10 hover:bg-white/5"
                        onClick={() => {
                          setInputValue('');
                          setError(null);
                          setResult(null);
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Results Area */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Critical Alert Banner if enabled in Settings */}
              {userSettings.criticalWarningBanner && result.type === 'Dangerous' && (
                <div className="p-4 rounded-2xl bg-accent-red/20 border-2 border-accent-red/50 text-accent-red flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-wider text-white">Critical Severity Threat Flagged</h4>
                      <p className="text-xs text-white/70">Potential malware or data exfiltration payload detected. Immediate triage recommended.</p>
                    </div>
                  </div>
                  {onOpenChat && (
                    <button
                      onClick={() => onOpenChat(
                        `Urgent: Analyze dangerous threat detected in ${activeTab}`,
                        `Type: ${activeTab}, Classification: Dangerous, RiskScore: ${result.score}, Explanation: ${result.explanation}`
                      )}
                      className="px-3 py-1.5 rounded-lg bg-accent-red text-white text-xs font-bold hover:bg-accent-red/90 transition-all flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Contain with CyberBot</span>
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Risk Score */}
                <Card className="md:col-span-1 flex flex-col items-center justify-center py-10">
                  <RiskMeter score={result.score} />
                  <div className={`mt-6 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest ${
                    result.type === 'Safe' ? 'bg-accent-green/20 text-accent-green' :
                    result.type === 'Suspicious' ? 'bg-accent-yellow/20 text-accent-yellow' :
                    'bg-accent-red/20 text-accent-red'
                  }`}>
                    {result.threatLabel}
                  </div>
                </Card>

                {/* AI Explanation */}
                <Card className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-accent-teal" />
                      Explainable AI Analysis
                    </h3>
                    <p className="text-white/70 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                      {result.explanation}
                    </p>

                    {onOpenChat && (
                      <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-accent-teal/10 border border-accent-teal/30">
                        <div className="flex items-center gap-2 text-xs text-white/80">
                          <Bot className="w-4 h-4 text-accent-teal" />
                          <span>Need deep advice or incident response for this threat?</span>
                        </div>
                        <button
                          onClick={() => onOpenChat(
                            `I scanned a ${activeTab} (${inputValue || 'sample'}) with risk score ${result.score} (${result.type}). What specific safety measures should I take?`,
                            `Type: ${activeTab}, Classification: ${result.type}, RiskScore: ${result.score}, Explanation: ${result.explanation}`
                          )}
                          className="px-3 py-1.5 rounded-lg bg-accent-teal text-primary text-xs font-bold hover:bg-accent-teal/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Ask CyberBot</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Risk Factors
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.riskFactors?.map((factor, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-white/80 bg-white/5 p-2 rounded-lg">
                          <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${result.type === 'Dangerous' ? 'text-accent-red' : 'text-accent-yellow'}`} />
                          {factor}
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.whyFlagged && result.whyFlagged.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Why this was flagged?
                      </h4>
                      <ul className="space-y-2">
                        {result.whyFlagged.map((reason, i) => (
                          <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-teal mt-1.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.recommendedActions && result.recommendedActions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                        <ListChecks className="w-4 h-4" />
                        Recommended Actions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.recommendedActions.map((action, i) => (
                          <span key={i} className="px-3 py-1 bg-accent-teal/10 text-accent-teal rounded-full text-xs font-bold border border-accent-teal/20">
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback Mechanism */}
                  <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm text-white/50">Was this report helpful?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFeedback('up')}
                        className={`p-2 rounded-lg transition-all ${
                          feedback === 'up' 
                            ? 'bg-accent-green/20 text-accent-green' 
                            : 'hover:bg-white/5 text-white/30 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setFeedback('down')}
                        className={`p-2 rounded-lg transition-all ${
                          feedback === 'down' 
                            ? 'bg-accent-red/20 text-accent-red' 
                            : 'hover:bg-white/5 text-white/30 hover:text-white'
                        }`}
                      >
                        <ThumbsDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Detailed Analysis Section */}
              <Card className="p-0 overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors list-none">
                    <span className="font-bold">{t.detailedAnalysis}</span>
                    <motion.div
                      animate={{ rotate: 0 }}
                      className="group-open:rotate-180 transition-transform"
                    >
                      <LinkIcon className="w-5 h-5 text-white/30" />
                    </motion.div>
                  </summary>
                  <div className="p-6 pt-0 border-t border-white/5 text-sm text-white/50 space-y-4">
                    <p>{t.detailedAnalysisDesc}</p>
                    <div className="bg-black/40 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre border border-white/5 text-blue-400">
                      <div className="flex items-center gap-2 mb-2 text-white/30 border-b border-white/5 pb-2">
                        <Terminal className="w-4 h-4" />
                        <span>System Analysis Log</span>
                      </div>
                      {result.detailedLog || t.detailedAnalysisLog}
                    </div>
                  </div>
                </details>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
