import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScamNotification, MessageSource, ScammerIntel } from '../types';
import { analyzeIncomingMessage, sendNativeBrowserNotification, reportScammerToGlobalRegistry, ScamDetectionResult } from '../services/scamDetectionService';
import { playAlertSynth } from '../services/settingsService';

interface ScamAlertContextType {
  notifications: ScamNotification[];
  activeAlert: ScamNotification | null;
  selectedScammerDossier: ScamNotification | null;
  unreadCount: number;
  isSentinelActive: boolean;
  setIsSentinelActive: (active: boolean) => void;
  fastAlertSirenEnabled: boolean;
  setFastAlertSirenEnabled: (enabled: boolean) => void;
  isNotificationPermissionGranted: boolean;
  requestBrowserNotificationPermission: () => Promise<boolean>;
  interceptMessage: (text: string, source?: MessageSource, sender?: string, senderName?: string) => Promise<ScamDetectionResult>;
  dismissActiveAlert: () => void;
  openScammerDossier: (notification: ScamNotification) => void;
  closeScammerDossier: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  blockSender: (id: string) => void;
  reportScammer: (id: string) => Promise<{ success: boolean; incidentRef: string }>;
  isScamCenterOpen: boolean;
  setIsScamCenterOpen: (open: boolean) => void;
  simulateIncomingScam: (preset: 'whatsapp_family' | 'whatsapp_job' | 'sms_bank' | 'sms_delivery' | 'whatsapp_otp') => Promise<ScamDetectionResult>;
}

const STORAGE_KEY = 'cybershield_scam_notifications_v2';

// Seed rich sample alerts with deep scammer profiles
const INITIAL_DEMO_ALERTS: ScamNotification[] = [
  {
    id: 'scam-demo-1',
    source: 'whatsapp',
    sender: '+1 (555) 234-8901',
    senderName: 'Unknown WhatsApp Caller',
    rawMessage: 'Hi Mum, I dropped my phone in water and this is my temporary number. Can you please quickly transfer $850 to this account for my car repair? BSB: 062-000 Acc: 12984928. Really urgent!! Don\'t call, microphone is dead.',
    threatType: 'Impersonation',
    riskScore: 98,
    severity: 'CRITICAL',
    summary: 'CRITICAL ALERT: Detected fake WHATSAPP scam (Impersonation) from active syndicate.',
    reasons: [
      'Impersonates family member claiming damaged phone ("Hi Mum")',
      'Urgent emotional pressure to transfer funds to third-party mule account',
      'Refuses incoming voice calls to avoid voice recognition'
    ],
    recommendedAction: 'Call your family member directly on their known original number. Do not send funds.',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    scammer: {
      id: 'scammer-15552348901',
      name: 'Family Impersonation Fraudster ("Hi Mum" Syndicate)',
      identifier: '+1 (555) 234-8901',
      alias: 'Syndicate Cell #402',
      threatGroup: 'Transnational Family Emergency Syndicate (TFES)',
      carrierOrRouting: 'High-Volume Disposable VoIP Bridge (Bandwidth/Twilio)',
      estimatedLocation: 'North American Virtual DID / Leased VoIP Gateway',
      reputationScore: 98,
      globalReportsCount: 487,
      tactics: [
        'Emotional urgency manipulation',
        'Fabricated phone damage excuse',
        'Direct money mule bank account routing'
      ],
      targetAsset: 'Emergency Bank Wire ($850+)',
      status: 'ACTIVE_SYNDICATE',
      reported: false,
    }
  },
  {
    id: 'scam-demo-2',
    source: 'sms',
    sender: 'VM-SBIBNK',
    senderName: 'Spoofed Bank SMS Route',
    rawMessage: 'Dear Customer, Your SBI Bank account has been SUSPENDED due to pending KYC verification. Update PAN immediately to avoid permanent closure: http://sbi-kyc-secure.top/login',
    threatType: 'Financial Fraud',
    riskScore: 97,
    severity: 'CRITICAL',
    summary: 'CRITICAL ALERT: Detected fake SMS scam (Financial Fraud) attempting netbanking credential theft.',
    reasons: [
      'Urgent account suspension threat demanding immediate KYC update',
      'Phishing clone URL using illegitimate suspicious extension (.top)',
      'Attempts real-time harvesting of netbanking credentials and 2FA OTP'
    ],
    recommendedAction: 'Delete message. Never click bank links received over SMS.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    scammer: {
      id: 'scammer-vmsbibnk',
      name: 'Banking Credential & OTP Harvesting Harvester',
      identifier: 'VM-SBIBNK',
      alias: 'FinPhish Botnet Operator #14',
      threatGroup: 'International Banking Phishing Kit Cartel',
      carrierOrRouting: 'Compromised Enterprise SMS Protocol (SMPP Gateway)',
      estimatedLocation: 'International Bulk SMS Aggregator (Spoofed Alphanumeric)',
      reputationScore: 97,
      globalReportsCount: 624,
      tactics: [
        'Alphanumeric sender ID spoofing',
        'Impersonation of leading national bank',
        'Reverse-proxy phishing credential sniffer'
      ],
      targetAsset: 'NetBanking Password & 2FA OTP Token',
      status: 'ACTIVE_SYNDICATE',
      reported: false,
    }
  }
];

