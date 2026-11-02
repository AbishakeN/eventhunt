import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean URL to prevent double slashes (e.g. .co//rest/v1/)
export const supabaseUrl = rawUrl.trim().replace(/\/+$/, '');
export const supabaseAnonKey = rawKey.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'
);

// Fallback dummy client if credentials are empty to avoid startup crashes
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      tablesExist: false,
      message: 'Supabase URL and Anon Key are not yet configured.',
    };
  }

  try {
    const { data, error } = await supabase.from('events').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('not find the table')) {
        return {
          connected: true,
          tablesExist: false,
          message: 'Connected to Supabase! Please run the migration script in Supabase SQL Editor to create tables.',
        };
      }
      return {
        connected: true,
        tablesExist: false,
        message: `Supabase returned: ${error.message}`,
      };
    }
    return {
      connected: true,
      tablesExist: true,
      message: 'Supabase PostgreSQL connected & tables verified!',
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      message: err.message || 'Connection failure to Supabase.',
    };
  }
}
