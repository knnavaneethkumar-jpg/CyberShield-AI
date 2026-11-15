import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';

export const CyberBackground: React.FC = () => {
  const { config, isLight, getCSSBackground } = useTheme();

  const gridLineColor = isLight 
    ? 'rgba(15, 23, 42, 0.06)' 
    : 'rgba(0, 209, 193, 0.18)';
  
  const movingGridColor = isLight 
    ? 'rgba(13, 148, 136, 0.1)' 
    : 'rgba(0, 209, 193, 0.25)';

  const particleColor = isLight
    ? 'bg-teal-600/30'
    : 'bg-accent-teal/40';

  return (
    <div 
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-all duration-700 ease-out select-none"
      style={{
        background: getCSSBackground(),
      }}
    >
      {/* Background Image Layer */}
      {config.imageUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img 
            src={config.imageUrl} 
            alt="Atmospheric Background" 
            referrerPolicy="no-referrer"
            initial={{ scale: 1.04, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="w-full h-full object-cover object-center"
            style={{
              filter: config.imageBlur ? `blur(${config.imageBlur}px)` : undefined,
            }}
          />
          {/* Dimming & Contrast Overlay for UI legibility */}
          <div 
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(3, 7, 18, 0.62)',
              opacity: config.imageDim ?? 0.45,
            }}
          />
          {/* Top and Bottom atmospheric vignettes */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/85 pointer-events-none" />
        </div>
      )}

      {/* Moving Grid */}
      {config.showGrid && (
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: config.gridOpacity ?? (isLight ? 0.15 : 0.2),
            backgroundImage: `
              linear-gradient(to right, ${gridLineColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${gridLineColor} 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
          }}
        >
          <motion.div 
            className="absolute inset-0"
            animate={{
              y: [0, 40],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundImage: `
                linear-gradient(to right, ${movingGridColor} 1px, transparent 1px),
                linear-gradient(to bottom, ${movingGridColor} 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      )}

      {/* Floating Cyber Particles */}
      {config.showParticles && (
        <div className="absolute inset-0">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full ${particleColor} backdrop-blur-sm`}
              initial={{
                x: `${(i * 13) % 100}%`,
                y: `${(i * 19) % 100}%`,
                scale: 0.8,
              }}
              animate={{
                y: [null, '-100%'],
                opacity: isLight ? [0, 0.35, 0] : [0, 0.5, 0],
              }}
              transition={{
                duration: 12 + (i % 6) * 3,
                repeat: Infinity,
                ease: "linear",
                delay: (i % 5) * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Ambient Glow Orbs */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[130px] rounded-full transition-all duration-700"
        style={{
          backgroundColor: isLight ? 'rgba(45, 212, 191, 0.12)' : 'rgba(0, 209, 193, 0.15)',
        }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[130px] rounded-full transition-all duration-700"
        style={{
          backgroundColor: isLight ? 'rgba(167, 139, 250, 0.12)' : 'rgba(139, 92, 246, 0.12)',
        }}
      />
    </div>
  );
};

