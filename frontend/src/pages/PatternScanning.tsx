import React from 'react';
import { ScrollReveal, Card } from '../components/UI';
import { Search, Shield, AlertCircle } from 'lucide-react';

export const PatternScanning: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <ScrollReveal className="mb-12">
        <div className="inline-flex p-4 bg-accent-teal/10 rounded-2xl mb-6">
          <Search className="w-10 h-10 text-accent-teal" />
        </div>
        <h1 className="text-4xl font-bold mb-6">Step 1: Pattern Scanning</h1>
        <p className="text-xl text-white/60 leading-relaxed">
          The first line of defense in CyberShield AI is our high-speed pattern scanning engine. This layer is designed to identify known threats with near-zero latency.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-teal" />
            Signature Matching
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">
            We maintain a massive, real-time database of malware signatures, phishing templates, and malicious URL patterns. Every scan starts by checking against these known indicators of compromise.
          </p>
        </Card>

        <Card className="p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent-teal" />
            Keyword Analysis
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">
            For messages and emails, our engine looks for linguistic patterns often used in social engineering, such as urgent calls to action, suspicious financial requests, and impersonation attempts.
          </p>
        </Card>
      </div>

      <ScrollReveal className="bg-white/5 rounded-3xl p-10 border border-white/10">
        <h2 className="text-2xl font-bold mb-6">How it Protects You</h2>
        <p className="text-white/60 leading-relaxed mb-6">
          By catching the "low-hanging fruit" of cyber threats instantly, pattern scanning allows our more complex neural models to focus on the sophisticated, never-before-seen attacks.
        </p>
        <ul className="space-y-4">
          {[
            'Blocks 99% of known phishing links instantly',
            'Identifies common malware families in milliseconds',
            'Flags suspicious language patterns in 5+ languages',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
              {item}
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </div>
  );
};
