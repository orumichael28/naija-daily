import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kxmxzjnmtwapfvzkhnrp.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Public client for client-side or anon operations
 */
export const supabase = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Privileged server-side client with bypass-RLS permissions
 * ONLY use in server actions, route handlers, or server components!
 */
export function getServiceSupabase() {
  const key = serviceRoleKey || supabaseAnonKey;
  if (!key) {
    throw new Error("Missing Supabase key. Please configure SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
