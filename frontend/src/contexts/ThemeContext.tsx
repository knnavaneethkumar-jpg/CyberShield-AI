import React, { createContext, useContext, useState, useEffect } from 'react';

export type BackgroundMode = 'light' | 'dark' | 'custom' | 'image';
export type GradientType = 'linear' | 'radial' | 'mesh' | 'solid' | 'image';

export interface BackgroundConfig {
  id: string;
  name: string;
  mode: BackgroundMode;
  type: GradientType;
  color1: string;
  color2: string;
  color3?: string;
  angle: number; // in degrees
  showGrid: boolean;
  showParticles: boolean;
  gridOpacity: number; // 0 to 1
  isLight: boolean;
  imageUrl?: string;
  imageDim?: number; // 0 to 1 dimming overlay
  imageBlur?: number; // blur in px
}

export interface PresetTheme {
  id: string;
  name: string;
  category: 'light' | 'dark' | 'vibrant';
  icon: string;
  config: BackgroundConfig;
}

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: 'gothic-mansion',
    name: 'Gothic Manor & Moon',
    category: 'dark',
    icon: '🏰',
    config: {
      id: 'gothic-mansion',
      name: 'Gothic Manor & Moon',
      mode: 'dark',
      type: 'image',
      color1: '#030712',
      color2: '#0b132b',
      color3: '#1e1b4b',
      angle: 180,
      showGrid: true,
      showParticles: true,
      gridOpacity: 0.12,
      isLight: false,
      imageUrl: '/gothic_mansion_bg.jpg',
      imageDim: 0.4,
      imageBlur: 0,
    }
  },
  {
    id: 'dark-cyber',
    name: 'Midnight Cyber',
    category: 'dark',
    icon: '🌌',
    config: {
      id: 'dark-cyber',
      name: 'Midnight Cyber',
      mode: 'dark',
      type: 'linear',
      color1: '#020617',
      color2: '#0b132b',
      color3: '#0f172a',
      angle: 180,
      showGrid: true,
      showParticles: true,
      gridOpacity: 0.18,
      isLight: false,
    }
  },
  {
    id: 'light-clean',
    name: 'Pure Pearl Light',
    category: 'light',
    icon: '☀️',
    config: {
      id: 'light-clean',
      name: 'Pure Pearl Light',
      mode: 'light',
      type: 'linear',
      color1: '#ffffff',
      color2: '#f1f5f9',
      color3: '#e2e8f0',
      angle: 135,
      showGrid: true,
      showParticles: true,
      gridOpacity: 0.12,
      isLight: true,
    }
  },
  {
    id: 'light-azure',
    name: 'Cyber Azure Light',
    category: 'light',
    icon: '🌊',
    config: {
      id: 'light-azure',
      name: 'Cyber Azure Light',
      mode: 'light',
      type: 'linear',
      color1: '#f0f9ff',
      color2: '#e0f2fe',
      color3: '#e0e7ff',
      angle: 120,
      showGrid: true,
      showParticles: true,
      gridOpacity: 0.15,
      isLight: true,
    }
  },
  {
    id: 'light-mint',
    name: 'Clean Emerald Mint',
    category: 'light',
    icon: '🌿',
    config: {
      id: 'light-mint',
      name: 'Clean Emerald Mint',
      mode: 'light',
      type: 'linear',
      color1: '#f0fdf4',
      color2: '#dcfce7',
      color3: '#ccfbf1',
      angle: 160,
      showGrid: true,
      showParticles: true,
      gridOpacity: 0.15,
      isLight: true,
    }
  },
  {
    id: 'light-dawn',
    name: 'Warm Dawn Pastel',
    category: 'light',
    icon: '🌅',
    config: {
      id: 'light-dawn',
      name: 'Warm Dawn Pastel',
      mode: 'light',
      type: 'linear',
      color1: '#fffbeb',
      color2: '#fef3c7',
      color3: '#fce7f3',
      angle: 90,
      showGrid: true,
      showParticles: true,
      gridOpacity: 0.12,
      isLight: true,
    }
  },
  {
    id: 'light-violet',
    name: 'Silken Lavender Light',
    category: 'light',
    icon: '🌸',
    config: {
      id: 'light-violet',
      name: 'Silken Lavender Light',
      mode: 'light',
      type: 'linear',
      color1: '#faf5ff',
      color2: '#ede9fe',
      color3: '#f5d0fe',
      angle: 145,
      showGrid: true,
      showParticles: true,
      gridOpacity: 0.14,
      isLight: true,
    }
  },
  {
    id: 'dark-cyber',
    name: 'Midnight Cyber',
    category: 'dark',
    icon: '🌌',
    config: {
      id: 'dark-cyber',
      name: 'Midnight Cyber',
      mode: 'dark',
      type: 'linear',
      color1: '#020617',
      color2: '#0b132b',
      color3: '#0f172a',
      angle: 180,
      showGrid: true,
      showParticles: true,
      gridOpacity: 0.18,
      isLight: false,
    }
  },
  {
    id: 'dark-neon',
    name: 'Synthwave Purple',
    category: 'dark',
    icon: '🔮',
    config: {
      id: 'dark-neon',
      name: 'Synthwave Purple',
      mode: 'dark',
      type: 'radial',
      color1: '#1e053a',
      color2: '#070314',
      color3: '#2e1065',
      angle: 135,
      showGrid: true,
      showParticles: true,
      gridOpacity: 0.22,
      isLight: false,
    }
  },
  {
    id: 'dark-matrix',
    name: 'Matrix Emerald',
    category: 'dark',
    icon: '⚡',
    config: {
      id: 'dark-matrix',
      name: 'Matrix Emerald',
      mode: 'dark',
      type: 'linear',
      color1: '#021814',
      color2: '#062920',
      color3: '#022c22',
      angle: 140,
      showGrid: true,
      showParticles: true,
      gridOpacity: 0.2,
      isLight: false,
    }
  },
];

