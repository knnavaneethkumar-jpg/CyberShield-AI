import React from 'react';
import { ScrollReveal, Card } from '../components/UI';
import { Lock, Shield, EyeOff } from 'lucide-react';

export const PrivacyVerification: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <ScrollReveal className="mb-12">
        <div className="inline-flex p-4 bg-accent-green/10 rounded-2xl mb-6">
          <Lock className="w-10 h-10 text-accent-green" />
        </div>
        <h1 className="text-4xl font-bold mb-6">Step 4: Privacy Verification</h1>
        <p className="text-xl text-white/60 leading-relaxed">
          At CyberShield AI, your privacy is our top priority. The final step of every scan is a rigorous verification process to ensure your data remains secure.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-accent-green" />
            Zero-Storage Policy
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">
            We do not store the files, messages, or links you scan. Analysis is performed in real-time, and the data is discarded immediately after the results are generated.
          </p>
        </Card>

        <Card className="p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-green" />
            Secure Analysis
          </h3>
          <p className="text-white/50 text-sm leading-relaxed">
            All analysis is performed in secure, transient environments. Your data is never used to train our models without your explicit, opt-in consent.
          </p>
        </Card>
      </div>

      <ScrollReveal className="bg-white/5 rounded-3xl p-10 border border-white/10">
        <h2 className="text-2xl font-bold mb-6">Privacy-First Security</h2>
        <p className="text-white/60 leading-relaxed mb-6">
          Privacy verification ensures that CyberShield AI is not just a security tool, but a privacy tool as well. We believe that security should never come at the cost of your personal data.
        </p>
        <ul className="space-y-4">
          {[
            'No data is stored after a scan',
            'Analysis is performed in secure, isolated environments',
            'Strict compliance with global privacy standards',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-white/40">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              {item}
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </div>
  );
};
