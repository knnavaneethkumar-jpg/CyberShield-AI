import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Cpu, Activity, Lock, Search, Zap } from 'lucide-react';
import { Translation } from '../types';

interface AILoaderProps {
  t: Translation;
  text?: string;
}

export const AILoader: React.FC<AILoaderProps> = ({ t, text }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Search, label: t.stepScanning },
    { icon: Cpu, label: t.stepNeural },
    { icon: Activity, label: t.stepHeuristic },
    { icon: Lock, label: t.stepFinalizing }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentStep(Math.min(Math.floor(progress / 25), 3));
  }, [progress]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-12">
      <div className="relative">
        {/* Outer Pulsing Rings */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.05, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-[-40px] bg-accent-teal/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-[-80px] bg-accent-purple/10 rounded-full blur-3xl"
        />
        
        {/* Rotating Tech Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-20px] border-2 border-dashed border-accent-teal/30 rounded-full"
        />
        
        {/* Scanning Beam Effect */}
        <div className="absolute inset-0 z-20 overflow-hidden rounded-3xl pointer-events-none">
          <motion.div
            animate={{ top: ['-20%', '120%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-teal to-transparent shadow-[0_0_20px_rgba(0,209,193,1)] opacity-50"
          />
        </div>
        
        {/* Central AI Core */}
        <div className="relative z-10 w-32 h-32 bg-primary-light border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl overflow-hidden group">
          {/* Internal Grid */}
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'radial-gradient(circle, #00D1C1 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
          
          {/* Scanning Overlay */}
          <motion.div
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-accent-teal/5"
          />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 blur-lg bg-accent-teal/30 rounded-full" />
              <CurrentIcon className="w-14 h-14 text-accent-teal relative z-10" />
            </motion.div>
          </AnimatePresence>
          
          {/* Corner Accents */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-accent-teal/50" />
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-accent-teal/50" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-accent-teal/50" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-accent-teal/50" />
        </div>

        {/* Floating Data Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              opacity: [0, 1, 0],
              x: [0, (i % 2 === 0 ? 80 : -80) * Math.random()],
              y: [0, (i % 3 === 0 ? 80 : -80) * Math.random()],
              scale: [0, 1, 0]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              delay: i * 0.4,
              ease: "circOut"
            }}
            className="absolute top-1/2 left-1/2 w-1 h-1 bg-accent-teal rounded-full"
          >
            <Zap className="w-full h-full text-accent-teal/50" />
          </motion.div>
        ))}
      </div>

      <div className="text-center space-y-8 w-full max-w-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.4em] text-accent-teal/60">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent-teal rounded-full animate-pulse" />
              {text || t.scanning}
            </span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          
          {/* Stylized Progress Bar */}
          <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-accent-teal via-accent-purple to-accent-teal bg-[length:200%_100%] animate-[gradient_3s_linear_infinite] rounded-full relative"
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>
            
            {/* Grid Overlay */}
            <div className="absolute inset-0 flex justify-between px-2 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-[1px] h-full bg-primary/30" />
              ))}
            </div>
          </div>
        </div>

        {/* Active Step Indicator */}
        <div className="h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-xs font-black text-white/30 uppercase tracking-widest">Processing</span>
              <span className="text-base font-bold text-white tracking-tight">
                {steps[currentStep].label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