// Curated palettes for random color generation
const RANDOM_LIGHT_PALETTES = [
  { c1: '#ffffff', c2: '#f1f5f9', c3: '#e2e8f0', name: 'Pearl Mist' },
  { c1: '#f0f9ff', c2: '#e0f2fe', c3: '#bae6fd', name: 'Sky Breeze' },
  { c1: '#f8fafc', c2: '#e2e8f0', c3: '#cbd5e1', name: 'Slate Light' },
  { c1: '#ecfeff', c2: '#cffafe', c3: '#e0f2fe', name: 'Glacier Cyan' },
  { c1: '#f0fdf4', c2: '#dcfce7', c3: '#bbf7d0', name: 'Spring Mint' },
  { c1: '#fefce8', c2: '#fef08a', c3: '#fed7aa', name: 'Sunny Champagne' },
  { c1: '#fff1f2', c2: '#ffe4e6', c3: '#fecdd3', name: 'Blush Coral' },
  { c1: '#faf5ff', c2: '#f3e8ff', c3: '#e9d5ff', name: 'Dream Lavender' },
  { c1: '#f5f3ff', c2: '#ede9fe', c3: '#ddd6fe', name: 'Periwinkle Cloud' },
  { c1: '#fdf2f8', c2: '#fce7f3', c3: '#fbcfe8', name: 'Cotton Candy' },
  { c1: '#f8fafc', c2: '#f0fdfa', c3: '#ccfbf1', name: 'Cyber Opal Light' },
  { c1: '#f0f4f8', c2: '#d9e2ec', c3: '#bcccdc', name: 'Nordic Frost' },
];

const RANDOM_VIBRANT_PALETTES = [
  { c1: '#0f172a', c2: '#1e1b4b', c3: '#312e81', name: 'Cosmic Indigo' },
  { c1: '#042f2e', c2: '#064e3b', c3: '#0f766e', name: 'Deep Cyber Teal' },
  { c1: '#18181b', c2: '#27272a', c3: '#3f3f46', name: 'Carbon Stealth' },
  { c1: '#1c1917', c2: '#292524', c3: '#44403c', name: 'Obsidian Earth' },
  { c1: '#1e053a', c2: '#3b0764', c3: '#581c87', name: 'Neon Nebula' },
  { c1: '#022c22', c2: '#065f46', c3: '#047857', name: 'Electric Emerald' },
  { c1: '#172554', c2: '#1d4ed8', c3: '#2563eb', name: 'Cyber Cobalt' },
];

// Helper to determine if a hex color is light
export function isColorLight(hex: string): boolean {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length < 6) return false;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  // Perceived luminance formula (ITU-R BT.709)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}

