import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserSettings, DEFAULT_USER_SETTINGS, Language, SensitivityLevel } from '../types';

const SETTINGS_STORAGE_KEY_PREFIX = 'cybershield_settings_';

/**
 * Load settings for a user. First attempts Firestore (if authenticated),
 * then falls back to localStorage, then defaults.
 */
export async function loadUserSettings(userId: string, isDemo?: boolean): Promise<UserSettings> {
  const localKey = `${SETTINGS_STORAGE_KEY_PREFIX}${userId}`;
  let localData: Partial<UserSettings> = {};

  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      localData = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read settings from localStorage', e);
  }

  // If demo user or offline, return local or default
  if (isDemo || !userId) {
    return {
      ...DEFAULT_USER_SETTINGS,
      ...localData,
      userId: userId || 'anonymous',
    };
  }

  try {
    const response = await fetch(`/api/settings/${encodeURIComponent(userId)}`);
    if (response.ok) {
      const body = await response.json();
      if (body.settings) {
        const merged = { ...DEFAULT_USER_SETTINGS, ...body.settings, userId } as UserSettings;
        localStorage.setItem(localKey, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn('Backend settings fetch fallback:', err);
  }

  try {
    const settingsDocRef = doc(db, 'users', userId, 'settings', 'preferences');
    const snap = await getDoc(settingsDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const merged: UserSettings = {
        userId,
        sensitivity: (data.sensitivity as SensitivityLevel) || 'balanced',
        deepAnalysis: data.deepAnalysis ?? true,
        autoScanLinks: data.autoScanLinks ?? true,
        soundAlerts: data.soundAlerts ?? true,
        criticalWarningBanner: data.criticalWarningBanner ?? true,
        dataRetentionDays: Number(data.dataRetentionDays) || 30,
        anonymizeInputs: data.anonymizeInputs ?? true,
        hudAnimations: data.hudAnimations ?? true,
        language: (data.language as Language) || 'en',
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
      };
      // Keep local in sync
      localStorage.setItem(localKey, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Firestore settings fetch fallback to localStorage:', err);
  }

  return {
    ...DEFAULT_USER_SETTINGS,
    ...localData,
    userId,
  };
}

/**
 * Save settings to both localStorage and Firestore (if not demo).
 */
export async function saveUserSettings(settings: UserSettings, isDemo?: boolean): Promise<void> {
  const localKey = `${SETTINGS_STORAGE_KEY_PREFIX}${settings.userId}`;
  try {
    localStorage.setItem(localKey, JSON.stringify(settings));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  try {
    await fetch(`/api/settings/${encodeURIComponent(settings.userId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  } catch (err) {
    console.warn('Backend settings save fallback:', err);
  }

  if (!isDemo && settings.userId && settings.userId !== 'anonymous') {
    try {
      const settingsDocRef = doc(db, 'users', settings.userId, 'settings', 'preferences');
      await setDoc(settingsDocRef, {
        userId: settings.userId,
        sensitivity: settings.sensitivity,
        deepAnalysis: Boolean(settings.deepAnalysis),
        autoScanLinks: Boolean(settings.autoScanLinks),
        soundAlerts: Boolean(settings.soundAlerts),
        criticalWarningBanner: Boolean(settings.criticalWarningBanner),
        dataRetentionDays: Number(settings.dataRetentionDays),
        anonymizeInputs: Boolean(settings.anonymizeInputs),
        hudAnimations: Boolean(settings.hudAnimations),
        language: settings.language,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore settings update failed:', err);
    }
  }
}

/**
 * Export all user security data (profile, settings, and scan records) as a JSON file.
 */
export async function exportSecurityData(
  userId: string, 
  userEmail: string | null,
  currentSettings: UserSettings
): Promise<void> {
  const scans: any[] = [];
  try {
    if (userId && userId !== 'anonymous') {
      const scansRef = collection(db, 'users', userId, 'scans');
      const snap = await getDocs(scansRef);
      snap.forEach((doc) => {
        scans.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate().toISOString() : doc.data().timestamp
        });
      });
    }
  } catch (e) {
    console.warn('Scans export from firestore had error:', e);
  }

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    system: "CyberShield AI Threat Engine",
    user: {
      userId,
      email: userEmail || 'Unspecified'
    },
    settings: currentSettings,
    totalScansExported: scans.length,
    scans
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `cybershield_security_export_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Purge all past scan logs for the user.
 */
export async function purgeUserScans(userId: string): Promise<number> {
  if (!userId || userId === 'anonymous') return 0;
  let deletedCount = 0;

  try {
    const scansRef = collection(db, 'users', userId, 'scans');
    const snap = await getDocs(scansRef);
    const deletePromises = snap.docs.map(async (d) => {
      await deleteDoc(d.ref);
      deletedCount++;
    });
    await Promise.all(deletePromises);
  } catch (err) {
    console.error('Failed to purge scans:', err);
    throw err;
  }

  return deletedCount;
}

/**
 * Cyber audio alert sound generator using standard Web Audio API
 */
export function playAlertSynth(type: 'warning' | 'critical' | 'success' = 'warning') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'critical') {
      // Urgent double high beep
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      osc.frequency.setValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'success') {
      // Pleasing ascending chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Standard tech warning
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.linearRampToValueAtTime(392.00, now + 0.18);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    // Audio context may be restricted by autoplay policy
    console.debug('Audio synth notification suppressed:', e);
  }
}
