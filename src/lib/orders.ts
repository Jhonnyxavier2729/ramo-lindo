'use client';
import { supabase } from './supabase';
import type { Note, RibbonId, Stem } from './catalog';

export interface SavedOrder {
  id: string;
  stems: Omit<Stem, 'key'>[];
  ribbon: RibbonId | null;
  note_text: string | null;
  note_svg: string | null;
  total: number;
  created_at: string;
}

const LOCAL_KEY = 'ramo-lindo:orders';

function readLocal(): SavedOrder[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]'); } catch { return []; }
}
function writeLocal(orders: SavedOrder[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(orders.slice(0, 20))); } catch { /* modo privado */ }
}

export async function saveOrder(input: { stems: Stem[]; ribbon: RibbonId | null; note: Note | null; total: number }) {
  const row = {
    stems: input.stems.map(({ id, j, k }) => ({ id, j: +j.toFixed(3), k: +k.toFixed(3) })),
    ribbon: input.ribbon,
    note_text: input.note?.text || null,
    note_svg: input.note?.svg || null,
    total: input.total,
  };
  if (supabase) {
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      const { error } = await supabase.from('orders').insert(row);
      if (!error) return { mode: 'cloud' as const };
      console.warn('Supabase no guardó el pedido, uso modo demo:', error.message);
    }
  }
  writeLocal([{ ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...readLocal()]);
  return { mode: 'demo' as const };
}

export async function listOrders(): Promise<{ orders: SavedOrder[]; mode: 'cloud' | 'demo' }> {
  if (supabase) {
    const { data: session } = await supabase.auth.getSession();
    if (session.session) {
      const { data, error } = await supabase
        .from('orders')
        .select('id, stems, ribbon, note_text, note_svg, total, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data) return { orders: data as SavedOrder[], mode: 'cloud' };
    }
  }
  return { orders: readLocal(), mode: 'demo' };
}
