import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Terminal, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Unlock, 
  Trash2, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  Sliders, 
  Database, 
  FileText, 
  Zap, 
  Ban, 
  Radio, 
  Flame, 
  Server,
  Key,
  Globe,
  Smartphone,
  MessageSquare,
  ArrowRight,
  Armchair,
  Monitor,
  Clock,
  Camera,
  Upload,
  Image as ImageIcon,
  Edit2,
  Check,
  Bell,
  Settings,
  Download,
  FileSpreadsheet,
  FileCode,
  Printer,
  ExternalLink,
  Copy,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { AdminProfile, ThreatBlacklistEntry } from '../types';
import { 
  DESIGNATED_ADMINS, 
  INITIAL_AUDIT_LOGS, 
  AdminAuditLog, 
  loadThreatBlacklist, 
  addThreatBlacklistEntry, 
  deleteThreatBlacklistEntry,
  getActiveAdminIdentity,
  checkIsAdmin,
  loadAdminProfiles,
  saveAdminProfiles,
  updateAdminSittingOption
} from '../services/adminService';
import { Button } from '../components/UI';
import navaneethAvatar from '../assets/images/admin_navaneeth_1790067281641.jpg';
import madanAvatar from '../assets/images/admin_madan_1790067312602.jpg';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'admins' | 'sitting' | 'blacklist' | 'incidents' | 'audit' | 'system' | 'export' | 'logins'>('admins');
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [adminsList, setAdminsList] = useState<AdminProfile[]>(() => loadAdminProfiles());
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile>(() => getActiveAdminIdentity(user));
  const [blacklist, setBlacklist] = useState<ThreatBlacklistEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [loginRecords, setLoginRecords] = useState<Array<{ id: string; userId: string; name: string; email: string; loginAt: string; success: boolean; ip: string }>>([]);
  const [loginRecordsLoading, setLoginRecordsLoading] = useState(false);
  const [loginRecordsError, setLoginRecordsError] = useState<string | null>(null);
  const [blacklistFilter, setBlacklistFilter] = useState('');
  const [blacklistType, setBlacklistType] = useState<string>('all');
  const [isAddingIoc, setIsAddingIoc] = useState(false);
  const [emergencyLockdown, setEmergencyLockdown] = useState(false);
  const [defenseLevel, setDefenseLevel] = useState<'normal' | 'elevated' | 'critical'>('elevated');

  // Change Image Modal state
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [targetAdminForImage, setTargetAdminForImage] = useState<AdminProfile | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageSaveSuccess, setImageSaveSuccess] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<'device' | 'presets' | 'url'>('device');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sitting / Seating Options state
  const [sittingPosture, setSittingPosture] = useState<'seated_active' | 'desk_standby' | 'away_roaming'>(
    currentAdmin.sittingStatus || 'seated_active'
  );
  const [selectedStation, setSelectedStation] = useState<string>(
    currentAdmin.seatingStation || 'Command Console Alpha (Primary SecOps)'
  );
  const [ergonomicAlerts, setErgonomicAlerts] = useState<boolean>(currentAdmin.seatingErgonomicAlerts ?? true);
  const [autoLockOnAway, setAutoLockOnAway] = useState<boolean>(currentAdmin.autoLockOnAway ?? true);
  const [sittingTimerMinutes, setSittingTimerMinutes] = useState<number>(currentAdmin.sittingDurationMinutes || 145);
  const [sittingSaveNotification, setSittingSaveNotification] = useState<string | null>(null);

  // Form states for new IOC
  const [newIndicator, setNewIndicator] = useState('');
  const [newType, setNewType] = useState<'domain' | 'sender_id' | 'hash' | 'apk'>('domain');
  const [newCategory, setNewCategory] = useState('Phishing / Fraud');
  const [newSeverity, setNewSeverity] = useState<'Critical' | 'High' | 'Medium'>('Critical');

  // Load blacklist and admin profiles on mount
  useEffect(() => {
    loadThreatBlacklist().then(setBlacklist);
    const loaded = loadAdminProfiles();
    setAdminsList(loaded);
  }, []);

  const loadLoginRecords = async () => {
    setLoginRecordsLoading(true);
    setLoginRecordsError(null);
    try {
      const raw = localStorage.getItem('cybershield_auth');
      const session = raw ? JSON.parse(raw) : null;
      if (!session?.token) throw new Error('Please sign in again to view login records.');
      const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const response = await fetch(`${base}/api/admin/login-records`, {
        headers: { Authorization: `Bearer ${session.token}` },
        cache: 'no-store',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
      setLoginRecords(Array.isArray(data.records) ? data.records : []);
    } catch (error) {
      setLoginRecordsError(error instanceof Error ? error.message : 'Could not load login records.');
    } finally {
      setLoginRecordsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logins') void loadLoginRecords();
  }, [activeTab]);

  // Sync active admin identity when user changes
  useEffect(() => {
    const active = getActiveAdminIdentity(user);
    setCurrentAdmin(active);
    setSittingPosture(active.sittingStatus || 'seated_active');
    setSelectedStation(active.seatingStation || 'Command Console Alpha (Primary SecOps)');
  }, [user]);

  // Simulate sitting timer incremental progression
  useEffect(() => {
    const timer = setInterval(() => {
      if (sittingPosture === 'seated_active') {
        setSittingTimerMinutes(prev => prev + 1);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [sittingPosture]);

  const handleSwitchAdmin = (admin: AdminProfile) => {
    setCurrentAdmin(admin);
    setSittingPosture(admin.sittingStatus || 'seated_active');
    setSelectedStation(admin.seatingStation || 'Command Console Alpha (Primary SecOps)');
    localStorage.setItem('cybershield_active_admin_id', admin.id);
    localStorage.setItem('cybershield_active_admin_session', 'true');
    
    // Add audit log
    const newLog: AdminAuditLog = {
      id: 'log_' + Date.now(),
      adminName: admin.name,
      action: 'Administrative Session Switched',
      details: `Active command console handed to ${admin.name} (${admin.title})`,
      timestamp: 'Just now',
      type: 'system'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const processImageFile = (file: File) => {
    setImageUploadError(null);
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Invalid file type. Please select an image file (PNG, JPG, JPEG, WEBP, or SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageUploadError('File size exceeds 10MB limit. Please select a smaller photo.');
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (file.size / 1024).toFixed(0) + ' KB';

    setSelectedFileName(file.name);
    setSelectedFileSize(sizeFormatted);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      // Optimize/compress image with canvas so it persists cleanly in state & localStorage
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92);
          setCustomImageUrl(compressed);
        } else {
          setCustomImageUrl(result);
        }
      };
      img.onerror = () => {
        setCustomImageUrl(result);
      };
      img.src = result;
    };
    reader.onerror = () => {
      setImageUploadError('Failed to read image file from your device. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const openImageEditor = (admin: AdminProfile) => {
    setTargetAdminForImage(admin);
    setCustomImageUrl(admin.avatar || '');
    setSelectedFileName(null);
    setSelectedFileSize(null);
    setImageUploadError(null);
    setIsDraggingOver(false);
    setImageUploadMode('device');
    setIsEditingImage(true);
    setImageSaveSuccess(false);
  };

  const handleApplyImage = (newUrl: string) => {
    if (!targetAdminForImage) return;

    const updated = adminsList.map(a => {
      if (a.id === targetAdminForImage.id) {
        return { ...a, avatar: newUrl };
      }
      return a;
    });

    setAdminsList(updated);
    saveAdminProfiles(updated);

    if (currentAdmin.id === targetAdminForImage.id) {
      setCurrentAdmin({ ...currentAdmin, avatar: newUrl });
    }

    setImageSaveSuccess(true);

    const newLog: AdminAuditLog = {
      id: 'log_' + Date.now(),
      adminName: targetAdminForImage.name,
      action: 'Administrator Portrait Image Updated',
      details: `Updated security badge photo for ${targetAdminForImage.name}`,
      timestamp: 'Just now',
      type: 'system'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    setTimeout(() => {
      setIsEditingImage(false);
      setImageSaveSuccess(false);
    }, 1200);
  };

  const handleSaveSittingOption = () => {
    const updated = updateAdminSittingOption(
      currentAdmin.id,
      sittingPosture,
      selectedStation,
      autoLockOnAway,
      ergonomicAlerts
    );
    setAdminsList(updated);
    const updatedCurrent = updated.find(a => a.id === currentAdmin.id) || currentAdmin;
    setCurrentAdmin(updatedCurrent);

    setSittingSaveNotification(`Sitting posture set to: ${
      sittingPosture === 'seated_active' ? 'Active at Console' : sittingPosture === 'desk_standby' ? 'Desk Standby' : 'Away / Roaming'
    } at ${selectedStation}`);

    const newLog: AdminAuditLog = {
      id: 'log_' + Date.now(),
      adminName: currentAdmin.name,
      action: 'Console Seating & Sitting Status Updated',
      details: `Operator posture: ${sittingPosture.toUpperCase()} | Station: ${selectedStation}`,
      timestamp: 'Just now',
      type: 'system'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    setTimeout(() => setSittingSaveNotification(null), 4000);
  };

  const handleAddIoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIndicator.trim()) return;

    const added = await addThreatBlacklistEntry({
      indicator: newIndicator.trim(),
      type: newType,
      threatCategory: newCategory.trim(),
      severity: newSeverity,
      addedBy: currentAdmin.name,
      addedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'active'
    });

    setBlacklist(prev => [added, ...prev]);
    setNewIndicator('');
    setIsAddingIoc(false);

    // Add audit log
    const newLog: AdminAuditLog = {
      id: 'log_' + Date.now(),
      adminName: currentAdmin.name,
      action: 'Global IOC Blacklist Entry Added',
      details: `Added ${newType.toUpperCase()}: ${added.indicator} (${added.threatCategory})`,
      timestamp: 'Just now',
      type: 'blacklist'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleDeleteIoc = async (id: string, indicator: string) => {
    await deleteThreatBlacklistEntry(id);
    setBlacklist(prev => prev.filter(i => i.id !== id));

    const newLog: AdminAuditLog = {
      id: 'log_' + Date.now(),
      adminName: currentAdmin.name,
      action: 'IOC Blacklist Entry Removed',
      details: `Revoked indicator block for ${indicator}`,
      timestamp: 'Just now',
      type: 'blacklist'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleToggleLockdown = () => {
    const nextState = !emergencyLockdown;
    setEmergencyLockdown(nextState);
    setDefenseLevel(nextState ? 'critical' : 'elevated');

    const newLog: AdminAuditLog = {
      id: 'log_' + Date.now(),
      adminName: currentAdmin.name,
      action: nextState ? 'EMERGENCY LOCKDOWN INITIATED' : 'Emergency Lockdown Disengaged',
      details: nextState 
        ? 'All AI scanner thresholds set to maximum strictness; external sandbox isolation engaged.' 
        : 'System returned to standard elevated defense posture.',
      timestamp: 'Just now',
      type: 'security'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Download helper for client-side blob export
  const triggerDownload = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const logExportAction = (artifactName: string) => {
    const newLog: AdminAuditLog = {
      id: 'log_' + Date.now(),
      adminName: currentAdmin.name,
      action: 'Data Export Dispatched',
      details: `Generated cryptographically validated export of ${artifactName}`,
      timestamp: 'Just now',
      type: 'system'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setExportSuccessMessage(`Successfully exported ${artifactName}! Download initiated.`);
    setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  const handleExportBlacklistCSV = () => {
    const headers = ['ID', 'Indicator', 'Type', 'Threat Category', 'Severity', 'Added By', 'Added At', 'Status'];
    const rows = blacklist.map(item => [
      `"${item.id}"`,
      `"${item.indicator.replace(/"/g, '""')}"`,
      `"${item.type}"`,
      `"${item.threatCategory.replace(/"/g, '""')}"`,
      `"${item.severity}"`,
      `"${item.addedBy.replace(/"/g, '""')}"`,
      `"${item.addedAt}"`,
      `"${item.status}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerDownload(`cybershield-threat-blacklist-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8;');
    logExportAction('Threat Blacklist CSV');
  };

  const handleExportBlacklistJSON = () => {
    const payload = {
      format: 'CyberShield-STIX-IOC-v2.1',
      exportedAt: new Date().toISOString(),
      exportedBy: currentAdmin.name,
      classification: 'RESTRICTED // CYBER-INTELLIGENCE',
      totalIndicators: blacklist.length,
      indicators: blacklist
    };
    triggerDownload(`cybershield-threat-blacklist-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), 'application/json');
    logExportAction('Threat Blacklist JSON (STIX)');
  };

  const handleExportAuditCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Admin Authority', 'Action', 'Category', 'Details'];
    const rows = auditLogs.map(log => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.adminName.replace(/"/g, '""')}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.type}"`,
      `"${log.details.replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerDownload(`cybershield-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8;');
    logExportAction('Audit Trail CSV');
  };

  const handleExportAuditJSON = () => {
    const payload = {
      system: 'CyberShield AI Root Authority',
      exportedAt: new Date().toISOString(),
      dispatchedBy: currentAdmin.name,
      totalAuditEntries: auditLogs.length,
      auditRecords: auditLogs
    };
    triggerDownload(`cybershield-audit-trail-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), 'application/json');
    logExportAction('Audit Trail JSON');
  };

  const handleExportIncidentDossier = () => {
    const dossier = {
      incidentDossierId: `CYBER-DOSSIER-${Date.now().toString(36).toUpperCase()}`,
      exportedAt: new Date().toISOString(),
      leadInvestigators: ['Navaneeth Kumar Kn', 'Madan gowda'],
      threatClassification: 'CONFIDENTIAL // SOC LEVEL 4',
      neutralizedThreats: 142,
      activeQuarantineCount: blacklist.length,
      containmentStatus: emergencyLockdown ? 'CRITICAL LOCKDOWN' : 'ELEVATED DEFENSE',
      activeCommandStation: selectedStation,
      operatorSittingStatus: sittingPosture,
      recentForensicIncidents: [
        {
          id: 'INC-9042',
          title: 'Malicious Android Banking APK Distribution Campaign',
          vector: 'WhatsApp & Bulk SMS Smishing',
          severity: 'CRITICAL',
          status: 'NEUTRALIZED',
          iocsQuarantined: ['sbi-kyc-update-portal.top', 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069']
        },
        {
          id: 'INC-9038',
          title: 'Unicode Homograph Domain Spoof on Payment Gateway',
          vector: 'Punycode imitation domain (xn--pypal-4ve.com)',
          severity: 'HIGH',
          status: 'RESOLVED',
          iocsQuarantined: ['xn--pypal-4ve.com']
        },
        {
          id: 'INC-8991',
          title: 'State Lottery SMS Spoofing Campaign',
          vector: 'Header sender ID forging (TM-KRLOTTO)',
          severity: 'MEDIUM',
          status: 'RESOLVED',
          iocsQuarantined: ['TM-KRLOTTO', 'AD-LOTTO99']
        }
      ]
    };
    triggerDownload(`cybershield-incident-dossier-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(dossier, null, 2), 'application/json');
    logExportAction('Security Incident Forensics Dossier');
  };

  const handleExportDutyRoster = () => {
    const roster = {
      title: 'CyberShield SOC Command Duty & Sitting Posture Roster',
      generatedAt: new Date().toISOString(),
      activeConsoleAuthority: currentAdmin.name,
      currentPostures: adminsList.map(a => ({
        id: a.id,
        name: a.name,
        role: a.role,
        station: a.seatingStation,
        posture: a.sittingStatus,
        seatedDurationMinutes: a.sittingDurationMinutes,
        autoLockOnAway: a.autoLockOnAway,
        ergonomicAlerts: a.seatingErgonomicAlerts,
        lastActive: a.lastActive
      }))
    };
    triggerDownload(`cybershield-duty-roster-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(roster, null, 2), 'application/json');
    logExportAction('Command Console Duty Roster');
  };

  const handleExportSystemSnapshot = () => {
    const snapshot = {
      platform: 'CyberShield AI Threat Defense Platform',
      snapshotTimestamp: new Date().toISOString(),
      dispatchedBy: {
        id: currentAdmin.id,
        name: currentAdmin.name,
        role: currentAdmin.role,
        station: selectedStation,
        posture: sittingPosture,
        sittingMinutes: sittingTimerMinutes
      },
      securityState: {
        defenseLevel,
        emergencyLockdown,
        firestoreTargetDb: 'ai-studio-remixcybershield-f1e72fff-c8d1-4e34-9f11-9014dff06244',
        abacEnforced: true
      },
      superAdmins: adminsList,
      iocBlacklistCount: blacklist.length,
      auditLogsCount: auditLogs.length,
      fullBlacklist: blacklist,
      auditTrail: auditLogs
    };
    triggerDownload(`cybershield-system-snapshot-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(snapshot, null, 2), 'application/json');
    logExportAction('Full System Disaster Recovery Snapshot');
  };

  const filteredBlacklist = blacklist.filter(item => {
    const matchesQuery = item.indicator.toLowerCase().includes(blacklistFilter.toLowerCase()) ||
                         item.threatCategory.toLowerCase().includes(blacklistFilter.toLowerCase());
    const matchesType = blacklistType === 'all' || item.type === blacklistType;
    return matchesQuery && matchesType;
  });

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Top Threat & Admin Status Ribbon */}
      <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
          emergencyLockdown ? 'bg-accent-red/20' : 'bg-accent-teal/15'
        }`} />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-accent-teal/20 text-accent-teal border border-accent-teal/40 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-accent-teal" />
                Root Authority Console
              </span>
              <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                emergencyLockdown 
                  ? 'bg-accent-red/20 text-accent-red border-accent-red/50 animate-pulse'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                <Flame className="w-3.5 h-3.5" />
                Posture: {emergencyLockdown ? 'CRITICAL LOCKDOWN' : 'ELEVATED DEFENSE'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-accent-teal" />
              CyberShield AI Command Center
            </h1>
            <p className="text-white/60 text-sm mt-1 max-w-2xl">
              Centralized administrative security nexus governed by Lead Security Architects{' '}
              <strong className="text-accent-teal font-semibold">Navaneeth Kumar Kn</strong> and{' '}
              <strong className="text-accent-purple font-semibold">Madan gowda</strong>.
            </p>
          </div>

          {/* Active Admin Identity Switcher Box with Real Avatar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              {/* Image with fallback */}
              <div className="relative group">
                <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-accent-teal/60 shadow-lg shadow-accent-teal/20 shrink-0 bg-slate-800">
                  {currentAdmin.avatar ? (
                    <img 
                      src={currentAdmin.avatar} 
                      alt={currentAdmin.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent-teal/30 to-accent-purple/30 flex items-center justify-center font-black text-white text-base">
                      {currentAdmin.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openImageEditor(currentAdmin)}
                  title="Change Admin Image"
                  className="absolute -bottom-1 -right-1 p-1 bg-accent-teal text-primary rounded-lg shadow hover:scale-110 transition-transform cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-white/50 font-mono">Active Authority:</p>
                  <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono font-bold flex items-center gap-1 ${
                    sittingPosture === 'seated_active'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : sittingPosture === 'desk_standby'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                    {sittingPosture === 'seated_active' ? 'Sitting: Active' : sittingPosture === 'desk_standby' ? 'Sitting: Standby' : 'Away'}
                  </span>
                </div>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  {currentAdmin.name}
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-teal" />
                </p>
                <p className="text-[11px] text-accent-teal/80 font-mono truncate max-w-[200px]">{currentAdmin.title}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto">
              <button
                onClick={() => handleSwitchAdmin(currentAdmin.id === 'admin_navaneeth' ? adminsList[1] || DESIGNATED_ADMINS[1] : adminsList[0] || DESIGNATED_ADMINS[0])}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/90 transition-all flex items-center gap-1.5 cursor-pointer justify-center"
                title="Switch active administrator view"
              >
                <RefreshCw className="w-3 h-3 text-accent-teal" />
                Switch to {currentAdmin.id === 'admin_navaneeth' ? 'Madan gowda' : 'Navaneeth'}
              </button>
              <button
                onClick={() => setActiveTab('sitting')}
                className="px-3 py-1.5 rounded-lg bg-accent-teal/15 hover:bg-accent-teal/25 text-accent-teal border border-accent-teal/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer justify-center"
              >
                <Armchair className="w-3 h-3" />
                Sitting Options
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className="px-3 py-1.5 rounded-lg bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple border border-accent-purple/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer justify-center"
                title="Export Security Intelligence & Audit Feeds"
              >
                <Download className="w-3 h-3" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Global Security Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[11px] font-mono text-white/50 uppercase tracking-wider">Scans Evaluated</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">14,892</p>
            <span className="text-[10px] text-accent-teal font-mono">↑ 18.4% this week</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[11px] font-mono text-white/50 uppercase tracking-wider">Malware & APKs Blocked</p>
            <p className="text-xl sm:text-2xl font-black text-accent-red mt-1">2,130</p>
            <span className="text-[10px] text-accent-red font-mono">100% neutralized</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[11px] font-mono text-white/50 uppercase tracking-wider">Console Seated Duty</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              {Math.floor(sittingTimerMinutes / 60)}h {sittingTimerMinutes % 60}m
            </p>
            <span className="text-[10px] text-emerald-400 font-mono">Active station session</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[11px] font-mono text-white/50 uppercase tracking-wider">ABAC Zero-Trust Rules</p>
            <p className="text-xl sm:text-2xl font-black text-accent-teal mt-1">ACTIVE</p>
            <span className="text-[10px] text-accent-teal font-mono">Firestore Enforced</span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'admins'
              ? 'bg-accent-teal text-primary shadow-lg shadow-accent-teal/20'
              : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          Lead Administrators ({adminsList.length})
        </button>

        <button
          onClick={() => setActiveTab('sitting')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'sitting'
              ? 'bg-accent-teal text-primary shadow-lg shadow-accent-teal/20'
              : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Armchair className="w-4 h-4" />
          Sitting & Console Options
        </button>

        <button
          onClick={() => setActiveTab('blacklist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'blacklist'
              ? 'bg-accent-teal text-primary shadow-lg shadow-accent-teal/20'
              : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Ban className="w-4 h-4" />
          Threat Blacklist ({blacklist.length})
        </button>

        <button
          onClick={() => setActiveTab('incidents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'incidents'
              ? 'bg-accent-teal text-primary shadow-lg shadow-accent-teal/20'
              : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Activity className="w-4 h-4" />
          Live Incidents
        </button>

        <button
          onClick={() => setActiveTab('logins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'logins'
              ? 'bg-accent-teal text-primary shadow-lg shadow-accent-teal/20'
              : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Clock className="w-4 h-4" />
          User Login History
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-accent-teal text-primary shadow-lg shadow-accent-teal/20'
              : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <FileText className="w-4 h-4" />
          Audit Log ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'system'
              ? 'bg-accent-teal text-primary shadow-lg shadow-accent-teal/20'
              : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Defense Controls
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'export'
              ? 'bg-accent-teal text-primary shadow-lg shadow-accent-teal/20'
              : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Download className="w-4 h-4" />
          Export & Intelligence
        </button>
      </div>

      {/* Export Success Floating Banner */}
      <AnimatePresence>
        {exportSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-accent-teal/15 border border-accent-teal/40 text-white flex items-center justify-between gap-4 shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-teal/20 text-accent-teal">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{exportSuccessMessage}</p>
                <p className="text-xs text-white/60">The data file was created and sent to your browser's download manager.</p>
              </div>
            </div>
            <button
              onClick={() => setExportSuccessMessage(null)}
              className="text-white/40 hover:text-white text-xs font-mono px-2 py-1 rounded bg-white/5 hover:bg-white/10"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'logins' && (
        <section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white"><Clock className="h-5 w-5 text-accent-teal" />User Login History</h2>
              <p className="mt-1 text-sm text-white/60">Live records read from backend/data/login.csv, newest first. Passwords and tokens are never returned.</p>
            </div>
            <button onClick={() => void loadLoginRecords()} disabled={loginRecordsLoading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loginRecordsLoading ? 'animate-spin' : ''}`} /> Refresh records
            </button>
          </div>

          {loginRecordsError && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{loginRecordsError}</div>}
          {!loginRecordsError && loginRecordsLoading && <p className="text-sm text-white/60">Loading login.csv…</p>}
          {!loginRecordsError && !loginRecordsLoading && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-wider text-white/50">Records loaded</p><p className="mt-1 text-2xl font-black text-white">{loginRecords.length}</p></div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-wider text-white/50">Successful logins</p><p className="mt-1 text-2xl font-black text-emerald-400">{loginRecords.filter(row => row.success).length}</p></div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-wider text-white/50">Failed attempts</p><p className="mt-1 text-2xl font-black text-rose-400">{loginRecords.filter(row => !row.success).length}</p></div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/50"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Login date & time</th><th className="px-4 py-3">Result</th><th className="px-4 py-3">IP address</th></tr></thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {loginRecords.map(record => <tr key={record.id} className="hover:bg-white/[0.03]"><td className="px-4 py-3 font-medium">{record.name || 'Unknown user'}</td><td className="px-4 py-3">{record.email || '—'}</td><td className="px-4 py-3 whitespace-nowrap">{record.loginAt ? new Date(record.loginAt).toLocaleString() : 'Unknown date'}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${record.success ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>{record.success ? 'Successful' : 'Failed'}</span></td><td className="px-4 py-3 font-mono text-xs">{record.ip || '—'}</td></tr>)}
                    {loginRecords.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-white/50">No login attempts have been recorded yet.</td></tr>}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-white/40">For privacy, this view is restricted to administrator accounts configured in backend/.env.</p>
            </>
          )}
        </section>
      )}

      {/* TAB 1: LEAD ADMINISTRATORS (WITH IMAGES) */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-accent-teal" />
                Designated Super Administrators
              </h2>
              <p className="text-sm text-white/60">
                Primary security architects with unrestricted authority over CyberShield AI telemetry, threat models, and policies.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent-teal bg-accent-teal/10 px-3 py-1 rounded-lg border border-accent-teal/20">
                2 Lead Authorities Appointed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminsList.map((admin) => {
              const isCurrent = currentAdmin.id === admin.id;
              return (
                <div
                  key={admin.id}
                  className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
                    isCurrent
                      ? 'bg-slate-900/90 border-accent-teal shadow-xl shadow-accent-teal/10'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      {/* Admin Image */}
                      <div className="relative group">
                        <div className="w-18 h-18 rounded-2xl overflow-hidden border-2 border-accent-teal/50 shadow-lg shadow-accent-teal/15 shrink-0 bg-slate-800">
                          {admin.avatar ? (
                            <img 
                              src={admin.avatar} 
                              alt={admin.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent-teal/30 to-accent-purple/30 flex items-center justify-center font-extrabold text-2xl text-white">
                              {admin.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => openImageEditor(admin)}
                          className="absolute -bottom-1 -right-1 p-1.5 bg-accent-teal hover:bg-accent-teal/90 text-primary rounded-xl shadow-lg transition-transform hover:scale-110 cursor-pointer"
                          title="Change admin photo"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-white">{admin.name}</h3>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-teal text-primary font-black uppercase tracking-wider">
                              Active Session
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-accent-teal font-mono">{admin.title}</p>
                        <p className="text-xs text-white/50 font-mono mt-0.5">{admin.email}</p>
                        <button
                          onClick={() => openImageEditor(admin)}
                          className="text-[11px] text-accent-purple hover:text-accent-purple/80 font-semibold mt-1 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          Change Image
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-white/50">Role Clearance:</span>
                      <span className="font-bold text-accent-teal font-mono uppercase bg-accent-teal/10 px-2 py-0.5 rounded border border-accent-teal/30">
                        {admin.role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-white/50">Console Seating / Sitting Status:</span>
                      <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <Armchair className="w-3.5 h-3.5 text-accent-teal" />
                        {admin.sittingStatus === 'seated_active' ? 'Seated & Active' : admin.sittingStatus === 'desk_standby' ? 'Desk Standby' : 'Away / Roaming'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-white/50">Assigned Station:</span>
                      <span className="font-mono text-white/80 truncate max-w-[200px]">
                        {admin.seatingStation || 'Console Alpha'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-white/50">Two-Factor Authentication:</span>
                      <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enforced (Hardware Token)
                      </span>
                    </div>

                    <div className="pt-2">
                      <p className="text-white/60 font-semibold mb-2">Security Grants & Entitlements:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {admin.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/80"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => {
                        handleSwitchAdmin(admin);
                        setActiveTab('sitting');
                      }}
                      className="text-xs text-accent-teal hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Armchair className="w-3.5 h-3.5" />
                      Configure Sitting Station
                    </button>
                    <button
                      onClick={() => handleSwitchAdmin(admin)}
                      disabled={isCurrent}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-accent-teal/20 text-accent-teal border border-accent-teal/40 cursor-default'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-teal" />
                          Current Operator
                        </>
                      ) : (
                        <>
                          <Key className="w-3.5 h-3.5" />
                          Operate as {admin.name.split(' ')[0]}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Super Admin Responsibilities Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-accent-teal/10 via-slate-900 to-accent-purple/10 border border-white/10">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent-teal" />
              Administrative Governance Mandate
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Both <strong className="text-white">Navaneeth Kumar Kn</strong> and <strong className="text-white">Madan gowda</strong> hold shared, dual-custody administrator access. System actions taken by either administrator are immediately cryptographically logged in the immutable audit trail and synchronized across all distributed AI threat scanners.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: SITTING & CONSOLE SEATING OPTIONS */}
      {activeTab === 'sitting' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Armchair className="w-5 h-5 text-accent-teal" />
                Console Seating & Sitting Duty Posture
              </h2>
              <p className="text-sm text-white/60">
                Manage operational station duty, active seated telemetry, ergonomic posture safeguards, and auto-lockout preferences.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Station Active ({Math.floor(sittingTimerMinutes / 60)}h {sittingTimerMinutes % 60}m)
              </span>
            </div>
          </div>

          {/* Notification banner on save */}
          {sittingSaveNotification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2"
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>{sittingSaveNotification}</span>
            </motion.div>
          )}

          {/* Current Sitting Posture Selector */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Monitor className="w-4 h-4 text-accent-teal" />
              Select Sitting Posture & Operational Mode
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Seated Active */}
              <div
                onClick={() => setSittingPosture('seated_active')}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  sittingPosture === 'seated_active'
                    ? 'bg-emerald-500/10 border-emerald-400 shadow-xl shadow-emerald-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Armchair className="w-6 h-6" />
                  </div>
                  {sittingPosture === 'seated_active' && (
                    <span className="p-1 rounded-full bg-emerald-400 text-primary">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Seated & Active at Console</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Administrator is actively sitting at the primary terminal. Full real-time telemetry streaming and critical threat audio alarms engaged.
                </p>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                  <span>Latency: &lt;12ms</span>
                  <span>Sensor: Active</span>
                </div>
              </div>

              {/* Option 2: Desk Standby */}
              <div
                onClick={() => setSittingPosture('desk_standby')}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  sittingPosture === 'desk_standby'
                    ? 'bg-amber-500/10 border-amber-400 shadow-xl shadow-amber-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                    <Monitor className="w-6 h-6" />
                  </div>
                  {sittingPosture === 'desk_standby' && (
                    <span className="p-1 rounded-full bg-amber-400 text-primary">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Desk Standby Mode</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Sitting at desk on standby or reviewing offline compliance logs. AI engine autonomously mitigates lower-tier suspicious items.
                </p>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-amber-300">
                  <span>Latency: Standard</span>
                  <span>Sensor: Low Power</span>
                </div>
              </div>

              {/* Option 3: Away Roaming */}
              <div
                onClick={() => setSittingPosture('away_roaming')}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  sittingPosture === 'away_roaming'
                    ? 'bg-blue-500/10 border-blue-400 shadow-xl shadow-blue-500/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  {sittingPosture === 'away_roaming' && (
                    <span className="p-1 rounded-full bg-blue-400 text-primary">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Away / Mobile Overwatch</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Administrator is away from seat. Console automatically engages Zero-Trust screen privacy shade; critical incident pings dispatched via mobile.
                </p>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-blue-300">
                  <span>Workstation: Locked</span>
                  <span>Mobile Relay: On</span>
                </div>
              </div>
            </div>

            {/* Station Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">
                  Assigned Command Console / Seating Station
                </label>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-accent-teal"
                >
                  <option value="Command Console Alpha (Primary SecOps)" className="bg-slate-900">
                    Station Alpha — Primary Lead Architect Console (Navaneeth Desk)
                  </option>
                  <option value="Incident Triage Console Bravo (Threat Ops)" className="bg-slate-900">
                    Station Bravo — Incident Triage & IOC Station (Madan Desk)
                  </option>
                  <option value="Mobile SecOps Overwatch Rig Gamma" className="bg-slate-900">
                    Station Gamma — Mobile Field Command Overwatch Rig
                  </option>
                  <option value="Zero-Trust Air-Gapped Analysis Terminal Delta" className="bg-slate-900">
                    Station Delta — Air-Gapped Malware Reverse Engineering Pod
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">
                  Operator Sitting Session Duration
                </label>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-teal" />
                    <span className="text-white/80">Continuous Seated Session:</span>
                  </div>
                  <span className="font-mono font-bold text-accent-teal">
                    {Math.floor(sittingTimerMinutes / 60)} hours {sittingTimerMinutes % 60} mins
                  </span>
                </div>
              </div>
            </div>

            {/* Ergonomic & Station Preferences Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-xs font-bold text-white">Ergonomic Sitting Rest Alerts</p>
                  <p className="text-[11px] text-white/50">Chime every 50 mins of continuous seated screen monitoring</p>
                </div>
                <input
                  type="checkbox"
                  checked={ergonomicAlerts}
                  onChange={(e) => setErgonomicAlerts(e.target.checked)}
                  className="w-4 h-4 accent-accent-teal cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-xs font-bold text-white">Auto-Workstation Lock on Away</p>
                  <p className="text-[11px] text-white/50">Conceal threat dashboard if operator stands up / departs station</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoLockOnAway}
                  onChange={(e) => setAutoLockOnAway(e.target.checked)}
                  className="w-4 h-4 accent-accent-teal cursor-pointer"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('settings')}
                className="text-xs font-bold text-white/70"
              >
                <Settings className="w-3.5 h-3.5 mr-1 text-accent-purple" />
                System Settings
              </Button>
              <Button
                variant="primary"
                size="sm"
                glow
                onClick={handleSaveSittingOption}
                className="bg-accent-teal text-primary font-bold text-xs"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Engage Sitting & Station Posture
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GLOBAL THREAT BLACKLIST */}
      {activeTab === 'blacklist' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Ban className="w-5 h-5 text-accent-red" />
                Global Threat Blacklist & IOC Registry
              </h2>
              <p className="text-sm text-white/60">
                Indicators of Compromise (IOCs) blocked synchronously across all CyberShield AI scans.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <button
                onClick={handleExportBlacklistCSV}
                title="Export Indicators as CSV (RFC 4180)"
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-accent-teal" />
                Export CSV
              </button>
              <button
                onClick={handleExportBlacklistJSON}
                title="Export Indicators as STIX 2.1 JSON"
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-accent-purple" />
                Export JSON
              </button>
              <button
                onClick={() => setIsAddingIoc(true)}
                className="px-4 py-2 rounded-xl bg-accent-teal hover:bg-accent-teal/90 text-primary font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-accent-teal/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Threat Indicator
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/10">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search indicator, domain, hash, sender ID..."
                value={blacklistFilter}
                onChange={(e) => setBlacklistFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-accent-teal"
              />
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {['all', 'domain', 'apk', 'sender_id', 'hash'].map((type) => (
                <button
                  key={type}
                  onClick={() => setBlacklistType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                    blacklistType === type
                      ? 'bg-accent-teal text-primary font-bold'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {type === 'sender_id' ? 'SMS Sender' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Blacklist Table */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-white/50 font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-4">Indicator / Target</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Threat Classification</th>
                    <th className="py-3.5 px-4">Severity</th>
                    <th className="py-3.5 px-4">Added By</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBlacklist.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-white/40 font-mono">
                        No threat indicators match current query.
                      </td>
                    </tr>
                  ) : (
                    filteredBlacklist.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white max-w-xs truncate">
                          {item.indicator}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-white/80">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/70">
                          {item.threatCategory}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            item.severity === 'Critical'
                              ? 'bg-accent-red/20 text-accent-red border border-accent-red/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {item.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/50 font-mono">
                          {item.addedBy}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteIoc(item.id, item.indicator)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-accent-red hover:bg-accent-red/10 transition-colors cursor-pointer"
                            title="Remove indicator from global blocklist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add IOC Modal */}
          <AnimatePresence>
            {isAddingIoc && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 border border-white/15 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-accent-teal" />
                      Add Threat Indicator (IOC)
                    </h3>
                    <button
                      onClick={() => setIsAddingIoc(false)}
                      className="text-white/40 hover:text-white text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleAddIoc} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-white/70 font-semibold mb-1">
                        Indicator Target (Domain, URL, Sender ID, or Hash)
                      </label>
                      <input
                        type="text"
                        required
                        value={newIndicator}
                        onChange={(e) => setNewIndicator(e.target.value)}
                        placeholder="e.g. malicous-bank-login.xyz or AX-SBIOTP"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-accent-teal"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/70 font-semibold mb-1">Indicator Type</label>
                        <select
                          value={newType}
                          onChange={(e: any) => setNewType(e.target.value)}
                          className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-accent-teal"
                        >
                          <option value="domain">Domain / URL</option>
                          <option value="apk">Malicious APK</option>
                          <option value="sender_id">SMS Sender ID</option>
                          <option value="hash">File / SHA Hash</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-white/70 font-semibold mb-1">Severity Tier</label>
                        <select
                          value={newSeverity}
                          onChange={(e: any) => setNewSeverity(e.target.value)}
                          className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-accent-teal"
                        >
                          <option value="Critical">Critical (Immediate Block)</option>
                          <option value="High">High Risk</option>
                          <option value="Medium">Medium (Suspicious)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/70 font-semibold mb-1">Threat Category</label>
                      <input
                        type="text"
                        required
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="e.g. Banking Trojan / Stealer, Phishing"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-teal"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingIoc(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-accent-teal hover:bg-accent-teal/90 text-primary font-bold shadow-lg shadow-accent-teal/20 transition-all cursor-pointer"
                      >
                        Broadcast Block Rule
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TAB 4: LIVE INCIDENT STREAM */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-teal animate-pulse" />
                Live Incident & Threat Interception Stream
              </h2>
              <p className="text-sm text-white/60">
                Real-time telemetry feeds capturing suspicious SMS, malicious links, and dangerous APK payloads.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono text-emerald-400 font-bold">STREAM ACTIVE</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'inc_101',
                time: '2 mins ago',
                target: 'https://verify-pan-adhaar-portal-service.xyz',
                type: 'Phishing URL',
                score: 96,
                classification: 'Dangerous',
                ruleTrigger: 'Indian Govt Impersonation + Unregistered TLD',
                user: 'user_node_71b'
              },
              {
                id: 'inc_102',
                time: '7 mins ago',
                target: 'com.quickloan.instantapproval.apk',
                type: 'Android APK',
                score: 92,
                classification: 'Dangerous',
                ruleTrigger: 'Access to Contacts, SMS, Background Audio Recording',
                user: 'user_node_90a'
              },
              {
                id: 'inc_103',
                time: '14 mins ago',
                target: 'VM-HDFCAL-9012',
                type: 'SMS Sender',
                score: 84,
                classification: 'Dangerous',
                ruleTrigger: 'Fake Reward Point Expiration with bit.ly redirect',
                user: 'user_node_42c'
              },
              {
                id: 'inc_104',
                time: '28 mins ago',
                target: 'https://myaccount.google.com/security',
                type: 'URL',
                score: 4,
                classification: 'Safe',
                ruleTrigger: 'Verified Domain Signature + SSL Certificate Valid',
                user: 'user_node_15e'
              }
            ].map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white/40">{inc.time}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10 font-bold">
                      {inc.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      inc.classification === 'Dangerous'
                        ? 'bg-accent-red/20 text-accent-red border border-accent-red/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {inc.classification} ({inc.score}/100)
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/40">Node: {inc.user}</span>
                  </div>
                  <p className="text-sm font-bold text-white font-mono break-all">
                    {inc.target}
                  </p>
                  <p className="text-white/60 font-sans">
                    Vector: {inc.ruleTrigger}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => {
                      addThreatBlacklistEntry({
                        indicator: inc.target,
                        type: inc.type.includes('APK') ? 'apk' : inc.type.includes('SMS') ? 'sender_id' : 'domain',
                        threatCategory: inc.ruleTrigger,
                        severity: 'Critical',
                        addedBy: currentAdmin.name,
                        addedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        status: 'active'
                      });
                      alert(`Indicator ${inc.target} immediately pushed to Global Blacklist!`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-accent-red/20 hover:bg-accent-red/30 text-accent-red border border-accent-red/40 font-bold transition-all cursor-pointer"
                  >
                    Quick Blacklist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-teal" />
                Administrative Audit Trail
              </h2>
              <p className="text-sm text-white/60">
                Cryptographic immutable log of root actions dispatched by Navaneeth Kumar Kn and Madan gowda.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <button
                onClick={handleExportAuditCSV}
                title="Export Audit Trail as CSV"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-accent-teal" />
                Export CSV
              </button>
              <button
                onClick={handleExportAuditJSON}
                title="Export Audit Trail as JSON"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-accent-purple" />
                Export JSON
              </button>
              <span className="text-xs font-mono text-white/40 hidden sm:inline ml-1">
                Retention: 365 Days
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 divide-y divide-white/5 backdrop-blur-xl">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{log.adminName}</span>
                    <span className="text-white/30">•</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 text-accent-teal border border-accent-teal/20">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-white/70">{log.details}</p>
                </div>
                <span className="text-white/40 font-mono text-[11px] shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SYSTEM DEFENSE CONTROLS */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-accent-teal" />
              Global Defense Controls & Emergency Protocols
            </h2>
            <p className="text-sm text-white/60">
              Configure system-wide neural heuristics and emergency response triggers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emergency Lockdown Switch */}
            <div className={`p-6 rounded-2xl border transition-all ${
              emergencyLockdown
                ? 'bg-accent-red/10 border-accent-red/50 shadow-xl shadow-accent-red/20'
                : 'bg-slate-900/80 border-white/10'
            }`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="p-3 rounded-xl bg-accent-red/20 border border-accent-red/40 text-accent-red">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button
                  onClick={handleToggleLockdown}
                  className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    emergencyLockdown
                      ? 'bg-accent-red text-white shadow-lg shadow-accent-red/30 animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {emergencyLockdown ? 'Disengage Lockdown' : 'Trigger Emergency Lockdown'}
                </button>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Emergency System Lockdown
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Immediately escalates all AI scanning models to Zero-Trust threshold. In-flight links are isolated in cloud micro-VM sandboxes prior to client delivery.
              </p>
            </div>

            {/* ABAC Database Security Verification */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="p-3 rounded-xl bg-accent-teal/20 border border-accent-teal/40 text-accent-teal">
                  <Database className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  VERIFIED DEPLOYED
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Firestore Security Rules (ABAC)
              </h3>
              <p className="text-xs text-white/60 leading-relaxed mb-3">
                Zero-Trust security rules protect user profile privacy, prevent ID poisoning, and enforce admin authorization for Navaneeth Kumar Kn and Madan gowda.
              </p>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 font-mono text-[11px] text-accent-teal">
                Target: ai-studio-remixcybershield-f1e72fff-c8d1-4e34-9f11-9014dff06244
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DATA & SECURITY INTELLIGENCE EXPORT CENTER */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-accent-teal" />
                Security Intelligence & Data Export Center
              </h2>
              <p className="text-sm text-white/60">
                Generate and download signed machine-readable feeds, incident dossiers, and disaster-recovery backups.
              </p>
            </div>
            <button
              onClick={handleExportSystemSnapshot}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-teal to-accent-purple text-primary font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-accent-teal/20 hover:opacity-95 transition-opacity cursor-pointer self-start sm:self-auto"
            >
              <Database className="w-3.5 h-3.5" />
              Full Disaster Recovery Snapshot
            </button>
          </div>

          {/* Export Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Threat Blacklist & IOC Registry */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-accent-teal/40 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-accent-red/20 text-accent-red border border-accent-red/30">
                    <Ban className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-accent-red border border-accent-red/30">
                    {blacklist.length} Indicators
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Threat Blacklist & IOC Feed</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  Full registry of blacklisted domains, APK checksums, SMS sender IDs, and malicious URLs. Ready for ingestion by firewalls and SIEMs (Snort, Suricata, Cloudflare, Palo Alto).
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={handleExportBlacklistCSV}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-accent-teal" />
                  CSV (RFC 4180)
                </button>
                <button
                  onClick={handleExportBlacklistJSON}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-accent-purple" />
                  JSON (STIX)
                </button>
              </div>
            </div>

            {/* Card 2: Administrative Audit Trail */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-accent-teal/40 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-accent-teal/20 text-accent-teal border border-accent-teal/30">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-accent-teal border border-accent-teal/30">
                    {auditLogs.length} Entries
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Administrative Audit Trail</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  Immutable chronological log of administrative commands, seating changes, security policy overrides, and threat mitigations issued by root operators.
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={handleExportAuditCSV}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-accent-teal" />
                  CSV Format
                </button>
                <button
                  onClick={handleExportAuditJSON}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-accent-purple" />
                  JSON Format
                </button>
              </div>
            </div>

            {/* Card 3: Incident Forensics Dossier */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-accent-teal/40 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-accent-purple border border-accent-purple/30">
                    SOC Level 4
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Incident Forensics Dossier</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  Comprehensive forensic intelligence package including vector analysis of smishing, malicious APK signatures, punycode phishing, and active remediations.
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={handleExportIncidentDossier}
                  className="w-full py-2 px-3 rounded-xl bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple border border-accent-purple/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Forensics Dossier (JSON)
                </button>
              </div>
            </div>

            {/* Card 4: Command Console Sitting & Duty Roster */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-accent-teal/40 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Armchair className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-emerald-400 border border-emerald-500/30">
                    Active Roster
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Console Seating & Duty Roster</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  Duty posture history, workstation console assignments (Alpha / Bravo), ergonomic rest metrics, and zero-trust away state logs for Navaneeth Kumar Kn and Madan gowda.
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={handleExportDutyRoster}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Sitting Duty Roster (JSON)
                </button>
              </div>
            </div>

            {/* Card 5: Complete System Backup Snapshot */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-accent-teal/40 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-amber-300 border border-amber-500/30">
                    Full Snapshot
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Disaster Recovery Backup</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  Full state snapshot archiving active defense posture, lockdown flags, ABAC database mappings, threat registries, and designated administrators.
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={handleExportSystemSnapshot}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Complete Backup (JSON)
                </button>
              </div>
            </div>

            {/* Card 6: Application Code Export Guide */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-accent-teal/10 border border-accent-teal/30 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-accent-teal/20 text-accent-teal border border-accent-teal/40">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-teal/20 text-accent-teal border border-accent-teal/40">
                    AI Studio Codebase
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Export Project Code & Repository</h3>
                <p className="text-xs text-white/70 leading-relaxed mb-3">
                  To download the complete application codebase or sync with GitHub:
                </p>
                <div className="space-y-1.5 text-xs text-white/60 font-mono bg-black/40 p-2.5 rounded-xl border border-white/5 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-accent-teal font-bold">1.</span>
                    <span>Open AI Studio top-right settings menu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent-teal font-bold">2.</span>
                    <span>Select <strong className="text-white">Export to GitHub</strong> or <strong className="text-white">Download ZIP</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent-teal font-bold">3.</span>
                    <span>Deploy directly to Cloud Run anytime</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <span>Platform: Google AI Studio Build</span>
                <span className="text-accent-teal font-mono font-semibold">Production Ready</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE ADMIN IMAGE MODAL - DEVICE UPLOAD FIRST */}
      <AnimatePresence>
        {isEditingImage && targetAdminForImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/15 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-accent-teal" />
                    Update Administrator Photo
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Upload an official portrait from your device for <span className="text-white font-semibold">{targetAdminForImage.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingImage(false)}
                  className="text-white/40 hover:text-white text-lg font-bold cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              {imageSaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Admin profile photo updated and saved successfully!</span>
                </div>
              )}

              {/* Current Preview Box */}
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-accent-teal shadow-xl shadow-accent-teal/20 bg-slate-800 shrink-0">
                  {customImageUrl ? (
                    <img
                      src={customImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent-teal/30 to-accent-purple/30 flex items-center justify-center font-bold text-2xl text-white">
                      {targetAdminForImage.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-accent-teal font-mono font-semibold uppercase tracking-wider">Active Preview</p>
                  <p className="text-sm font-bold text-white truncate">{targetAdminForImage.name}</p>
                  <p className="text-xs text-white/60 truncate">{targetAdminForImage.title}</p>
                  {selectedFileName ? (
                    <p className="text-[11px] text-emerald-400 font-mono mt-1 truncate">
                      File: {selectedFileName} ({selectedFileSize})
                    </p>
                  ) : (
                    <p className="text-[11px] text-white/40 font-mono mt-1">
                      {customImageUrl ? 'Photo ready to save' : 'No photo selected yet'}
                    </p>
                  )}
                </div>
              </div>

              {/* Mode Selector Tabs */}
              <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setImageUploadMode('device')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    imageUploadMode === 'device'
                      ? 'bg-accent-teal text-primary shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload from Device
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadMode('presets')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    imageUploadMode === 'presets'
                      ? 'bg-accent-teal text-primary shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Official Presets
                </button>
                <button
                  type="button"
                  onClick={() => setImageUploadMode('url')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    imageUploadMode === 'url'
                      ? 'bg-accent-teal text-primary shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span>URL / Link</span>
                </button>
              </div>

              {/* Tab 1: Upload from Device */}
              {imageUploadMode === 'device' && (
                <div className="space-y-3">
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                      isDraggingOver
                        ? 'border-accent-teal bg-accent-teal/15 scale-[1.01]'
                        : 'border-white/20 bg-white/[0.03] hover:border-accent-teal/60 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="p-3 rounded-full bg-accent-teal/10 border border-accent-teal/30 text-accent-teal">
                      <Upload className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Drag and drop your photo here, or <span className="text-accent-teal underline">Browse Device</span>
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        Supports PNG, JPG, JPEG, WEBP, or SVG (Up to 10MB)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-1 px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-accent-teal" />
                      Select File from Device
                    </button>
                  </div>

                  {imageUploadError && (
                    <div className="p-2.5 rounded-xl bg-accent-red/20 border border-accent-red/40 text-accent-red text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{imageUploadError}</span>
                    </div>
                  )}

                  {selectedFileName && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <span className="text-emerald-300 truncate font-mono">
                        ✓ Loaded: {selectedFileName} ({selectedFileSize})
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="text-white/60 hover:text-white underline text-[11px] ml-2 shrink-0 cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Preset AI Generated Portraits */}
              {imageUploadMode === 'presets' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white/70">Pick Official Portrait Asset:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomImageUrl(navaneethAvatar);
                        setSelectedFileName('navaneeth_portrait_official.png');
                        setSelectedFileSize('Preset Asset');
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                        customImageUrl === navaneethAvatar
                          ? 'bg-accent-teal/20 border-accent-teal text-white ring-1 ring-accent-teal'
                          : 'bg-white/5 border-white/10 hover:border-white/20 text-white/70'
                      }`}
                    >
                      <img src={navaneethAvatar} alt="Navaneeth" className="w-11 h-11 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-white">Navaneeth</p>
                        <p className="text-[10px] text-white/40">Lead Architect</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCustomImageUrl(madanAvatar);
                        setSelectedFileName('madan_portrait_official.png');
                        setSelectedFileSize('Preset Asset');
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                        customImageUrl === madanAvatar
                          ? 'bg-accent-teal/20 border-accent-teal text-white ring-1 ring-accent-teal'
                          : 'bg-white/5 border-white/10 hover:border-white/20 text-white/70'
                      }`}
                    >
                      <img src={madanAvatar} alt="Madan" className="w-11 h-11 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-white">Madan</p>
                        <p className="text-[10px] text-white/40">SecOps Director</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Custom Image URL */}
              {imageUploadMode === 'url' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-white/70">
                    Paste Image URL or Data URI:
                  </label>
                  <input
                    type="text"
                    value={customImageUrl}
                    onChange={(e) => {
                      setCustomImageUrl(e.target.value);
                      setSelectedFileName('Web URL Image');
                      setSelectedFileSize(null);
                    }}
                    placeholder="https://images.example.com/avatar.jpg"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-accent-teal"
                  />
                  <p className="text-[11px] text-white/40">
                    Supports any HTTPS image URL or base64 data URI scheme.
                  </p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                {customImageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomImageUrl('');
                      setSelectedFileName(null);
                      setSelectedFileSize(null);
                    }}
                    className="text-white/40 hover:text-accent-red text-xs transition-colors cursor-pointer"
                  >
                    Clear Photo
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditingImage(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyImage(customImageUrl)}
                    disabled={!customImageUrl.trim()}
                    className="px-5 py-2 rounded-xl bg-accent-teal hover:bg-accent-teal/90 text-primary text-xs font-bold shadow-lg shadow-accent-teal/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Admin Photo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
