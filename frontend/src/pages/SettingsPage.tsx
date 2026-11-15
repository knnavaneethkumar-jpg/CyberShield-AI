import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserSettings, 
  DEFAULT_USER_SETTINGS, 
  SensitivityLevel, 
  Language 
} from '../types';
import { 
  loadUserSettings, 
  saveUserSettings, 
  exportSecurityData, 
  purgeUserScans, 
  playAlertSynth 
} from '../services/settingsService';
import { Card, Button, Input } from '../components/UI';
import { 
  Shield, 
  Sliders, 
  Bell, 
  Eye, 
  Database, 
  User, 
  Save, 
  Check, 
  Copy, 
  Trash2, 
  Download, 
  Volume2, 
  Sparkles, 
  Lock, 
  ShieldAlert, 
  Cpu, 
  AlertTriangle,
  RotateCcw,
  Palette,
  Sun,
  Moon,
  Shuffle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme, PRESET_THEMES } from '../contexts/ThemeContext';

interface SettingsPageProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate?: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  currentLang, 
  onLanguageChange,
  onNavigate 
}) => {
  const { user, updateUserProfile, logout } = useAuth();
  const isDesignatedAdmin = user?.email?.trim().toLowerCase() === 'admin123@gamil.com';
  const { 
    config: bgConfig, 
    isLight, 
    setPreset, 
    generateRandomBackground, 
    resetToDefaultLight, 
    resetToDefaultDark, 
    resetToGothicMansion,
    setIsCustomizerOpen,
    getCSSBackground 
  } = useTheme();

  const [settings, setSettings] = useState<UserSettings>({
    ...DEFAULT_USER_SETTINGS,
    userId: user?.uid || 'anonymous',
    language: currentLang
  });

  const [activeTab, setActiveTab] = useState<'scanner' | 'appearance' | 'profile' | 'alerts' | 'privacy' | 'telemetry'>('scanner');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || '');
  const [copiedUid, setCopiedUid] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeSuccessMessage, setPurgeSuccessMessage] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Default avatar presets with futuristic cybersecurity themes
  const avatarPresets = [
    { label: 'Sentinel', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { label: 'CyberHunter', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { label: 'Ghost Agent', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { label: 'Net Guardian', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' }
  ];

  useEffect(() => {
    let isMounted = true;
    async function fetchSettings() {
      if (user) {
        setLoading(true);
        const data = await loadUserSettings(user.uid, user.isDemo);
        if (isMounted) {
          setSettings(data);
          setDisplayName(user.displayName || '');
          setSelectedAvatar(user.photoURL || '');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSettingChange = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      if (key === 'language') {
        onLanguageChange(value as Language);
      }
      return updated;
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveUserSettings(settings, user?.isDemo);
      setSaveSuccess(true);
      playAlertSynth('success');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileSuccess(false);
    try {
      await updateUserProfile(displayName, selectedAvatar);
      setProfileSuccess(true);
      playAlertSynth('success');
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update profile:', e);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    await exportSecurityData(user.uid, user.email, settings);
    playAlertSynth('success');
  };

  const handlePurgeHistory = async () => {
    if (!user) return;
    setPurging(true);
    try {
      const count = await purgeUserScans(user.uid);
      setPurgeSuccessMessage(`Successfully deleted ${count} threat scan records.`);
      setShowPurgeModal(false);
      playAlertSynth('warning');
      setTimeout(() => setPurgeSuccessMessage(null), 4000);
    } catch (e) {
      console.error('Purge failed:', e);
    } finally {
      setPurging(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      ...DEFAULT_USER_SETTINGS,
      userId: user?.uid || 'anonymous',
      language: currentLang
    });
    playAlertSynth('warning');
  };



  return (
    <div className="pt-28 pb-24 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-accent-teal/10 border border-accent-teal/30 text-accent-teal">
              <Sliders className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">System Settings</h1>
          </div>
          <p className="text-sm text-white/50 max-w-xl">
            Configure AI threat scanning sensitivity, alert parameters, profile credentials, and data retention governance.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {isDesignatedAdmin && <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('admin')}
            className="border-accent-purple/40 text-accent-purple hover:bg-accent-purple/10 font-bold"
            title="Open Admin Control Center"
          >
            <Shield className="w-4 h-4 mr-1.5 text-accent-purple" />
            Admin Panel
          </Button>}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetDefaults}
            className="text-white/60 hover:text-white"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Defaults
          </Button>

          <Button
            variant="primary"
            size="sm"
            glow
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-accent-teal to-accent-purple text-primary font-bold shadow-lg"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : saveSuccess ? (
              <span className="flex items-center gap-1.5 text-primary">
                <Check className="w-4 h-4" />
                Saved!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="w-4 h-4" />
                Save Settings
              </span>
            )}
          </Button>
        </div>
      </div>

      {purgeSuccessMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-accent-green/20 border border-accent-green/40 text-accent-green flex items-center gap-3 text-sm font-semibold"
        >
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{purgeSuccessMessage}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8 overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'scanner', label: 'AI Threat Engine', icon: Shield },
          { id: 'appearance', label: 'Background & Theme', icon: Palette },
          { id: 'profile', label: 'Agent Profile', icon: User },
          { id: 'alerts', label: 'Alerts & Audio', icon: Bell },
          { id: 'privacy', label: 'Privacy & Retention', icon: Eye },
          { id: 'telemetry', label: 'Cloud Status', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-accent-teal text-accent-teal bg-white/5 rounded-t-lg'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-accent-teal border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* TAB: BACKGROUND & THEME GENERATOR */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Quick Switch Card */}
              <Card className="p-6 bg-white/[0.03] border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Palette className="w-5 h-5 text-accent-teal" />
                      App Background & Color Architecture
                    </h3>
                    <p className="text-xs opacity-60 mt-1">
                      Choose between light mode, cyber dark, or randomly generate your own high-tech background color palette.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={resetToGothicMansion}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        bgConfig.id === 'gothic-mansion'
                          ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-md ring-2 ring-purple-400/50'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                      title="Gothic Manor & Moon Wallpaper"
                    >
                      <span>🏰</span>
                      Gothic Manor
                    </button>
                    <button
                      onClick={resetToDefaultDark}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        bgConfig.id === 'dark-cyber'
                          ? 'bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400/50'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-teal-400" />
                      Dark Cyber
                    </button>
                    <button
                      onClick={resetToDefaultLight}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isLight
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      Light Mode
                    </button>
                  </div>
                </div>

                {/* Magic Generator Callout */}
                <div 
                  className="p-5 rounded-2xl border text-center transition-all relative overflow-hidden mb-6"
                  style={{
                    background: getCSSBackground(),
                    borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)',
                    minHeight: '130px'
                  }}
                >
                  <div className="relative z-10 flex flex-col items-center justify-center gap-3">
                    <span className={`text-[11px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                      isLight ? 'bg-white/90 text-slate-900 shadow-sm' : 'bg-black/60 text-white border border-white/20'
                    }`}>
                      Current Background: {bgConfig.name}
                    </span>
                    <button
                      onClick={() => generateRandomBackground('light')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-teal via-cyan-400 to-accent-purple text-slate-950 font-black tracking-wide text-xs sm:text-sm flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Shuffle className="w-4 h-4 text-slate-950 animate-spin-slow" />
                      GENERATE RANDOM BACKGROUND COLOUR
                      <Sparkles className="w-4 h-4 text-slate-950" />
                    </button>
                  </div>
                </div>

                {/* Curated Presets Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
                    Curated Background Presets
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {PRESET_THEMES.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setPreset(preset.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                          bgConfig.id === preset.id
                            ? 'border-accent-teal ring-2 ring-accent-teal/40 font-bold'
                            : 'border-white/10 hover:border-accent-teal/30'
                        }`}
                        style={{
                          background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.6)'
                        }}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg shadow-inner border border-black/10 shrink-0 flex items-center justify-center text-sm overflow-hidden relative"
                          style={{
                            background: preset.config.imageUrl 
                              ? `url(${preset.config.imageUrl}) center/cover no-repeat` 
                              : `linear-gradient(135deg, ${preset.config.color1}, ${preset.config.color2})`
                          }}
                        >
                          {preset.config.imageUrl ? (
                            <span className="absolute bottom-0 right-0 text-[10px] bg-black/70 px-0.5 rounded leading-none">
                              {preset.icon}
                            </span>
                          ) : (
                            preset.icon
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">{preset.name}</p>
                          <p className="text-[10px] opacity-60 uppercase">{preset.category} Theme</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Studio drawer trigger */}
                <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                  <p className="text-xs opacity-60">Want fine-grained RGB/Hex color controls, angle adjustments, and CSS export?</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCustomizerOpen(true)}
                    className="text-xs"
                  >
                    <Sliders className="w-3.5 h-3.5 mr-1.5" />
                    Open Background Studio
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 1: SCANNER & AI ENGINE */}
          {activeTab === 'scanner' && (
            <div className="space-y-6">
              {/* Sensitivity Selector */}
              <Card className="p-6 bg-white/[0.03] border-white/10">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-accent-teal" />
                      Detection Engine Sensitivity
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      Calibrates the heuristic threshold and neural network confidence boundary for flagging malicious payloads.
                    </p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    settings.sensitivity === 'high' 
                      ? 'bg-accent-red/20 text-accent-red border-accent-red/40'
                      : settings.sensitivity === 'balanced'
                      ? 'bg-accent-teal/20 text-accent-teal border-accent-teal/40'
                      : 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/40'
                  }`}>
                    Mode: {settings.sensitivity.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'high' as SensitivityLevel,
                      title: 'Aggressive (High)',
                      desc: 'Flags minor link anomalies, uncommon permissions, and heuristic deviations. Maximizes zero-day prevention.',
                      badge: 'Zero-Tolerance',
                      color: 'border-accent-red/40 hover:border-accent-red bg-accent-red/[0.04]',
                      activeBorder: 'border-accent-red ring-2 ring-accent-red/30 bg-accent-red/10'
                    },
                    {
                      id: 'balanced' as SensitivityLevel,
                      title: 'Balanced (Standard)',
                      desc: 'Recommended multi-layered detection. Weighs neural analysis against threat signatures with low false alarm frequency.',
                      badge: 'Recommended',
                      color: 'border-accent-teal/40 hover:border-accent-teal bg-accent-teal/[0.04]',
                      activeBorder: 'border-accent-teal ring-2 ring-accent-teal/30 bg-accent-teal/10'
                    },
                    {
                      id: 'low' as SensitivityLevel,
                      title: 'Permissive (Low)',
                      desc: 'Suppresses edge-case warnings. Alerts only on high-confidence malware signatures, known CVEs, and confirmed phishing.',
                      badge: 'Minimal Interruptions',
                      color: 'border-accent-yellow/40 hover:border-accent-yellow bg-accent-yellow/[0.04]',
                      activeBorder: 'border-accent-yellow ring-2 ring-accent-yellow/30 bg-accent-yellow/10'
                    }
                  ].map((lvl) => (
                    <div
                      key={lvl.id}
                      onClick={() => handleSettingChange('sensitivity', lvl.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        settings.sensitivity === lvl.id ? lvl.activeBorder : lvl.color
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white">{lvl.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white/70">
                          {lvl.badge}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{lvl.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Advanced Scan Toggles */}
              <Card className="p-6 bg-white/[0.03] border-white/10 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-teal" />
                  Analysis Capabilities
                </h3>

                <div className="space-y-4">
                  {/* Deep Analysis */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-white">Deep Explainable AI Analysis</h4>
                      <p className="text-xs text-white/50 mt-0.5">
                        Generates low-level telemetry logs, entropy checks, permission traces, and step-by-step risk justifications.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={settings.deepAnalysis} 
                        onChange={(e) => handleSettingChange('deepAnalysis', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-teal"></div>
                    </label>
                  </div>

                  {/* Auto Scan Links */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-white">Automated Link Pre-Triaging</h4>
                      <p className="text-xs text-white/50 mt-0.5">
                        Immediately screens pasted links for homograph attacks, suspicious TLDs, and IP-based URLs upon input.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={settings.autoScanLinks} 
                        onChange={(e) => handleSettingChange('autoScanLinks', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-teal"></div>
                    </label>
                  </div>
                </div>
              </Card>


            </div>
          )}

          {/* TAB 2: AGENT PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card className="p-6 bg-white/[0.03] border-white/10 space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-accent-teal" />
                      Security Operative Profile
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      Manage your visible analyst callsign and tactical avatar.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-accent-teal/20 text-accent-teal border border-accent-teal/40">
                      Clearance: Level 3
                    </span>
                  </div>
                </div>

                {/* Avatar Preview & Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">
                    Operative Avatar
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-16 h-16 rounded-full border-2 border-accent-teal p-0.5 overflow-hidden bg-primary shrink-0 shadow-lg">
                      {selectedAvatar ? (
                        <img src={selectedAvatar} alt="Avatar Preview" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-accent-teal/20 flex items-center justify-center text-accent-teal font-black text-xl">
                          {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <div className="flex gap-2 flex-wrap mb-2">
                        {avatarPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedAvatar(preset.url)}
                            className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                              selectedAvatar === preset.url
                                ? 'bg-accent-teal text-primary font-bold border-accent-teal'
                                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <input 
                        type="url"
                        placeholder="Or enter custom image URL..."
                        value={selectedAvatar}
                        onChange={(e) => setSelectedAvatar(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent-teal"
                      />
                    </div>
                  </div>
                </div>

                {/* Display Name Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">
                    Agent Callsign / Display Name
                  </label>
                  <Input 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name or agent alias"
                  />
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">
                    Verified Account Email
                  </label>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-sm text-white/70 flex items-center justify-between">
                    <span>{user?.email || 'No email attached (Demo Mode)'}</span>
                    <span className="text-[10px] uppercase font-bold text-accent-green px-2 py-0.5 rounded bg-accent-green/10 border border-accent-green/20">
                      {user?.isDemo ? 'Local Session' : 'Firebase Verified'}
                    </span>
                  </div>
                </div>

                {/* UID Section */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">
                    Cryptographic Operative ID (UID)
                  </label>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono text-white/60">
                    <span className="truncate max-w-md">{user?.uid || 'Not Authenticated'}</span>
                    <button
                      onClick={handleCopyUid}
                      className="p-1.5 hover:bg-white/10 rounded text-accent-teal hover:text-white transition-colors flex items-center gap-1 shrink-0 ml-2"
                      title="Copy UID"
                    >
                      {copiedUid ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4" />}
                      <span className="text-[10px]">{copiedUid ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="bg-accent-teal text-primary font-bold hover:bg-accent-teal/90"
                  >
                    {profileSaving ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </span>
                    ) : profileSuccess ? (
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        Profile Updated!
                      </span>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </div>
              </Card>

              {/* Session Controls */}
              <Card className="p-6 bg-white/[0.03] border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Active Session Authorization</h4>
                    <p className="text-xs text-white/50 mt-0.5">
                      Disconnect this terminal from your CyberShield security session.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={logout}
                    className="border-accent-red/30 text-accent-red hover:bg-accent-red/10"
                  >
                    Sign Out Terminal
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: ALERTS & AUDIO */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <Card className="p-6 bg-white/[0.03] border-white/10 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-accent-teal" />
                    Threat Notification & Acoustic Alerts
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    Control how the system signals critical vulnerabilities, malware, or urgent triage actions.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Sound Alerts */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">Cyber Synthesizer Audio Alerts</h4>
                        <button
                          onClick={() => playAlertSynth('critical')}
                          className="px-2 py-0.5 bg-accent-teal/10 hover:bg-accent-teal/20 text-accent-teal rounded text-[10px] font-bold border border-accent-teal/30 flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          Test Tone
                        </button>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">
                        Emits an audible harmonic frequency pulse whenever a scan result yields risk {'>='} 70%.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={settings.soundAlerts} 
                        onChange={(e) => handleSettingChange('soundAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-teal"></div>
                    </label>
                  </div>

                  {/* Warning Banner */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-white">Critical Threat Top Banner</h4>
                      <p className="text-xs text-white/50 mt-0.5">
                        Shows a sticky high-visibility warning notification when active malware or phishing is confirmed.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={settings.criticalWarningBanner} 
                        onChange={(e) => handleSettingChange('criticalWarningBanner', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-teal"></div>
                    </label>
                  </div>

                  {/* Visual HUD Motion */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-white">Dynamic Cyber HUD Animations</h4>
                      <p className="text-xs text-white/50 mt-0.5">
                        Renders matrix grids, pulsing risk meters, and circuit animations. Disable for reduced motion and battery saving.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={settings.hudAnimations} 
                        onChange={(e) => handleSettingChange('hudAnimations', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-teal"></div>
                    </label>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: PRIVACY & RETENTION */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <Card className="p-6 bg-white/[0.03] border-white/10 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-accent-teal" />
                    Data Governance & Privacy Safeguards
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    Control how scan payloads are scrubbed, stored, and retained.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* PII Anonymization */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">Automatic PII Redaction</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-green/20 text-accent-green">
                          Privacy Guard
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">
                        Masks credit card numbers, phone numbers, and private email strings before sending payloads to the AI analysis model.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={settings.anonymizeInputs} 
                        onChange={(e) => handleSettingChange('anonymizeInputs', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-teal"></div>
                    </label>
                  </div>

                  {/* Retention Window */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">Scan Log Retention Policy</h4>
                      <span className="text-xs font-mono font-bold text-accent-teal">
                        {settings.dataRetentionDays === 0 ? 'Transient (Never Store)' : `${settings.dataRetentionDays} Days`}
                      </span>
                    </div>
                    <p className="text-xs text-white/50">
                      Scans older than this period are automatically scheduled for database purging.
                    </p>

                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {[
                        { label: 'Transient (0d)', days: 0 },
                        { label: '7 Days', days: 7 },
                        { label: '30 Days', days: 30 },
                        { label: '90 Days', days: 90 },
                      ].map((item) => (
                        <button
                          key={item.days}
                          onClick={() => handleSettingChange('dataRetentionDays', item.days)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            settings.dataRetentionDays === item.days
                              ? 'bg-accent-teal text-primary shadow'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Export & Purge Actions */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Security Data Portability</h4>
                    <p className="text-xs text-white/50">
                      Download a complete cryptographic JSON export of all your scan history and configuration parameters.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportData}
                    className="flex items-center gap-2 border-white/20 hover:border-accent-teal text-white shrink-0"
                  >
                    <Download className="w-4 h-4 text-accent-teal" />
                    Export Security Data
                  </Button>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 bg-accent-red/[0.03] border-accent-red/20 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent-red/10 text-accent-red mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-accent-red">Destructive Operations</h4>
                    <p className="text-xs text-white/50 mt-1">
                      Permanently delete all threat history, risk analyses, and forensic records stored in your Firestore cloud database account.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowPurgeModal(true)}
                    className="bg-accent-red/10 border-accent-red/30 text-accent-red hover:bg-accent-red/20 font-bold"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Purge All Threat Logs
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: CLOUD & TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <Card className="p-6 bg-white/[0.03] border-white/10 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-accent-teal" />
                    Cloud Architecture & Node Status
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    Live telemetry reports on the underlying Google Cloud and AI Studio services powering CyberShield AI.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Firestore status */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/50">Database Engine</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-green/20 text-accent-green border border-accent-green/30">
                        Operational
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">Google Cloud Firestore</div>
                    <p className="text-xs text-white/40 font-mono">
                      Database: ai-studio-remixcybershield-f1e72fff
                    </p>
                    <p className="text-xs text-white/40">
                      Rules: Production-hardened with user ownership enforcement
                    </p>
                  </div>

                  {/* Gemini status */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/50">AI Reasoning Core</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-teal/20 text-accent-teal border border-accent-teal/30">
                        Active Grid
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">Gemini 3.8 Flash AI Model</div>
                    <p className="text-xs text-white/40 font-mono">
                      Endpoint: Google GenAI Multimodal Neural Service
                    </p>
                    <p className="text-xs text-white/40">
                      Zero-Day heuristic classification with Explainable AI reasoning
                    </p>
                  </div>

                  {/* CyberBot */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/50">CyberBot Assistant</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-teal/20 text-accent-teal border border-accent-teal/30">
                        Online
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">Incident Triage & Threat Response</div>
                    <p className="text-xs text-white/40">
                      Specialized in APK static analysis, malware containment, and phishing breakdown
                    </p>
                  </div>

                  {/* Client Terminal */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/50">Local Terminal Cache</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent-teal/20 text-accent-teal border border-accent-teal/30">
                        Synchronized
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">Web Storage Sync</div>
                    <p className="text-xs text-white/40">
                      Offline-resilient fallback with instant state reconciliation
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Purge */}
      <AnimatePresence>
        {showPurgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-primary border border-accent-red/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-accent-red">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Purge All Threat Logs?</h3>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                This action is irreversible. All past scan records, risk scores, forensic explanations, and why-flagged logs will be deleted from your cloud account.
              </p>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPurgeModal(false)}
                  disabled={purging}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePurgeHistory}
                  disabled={purging}
                  className="bg-accent-red hover:bg-accent-red/90 text-white font-bold"
                >
                  {purging ? 'Purging...' : 'Yes, Purge History'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
