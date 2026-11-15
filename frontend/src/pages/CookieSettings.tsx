import React from 'react';
import { ScrollReveal, Button } from '../components/UI';
import { CheckCircle2, XCircle } from 'lucide-react';

export const CookieSettings: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
      <ScrollReveal>
        <h1 className="text-4xl font-bold mb-8">Cookie Settings</h1>
        <div className="space-y-8">
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Essential Cookies</h3>
              <div className="flex items-center gap-2 text-accent-green">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Always Active</span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.
            </p>
          </div>

          <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Preference Cookies</h3>
              <div className="flex items-center gap-2 text-white/30">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Inactive</span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              These cookies allow the website to remember choices you make (such as your user name, language or the region you are in) and provide enhanced, more personal features.
            </p>
            <Button variant="secondary" size="sm">Enable Preference Cookies</Button>
          </div>

          <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Analytics Cookies</h3>
              <div className="flex items-center gap-2 text-white/30">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Inactive</span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              These cookies help us to understand how visitors engage with the website. We may use a set of cookies to collect information and report website usage statistics without personally identifying individual visitors to Google.
            </p>
            <Button variant="secondary" size="sm">Enable Analytics Cookies</Button>
          </div>

          <div className="flex justify-end gap-4 pt-8">
            <Button variant="secondary">Reject All</Button>
            <Button variant="primary">Save Preferences</Button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
