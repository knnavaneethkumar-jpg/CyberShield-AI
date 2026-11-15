import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components/UI';
import { CaptchaWidget } from '../components/CaptchaWidget';
import { Shield, Lock, Mail, User as UserIcon, ArrowRight, AlertTriangle, X, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthPageProps {
  onSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [wrongPasswordAlert, setWrongPasswordAlert] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signInWithEmail, registerWithEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWrongPasswordAlert(null);

    // 1. Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    // 2. CAPTCHA verification check
    const captchaTargetEl = document.querySelector('[data-captcha-target]') as HTMLInputElement | null;
    const expectedCaptcha = captchaTargetEl?.getAttribute('data-captcha-target') || '';

    if (!captchaInput.trim() || captchaInput.trim().toUpperCase() !== expectedCaptcha.toUpperCase()) {
      setError('CAPTCHA verification failed! Please type the exact characters shown in the security box.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName);
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errCode = err.code || '';
      
      if (
        errCode === 'auth/wrong-password' || 
        errCode === 'auth/invalid-credential' ||
        errCode === 'auth/user-not-found'
      ) {
        setWrongPasswordAlert('Incorrect password! The password you entered is wrong. Please check your password and try again, or register for a new account.');
      } else if (errCode === 'auth/email-already-in-use') {
        setError('An account with this email address already exists. Please sign in instead.');
      } else if (errCode === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (errCode === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 max-w-md mx-auto min-h-[85vh] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-accent-teal/10 rounded-2xl mb-4 border border-accent-teal/20 shadow-lg shadow-accent-teal/5">
            <Shield className="w-10 h-10 text-accent-teal animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            CyberShield <span className="text-accent-teal">AI</span>
          </h1>
          <p className="text-sm text-white/50">
            {mode === 'login' 
              ? 'Please sign in to access your cybersecurity dashboard' 
              : 'Register your account to unlock AI threat analysis & history'}
          </p>
        </div>

        <Card className="p-8 border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Mode Switch Tabs */}
          <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setWrongPasswordAlert(null);
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-accent-teal text-primary shadow-lg shadow-accent-teal/20 font-bold'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setWrongPasswordAlert(null);
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-accent-teal text-primary shadow-lg shadow-accent-teal/20 font-bold'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* WRONG PASSWORD ALERT POPUP / BANNER */}
          <AnimatePresence>
            {wrongPasswordAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="mb-6 p-4 bg-accent-red/20 border-2 border-accent-red rounded-2xl text-white relative shadow-2xl shadow-accent-red/20"
              >
                <button
                  onClick={() => setWrongPasswordAlert(null)}
                  className="absolute top-3 right-3 text-white/60 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent-red/30 rounded-xl text-accent-red flex-shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-accent-red uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4" />
                      Incorrect Password!
                    </h4>
                    <p className="text-xs text-white/90 leading-relaxed font-medium">
                      {wrongPasswordAlert}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standard Error Banner */}
          <AnimatePresence>
            {error && !wrongPasswordAlert && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3.5 bg-accent-red/10 border border-accent-red/30 rounded-xl flex items-start gap-3 text-xs text-accent-red"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-semibold">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-primary text-[10px] font-black uppercase tracking-widest text-white/30">
              Or with Email & Password
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-teal transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-teal transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-black/30 border rounded-xl pl-10 pr-12 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none transition-colors ${
                    wrongPasswordAlert ? 'border-accent-red text-accent-red focus:border-accent-red' : 'border-white/10 focus:border-accent-teal'
                  }`}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-accent-teal" title={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-12 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-teal transition-colors"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} aria-pressed={showConfirmPassword} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-accent-teal" title={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* CAPTCHA Widget */}
            <div className="pt-2 border-t border-white/10">
              <CaptchaWidget
                value={captchaInput}
                onChange={setCaptchaInput}
                error={error?.includes('CAPTCHA')}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              glow
              className="w-full mt-6 bg-gradient-to-r from-accent-teal to-accent-purple text-primary font-black py-3.5 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Verify & Sign In' : 'Verify & Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer toggle note */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center text-xs text-white/40">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setWrongPasswordAlert(null);
                  }}
                  className="text-accent-teal font-bold hover:underline ml-1 cursor-pointer"
                >
                  Register now
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setWrongPasswordAlert(null);
                  }}
                  className="text-accent-teal font-bold hover:underline ml-1 cursor-pointer"
                >
                  Sign in instead
                </button>
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