const ScamAlertContext = createContext<ScamAlertContextType | undefined>(undefined);

export const ScamAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ScamNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_DEMO_ALERTS;
  });

  const [activeAlert, setActiveAlert] = useState<ScamNotification | null>(null);
  const [selectedScammerDossier, setSelectedScammerDossier] = useState<ScamNotification | null>(null);
  const [isSentinelActive, setIsSentinelActive] = useState<boolean>(true);
  const [fastAlertSirenEnabled, setFastAlertSirenEnabled] = useState<boolean>(true);
  const [isScamCenterOpen, setIsScamCenterOpen] = useState<boolean>(false);
  const [isNotificationPermissionGranted, setIsNotificationPermissionGranted] = useState<boolean>(false);

  // Check browser notification permission status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsNotificationPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  // Persist notifications to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore storage error
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const requestBrowserNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setIsNotificationPermissionGranted(granted);
      if (granted) {
        new Notification('🚨 CyberShield Fast Scammer Alert Active', {
          body: 'You will receive instant alerts about intercepted scammers and their fraudulent notifications!',
          icon: '/favicon.ico'
        });
        playAlertSynth('success');
      }
      return granted;
    } catch {
      return false;
    }
  };

  const interceptMessage = async (
    text: string,
    source: MessageSource = 'whatsapp',
    sender: string = source === 'whatsapp' ? '+91 98765 43210' : 'SMS-ALERT',
    senderName?: string
  ): Promise<ScamDetectionResult> => {
    const result = analyzeIncomingMessage(text, source, sender);

    if (result.isScam) {
      const newNotification: ScamNotification = {
        id: `scam-${Date.now()}`,
        source,
        sender,
        senderName: senderName || (source === 'whatsapp' ? 'Unknown WhatsApp Contact' : 'Suspicious Sender'),
        rawMessage: text,
        threatType: result.threatType,
        riskScore: result.riskScore,
        severity: result.severity,
        summary: result.summary,
        reasons: result.reasons,
        recommendedAction: result.recommendedAction,
        timestamp: new Date().toISOString(),
        read: false,
        scammer: result.scammerIntel,
      };

      // 1. Play immediate high-priority audio siren if enabled
      if (fastAlertSirenEnabled) {
        playAlertSynth('critical');
      }

      // 2. Trigger native OS/Browser push notification with scammer details
      sendNativeBrowserNotification(newNotification);

      // 3. Show instant in-app sliding alert HUD
      setActiveAlert(newNotification);

      // 4. Save to notification stream
      setNotifications(prev => [newNotification, ...prev]);
    }

    return result;
  };

  const dismissActiveAlert = () => {
    setActiveAlert(null);
  };

  const openScammerDossier = (notification: ScamNotification) => {
    setSelectedScammerDossier(notification);
    markAsRead(notification.id);
  };

  const closeScammerDossier = () => {
    setSelectedScammerDossier(null);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (activeAlert?.id === id) {
      setActiveAlert(null);
    }
    if (selectedScammerDossier?.id === id) {
      setSelectedScammerDossier(null);
    }
  };

  const blockSender = (id: string) => {
    const item = notifications.find(n => n.id === id);
    if (!item) return;

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, blocked: true } : n));

    // Save to blacklist
    try {
      const raw = localStorage.getItem('cybershield_threat_blacklist');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({
        id: `blk-${Date.now()}`,
        indicator: item.sender,
        type: 'sender_id',
        threatCategory: item.threatType,
        severity: item.severity === 'CRITICAL' ? 'Critical' : 'High',
        addedBy: 'Scammer Fast Alert Sentinel',
        addedAt: new Date().toISOString(),
        status: 'quarantined'
      });
      localStorage.setItem('cybershield_threat_blacklist', JSON.stringify(list));
    } catch {
      // ignore
    }

    playAlertSynth('success');
  };

  const reportScammer = async (id: string): Promise<{ success: boolean; incidentRef: string }> => {
    const item = notifications.find(n => n.id === id);
    if (!item || !item.scammer) {
      return { success: false, incidentRef: '' };
    }

    const reportRes = await reportScammerToGlobalRegistry(item.scammer, item.rawMessage, item.source);

    setNotifications(prev => prev.map(n => {
      if (n.id === id && n.scammer) {
        return {
          ...n,
          scammer: {
            ...n.scammer,
            reported: true,
            globalReportsCount: n.scammer.globalReportsCount + 1
          }
        };
      }
      return n;
    }));

    if (selectedScammerDossier?.id === id && selectedScammerDossier.scammer) {
      setSelectedScammerDossier({
        ...selectedScammerDossier,
        scammer: {
          ...selectedScammerDossier.scammer,
          reported: true,
          globalReportsCount: selectedScammerDossier.scammer.globalReportsCount + 1
        }
      });
    }

    playAlertSynth('success');
    return { success: true, incidentRef: reportRes.incidentRef };
  };

  const simulateIncomingScam = async (
    preset: 'whatsapp_family' | 'whatsapp_job' | 'sms_bank' | 'sms_delivery' | 'whatsapp_otp'
  ): Promise<ScamDetectionResult> => {
    let text = '';
    let source: MessageSource = 'whatsapp';
    let sender = '';
    let senderName = '';

    switch (preset) {
      case 'whatsapp_family':
        source = 'whatsapp';
        sender = '+1 (555) 019-2834';
        senderName = 'Unknown WhatsApp Sender';
        text = 'Hi Dad, my phone broke completely and I lost all my contacts. This is my temporary WhatsApp number. Please transfer $950 to this account right away, I have an emergency bill due today: BSB: 092-111 Acc: 58392019. Please don\'t call, microphone is damaged too!';
        break;
      case 'whatsapp_job':
        source = 'whatsapp';
        sender = '+62 812-9842-1920';
        senderName = 'VIP Career Recruiter';
        text = 'Greetings! I am from YouTube Partner HR. We offer Part-time Work From Home rating videos. Earn $300 - $800 daily directly to your account. No experience required. Join our official Telegram manager: https://t.me/vip_rating_jobs_bot to claim your $50 welcome bonus now!';
        break;
      case 'whatsapp_otp':
        source = 'whatsapp';
        sender = '+44 7911 123456';
        senderName = 'Unknown Contact';
        text = 'Hey sorry! I accidentally sent my 6-digit WhatsApp registration code to your phone number by mistake. Can you please forward the 6-digit code back to me immediately? It is very urgent!';
        break;
      case 'sms_bank':
        source = 'sms';
        sender = 'AD-HDFCBK';
        senderName = 'Spoofed Bank SMS';
        text = 'URGENT: Your HDFC / Chase debit card and netbanking access will be blocked within 12 hours due to pending KYC verification. Click to update PAN and verify identity immediately: https://hdfc-kyc-portal.buzz/verify';
        break;
      case 'sms_delivery':
        source = 'sms';
        sender = '+1 (800) 555-0199';
        senderName = 'FedEx Express Courier';
        text = 'FedEx Notification: Your parcel #FX-928419 is held at our local distribution hub due to an unpaid address redelivery fee of $2.45. Update your delivery address & pay fee now: https://fedx-parcel-track.xyz/fee';
        break;
    }

    return interceptMessage(text, source, sender, senderName);
  };

  return (
    <ScamAlertContext.Provider
      value={{
        notifications,
        activeAlert,
        selectedScammerDossier,
        unreadCount,
        isSentinelActive,
        setIsSentinelActive,
        fastAlertSirenEnabled,
        setFastAlertSirenEnabled,
        isNotificationPermissionGranted,
        requestBrowserNotificationPermission,
        interceptMessage,
        dismissActiveAlert,
        openScammerDossier,
        closeScammerDossier,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        blockSender,
        reportScammer,
        isScamCenterOpen,
        setIsScamCenterOpen,
        simulateIncomingScam,
      }}
    >
      {children}
    </ScamAlertContext.Provider>
  );
};

export const useScamAlert = () => {
  const context = useContext(ScamAlertContext);
  if (!context) {
    throw new Error('useScamAlert must be used within a ScamAlertProvider');
  }
  return context;
};

