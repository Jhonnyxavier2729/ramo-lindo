import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Vercel Cron llama a esta ruta una vez al día (vercel.json) para que el
// proyecto gratuito de Supabase no se pause por inactividad.
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ ok: true, skipped: 'sin Supabase' });
  const { error } = await createClient(url, key).from('orders').select('id', { count: 'exact', head: true });
  return NextResponse.json({ ok: !error, at: new Date().toISOString() }, { status: error ? 500 : 200 });
}
