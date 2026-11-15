import React from 'react';
import { ScrollReveal, Button, Card } from '../components/UI';
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <ScrollReveal className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          Have questions about our AI analysis or need enterprise-grade security? Our team is here to help.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-teal/10 rounded-xl">
                <Mail className="w-6 h-6 text-accent-teal" />
              </div>
              <div>
                <h4 className="font-bold">Email Us</h4>
                <p className="text-sm text-white/50">support@cybershield.ai</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-purple/10 rounded-xl">
                <MessageSquare className="w-6 h-6 text-accent-purple" />
              </div>
              <div>
                <h4 className="font-bold">Live Chat</h4>
                <p className="text-sm text-white/50">Available 24/7 for Pro users</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-yellow/10 rounded-xl">
                <Phone className="w-6 h-6 text-accent-yellow" />
              </div>
              <div>
                <h4 className="font-bold">Call Us</h4>
                <p className="text-sm text-white/50">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-green/10 rounded-xl">
                <MapPin className="w-6 h-6 text-accent-green" />
              </div>
              <div>
                <h4 className="font-bold">Office</h4>
                <p className="text-sm text-white/50">San Francisco, CA</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-teal transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-teal transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Subject</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-teal transition-colors"
                  placeholder="How can we help?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">Message</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-accent-teal transition-colors h-32 resize-none"
                  placeholder="Your message here..."
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-accent-teal to-accent-purple">
                Send Message
                <Send className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
