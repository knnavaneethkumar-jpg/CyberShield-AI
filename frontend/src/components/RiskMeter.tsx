import React from 'react';
import { motion } from 'motion/react';

interface RiskMeterProps {
  score: number;
  size?: number;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, size = 200 }) => {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score < 30) return '#2ECC71'; // Green
    if (score < 70) return '#F4C542'; // Yellow
    return '#FF4D4D'; // Red
  };

  const color = getColor();

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={size * 0.08}
          fill="transparent"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={size * 0.08}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          fill="transparent"
          style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl font-bold"
          style={{ color }}
        >
          {score}%
        </motion.span>
        <span className="text-white/50 text-xs uppercase tracking-widest mt-1">Risk Level</span>
      </div>
    </div>
  );
};
