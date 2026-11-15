import React, { useState } from 'react';
import { Shield, ShieldAlert, Menu, X, LogIn, LogOut, User, Settings, Sun, Moon, Palette, Bell, BellRing } from 'lucide-react';
import { Button } from './UI';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useScamAlert } from '../contexts/ScamAlertContext';
import { getActiveAdminIdentity } from '../services/adminService';

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isLight, resetToDefaultLight, resetToDefaultDark, setIsCustomizerOpen } = useTheme();
  const { unreadCount, setIsScamCenterOpen } = useScamAlert();
  const isDesignatedAdmin = user?.email?.trim().toLowerCase() === 'admin123@gamil.com';
  const activeAdmin = isDesignatedAdmin ? getActiveAdminIdentity(user) : null;
  const profilePhoto = user?.photoURL || activeAdmin?.avatar;

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Scanner' },
    { id: 'chatbot', label: 'AI CyberBot', isSpecial: true },
    { id: 'admin', label: 'Admin Panel', isAdmin: true },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/80 backdrop-blur-md border-b border-white/5 w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => handleNavigate('home')}
          >
            <div className="p-2 bg-accent-teal/10 rounded-lg group-hover:bg-accent-teal/20 transition-colors">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-accent-teal" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">
              CyberShield <span className="text-accent-teal">AI</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-3.5 xl:gap-6">
            {navItems.filter((item) => !item.isAdmin || isDesignatedAdmin).map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`text-xs xl:text-sm font-medium transition-colors hover:text-accent-teal flex items-center gap-1.5 py-1 px-1.5 rounded-lg ${
                  activePage === item.id ? 'text-accent-teal font-bold' : 'text-white/70'
                }`}
              >
                <span>{item.label}</span>
                {item.isSpecial && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent-teal/20 text-accent-teal border border-accent-teal/30 font-bold uppercase tracking-wider animate-pulse">
                    Chat
                  </span>
                )}
                {item.isAdmin && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent-purple/20 text-accent-purple border border-accent-purple/40 font-bold uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Light / Dark Mode Toggle Button */}
            <button
              onClick={() => (isLight ? resetToDefaultDark() : resetToDefaultLight())}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isLight
                  ? 'bg-amber-100/80 hover:bg-amber-200/80 border-amber-300 text-amber-900 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
              }`}
              title={isLight ? 'Switch to Cyber Dark Background' : 'Switch to Clean Light Background'}
              aria-label="Toggle Light/Dark Theme"
            >
              {isLight ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline font-mono">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline font-mono">Dark</span>
                </>
              )}
            </button>

            {/* Background Colour Generator Studio Button */}
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-accent-teal/15 to-accent-purple/15 hover:from-accent-teal/25 hover:to-accent-purple/25 border border-accent-teal/30 text-xs font-semibold text-accent-teal hover:text-accent-teal transition-all cursor-pointer group"
              title="Open Background Colour Generator & Studio"
              aria-label="Generate Background Color"
            >
              <Palette className="w-3.5 h-3.5 text-accent-teal group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden md:inline">Generate BG</span>
            </button>


            {/* Fast Scam Notification Sentinel Bell */}
            <button
              onClick={() => setIsScamCenterOpen(true)}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                unreadCount > 0
                  ? 'bg-accent-red/20 border-accent-red/60 text-accent-red shadow-lg shadow-accent-red/20 ring-1 ring-accent-red/40 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
              }`}
              title={unreadCount > 0 ? `${unreadCount} unread scam notifications intercepted!` : 'Scam Notification Center (WhatsApp & SMS Guard)'}
              aria-label="Scam Notifications"
            >
              {unreadCount > 0 ? (
                <BellRing className="w-3.5 h-3.5 text-accent-red animate-bounce" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-accent-teal" />
              )}
              <span className="hidden sm:inline font-mono">
                {unreadCount > 0 ? `${unreadCount} Alert${unreadCount > 1 ? 's' : ''}` : 'Scam Guard'}
              </span>
              {unreadCount > 0 && (
                <span className="bg-accent-red text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-white leading-tight max-w-[120px] truncate">{user.displayName}</span>
                  <div className="flex items-center gap-1.5">
                    {isDesignatedAdmin && <>
                      <button onClick={() => handleNavigate('admin')} className="text-[10px] text-accent-purple hover:underline font-bold transition-colors" title="Access Admin Console">Admin</button>
                      <span className="text-white/20 text-[10px]">•</span>
                    </>}
                    <button 
                      onClick={() => handleNavigate('settings')}
                      className="text-[10px] text-accent-teal hover:underline font-bold transition-colors"
                    >
                      Settings
                    </button>
                    <span className="text-white/20 text-[10px]">•</span>
                    <button 
                      onClick={logout}
                      className="text-[10px] text-white/40 hover:text-accent-red uppercase tracking-widest font-black transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleNavigate('settings')}
                  title="Open System Settings"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-accent-teal/30 hover:border-accent-teal p-0.5 overflow-hidden transition-all hover:scale-105 cursor-pointer relative group"
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-accent-teal/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-accent-teal" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                    <Settings className="w-4 h-4 text-accent-teal animate-spin-slow" />
                  </div>
                </button>
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                glow 
                className="hidden sm:flex bg-gradient-to-r from-accent-teal/20 to-accent-purple/20 border-accent-teal/30 hover:border-accent-teal text-white font-bold"
                onClick={() => handleNavigate('auth')}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login / Register
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-primary border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.filter((item) => !item.isAdmin || isDesignatedAdmin).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                    activePage === item.id ? 'bg-accent-teal/10 text-accent-teal' : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {user && (
                <div className="px-4 py-4 bg-white/5 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-full h-full p-2 bg-white/10" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => handleNavigate('settings')} role="button">
                    <p className="font-bold text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleNavigate('settings')} 
                      title="Settings"
                      className="p-2 text-accent-teal hover:bg-accent-teal/10 rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={logout} 
                      title="Log Out"
                      className="p-2 text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Mobile Background & Theme Studio */}
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3 px-4">Background & Theme</p>
                <div className="grid grid-cols-2 gap-2 px-2">
                  <button
                    onClick={() => {
                      if (isLight) resetToDefaultDark();
                      else resetToDefaultLight();
                    }}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isLight 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-white/5 text-white/80 border border-white/10'
                    }`}
                  >
                    {isLight ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-teal-400" />}
                    <span>{isLight ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsCustomizerOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-accent-teal/15 text-accent-teal border border-accent-teal/30 hover:bg-accent-teal/20 transition-all"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Generate BG</span>
                  </button>
                </div>
              </div>

              {/* Mobile Scam Sentinel Trigger */}
              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    setIsScamCenterOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                    unreadCount > 0
                      ? 'bg-accent-red/20 border-accent-red/60 text-accent-red'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {unreadCount > 0 ? (
                      <BellRing className="w-4 h-4 text-accent-red animate-bounce" />
                    ) : (
                      <Bell className="w-4 h-4 text-accent-teal" />
                    )}
                    <div>
                      <p className="text-xs font-bold leading-tight">Scam Notification Sentinel</p>
                      <p className="text-[10px] opacity-60">WhatsApp & SMS Live Guard</p>
                    </div>
                  </div>
                  {unreadCount > 0 ? (
                    <span className="bg-accent-red text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {unreadCount} Alerts
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Active</span>
                  )}
                </button>
              </div>



              {!user && (
                <div className="pt-4">
                  <Button 
                    variant="primary" 
                    className="w-full bg-accent-teal/10 text-accent-teal border-accent-teal/20"
                    onClick={() => handleNavigate('auth')}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login / Register
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
