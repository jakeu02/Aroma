import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRole = async (currentSession) => {
    if (!currentSession?.user) {
      setRole(null);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentSession.user.id)
      .maybeSingle();
    setRole(data?.role || 'customer');
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadRole(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      await loadRole(newSession);
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email, password, metadata = {}) =>
    supabase.auth.signUp({ email, password, options: { data: metadata } });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        role,
        isAdmin: role === 'admin',
        isEmployee: role === 'employee',
        isStaff: role === 'admin' || role === 'employee',
        loading,
        signIn,
        signUp,
        signOut,
        configured: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
