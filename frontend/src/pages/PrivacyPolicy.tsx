import React from 'react';
import { ScrollReveal } from '../components/UI';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
      <ScrollReveal>
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-white/70">
          <p>Last updated: March 24, 2026</p>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              At CyberShield AI, we prioritize your privacy. This Privacy Policy explains how we handle your data when you use our scanning services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Data Collection</h2>
            <p>
              We do not store the files, messages, or links you scan. Analysis is performed in real-time, and the data is discarded immediately after the results are generated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. AI Analysis</h2>
            <p>
              Our AI models process your input locally or in secure, transient environments. No personal data is used to train our models without explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Cookies</h2>
            <p>
              We use minimal cookies to remember your language preferences and session state. We do not use tracking cookies for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this policy, please contact us at privacy@cybershield.ai.
            </p>
          </section>
        </div>
      </ScrollReveal>
    </div>
  );
};
