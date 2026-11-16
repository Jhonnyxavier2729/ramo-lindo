import type { SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** false en la versión demo (sin claves): la app usa localStorage. */
export const hasSupabase = !!(url && key);

let client: SupabaseClient | null = null;

/**
 * Rendimiento: el SDK de Supabase (~55 KB) solo se descarga si hay claves configuradas
 * y en el momento en que se necesita, no al cargar la página.
 */
export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!hasSupabase) return null;
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(url!, key!);
  }
  return client;
}
