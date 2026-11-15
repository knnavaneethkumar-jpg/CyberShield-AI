import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './UI';
import { Clock, ShieldCheck, ShieldAlert, ShieldX, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoricalScan {
  id: string;
  type: string;
  input: string;
  riskScore: number;
  classification: string;
  timestamp: any;
}

export const ScanHistory: React.FC = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<HistoricalScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'scans'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scanData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoricalScan[];
      setScans(scanData);
      setLoading(false);
    }, (error) => {
      console.error("History fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-accent-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
        <Clock className="w-12 h-12 text-white/10 mx-auto mb-4" />
        <p className="text-white/40">No scan history found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {scans.map((scan, i) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 border-white/5 hover:border-white/10 transition-colors bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  scan.classification === 'Safe' ? 'bg-accent-green/10 text-accent-green' :
                  scan.classification === 'Suspicious' ? 'bg-accent-yellow/10 text-accent-yellow' :
                  'bg-accent-red/10 text-accent-red'
                }`}>
                  {scan.classification === 'Safe' ? <ShieldCheck className="w-6 h-6" /> :
                   scan.classification === 'Suspicious' ? <ShieldAlert className="w-6 h-6" /> :
                   <ShieldX className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded text-white/40">
                      {scan.type}
                    </span>
                    <span className="text-[10px] text-white/20">
                      {scan.timestamp?.toDate().toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{scan.input}</p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-white">{scan.riskScore}%</div>
                  <div className="text-[10px] font-bold text-white/30 uppercase">Risk</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
