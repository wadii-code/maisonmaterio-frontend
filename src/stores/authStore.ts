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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    set({ profile: data, initialized: true });
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
