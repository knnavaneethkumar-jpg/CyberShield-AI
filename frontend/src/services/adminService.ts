import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { AdminProfile, ThreatBlacklistEntry } from '../types';
import navaneethAvatar from '../assets/images/admin_navaneeth_1790067281641.jpg';
import madanAvatar from '../assets/images/admin_madan_1790067312602.jpg';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.warn('Firestore Error in AdminService: ', JSON.stringify(errInfo));
}

// Canonical Designated Super Administrators
export const DESIGNATED_ADMINS: AdminProfile[] = [
  {
    id: 'admin_navaneeth',
    name: 'Navaneeth Kumar Kn',
    email: 'knnavaneethkumar@gmail.com',
    role: 'super_admin',
    title: 'Lead Security Architect & Super Administrator',
    avatar: navaneethAvatar,
    phone: '+91 98450 12345',
    twoFactorEnabled: true,
    status: 'active',
    lastActive: 'Just now',
    seatingStation: 'Command Console Alpha (Primary SecOps)',
    sittingStatus: 'seated_active',
    sittingDurationMinutes: 145,
    autoLockOnAway: true,
    seatingErgonomicAlerts: true,
    permissions: [
      'ALL_ROOT_PRIVILEGES',
      'GLOBAL_TELEMETRY_CONTROL',
      'IOC_BLACKLIST_MANAGE',
      'EMERGENCY_LOCKDOWN',
      'USER_ACCOUNT_AUDIT',
      'THREAT_QUARANTINE_OVERRIDE'
    ]
  },
  {
    id: 'admin_madan',
    name: 'Madan gowda',
    email: 'madangowda@cybershield.ai',
    role: 'super_admin',
    title: 'Co-Administrator & SecOps Director',
    avatar: madanAvatar,
    phone: '+91 99160 54321',
    twoFactorEnabled: true,
    status: 'active',
    lastActive: '3 mins ago',
    seatingStation: 'Incident Triage Console Bravo (Threat Ops)',
    sittingStatus: 'seated_active',
    sittingDurationMinutes: 80,
    autoLockOnAway: true,
    seatingErgonomicAlerts: true,
    permissions: [
      'ALL_ROOT_PRIVILEGES',
      'SECOPS_INCIDENT_TRIAGE',
      'IOC_BLACKLIST_MANAGE',
      'MODEL_SENSITIVITY_TUNING',
      'THREAT_QUARANTINE_OVERRIDE',
      'AUDIT_LOG_EXPORT'
    ]
  }
];

export function loadAdminProfiles(): AdminProfile[] {
  try {
    const raw = localStorage.getItem('cybershield_admins_profiles');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading admins from storage', e);
  }
  return DESIGNATED_ADMINS;
}

export function saveAdminProfiles(profiles: AdminProfile[]): void {
  localStorage.setItem('cybershield_admins_profiles', JSON.stringify(profiles));
}

export function updateAdminSittingOption(
  adminId: string, 
  sittingStatus: 'seated_active' | 'desk_standby' | 'away_roaming',
  seatingStation?: string,
  autoLockOnAway?: boolean,
  seatingErgonomicAlerts?: boolean
): AdminProfile[] {
  const current = loadAdminProfiles();
  const updated = current.map(admin => {
    if (admin.id === adminId) {
      return {
        ...admin,
        sittingStatus,
        seatingStation: seatingStation !== undefined ? seatingStation : admin.seatingStation,
        autoLockOnAway: autoLockOnAway !== undefined ? autoLockOnAway : admin.autoLockOnAway,
        seatingErgonomicAlerts: seatingErgonomicAlerts !== undefined ? seatingErgonomicAlerts : admin.seatingErgonomicAlerts,
        lastActive: sittingStatus === 'seated_active' ? 'Active at Console' : sittingStatus === 'desk_standby' ? 'Standby (Desk)' : 'Away (Mobile Triage)'
      };
    }
    return admin;
  });
  saveAdminProfiles(updated);
  return updated;
}

// Initial pre-loaded real-world IOC blacklist items
export const INITIAL_BLACKLIST: ThreatBlacklistEntry[] = [
  {
    id: 'ioc_1',
    indicator: 'free-gift-crypto-claim.xyz',
    type: 'domain',
    threatCategory: 'Phishing / Wallet Drainer',
    severity: 'Critical',
    addedBy: 'Navaneeth Kumar Kn',
    addedAt: '2026-09-21 14:30:00',
    status: 'active'
  },
  {
    id: 'ioc_2',
    indicator: 'secure-hdfc-kyc-update.apk',
    type: 'apk',
    threatCategory: 'Banking Trojan / SMS Stealer',
    severity: 'Critical',
    addedBy: 'Madan gowda',
    addedAt: '2026-09-21 18:45:00',
    status: 'quarantined'
  },
  {
    id: 'ioc_3',
    indicator: 'VM-SBISMS-9941',
    type: 'sender_id',
    threatCategory: 'Smishing / OTP Fraud Campaign',
    severity: 'High',
    addedBy: 'Navaneeth Kumar Kn',
    addedAt: '2026-09-22 00:15:00',
    status: 'active'
  },
  {
    id: 'ioc_4',
    indicator: '7a8f9b2c3d4e5f60718293a4b5c6d7e8f90a1b2c',
    type: 'hash',
    threatCategory: 'SpyLoan Malware (SHA-1)',
    severity: 'Critical',
    addedBy: 'Madan gowda',
    addedAt: '2026-09-22 01:10:00',
    status: 'active'
  }
];

