export type FlowerId = 'rosa' | 'girasol' | 'tulipan' | 'margarita' | 'cosmos' | 'lavanda';
export type RibbonId = 'coral' | 'cielo' | 'fucsia';

export interface Flower { id: FlowerId; name: string; price: number; crate: string }
export interface Ribbon { id: RibbonId; name: string; price: number; color: string; dark: string }

/** j y k son pequeñas variaciones aleatorias para que cada ramo se vea natural. */
export interface Stem { key: string; id: FlowerId; j: number; k: number }
export interface Note { text: string; svg: string | null }

export const FLOWERS: Flower[] = [
// Precios por tallo en pesos colombianos (COP)
  { id: 'rosa', name: 'Rosa de jardín', price: 7000, crate: '#e8472f' },
  { id: 'girasol', name: 'Girasol', price: 6000, crate: '#3455db' },
  { id: 'tulipan', name: 'Tulipán frambuesa', price: 9000, crate: '#f6ead2' },
  { id: 'margarita', name: 'Margarita', price: 3500, crate: '#e8472f' },
  { id: 'cosmos', name: 'Cosmos rosa', price: 4500, crate: '#3455db' },
  { id: 'lavanda', name: 'Lavanda', price: 5000, crate: '#f6ead2' },
];

export const RIBBONS: Ribbon[] = [
  { id: 'coral', name: 'Coral', price: 4000, color: '#ff6a3d', dark: '#c9441a' },
  { id: 'cielo', name: 'Azul cielo', price: 4000, color: '#5aa9ff', dark: '#2a6fc4' },
  { id: 'fucsia', name: 'Fucsia', price: 4000, color: '#ff4fa3', dark: '#c42a7a' },
];

export const NOTE_PRICE = 3000;
export const MAX_STEMS = 15;
export const MIN_FOR_RIBBON = 3;

export const F = Object.fromEntries(FLOWERS.map((f) => [f.id, f])) as Record<FlowerId, Flower>;
export const R = Object.fromEntries(RIBBONS.map((r) => [r.id, r])) as Record<RibbonId, Ribbon>;

/** Formato colombiano: $45.500 (punto de miles, sin decimales). Igual en servidor y navegador. */
export const money = (n: number) => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

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
