'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient, hasSupabaseBrowserConfig } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseConfigured = hasSupabaseBrowserConfig();
  const supabase = useMemo(() => (supabaseConfigured ? createClient() : null), [supabaseConfigured]);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u ?? null);
      if (u) {
        const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single();
        setProfile(p as Profile | null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then((result: { data: Profile | null }) => setProfile(result.data));
      } else {
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, supabaseConfigured]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return { user, profile, loading, signOut, supabaseConfigured };
}
