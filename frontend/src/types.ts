export type Language = 'en' | 'hi' | 'kn' | 'te' | 'ta';

export type ScanType = 'app' | 'message' | 'link';

export interface ScanResult {
  score: number;
  mlModelAvailable?: boolean;
  mlPrediction?: 'MALICIOUS' | 'BENIGN';
  mlRiskScore?: number;
  mlModality?: 'url' | 'text';
  type: 'Safe' | 'Suspicious' | 'Dangerous';
  threatLabel?: string;
  explanation: string;
  details: string[];
  whyFlagged?: string[];
  riskFactors?: string[];
  recommendedActions?: string[];
  detailedLog?: string;
  timestamp: string;
}

export type SensitivityLevel = 'high' | 'balanced' | 'low';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'secops_admin';
  title: string;
  avatar?: string;
  phone?: string;
  twoFactorEnabled: boolean;
  status: 'active' | 'standby';
  lastActive: string;
  permissions: string[];
  seatingStation?: string;
  sittingStatus?: 'seated_active' | 'desk_standby' | 'away_roaming';
  sittingDurationMinutes?: number;
  autoLockOnAway?: boolean;
  seatingErgonomicAlerts?: boolean;
}

export interface ThreatBlacklistEntry {
  id: string;
  indicator: string;
  type: 'domain' | 'sender_id' | 'hash' | 'apk';
  threatCategory: string;
  severity: 'Critical' | 'High' | 'Medium';
  addedBy: string;
  addedAt: string;
  status: 'active' | 'quarantined';
}

export interface UserSettings {
  userId: string;
  sensitivity: SensitivityLevel;
  deepAnalysis: boolean;
  autoScanLinks: boolean;
  soundAlerts: boolean;
  criticalWarningBanner: boolean;
  dataRetentionDays: number;
  anonymizeInputs: boolean;
  hudAnimations: boolean;
  language: Language;
  updatedAt?: string;
}

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'userId'> = {
  sensitivity: 'balanced',
  deepAnalysis: true,
  autoScanLinks: true,
  soundAlerts: true,
  criticalWarningBanner: true,
  dataRetentionDays: 30,
  anonymizeInputs: true,
  hudAnimations: true,
  language: 'en',
};

export interface Translation {
  heroTitle: string;
  heroSubtitle: string;
  scanNow: string;
  appScan: string;
  messageScan: string;
  linkScan: string;
  whyChooseUs: string;
  explainableAI: string;
  multilingual: string;
  privacyFirst: string;
  dashboard: string;
  results: string;
  about: string;
  howItWorks: string;
  scanning: string;
  riskScore: string;
  detailedAnalysis: string;
  stepScanning: string;
  stepNeural: string;
  stepHeuristic: string;
  stepFinalizing: string;
  appExplanation: string;
  appDetail1: string;
  appDetail2: string;
  appDetail3: string;
  appDetail4: string;
  messageExplanation: string;
  messageDetail1: string;
  messageDetail2: string;
  messageDetail3: string;
  messageDetail4: string;
  linkExplanation: string;
  linkDetail1: string;
  linkDetail2: string;
  linkDetail3: string;
  linkDetail4: string;
  detailedAnalysisDesc: string;
  detailedAnalysisLog: string;
}

export type MessageSource = 'whatsapp' | 'sms' | 'notification' | 'email';

export interface ScammerIntel {
  id: string;
  name: string;
  identifier: string; // phone number, sender ID, or email
  alias?: string;
  threatGroup?: string;
  carrierOrRouting: string;
  estimatedLocation: string;
  reputationScore: number; // 0-100 (100 = confirmed repeat fraud syndicate)
  globalReportsCount: number;
  tactics: string[];
  targetAsset: string; // e.g. "Emergency Wire Funds", "Bank KYC Credentials", "WhatsApp OTP"
  status: 'ACTIVE_SYNDICATE' | 'CONFIRMED_FRAUDSTER' | 'DISPOSABLE_BOT' | 'SUSPECTED_PHISHER';
  reported: boolean;
}

export interface ScamNotification {
  id: string;
  source: MessageSource;
  sender: string;
  senderName?: string;
  rawMessage: string;
  threatType: 'Phishing' | 'Account Takeover' | 'Financial Fraud' | 'Fake Delivery' | 'Malicious Link' | 'Job Scam' | 'Impersonation' | 'Urgent Extortion';
  riskScore: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  summary: string;
  reasons: string[];
  recommendedAction: string;
  timestamp: string;
  read: boolean;
  blocked?: boolean;
  scammer?: ScammerIntel;
}
