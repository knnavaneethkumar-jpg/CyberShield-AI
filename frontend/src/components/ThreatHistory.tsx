import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from './UI';
import { 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Search, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  LogIn, 
  AlertCircle,
  ListChecks,
  Info,
  Filter,
  Download,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ThreatScan {
  id: string;
  type: 'app' | 'message' | 'link' | string;
  input: string;
  riskScore: number;
  classification: 'Safe' | 'Suspicious' | 'Dangerous' | string;
  explanation?: string;
  whyFlagged?: string[];
  riskFactors?: string[];
  recommendedActions?: string[];
  detailedLog?: string;
  timestamp: any;
}

export const ThreatHistory: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const [scans, setScans] = useState<ThreatScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Dangerous' | 'Suspicious' | 'Safe'>('All');
  const [selectedType, setSelectedType] = useState<'All' | 'app' | 'message' | 'link'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setScans([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const scansQuery = query(
      collection(db, 'users', user.uid, 'scans'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      scansQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as ThreatScan[];
        setScans(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching threat history:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (scanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setDeletingId(scanId);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'scans', scanId));
    } catch (err) {
      console.error('Failed to delete scan entry:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredScans = scans.filter((scan) => {
    const matchesClassification =
      selectedFilter === 'All' || scan.classification === selectedFilter;
    const matchesType = selectedType === 'All' || scan.type === selectedType;
    const matchesSearch =
      !searchQuery.trim() ||
      scan.input.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.explanation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.riskFactors?.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesClassification && matchesType && matchesSearch;
  });

  const handleExportScansCSV = () => {
    if (filteredScans.length === 0) return;
    const headers = ['Scan ID', 'Type', 'Target/Payload', 'Risk Score', 'Classification', 'Explanation', 'Timestamp'];
    const rows = filteredScans.map((scan) => {
      const dateStr = scan.timestamp?.toDate
        ? scan.timestamp.toDate().toISOString()
        : new Date().toISOString();
      return [
        `"${scan.id}"`,
        `"${scan.type}"`,
        `"${scan.input.replace(/"/g, '""')}"`,
        `"${scan.riskScore}"`,
        `"${scan.classification}"`,
        `"${(scan.explanation || '').replace(/"/g, '""')}"`,
        `"${dateStr}"`
      ];
    });
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cybershield-threat-scans-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportScansJSON = () => {
    if (filteredScans.length === 0) return;
    const payload = {
      title: 'CyberShield AI Threat Scans Export',
      generatedAt: new Date().toISOString(),
      user: user?.email || 'Authenticated User',
      totalScans: filteredScans.length,
      scans: filteredScans.map((s) => ({
        ...s,
        timestamp: s.timestamp?.toDate ? s.timestamp.toDate().toISOString() : s.timestamp
      }))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cybershield-threat-scans-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <Card className="p-8 text-center bg-white/5 border-white/10">
        <Clock className="w-12 h-12 text-accent-teal/50 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Sign in to View Threat History</h3>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
          Log in with your account to securely save and access your past threat scans, risk analyses, and safety insights.
        </p>
        <Button onClick={signInWithGoogle} variant="primary" className="bg-gradient-to-r from-accent-teal to-accent-purple text-primary font-bold">
          <LogIn className="w-4 h-4 mr-2" />
          Sign In with Google
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search scans, threats, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-accent-teal transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1 text-xs text-white/40 mr-1 font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {(['All', 'Dangerous', 'Suspicious', 'Safe'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === filter
                  ? filter === 'Dangerous'
                    ? 'bg-accent-red text-white'
                    : filter === 'Suspicious'
                    ? 'bg-accent-yellow text-primary'
                    : filter === 'Safe'
                    ? 'bg-accent-green text-primary'
                    : 'bg-accent-teal text-primary'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {filter}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

          {(['All', 'app', 'message', 'link'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedType === type
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Scans List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-accent-teal border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredScans.length === 0 ? (
        <Card className="p-12 text-center bg-white/5 border-white/10">
          <Clock className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-white mb-1">No Threat Records Found</h4>
          <p className="text-white/40 text-sm max-w-sm mx-auto">
            {scans.length === 0
              ? 'You have not performed any scans yet. Run your first analysis above to populate your threat history.'
              : 'No scans match your current filter criteria. Try clearing search filters.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Export Action Strip */}
          <div className="flex items-center justify-between px-2 text-xs text-white/60">
            <span>Showing <strong className="text-white">{filteredScans.length}</strong> threat record{filteredScans.length === 1 ? '' : 's'}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportScansCSV}
                title="Export filtered scans as CSV"
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
              >
                <FileSpreadsheet className="w-3 h-3 text-accent-teal" />
                Export CSV
              </button>
              <button
                onClick={handleExportScansJSON}
                title="Export filtered scans as JSON"
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
              >
                <FileCode className="w-3 h-3 text-accent-purple" />
                Export JSON
              </button>
            </div>
          </div>
          <AnimatePresence>
            {filteredScans.map((scan) => {
              const isExpanded = expandedId === scan.id;
              const dateStr = scan.timestamp?.toDate
                ? scan.timestamp.toDate().toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : new Date().toLocaleDateString();

              return (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    onClick={() => setExpandedId(isExpanded ? null : scan.id)}
                    className={`p-5 cursor-pointer border transition-all duration-200 bg-white/5 hover:bg-white/10 ${
                      scan.classification === 'Dangerous'
                        ? 'border-accent-red/30 hover:border-accent-red/50'
                        : scan.classification === 'Suspicious'
                        ? 'border-accent-yellow/30 hover:border-accent-yellow/50'
                        : 'border-accent-green/20 hover:border-accent-green/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left Header Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`p-2.5 rounded-xl flex-shrink-0 ${
                            scan.classification === 'Safe'
                              ? 'bg-accent-green/10 text-accent-green'
                              : scan.classification === 'Suspicious'
                              ? 'bg-accent-yellow/10 text-accent-yellow'
                              : 'bg-accent-red/10 text-accent-red'
                          }`}
                        >
                          {scan.classification === 'Safe' ? (
                            <ShieldCheck className="w-6 h-6" />
                          ) : scan.classification === 'Suspicious' ? (
                            <ShieldAlert className="w-6 h-6" />
                          ) : (
                            <ShieldX className="w-6 h-6" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/10 text-white/80 rounded">
                              {scan.type}
                            </span>

                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                                scan.classification === 'Dangerous'
                                  ? 'bg-accent-red/20 text-accent-red'
                                  : scan.classification === 'Suspicious'
                                  ? 'bg-accent-yellow/20 text-accent-yellow'
                                  : 'bg-accent-green/20 text-accent-green'
                              }`}
                            >
                              {scan.classification}
                            </span>

                            <span className="text-xs text-white/40 flex items-center gap-1 ml-auto sm:ml-0">
                              <Clock className="w-3 h-3" />
                              {dateStr}
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-white truncate max-w-xl">
                            {scan.input}
                          </p>

                          {scan.explanation && !isExpanded && (
                            <p className="text-xs text-white/50 line-clamp-1 mt-1">
                              {scan.explanation}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Risk Score & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                        <div className="text-right">
                          <div
                            className={`text-2xl font-black ${
                              scan.riskScore > 65
                                ? 'text-accent-red'
                                : scan.riskScore > 30
                                ? 'text-accent-yellow'
                                : 'text-accent-green'
                            }`}
                          >
                            {scan.riskScore}%
                          </div>
                          <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                            Threat Level
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDelete(scan.id, e)}
                            disabled={deletingId === scan.id}
                            title="Remove scan record"
                            className="p-2 text-white/30 hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="p-2 text-white/40">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-accent-teal" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-white/10 space-y-4 text-left overflow-hidden"
                        >
                          {/* Explanation */}
                          {scan.explanation && (
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                              <h5 className="text-xs font-bold text-accent-teal uppercase tracking-wider mb-1">
                                AI Explanation
                              </h5>
                              <p className="text-sm text-white/80 leading-relaxed">
                                {scan.explanation}
                              </p>
                            </div>
                          )}

                          {/* Risk Factors */}
                          {scan.riskFactors && scan.riskFactors.length > 0 && (
                            <div>
                              <h5 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-accent-yellow" />
                                Key Risk Factors
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {scan.riskFactors.map((rf, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white/5 p-2.5 rounded-lg text-xs text-white/80 flex items-start gap-2 border border-white/5"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-yellow mt-1.5 flex-shrink-0" />
                                    <span>{rf}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Why Flagged */}
                          {scan.whyFlagged && scan.whyFlagged.length > 0 && (
                            <div>
                              <h5 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-accent-teal" />
                                Decision Reasoning
                              </h5>
                              <ul className="space-y-1.5 bg-black/20 p-3 rounded-xl border border-white/5">
                                {scan.whyFlagged.map((reason, idx) => (
                                  <li key={idx} className="text-xs text-white/70 flex items-start gap-2">
                                    <span className="text-accent-teal font-bold">•</span>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Recommended Actions */}
                          {scan.recommendedActions && scan.recommendedActions.length > 0 && (
                            <div>
                              <h5 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <ListChecks className="w-3.5 h-3.5 text-accent-green" />
                                Recommended Actions
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {scan.recommendedActions.map((action, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-accent-teal/10 text-accent-teal border border-accent-teal/20 rounded-full text-xs font-semibold"
                                  >
                                    {action}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
