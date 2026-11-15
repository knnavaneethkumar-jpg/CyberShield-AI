import React from 'react';
import { ScrollReveal, Card } from '../components/UI';
import { Cpu, Zap, Activity } from 'lucide-react';

export const NeuralAnalysis: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <ScrollReveal className="mb-12">
        <div className="inline-flex p-4 bg-accent-purple/10 rounded-2xl mb-6">
          <Cpu className="w-10 h-10 text-accent-purple" />
        </div>
        <h1 className="text-4xl font-bold mb-6">Step 2: Neural Analysis</h1>
        <p className="text-xl text-white/60 leading-relaxed">
          When a threat is too sophisticated for simple pattern matching, our deep learning models take over. This is the core of CyberShield AI's intelligence.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-purple" />
            Deep Learning Models
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Our neural networks are trained on millions of malicious and benign samples. They understand the "intent" behind code and language, allowing them to detect threats that have never been seen before.
          </p>
        </Card>

        <Card className="p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-purple" />
            Semantic Intent
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">
            For messages, we analyze the semantic meaning. A phishing email might use perfect grammar and a new link, but its neural signature will reveal its malicious intent.
          </p>
        </Card>
      </div>

      <ScrollReveal className="bg-white/5 rounded-3xl p-10 border border-white/10">
        <h2 className="text-2xl font-bold mb-6">Advanced Threat Detection</h2>
        <p className="text-white/60 leading-relaxed mb-6">
          Neural analysis is what separates CyberShield AI from traditional antivirus tools. It provides the "explainable" part of our AI, showing you exactly why a message or app was flagged.
        </p>
        <ul className="space-y-4">
          {[
            'Detects zero-day malware with 98.7% accuracy',
            'Analyzes over 1,400 features per scan',
            'Provides human-readable explanations for flags',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
              {item}
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </div>
  );
};
