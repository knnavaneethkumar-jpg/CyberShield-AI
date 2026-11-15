import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  glow = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  const variants = {
    primary: 'bg-accent-teal text-primary hover:bg-accent-teal/90',
    secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm',
    outline: 'border-2 border-accent-teal text-accent-teal hover:bg-accent-teal/10',
    ghost: 'text-white/70 hover:text-white hover:bg-white/5',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const glowStyles = glow ? 'glow-teal glow-teal-hover' : '';
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5 }}
    className={`glass-card p-6 ${className}`}
  >
    {children}
  </motion.div>
);

export const ScrollReveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/20 transition-all ${className}`}
    {...props}
  />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
  <textarea
    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/20 transition-all min-h-[120px] ${className}`}
    {...props}
  />
);
