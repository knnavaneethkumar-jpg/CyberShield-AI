import React, { createContext, useContext, useEffect, useState } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
const STORAGE_KEY = 'cybershield_auth';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isDemo?: boolean;
  role?: 'admin' | 'user';
}

interface AuthResponse {
  user: AppUser;
  token: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function saveSession(response: AuthResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
}

function getSession(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const session = getSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Authentication request failed') as Error & { code?: string };
    error.code = data.code;
    throw error;
  }
  return data as T;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const session = getSession();
    if (!session?.token) {
      setUser(session?.user || null);
      setLoading(false);
      return;
    }
    request<{ user: AppUser }>('/api/auth/me')
      .then((response) => {
        if (!mounted) return;
        const current = getSession();
        if (current) saveSession({ ...current, user: response.user });
        setUser(response.user);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    const response = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    saveSession(response);
    setUser(response.user);
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const response = await request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass, name }),
    });
    saveSession(response);
    setUser(response.user);
  };

  const signInWithGoogle = async () => {
    throw new Error('Google sign-in is not enabled. Please use email and password.');
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!user || user.isDemo) {
      if (user) {
        const updated = { ...user, displayName, photoURL: photoURL ?? user.photoURL };
        saveSession({ user: updated, token: '' });
        setUser(updated);
      }
      return;
    }

    const response = await request<{ user: AppUser }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ displayName, photoURL: photoURL ?? '' }),
    });
    const session = getSession();
    if (session) saveSession({ ...session, user: response.user });
    setUser(response.user);
  };

  const logout = async () => {
    const session = getSession();
    try {
      if (session?.token) {
        await request('/api/auth/logout', { method: 'POST' });
      }
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, registerWithEmail, updateUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