export interface AdminAuditLog {
  id: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'security' | 'user' | 'blacklist' | 'system';
}

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log_1',
    adminName: 'Navaneeth Kumar Kn',
    action: 'Global Threat Blacklist Updated',
    details: 'Blocked malicious domain free-gift-crypto-claim.xyz across all scanner nodes',
    timestamp: '10 mins ago',
    type: 'blacklist'
  },
  {
    id: 'log_2',
    adminName: 'Madan gowda',
    action: 'Heuristic Rule Adjusted',
    details: 'Elevated SMS phishing detection weight for Indian Banking impersonation patterns',
    timestamp: '25 mins ago',
    type: 'security'
  },
  {
    id: 'log_3',
    adminName: 'Navaneeth Kumar Kn',
    action: 'Security Audit Verified',
    details: 'Synchronized Zero-Trust ABAC Firestore Security Rules with production database',
    timestamp: '45 mins ago',
    type: 'system'
  },
  {
    id: 'log_4',
    adminName: 'Madan gowda',
    action: 'Quarantined Malicious Package',
    details: 'Flagged and isolated secure-hdfc-kyc-update.apk signature',
    timestamp: '1 hour ago',
    type: 'security'
  }
];

/**
 * Check if the user is recognized as an Administrator
 */
export function checkIsAdmin(user: { email?: string | null; displayName?: string | null } | null): boolean {
  if (!user) return false;
  
  const email = (user.email || '').toLowerCase().trim();
  const name = (user.displayName || '').toLowerCase().trim();

  // Primary check for Navaneeth Kumar Kn
  if (
    email === 'knnavaneethkumar@gmail.com' ||
    name.includes('navaneeth') ||
    email.includes('navaneeth')
  ) {
    return true;
  }

  // Primary check for Madan gowda
  if (
    email === 'madangowda@cybershield.ai' ||
    email.includes('madangowda') ||
    name.includes('madan') ||
    name.includes('gowda')
  ) {
    return true;
  }

  // Session admin override for demo/test mode
  const sessionAdmin = localStorage.getItem('cybershield_active_admin_session');
  if (sessionAdmin === 'true') {
    return true;
  }

  return false;
}

/**
 * Get active admin session name (defaults to Navaneeth Kumar Kn or Madan gowda)
 */
export function getActiveAdminIdentity(user: { email?: string | null; displayName?: string | null } | null): AdminProfile {
  const admins = loadAdminProfiles();
  if (user) {
    const name = (user.displayName || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    if (name.includes('madan') || email.includes('madan')) {
      return admins.find(a => a.id === 'admin_madan') || admins[1] || DESIGNATED_ADMINS[1];
    }
  }
  // Check override
  const override = localStorage.getItem('cybershield_active_admin_id');
  if (override === 'admin_madan') {
    return admins.find(a => a.id === 'admin_madan') || admins[1] || DESIGNATED_ADMINS[1];
  }
  return admins.find(a => a.id === 'admin_navaneeth') || admins[0] || DESIGNATED_ADMINS[0]; // Default to Navaneeth Kumar Kn
}

/**
 * Load Blacklist from localStorage / Firestore
 */
export async function loadThreatBlacklist(): Promise<ThreatBlacklistEntry[]> {
  try {
    const local = localStorage.getItem('cybershield_threat_blacklist');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading local blacklist', e);
  }

  // Attempt Firestore sync
  try {
    const path = 'blacklist';
    const querySnap = await getDocs(collection(db, path));
    if (!querySnap.empty) {
      const items: ThreatBlacklistEntry[] = [];
      querySnap.forEach(docSnap => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          indicator: d.indicator || '',
          type: d.type || 'domain',
          threatCategory: d.threatCategory || 'General Malware',
          severity: d.severity || 'High',
          addedBy: d.addedBy || 'Administrator',
          addedAt: d.addedAt || new Date().toISOString(),
          status: d.status || 'active'
        });
      });
      localStorage.setItem('cybershield_threat_blacklist', JSON.stringify(items));
      return items;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'blacklist');
  }

  // Fallback to initial canonical blacklist
  localStorage.setItem('cybershield_threat_blacklist', JSON.stringify(INITIAL_BLACKLIST));
  return INITIAL_BLACKLIST;
}

/**
 * Add an entry to the threat blacklist
 */
export async function addThreatBlacklistEntry(entry: Omit<ThreatBlacklistEntry, 'id'>): Promise<ThreatBlacklistEntry> {
  const newEntry: ThreatBlacklistEntry = {
    ...entry,
    id: 'ioc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6)
  };

  const current = await loadThreatBlacklist();
  const updated = [newEntry, ...current];
  localStorage.setItem('cybershield_threat_blacklist', JSON.stringify(updated));

  // Sync to Firestore
  try {
    const path = `blacklist/${newEntry.id}`;
    await setDoc(doc(db, 'blacklist', newEntry.id), {
      indicator: newEntry.indicator,
      type: newEntry.type,
      threatCategory: newEntry.threatCategory,
      severity: newEntry.severity,
      addedBy: newEntry.addedBy,
      addedAt: newEntry.addedAt,
      status: newEntry.status
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `blacklist/${newEntry.id}`);
  }

  return newEntry;
}

/**
 * Delete a threat blacklist entry
 */
export async function deleteThreatBlacklistEntry(id: string): Promise<void> {
  const current = await loadThreatBlacklist();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem('cybershield_threat_blacklist', JSON.stringify(updated));

  try {
    await deleteDoc(doc(db, 'blacklist', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `blacklist/${id}`);
  }
}
