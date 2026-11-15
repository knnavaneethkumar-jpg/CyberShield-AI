import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CyberBackground } from './components/CyberBackground';
import { BackgroundCustomizer } from './components/BackgroundCustomizer';
import { FastScamAlertPopup } from './components/FastScamAlertPopup';
import { ScamCenterModal } from './components/ScamCenterModal';
import { ScammerDossierModal } from './components/ScammerDossierModal';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';
import { HowItWorks } from './pages/HowItWorks';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { CookieSettings } from './pages/CookieSettings';
import { Contact } from './pages/Contact';
import { PatternScanning } from './pages/PatternScanning';
import { NeuralAnalysis } from './pages/NeuralAnalysis';
import { HeuristicCheck } from './pages/HeuristicCheck';
import { PrivacyVerification } from './pages/PrivacyVerification';
import { AuthPage } from './pages/AuthPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPanel } from './pages/AdminPanel';
import { CyberBotWidget } from './components/CyberBotWidget';
import { useAuth } from './contexts/AuthContext';
import { Language } from './types';
import { TRANSLATIONS } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Github, Twitter, Linkedin, Bot } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const { user, loading } = useAuth();
  // Default to 'auth' first if user is not authenticated
  const [activePage, setActivePage] = useState<string>('auth');
  const [chatQuery, setChatQuery] = useState<{ query?: string; context?: string }>({});
  const t = TRANSLATIONS[lang];

  const handleOpenChat = (query?: string, context?: string) => {
    setChatQuery({ query, context });
    setActivePage('chatbot');
  };

  const isDesignatedAdmin = user?.email?.trim().toLowerCase() === 'admin123@gamil.com';

  // The designated admin lands in the admin panel; ordinary users always land on Home.
  useEffect(() => {
    if (user && (activePage === 'auth' || (isDesignatedAdmin && activePage === 'home'))) {
      setActivePage(isDesignatedAdmin ? 'admin' : 'home');
    } else if (!user && !loading && activePage !== 'auth') {
      setActivePage('auth');
    } else if (user && activePage === 'admin' && !isDesignatedAdmin) {
      setActivePage('home');
    }
  }, [user, loading, activePage, isDesignatedAdmin]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <CyberBackground />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="p-4 bg-accent-teal/10 rounded-2xl border border-accent-teal/20 animate-pulse">
            <Shield className="w-12 h-12 text-accent-teal" />
          </div>
          <div className="w-8 h-8 border-4 border-accent-teal border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono font-bold tracking-widest text-accent-teal uppercase">
            Initializing CyberShield AI...
          </p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    // Force Auth page if unauthenticated
    if (!user) {
      return <AuthPage onSuccess={() => setActivePage('home')} />;
    }

    switch (activePage) {
      case 'auth':
        return <AuthPage onSuccess={() => setActivePage('home')} />;
      case 'home':
        return <Home t={t} onStartScan={() => setActivePage('dashboard')} onOpenChat={() => handleOpenChat()} />;
      case 'dashboard':
        return <Dashboard t={t} onOpenChat={handleOpenChat} onNavigate={setActivePage} />;
      case 'chatbot':
        return (
          <ChatbotPage 
            language={lang} 
            onNavigate={setActivePage} 
            initialQuery={chatQuery.query} 
            securityContext={chatQuery.context} 
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            currentLang={lang} 
            onLanguageChange={setLang} 
            onNavigate={setActivePage} 
          />
        );
      case 'admin':
        return isDesignatedAdmin
          ? <AdminPanel onNavigate={setActivePage} />
          : <Home t={t} onStartScan={() => setActivePage('dashboard')} onOpenChat={() => handleOpenChat()} />;
      case 'about':
        return <About onNavigate={setActivePage} />;
      case 'how-it-works':
        return <HowItWorks />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms-of-service':
        return <TermsOfService />;
      case 'cookie-settings':
        return <CookieSettings />;
      case 'contact':
        return <Contact />;
      case 'pattern-scanning':
        return <PatternScanning />;
      case 'neural-analysis':
        return <NeuralAnalysis />;
      case 'heuristic-check':
        return <HeuristicCheck />;
      case 'privacy-verification':
        return <PrivacyVerification />;
      default:
        return <Home t={t} onStartScan={() => setActivePage('dashboard')} onOpenChat={() => handleOpenChat()} />;
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden selection:bg-accent-teal/30 selection:text-accent-teal flex flex-col transition-colors duration-300">
      <CyberBackground />
      <BackgroundCustomizer />
      <FastScamAlertPopup onOpenChat={(query, context) => handleOpenChat(query, context)} />
      <ScamCenterModal onOpenChat={(query, context) => handleOpenChat(query, context)} />
      <ScammerDossierModal onOpenChat={(query, context) => handleOpenChat(query, context)} />

      <Navbar 
        onNavigate={setActivePage} 
        activePage={activePage} 
      />
      
      <main className="w-full flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={user ? activePage : 'auth-page'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating CyberBot Widget (active across all views when authenticated) */}
      {user && activePage !== 'chatbot' && (
        <CyberBotWidget 
          language={lang} 
          onOpenFullPage={() => setActivePage('chatbot')} 
        />
      )}

      <footer className="bg-black/20 border-t border-white/5 py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-accent-teal" />
                <span className="text-xl font-bold">CyberShield <span className="text-accent-teal">AI</span></span>
              </div>
              <p className="text-white/40 max-w-sm leading-relaxed">
                Empowering individuals and businesses with AI-driven cybersecurity intelligence. Stay safe in the digital age with explainable threat detection.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-white/50">
                <li><button onClick={() => setActivePage(user ? 'dashboard' : 'auth')} className="hover:text-accent-teal transition-colors">Scanner</button></li>
                <li><button onClick={() => setActivePage(user ? 'chatbot' : 'auth')} className="hover:text-accent-teal transition-colors text-accent-teal font-medium flex items-center gap-1.5"><Bot className="w-4 h-4" /> CyberBot AI</button></li>
                <li><button onClick={() => setActivePage(user ? 'how-it-works' : 'auth')} className="hover:text-accent-teal transition-colors">How It Works</button></li>
                <li><button onClick={() => setActivePage(user ? 'about' : 'auth')} className="hover:text-accent-teal transition-colors">About Us</button></li>
                <li><button onClick={() => setActivePage(user ? 'settings' : 'auth')} className="hover:text-accent-teal transition-colors">Settings</button></li>
                <li><button onClick={() => setActivePage(user ? 'contact' : 'auth')} className="hover:text-accent-teal transition-colors">Contact</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-white/50">
                <li><button onClick={() => setActivePage(user ? 'privacy-policy' : 'auth')} className="hover:text-accent-teal transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setActivePage(user ? 'terms-of-service' : 'auth')} className="hover:text-accent-teal transition-colors">Terms of Service</button></li>
                <li><button onClick={() => setActivePage(user ? 'cookie-settings' : 'auth')} className="hover:text-accent-teal transition-colors">Cookie Settings</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-accent-teal/10 hover:text-accent-teal transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-accent-teal/10 hover:text-accent-teal transition-all">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-accent-teal/10 hover:text-accent-teal transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center text-sm text-white/30">
            <p>&copy; {new Date().getFullYear()} CyberShield AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
