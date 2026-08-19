import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase persistence is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  if (!client) client = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  return client;
}

export async function consumeRateLimit(scopeKey: string, limit: number, windowSeconds: number) {
  const { data, error } = await getSupabase().rpc("consume_rate_limit", { p_scope_key: scopeKey, p_limit: limit, p_window_seconds: windowSeconds });
  if (error) throw new Error(`Unable to apply request limit: ${error.message}`);
  return Boolean(data);
}
