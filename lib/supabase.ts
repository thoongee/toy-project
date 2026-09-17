import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function supabaseClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase 연결 정보가 없습니다. SUPABASE_URL과 SUPABASE_PUBLISHABLE_KEY를 설정해주세요.",
    );
  }

  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