interface ThemeContextType {
  config: BackgroundConfig;
  isLight: boolean;
  updateConfig: (partial: Partial<BackgroundConfig>) => void;
  setPreset: (presetId: string) => void;
  generateRandomBackground: (preference?: 'light' | 'any' | 'dark') => void;
  resetToDefaultLight: () => void;
  resetToDefaultDark: () => void;
  resetToGothicMansion: () => void;
  getCSSBackground: () => string;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'cybershield_background_theme_v5';

// Default to the user's Gothic Manor & Moon background theme
const DEFAULT_THEME: BackgroundConfig = PRESET_THEMES.find(p => p.id === 'gothic-mansion')!.config;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<BackgroundConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_THEME;
  });

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Sync to HTML classes for immediate global styling
  useEffect(() => {
    const isLightMode = config.isLight;
    const root = document.documentElement;
    const body = document.body;

    if (isLightMode) {
      root.classList.remove('theme-dark');
      root.classList.add('theme-light');
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('theme-dark');
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  const updateConfig = (partial: Partial<BackgroundConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...partial };
      // Check luminance if colors changed
      if (partial.color1 || partial.color2) {
        next.isLight = isColorLight(next.color1);
      }
      return next;
    });
  };

  const setPreset = (presetId: string) => {
    const preset = PRESET_THEMES.find(p => p.id === presetId);
    if (preset) {
      setConfig({ ...preset.config });
    }
  };

  const generateRandomBackground = (preference: 'light' | 'any' | 'dark' = 'dark') => {
    let pool = RANDOM_VIBRANT_PALETTES;
    if (preference === 'light') {
      pool = RANDOM_LIGHT_PALETTES;
    } else if (preference === 'any') {
      pool = [...RANDOM_LIGHT_PALETTES, ...RANDOM_VIBRANT_PALETTES];
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];
    const randomAngle = Math.floor(Math.random() * 8) * 45; // 0, 45, 90, 135, 180, etc.
    const types: GradientType[] = ['linear', 'linear', 'radial', 'mesh'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const lightCheck = isColorLight(chosen.c1);

    const newConfig: BackgroundConfig = {
      id: `generated-${Date.now()}`,
      name: `${chosen.name} (Custom)`,
      mode: lightCheck ? 'light' : 'dark',
      type: randomType,
      color1: chosen.c1,
      color2: chosen.c2,
      color3: chosen.c3,
      angle: randomAngle,
      showGrid: true,
      showParticles: true,
      gridOpacity: lightCheck ? 0.14 : 0.2,
      isLight: lightCheck,
    };

    setConfig(newConfig);
  };

  const resetToDefaultLight = () => {
    const lightPreset = PRESET_THEMES.find(p => p.id === 'light-clean');
    if (lightPreset) {
      setConfig({ ...lightPreset.config });
    }
  };

  const resetToDefaultDark = () => {
    const darkPreset = PRESET_THEMES.find(p => p.id === 'dark-cyber');
    if (darkPreset) {
      setConfig({ ...darkPreset.config });
    }
  };

  const resetToGothicMansion = () => {
    const gothicPreset = PRESET_THEMES.find(p => p.id === 'gothic-mansion');
    if (gothicPreset) {
      setConfig({ ...gothicPreset.config });
    }
  };

  const getCSSBackground = (): string => {
    const { type, color1, color2, color3, angle } = config;
    if (type === 'solid') {
      return color1;
    }
    if (type === 'radial') {
      return `radial-gradient(circle at center, ${color1} 0%, ${color2} 70%, ${color3 || color2} 100%)`;
    }
    if (type === 'mesh') {
      return `radial-gradient(at 0% 0%, ${color1} 0px, transparent 50%), radial-gradient(at 100% 0%, ${color2} 0px, transparent 50%), radial-gradient(at 100% 100%, ${color3 || color1} 0px, transparent 50%), ${color2}`;
    }
    // linear or image fallback
    if (color3) {
      return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
    }
    return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
  };

  return (
    <ThemeContext.Provider
      value={{
        config,
        isLight: config.isLight,
        updateConfig,
        setPreset,
        generateRandomBackground,
        resetToDefaultLight,
        resetToDefaultDark,
        resetToGothicMansion,
        getCSSBackground,
        isCustomizerOpen,
        setIsCustomizerOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
