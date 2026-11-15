export type FlowerId = 'rosa' | 'girasol' | 'tulipan' | 'margarita' | 'cosmos' | 'lavanda';
export type RibbonId = 'coral' | 'cielo' | 'fucsia';

export interface Flower { id: FlowerId; name: string; price: number; crate: string }
export interface Ribbon { id: RibbonId; name: string; price: number; color: string; dark: string }

/** j y k son pequeñas variaciones aleatorias para que cada ramo se vea natural. */
export interface Stem { key: string; id: FlowerId; j: number; k: number }
export interface Note { text: string; svg: string | null }

export const FLOWERS: Flower[] = [
  { id: 'rosa', name: 'Rosa de jardín', price: 8, crate: '#e8472f' },
  { id: 'girasol', name: 'Girasol', price: 5, crate: '#3455db' },
  { id: 'tulipan', name: 'Tulipán frambuesa', price: 6, crate: '#f6ead2' },
  { id: 'margarita', name: 'Margarita', price: 4, crate: '#e8472f' },
  { id: 'cosmos', name: 'Cosmos rosa', price: 5, crate: '#3455db' },
  { id: 'lavanda', name: 'Lavanda', price: 6, crate: '#f6ead2' },
];

export const RIBBONS: Ribbon[] = [
  { id: 'coral', name: 'Coral', price: 3, color: '#ff6a3d', dark: '#c9441a' },
  { id: 'cielo', name: 'Azul cielo', price: 3, color: '#5aa9ff', dark: '#2a6fc4' },
  { id: 'fucsia', name: 'Fucsia', price: 3, color: '#ff4fa3', dark: '#c42a7a' },
];

export const NOTE_PRICE = 2;
export const MAX_STEMS = 15;
export const MIN_FOR_RIBBON = 3;

export const F = Object.fromEntries(FLOWERS.map((f) => [f.id, f])) as Record<FlowerId, Flower>;
export const R = Object.fromEntries(RIBBONS.map((r) => [r.id, r])) as Record<RibbonId, Ribbon>;

export const money = (n: number) => '$' + n.toFixed(2);

export function orderTotal(stems: Pick<Stem, 'id'>[], ribbon: RibbonId | null, hasNote: boolean) {
  return stems.reduce((s, st) => s + F[st.id].price, 0) + (ribbon ? R[ribbon].price : 0) + (hasNote ? NOTE_PRICE : 0);
}

export function receiptLines(stems: Pick<Stem, 'id'>[], ribbon: RibbonId | null, hasNote: boolean) {
  const counts = new Map<FlowerId, number>();
  stems.forEach((s) => counts.set(s.id, (counts.get(s.id) ?? 0) + 1));
  const lines: { label: string; amount: number }[] = [...counts].map(([id, c]) => ({ label: `${c}x ${F[id].name}`, amount: c * F[id].price }));
  if (ribbon) lines.push({ label: `Lazo ${R[ribbon].name.toLowerCase()}`, amount: R[ribbon].price });
  if (hasNote) lines.push({ label: 'Nota a mano', amount: NOTE_PRICE });
  return lines;
}
