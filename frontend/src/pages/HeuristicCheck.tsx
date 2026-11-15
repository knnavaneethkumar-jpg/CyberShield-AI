import React from 'react';
import { ScrollReveal, Card } from '../components/UI';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const HeuristicCheck: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <ScrollReveal className="mb-12">
        <div className="inline-flex p-4 bg-accent-yellow/10 rounded-2xl mb-6">
          <Activity className="w-10 h-10 text-accent-yellow" />
        </div>
        <h1 className="text-4xl font-bold mb-6">Step 3: Heuristic Check</h1>
        <p className="text-xl text-white/60 leading-relaxed">
          Heuristic analysis is about predicting behavior. We don't just look at what a file *is*, we look at what it *might do*.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent-yellow" />
            Behavioral Prediction
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Our heuristics engine simulates the behavior of an app or link in a secure, virtual environment. It looks for suspicious actions like unauthorized data access or background microphone activation.
          </p>
        </Card>

        <Card className="p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent-yellow" />
            Zero-Day Protection
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Even if a threat has never been seen before, its behavior often follows a predictable pattern. Heuristics allow us to block new threats before they can cause any damage.
          </p>
        </Card>
      </div>

      <ScrollReveal className="bg-white/5 rounded-3xl p-10 border border-white/10">
        <h2 className="text-2xl font-bold mb-6">Predictive Security</h2>
        <p className="text-white/60 leading-relaxed mb-6">
          Heuristic analysis is the final layer of defense before a scan is finalized. It provides a comprehensive risk score based on the predicted behavior of the input.
        </p>
        <ul className="space-y-4">
          {[
            'Blocks suspicious background processes',
            'Flags unauthorized data exfiltration attempts',
            'Predicts malicious link redirects',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
              {item}
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </div>
  );
};
