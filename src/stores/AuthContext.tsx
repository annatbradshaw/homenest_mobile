import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, auth } from '../lib/supabase';
import { UserProfile, TenantMembership, Tenant } from '../types/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  memberships: TenantMembership[];
  currentTenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  setCurrentTenant: (tenant: Tenant) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memberships, setMemberships] = useState<TenantMembership[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const fetchMemberships = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tenant_memberships')
        .select(`
          *,
          tenant:tenants(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      setMemberships(data || []);

      // Set current tenant to the first one if not already set
      if (data && data.length > 0 && !currentTenant) {
        setCurrentTenant(data[0].tenant);
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
    }
  }, [currentTenant]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await Promise.all([fetchProfile(user.id), fetchMemberships(user.id)]);
    }
  }, [user?.id, fetchProfile, fetchMemberships]);

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        // If there's an error or no session, user is not authenticated
        if (error || !session) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setMemberships([]);
          setCurrentTenant(null);
          setIsLoading(false);
          return;
        }

        // Verify the session is still valid by making a request
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
          // Session is invalid, clear everything
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          setMemberships([]);
          setCurrentTenant(null);
          setIsLoading(false);
          return;
        }

        setSession(session);
        setUser(session.user);

        await fetchProfile(session.user.id);
        await fetchMemberships(session.user.id);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        // On any error, treat as not authenticated
        setSession(null);
        setUser(null);
        setProfile(null);
        setMemberships([]);
        setCurrentTenant(null);
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
          await fetchMemberships(session.user.id);
        } else {
          setProfile(null);
          setMemberships([]);
          setCurrentTenant(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, fetchMemberships]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await auth.signIn(email, password);
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await auth.signUp(email, password);
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setMemberships([]);
    setCurrentTenant(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await auth.resetPassword(email);
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    memberships,
    currentTenant,
    isLoading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
    setCurrentTenant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
