import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '../types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  profileError: string | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  refreshProfile: () => Promise<Profile | null>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  profileError: null,
  loading: false,
  initialized: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
    if (session?.user) {
      get().fetchProfile(session.user.id);
    } else {
      set({ profile: null, initialized: true });
    }
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[auth] Profile fetch failed:', error);
      set({ profile: null, profileError: error.message, initialized: true });
      return null;
    }

    if (!data) {
      // Profile row missing — try to auto-create it (signup trigger may not have run)
      const userEmail = get().user?.email ?? '';
      const fallbackName = userEmail.split('@')[0] || 'User';
      const { data: created, error: insertErr } = await supabase
        .from('profiles')
        .insert({ id: userId, full_name: fallbackName, role: 'customer' })
        .select()
        .single();

      if (insertErr) {
        console.error('[auth] Auto-create profile failed:', insertErr);
        set({
          profile: null,
          profileError: `Profile missing for user ${userId.slice(0, 8)}. Auto-create failed: ${insertErr.message}`,
          initialized: true,
        });
        return null;
      }

      set({ profile: created, profileError: null, initialized: true });
      return created;
    }

    set({ profile: data, profileError: null, initialized: true });
    return data;
  },

  refreshProfile: async () => {
    const userId = get().user?.id;
    if (!userId) return null;
    return get().fetchProfile(userId);
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ session: data.session, user: data.user });
      if (data.user) await get().fetchProfile(data.user.id);
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      if (data.user) {
        set({ session: data.session, user: data.user });
      }
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  isAdmin: () => get().profile?.role === 'admin',
}));
