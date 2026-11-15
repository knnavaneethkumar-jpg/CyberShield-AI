import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Sparkles, 
  Sun, 
  Moon, 
  Sliders, 
  Copy, 
  Check, 
  RotateCcw, 
  X, 
  Layers, 
  Grid, 
  Compass,
  Shuffle
} from 'lucide-react';
import { useTheme, PRESET_THEMES, GradientType } from '../contexts/ThemeContext';

export const BackgroundCustomizer: React.FC = () => {
  const { 
    config, 
    isLight, 
    updateConfig, 
    setPreset, 
    generateRandomBackground, 
    resetToDefaultLight, 
    resetToDefaultDark,
    resetToGothicMansion,
    getCSSBackground,
    isCustomizerOpen,
    setIsCustomizerOpen
  } = useTheme();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'presets' | 'custom'>('generate');
  const [randomMode, setRandomMode] = useState<'dark' | 'light' | 'any'>('dark');

  const handleCopyCSS = () => {
    const css = `background: ${getCSSBackground()};`;
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomize = () => {
    generateRandomBackground(randomMode);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsCustomizerOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl backdrop-blur-xl border transition-all duration-300 group hover:scale-105"
        style={{
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.92)',
          borderColor: isLight ? 'rgba(13, 148, 136, 0.3)' : 'rgba(0, 209, 193, 0.3)',
          color: isLight ? '#0f172a' : '#ffffff',
          boxShadow: isLight 
            ? '0 12px 28px -4px rgba(0, 0, 0, 0.12), 0 0 15px rgba(13, 148, 136, 0.2)' 
            : '0 12px 28px -4px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 209, 193, 0.3)'
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        title="Background Colour Generator & Themes"
      >
        <div className="relative flex items-center justify-center p-1.5 rounded-full bg-gradient-to-tr from-accent-teal to-accent-purple text-white shadow-md group-hover:rotate-12 transition-transform duration-300">
          <Palette className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
            Background Colors
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono uppercase font-semibold ${
              isLight ? 'bg-amber-100 text-amber-800' : 'bg-teal-950 text-accent-teal border border-teal-800'
            }`}>
              {isLight ? 'Light' : 'Dark'}
            </span>
          </span>
          <span className="text-[10px] opacity-60">Generate & Switch</span>
        </div>
      </motion.button>

      {/* Modal / Slide-over Drawer */}
      <AnimatePresence>
        {isCustomizerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-end sm:justify-end p-0 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomizerOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative z-10 w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border backdrop-blur-2xl ${
                isLight 
                  ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-900/15' 
                  : 'bg-slate-950/95 border-white/10 text-white shadow-black/80'
              }`}
            >
              {/* Header */}
              <div className="p-5 border-b flex items-center justify-between shrink-0"
                style={{ borderColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-tr from-accent-teal to-accent-purple text-white shadow-lg">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight">Background Colour Studio</h2>
                    <p className="text-xs opacity-60">Generate, customize & switch light/dark</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCustomizerOpen(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-white/60'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Light / Dark / Gothic Mode Toggle Bar */}
              <div className="px-5 py-3 border-b flex items-center justify-between gap-2 shrink-0 flex-wrap"
                style={{ 
                  backgroundColor: isLight ? 'rgba(241, 245, 249, 0.6)' : 'rgba(2, 6, 23, 0.4)',
                  borderColor: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)' 
                }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Quick Themes
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={resetToGothicMansion}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      config.id === 'gothic-mansion'
                        ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-md ring-2 ring-purple-400/60' 
                        : 'bg-white/5 hover:bg-white/10 text-white/80'
                    }`}
                    title="Gothic Manor & Full Moon Background"
                  >
                    <span>🏰</span>
                    Gothic Manor
                  </button>
                  <button
                    onClick={resetToDefaultDark}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      config.id === 'dark-cyber'
                        ? 'bg-teal-500 text-slate-950 shadow-md ring-2 ring-teal-400/50' 
                        : (isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-white/80')
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    Cyber Dark
                  </button>
                  <button
                    onClick={resetToDefaultLight}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isLight 
                        ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300/50' 
                        : 'bg-white/5 hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    Clean Light
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex px-5 pt-3 gap-2 border-b shrink-0"
                style={{ borderColor: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)' }}
              >
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'generate'
                      ? 'border-accent-teal text-accent-teal'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  🎲 Generator
                </button>
                <button
                  onClick={() => setActiveTab('presets')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'presets'
                      ? 'border-accent-teal text-accent-teal'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Presets
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'custom'
                      ? 'border-accent-teal text-accent-teal'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Fine Tune
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
                
                {/* 1. GENERATOR TAB */}
                {activeTab === 'generate' && (
                  <div className="space-y-5">
                    {/* Big Magic Button */}
                    <div className="text-center space-y-3">
                      <div className="p-4 rounded-2xl border text-center transition-all relative overflow-hidden"
                        style={{
                          background: getCSSBackground(),
                          borderColor: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)',
                          minHeight: '110px'
                        }}
                      >
                        <div className="relative z-10 flex flex-col items-center justify-center h-full drop-shadow">
                          <span className={`text-xs font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${
                            isLight ? 'bg-white/80 text-slate-900 border border-slate-200' : 'bg-black/60 text-white border border-white/20'
                          }`}>
                            Live Background Preview
                          </span>
                          <span className={`mt-2 font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {config.name || 'Custom Generated'}
                          </span>
                          <span className={`text-[11px] font-mono opacity-80 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            {config.type.toUpperCase()} • {config.angle}° • {config.color1} → {config.color2}
                          </span>
                        </div>
                      </div>

                      {/* Randomize Preference Picker */}
                      <div className="flex items-center justify-center gap-1 p-1 rounded-xl border"
                        style={{
                          backgroundColor: isLight ? '#f1f5f9' : '#020617',
                          borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'
                        }}
                      >
                        <button
                          onClick={() => setRandomMode('dark')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                            randomMode === 'dark'
                              ? (isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-teal-600 text-white shadow-sm')
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          🌙 Dark Cyber
                        </button>
                        <button
                          onClick={() => setRandomMode('light')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                            randomMode === 'light'
                              ? (isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-teal-600 text-white shadow-sm')
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          ☀️ Light Only
                        </button>
                        <button
                          onClick={() => setRandomMode('any')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                            randomMode === 'any'
                              ? (isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-teal-600 text-white shadow-sm')
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          ✨ Any Palette
                        </button>
                      </div>

                      {/* Prominent Generator Trigger */}
                      <motion.button
                        onClick={handleRandomize}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-accent-teal via-cyan-400 to-accent-purple text-slate-950 font-black tracking-wide text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-teal-500/20 hover:shadow-teal-500/35 transition-all"
                      >
                        <Shuffle className="w-5 h-5 text-slate-950 animate-spin-slow" />
                        <span>GENERATE BACKGROUND COLOUR</span>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                      </motion.button>
                      <p className="text-[11px] opacity-60">
                        Click above to immediately generate fresh harmonious gradients & colors!
                      </p>
                    </div>

                    {/* Quick Light Presets Row */}
                    <div>
                      <h4 className="text-xs font-bold tracking-wider uppercase opacity-70 mb-3 flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        Popular Light Themes
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {PRESET_THEMES.filter(p => p.category === 'light').map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => setPreset(preset.id)}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                              config.id === preset.id
                                ? 'border-accent-teal ring-2 ring-accent-teal/30 font-bold'
                                : 'border-transparent hover:border-accent-teal/30'
                            }`}
                            style={{
                              background: preset.config.color1 === '#ffffff' 
                                ? 'linear-gradient(135deg, #ffffff, #f1f5f9)' 
                                : `linear-gradient(135deg, ${preset.config.color1}, ${preset.config.color2})`,
                              color: '#0f172a'
                            }}
                          >
                            <span className="text-base">{preset.icon}</span>
                            <div className="truncate">
                              <p className="text-xs font-bold truncate">{preset.name}</p>
                              <p className="text-[10px] opacity-75 truncate">{preset.config.color1} → {preset.config.color2}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PRESETS TAB */}
                {activeTab === 'presets' && (
                  <div className="space-y-5">
                    {/* Light Presets */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="text-xs font-bold tracking-wider uppercase opacity-70 flex items-center gap-1.5">
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          Light Mode Backgrounds
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">Recommended</span>
                      </div>
                      <div className="space-y-2">
                        {PRESET_THEMES.filter(p => p.category === 'light').map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => setPreset(preset.id)}
                            className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                              config.id === preset.id
                                ? 'ring-2 ring-accent-teal border-accent-teal font-bold'
                                : (isLight ? 'border-slate-200 hover:border-slate-300' : 'border-white/10 hover:border-white/20')
                            }`}
                            style={{
                              background: isLight ? '#ffffff' : 'rgba(255,255,255,0.04)'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-8 h-8 rounded-lg shadow-inner border border-black/10 shrink-0"
                                style={{
                                  background: `linear-gradient(135deg, ${preset.config.color1}, ${preset.config.color2})`
                                }}
                              />
                              <div>
                                <p className="text-xs font-bold flex items-center gap-1.5">
                                  <span>{preset.icon}</span>
                                  {preset.name}
                                </p>
                                <p className="text-[10px] opacity-60">Clean high-contrast light background</p>
                              </div>
                            </div>
                            {config.id === preset.id && (
                              <Check className="w-4 h-4 text-accent-teal shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dark Presets */}
                    <div>
                      <h4 className="text-xs font-bold tracking-wider uppercase opacity-70 mb-2.5 flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-teal-400" />
                        Dark Cyber Backgrounds
                      </h4>
                      <div className="space-y-2">
                        {PRESET_THEMES.filter(p => p.category === 'dark').map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => setPreset(preset.id)}
                            className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                              config.id === preset.id
                                ? 'ring-2 ring-accent-teal border-accent-teal font-bold'
                                : (isLight ? 'border-slate-200 hover:border-slate-300' : 'border-white/10 hover:border-white/20')
                            }`}
                            style={{
                              background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.04)'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-8 h-8 rounded-lg shadow-inner border border-white/20 shrink-0 overflow-hidden"
                                style={{
                                  background: preset.config.imageUrl 
                                    ? `url(${preset.config.imageUrl}) center/cover no-repeat` 
                                    : `linear-gradient(135deg, ${preset.config.color1}, ${preset.config.color2})`
                                }}
                              />
                              <div>
                                <p className="text-xs font-bold flex items-center gap-1.5">
                                  <span>{preset.icon}</span>
                                  {preset.name}
                                </p>
                                <p className="text-[10px] opacity-60">
                                  {preset.config.imageUrl ? 'Atmospheric Gothic Manor & Moon' : 'Deep neon cyber matrix'}
                                </p>
                              </div>
                            </div>
                            {config.id === preset.id && (
                              <Check className="w-4 h-4 text-accent-teal shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. CUSTOM FINE-TUNE TAB */}
                {activeTab === 'custom' && (
                  <div className="space-y-5">
                    {/* Gradient Type */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-2">
                        Gradient Architecture
                      </label>
                      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl border"
                        style={{
                          backgroundColor: isLight ? '#f1f5f9' : '#020617',
                          borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'
                        }}
                      >
                        {(['linear', 'radial', 'mesh', 'solid'] as GradientType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => updateConfig({ type })}
                            className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                              config.type === type
                                ? (isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-teal-600 text-white')
                                : 'opacity-60 hover:opacity-100'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Angle Slider (for Linear) */}
                    {config.type === 'linear' && (
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-bold flex items-center gap-1 opacity-70">
                            <Compass className="w-3.5 h-3.5" /> Gradient Direction
                          </span>
                          <span className="font-mono font-bold text-accent-teal">{config.angle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="15"
                          value={config.angle}
                          onChange={(e) => updateConfig({ angle: Number(e.target.value) })}
                          className="w-full accent-teal-500 cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Color Pickers */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider opacity-70 block">
                        Background Color Stops
                      </label>
                      
                      {/* Color 1 */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl border"
                        style={{
                          backgroundColor: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                          borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="color"
                            value={config.color1}
                            onChange={(e) => updateConfig({ color1: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                          />
                          <div>
                            <p className="text-xs font-bold">Primary Base Color</p>
                            <p className="text-[10px] font-mono opacity-60 uppercase">{config.color1}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono opacity-50">Stop 1 (0%)</span>
                      </div>

                      {/* Color 2 */}
                      {config.type !== 'solid' && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl border"
                          style={{
                            backgroundColor: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                            borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="color"
                              value={config.color2}
                              onChange={(e) => updateConfig({ color2: e.target.value })}
                              className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                            />
                            <div>
                              <p className="text-xs font-bold">Blend / Secondary Color</p>
                              <p className="text-[10px] font-mono opacity-60 uppercase">{config.color2}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono opacity-50">Stop 2 (50%)</span>
                        </div>
                      )}

                      {/* Color 3 */}
                      {config.type !== 'solid' && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl border"
                          style={{
                            backgroundColor: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                            borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="color"
                              value={config.color3 || config.color2}
                              onChange={(e) => updateConfig({ color3: e.target.value })}
                              className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                            />
                            <div>
                              <p className="text-xs font-bold">Accent / Edge Color</p>
                              <p className="text-[10px] font-mono opacity-60 uppercase">{config.color3 || config.color2}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono opacity-50">Stop 3 (100%)</span>
                        </div>
                      )}
                    </div>

                    {/* Image Background Controls */}
                    <div className="pt-2 border-t space-y-3"
                      style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider opacity-70 block">
                            Background Image Layer
                          </label>
                          <span className="text-[10px] opacity-60">Gothic Manor & Moon wallpaper</span>
                        </div>
                        <button
                          onClick={() => {
                            if (config.imageUrl) {
                              updateConfig({ imageUrl: undefined, type: 'linear' });
                            } else {
                              updateConfig({ imageUrl: '/gothic_mansion_bg.jpg', type: 'image' });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                            config.imageUrl
                              ? 'bg-accent-teal text-slate-950 border-accent-teal'
                              : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {config.imageUrl ? 'Active (ON)' : 'Disabled (OFF)'}
                        </button>
                      </div>

                      {config.imageUrl && (
                        <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={config.imageUrl}
                              alt="Thumbnail"
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover border border-white/20"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">Gothic Manor & Moon</p>
                              <p className="text-[10px] opacity-60">Attached High-Res Scene</p>
                            </div>
                          </div>

                          {/* Image Dimness Slider */}
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="opacity-70 font-semibold">Overlay Darkness / Dim</span>
                              <span className="font-mono text-accent-teal font-bold">
                                {Math.round((config.imageDim ?? 0.45) * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="0.85"
                              step="0.05"
                              value={config.imageDim ?? 0.45}
                              onChange={(e) => updateConfig({ imageDim: Number(e.target.value) })}
                              className="w-full accent-teal-500 cursor-pointer"
                            />
                          </div>

                          {/* Image Blur Slider */}
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="opacity-70 font-semibold">Image Soft Blur</span>
                              <span className="font-mono text-accent-teal font-bold">
                                {config.imageBlur ?? 0}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="12"
                              step="1"
                              value={config.imageBlur ?? 0}
                              onChange={(e) => updateConfig({ imageBlur: Number(e.target.value) })}
                              className="w-full accent-teal-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cyber Grid & Effects */}
                    <div className="pt-2 border-t space-y-3"
                      style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}
                    >
                      <label className="text-xs font-bold uppercase tracking-wider opacity-70 block">
                        Atmospheric Overlays
                      </label>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium flex items-center gap-2">
                          <Grid className="w-3.5 h-3.5 opacity-70" />
                          Show Cyber Grid
                        </span>
                        <input
                          type="checkbox"
                          checked={config.showGrid}
                          onChange={(e) => updateConfig({ showGrid: e.target.checked })}
                          className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 opacity-70" />
                          Floating Cyber Particles
                        </span>
                        <input
                          type="checkbox"
                          checked={config.showParticles}
                          onChange={(e) => updateConfig({ showParticles: e.target.checked })}
                          className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Controls & CSS Export */}
              <div className="p-4 border-t flex items-center justify-between gap-3 shrink-0"
                style={{ 
                  backgroundColor: isLight ? 'rgba(241, 245, 249, 0.7)' : 'rgba(2, 6, 23, 0.6)',
                  borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' 
                }}
              >
                <button
                  onClick={resetToDefaultLight}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-white/10 text-white/70'
                  }`}
                  title="Reset to Default Clean Light Background"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCSS}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isLight 
                        ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm' 
                        : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>CSS Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy CSS</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsCustomizerOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-accent-teal text-slate-950 shadow-md hover:bg-accent-teal/90 transition-colors"
                  >
                    Apply & Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
