import React from 'react';
import { ScrollReveal } from '../components/UI';

export const TermsOfService: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
      <ScrollReveal>
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-white/70">
          <p>Last updated: March 24, 2026</p>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By using CyberShield AI, you agree to these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Use of Service</h2>
            <p>
              You may use our scanner for personal or professional security analysis. You may not use it for malicious purposes, such as testing your own malware for detection evasion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Accuracy of Results</h2>
            <p>
              Our AI analysis is highly accurate but not perfect. CyberShield AI is not responsible for any security incidents that occur despite using our tools.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
            <p>
              All content and technology used in CyberShield AI are the property of CyberShield AI and are protected by copyright and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p>
              CyberShield AI is provided "as is" without any warranties. We are not liable for any damages arising from your use of the service.
            </p>
          </section>
        </div>
      </ScrollReveal>
    </div>
  );
};
