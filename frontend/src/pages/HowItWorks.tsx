import React from 'react';
import { motion } from 'motion/react';
import { Search, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, ScrollReveal } from '../components/UI';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Search,
      title: '1. Input Data',
      desc: 'Upload an app, paste a message, or enter a suspicious link into our secure scanner.',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      icon: Shield,
      title: '2. AI Analysis',
      desc: 'Our deep learning models analyze thousands of features to detect hidden threats and patterns.',
      color: 'text-accent-teal',
      bg: 'bg-accent-teal/10'
    },
    {
      icon: AlertTriangle,
      title: '3. Risk Detection',
      desc: 'We calculate a risk score and identify the specific type of threat (Malware, Phishing, etc.).',
      color: 'text-accent-yellow',
      bg: 'bg-accent-yellow/10'
    },
    {
      icon: CheckCircle,
      title: '4. User Alert',
      desc: 'Get a clear explanation of the threat and actionable advice to stay safe.',
      color: 'text-accent-green',
      bg: 'bg-accent-green/10'
    }
  ];

  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <ScrollReveal className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">How CyberShield AI Works</h1>
        <p className="text-xl text-white/60 max-w-3xl mx-auto">
          Our sophisticated AI pipeline simplifies complex security analysis into four easy steps.
        </p>
      </ScrollReveal>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2 hidden md:block" />

        <div className="space-y-12">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex flex-col md:flex-row items-center gap-8 ${
                i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              <ScrollReveal 
                delay={0.1}
                className="flex-1 w-full"
              >
                <Card className="p-8">
                  <div className={`inline-flex p-3 ${step.bg} rounded-xl mb-4`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-white/50 leading-relaxed">{step.desc}</p>
                </Card>
              </ScrollReveal>
              
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative z-10 flex-shrink-0 w-16 h-16 bg-primary border-4 border-white/10 rounded-full flex items-center justify-center font-bold text-xl text-accent-teal"
              >
                {i + 1}
              </motion.div>
              
              <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
