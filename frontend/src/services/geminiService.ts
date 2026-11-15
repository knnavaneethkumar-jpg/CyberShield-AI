const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
const AUTH_STORAGE_KEY = 'cybershield_auth';

function authHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const session = raw ? JSON.parse(raw) : null;
    return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
  } catch {
    return {};
  }
}

export interface ScanExplanation {
  riskScore: number;
  classification: "Safe" | "Suspicious" | "Dangerous";
  explanation: string;
  whyFlagged: string[];
  riskFactors: string[];
  recommendedActions: string[];
  detailedLog: string;
  timestamp?: string;
  mlModelAvailable?: boolean;
  mlPrediction?: 'MALICIOUS' | 'BENIGN';
  mlRiskScore?: number;
  mlModality?: 'url' | 'text';
  mlModelName?: string;
  mlError?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  threatLevel?: 'safe' | 'suspicious' | 'dangerous' | 'info';
  suggestedFollowUps?: string[];
}

export interface CyberBotResponse {
  content: string;
  threatLevel: 'safe' | 'suspicious' | 'dangerous' | 'info';
  suggestedFollowUps: string[];
  degraded?: boolean;
  fallbackReason?: string;
}

export const explainScan = async (
  type: "app" | "message" | "link",
  input: string,
  userId?: string
): Promise<ScanExplanation> => {
  const response = await fetch(apiUrl('/api/scan'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ type, input, userId })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Scan failed' }));
    throw new Error(error.error || 'Scan failed');
  }

  return response.json() as Promise<ScanExplanation>;
};

export const chatWithCyberBot = async (
  history: { role: 'user' | 'assistant'; content: string }[],
  language: string = 'en',
  contextSummary?: string
): Promise<CyberBotResponse> => {
  const response = await fetch(apiUrl('/api/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ history, language, contextSummary })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Chat service unavailable' }));
    throw new Error(error.error || 'Chat service unavailable');
  }

  return response.json() as Promise<CyberBotResponse>;
};
