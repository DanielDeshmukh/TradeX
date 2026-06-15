import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { startSessionRefresh, stopSessionRefresh } from '../utils/security';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      if (s) startSessionRefresh(s);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s) startSessionRefresh(s);
      else stopSessionRefresh();
    });

    return () => {
      subscription.unsubscribe();
      stopSessionRefresh();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.session) startSessionRefresh(data.session);
    return { data, error };
  }, []);

  const signUp = useCallback(async (email, password, metadata) => {
    return supabase.auth.signUp({ email, password, options: { data: metadata } });
  }, []);

  const signOut = useCallback(async () => {
    stopSessionRefresh();
    return supabase.auth.signOut();
  }, []);

  const refreshSession = useCallback(async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (data.session) startSessionRefresh(data.session);
    return { data, error };
  }, []);

  return { user, session, loading, signIn, signUp, signOut, refreshSession };
}
