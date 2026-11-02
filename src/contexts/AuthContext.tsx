import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { INITIAL_PROFILES } from '@/services/mockData';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    organizationName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  switchRole: (role: UserRole) => void;
  isSupabaseLive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'eventsphere_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile as Profile);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase auth session load error:', err);
        }
      }

      // Local fallback restore
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(INITIAL_PROFILES[0]);
        }
      } else {
        // Default to publisher Alex Rivera for instant testability
        setUser(INITIAL_PROFILES[0]);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(INITIAL_PROFILES[0]));
      }
      setIsLoading(false);
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profile) {
            setUser(profile as Profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(AUTH_USER_KEY);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, _pass: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: _pass,
        });
        if (error) throw error;
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (profile) {
            setUser(profile as Profile);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
            setIsLoading(false);
            return { success: true };
          }
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // Local authentication fallback
    const allProfilesStr = localStorage.getItem('eventsphere_profiles');
    const profiles: Profile[] = allProfilesStr ? JSON.parse(allProfilesStr) : INITIAL_PROFILES;
    const found = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

    if (found) {
      setUser(found);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(found));
      setIsLoading(false);
      return { success: true };
    }

    // Create ad-hoc profile if not found
    const newProfile: Profile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      full_name: email.split('@')[0],
      email,
      role: email.includes('publisher') ? 'publisher' : 'booker',
      created_at: new Date().toISOString(),
    };
    setUser(newProfile);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newProfile));
    setIsLoading(false);
    return { success: true };
  };

  const register = async (data: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    organizationName?: string;
  }) => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              role: data.role,
              organization_name: data.organizationName,
            },
          },
        });
        if (error) throw error;
        if (authData.user) {
          const newProfile: Profile = {
            id: authData.user.id,
            full_name: data.fullName,
            email: data.email,
            role: data.role,
            organization_name: data.organizationName,
            created_at: new Date().toISOString(),
          };
          setUser(newProfile);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newProfile));
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Registration failed' };
      }
    }

    // Local fallback
    const newProfile: Profile = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      full_name: data.fullName,
      email: data.email,
      role: data.role,
      organization_name: data.organizationName,
      created_at: new Date().toISOString(),
    };

    const allProfilesStr = localStorage.getItem('eventsphere_profiles');
    const profiles: Profile[] = allProfilesStr ? JSON.parse(allProfilesStr) : INITIAL_PROFILES;
    profiles.push(newProfile);
    localStorage.setItem('eventsphere_profiles', JSON.stringify(profiles));

    setUser(newProfile);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newProfile));
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signout warning:', err);
      }
    }
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update(updates).eq('id', user.id);
      } catch (err) {
        console.warn('Supabase update profile error:', err);
      }
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      const updated: Profile = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'booker',
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        switchRole,
        isSupabaseLive: isSupabaseConfigured,
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

