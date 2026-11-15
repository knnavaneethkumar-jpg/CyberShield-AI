import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, Search, Cpu, Activity, Lock, CheckCircle2 } from 'lucide-react';
import { Card, ScrollReveal } from '../components/UI';

interface AboutProps {
  onNavigate: (page: string) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  const analysisSteps = [
    {
      id: 'pattern-scanning',
      icon: Search,
      title: "Step 1: Pattern Scanning",
      desc: "Our AI first scans the input for known malicious patterns, signatures, and suspicious keywords used in phishing or malware.",
      color: "text-accent-teal",
      bg: "bg-accent-teal/10"
    },
    {
      id: 'neural-analysis',
      icon: Cpu,
      title: "Step 2: Neural Analysis",
      desc: "Deep learning models analyze the structural integrity of files or the semantic intent of messages to identify hidden threats.",
      color: "text-accent-purple",
      bg: "bg-accent-purple/10"
    },
    {
      id: 'heuristic-check',
      icon: Activity,
      title: "Step 3: Heuristic Check",
      desc: "We perform behavioral analysis to predict how an app might act or how a link might redirect, even if it's a 'zero-day' threat.",
      color: "text-accent-yellow",
      bg: "bg-accent-yellow/10"
    },
    {
      id: 'privacy-verification',
      icon: Lock,
      title: "Step 4: Privacy Verification",
      desc: "The final step ensures that no sensitive user data is leaked during the analysis, maintaining our strict privacy-first policy.",
      color: "text-accent-green",
      bg: "bg-accent-green/10"
    }
  ];

  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <ScrollReveal className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-accent-teal to-accent-purple bg-clip-text text-transparent">
          Our AI Analysis Process
        </h1>
        <p className="text-xl text-white/60 max-w-3xl mx-auto">
          Understand how CyberShield AI protects you through our multi-layered, explainable analysis engine.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {analysisSteps.map((step, i) => (
          <Card 
            key={i} 
            delay={i * 0.1} 
            className="space-y-4 border-white/10 hover:border-accent-teal/30 transition-all cursor-pointer group"
            onClick={() => onNavigate(step.id)}
          >
            <div className={`p-4 ${step.bg} rounded-2xl w-fit group-hover:scale-110 transition-transform`}>
              <step.icon className={`w-8 h-8 ${step.color}`} />
            </div>
            <h3 className="text-2xl font-bold">{step.title}</h3>
            <p className="text-white/50 leading-relaxed text-lg">
              {step.desc}
            </p>
            <div className="pt-4 flex items-center gap-2 text-accent-teal text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Learn more <Shield className="w-4 h-4" />
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-12">
        <ScrollReveal className="text-center">
          <h2 className="text-3xl font-bold mb-4">Why Explainable AI?</h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Traditional security tools give you a 'Yes' or 'No'. We give you the 'Why'. By explaining the reasoning behind every scan, we empower you to recognize future threats yourself.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Transparency', desc: 'No black-box results. Every flag is explained.' },
            { title: 'Education', desc: 'Learn about cyber threats as you stay protected.' },
            { title: 'Trust', desc: 'Verified results backed by deep learning models.' },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1} className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
              <CheckCircle2 className="w-10 h-10 text-accent-green mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">{item.title}</h4>
              <p className="text-sm text-white/40">{item.desc}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};
