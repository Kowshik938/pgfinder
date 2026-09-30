import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

export type UserRole = 'USER' | 'OWNER' | 'ADMIN';

export interface DbUser {
  id: number;
  uid: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatar?: string | null;
  createdAt?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
  role: 'USER' | 'OWNER';
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  dbUser: DbUser | null;
  token: string | null;
  isLoading: boolean;
  activeRole: UserRole;
  signInWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmailPassword: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  setDemoUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pgfinder_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<UserRole>('USER');

  // Verify and load current user from token
  const loadUserWithToken = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user);
        setActiveRole(data.user.role || 'USER');
        return true;
      } else {
        localStorage.removeItem('pgfinder_token');
        setToken(null);
        setDbUser(null);
        return false;
      }
    } catch (err) {
      console.error('Failed to load user with token:', err);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Check stored custom JWT first
      const storedToken = localStorage.getItem('pgfinder_token');
      if (storedToken) {
        await loadUserWithToken(storedToken);
      }

      // Also listen to Firebase auth
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setFirebaseUser(currentUser);
        if (currentUser && !localStorage.getItem('pgfinder_token')) {
          try {
            const idToken = await currentUser.getIdToken();
            setToken(idToken);
            localStorage.setItem('pgfinder_token', idToken);
            await loadUserWithToken(idToken);
          } catch (err) {
            console.error('Error with Firebase token:', err);
          }
        }
        setIsLoading(false);
      });

      setIsLoading(false);
      return () => unsubscribe();
    };

    initAuth();
  }, []);

  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setToken(data.token);
      localStorage.setItem('pgfinder_token', data.token);
      setDbUser(data.user);
      setActiveRole(data.user.role || 'USER');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const registerWithEmailPassword = async (payload: RegisterPayload) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setToken(data.token);
      localStorage.setItem('pgfinder_token', data.token);
      setDbUser(data.user);
      setActiveRole(data.user.role || 'USER');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('pgfinder_token', idToken);
      await loadUserWithToken(idToken);
    } catch (error: any) {
      console.warn('Popup sign-in fallback:', error.message);
      // Fallback demo user
      setDemoUser('USER');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('Error signing out:', e);
    }
    localStorage.removeItem('pgfinder_token');
    setFirebaseUser(null);
    setDbUser(null);
    setToken(null);
    setActiveRole('USER');
  };

  const switchRole = async (newRole: UserRole) => {
    setActiveRole(newRole);
    if (token) {
      try {
        const res = await fetch('/api/auth/role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            setToken(data.token);
            localStorage.setItem('pgfinder_token', data.token);
          }
          if (data.user) {
            setDbUser(data.user);
          }
        }
      } catch (err) {
        console.error('Failed to switch role in DB:', err);
      }
    }
  };

  const setDemoUser = (role: UserRole) => {
    let demo: DbUser;
    if (role === 'ADMIN') {
      demo = {
        id: 2,
        uid: 'pgfinder_super_admin',
        name: 'PGFinder System Admin',
        email: 'admin@pgfinder.com',
        phone: '+91 99999 00000',
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      };
    } else if (role === 'OWNER') {
      demo = {
        id: 1,
        uid: 'pgfinder_master_owner',
        name: 'Rajesh Sharma (Verified Host)',
        email: 'rajesh.pgfinder@example.com',
        phone: '+91 98765 43210',
        role: 'OWNER',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };
    } else {
      demo = {
        id: 3,
        uid: 'demo_tenant_uid',
        name: 'Aarav Sharma (Tenant)',
        email: 'seeker@example.com',
        phone: '+91 91234 56789',
        role: 'USER',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      };
    }
    setDbUser(demo);
    setActiveRole(role);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        dbUser,
        token,
        isLoading,
        activeRole,
        signInWithGoogle,
        loginWithEmailPassword,
        registerWithEmailPassword,
        signOut,
        switchRole,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
