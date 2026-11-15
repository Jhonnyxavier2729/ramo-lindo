// Genera la música de fondo: un loop alegre tipo "ukelele + marimba" (sin cortes).
// Todo es síntesis propia: sin archivos de terceros ni licencias que revisar.
// Uso: npm run audio
import { writeFileSync, mkdirSync } from 'node:fs';

const SR = 22050;
const BPM = 116;
const BEAT = 60 / BPM;
const OUT = new URL('../public/audio/', import.meta.url);
mkdirSync(OUT, { recursive: true });

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// Progresión feliz en Do mayor (2 vueltas con final distinto)
const BARS = [
  { root: 48, notes: [60, 64, 67, 72] }, // C
  { root: 43, notes: [59, 62, 67, 71] }, // G
  { root: 45, notes: [57, 60, 64, 69] }, // Am
  { root: 41, notes: [57, 60, 65, 69] }, // F
  { root: 48, notes: [60, 64, 67, 72] }, // C
  { root: 41, notes: [57, 60, 65, 69] }, // F
  { root: 43, notes: [59, 62, 67, 71] }, // G
  { root: 43, notes: [59, 62, 65, 71] }, // G7
];
const LEN = Math.round(BARS.length * 4 * BEAT * SR);
const mix = new Float32Array(LEN);
const add = (start, samples, vol) => {
  const s0 = Math.round(start * SR);
  for (let i = 0; i < samples.length; i++) mix[(s0 + i) % LEN] += samples[i] * vol; // circular = loop perfecto
};

// Cuerda pulsada (Karplus-Strong): suena a ukelele/guitarra
function pluck(freq, seconds, bright = 0.5) {
  const n = Math.round(seconds * SR), p = Math.max(2, Math.round(SR / freq));
  const buf = new Float32Array(p).map(() => rnd() * 2 - 1);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = buf[i % p], b = buf[(i + 1) % p];
    out[i] = a;
    buf[i % p] = (bright * a + (1 - bright) * b) * 0.994;
  }
  return out;
}
// Marimba: seno + armónico 4x con decaimiento rápido
function marimba(freq, seconds) {
  const n = Math.round(seconds * SR), out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = (Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 5) + 0.35 * Math.sin(2 * Math.PI * freq * 4 * t) * Math.exp(-t * 18)) * Math.min(1, t * 400);
  }
  return out;
}
// Bajo redondo
function bass(freq, seconds) {
  const n = Math.round(seconds * SR), out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = (Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(4 * Math.PI * freq * t)) * Math.exp(-t * 3) * Math.min(1, t * 200);
  }
  return out;
}
// Shaker: ruido corto y brillante
function shaker(seconds) {
  const n = Math.round(seconds * SR), out = new Float32Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) { const w = rnd() * 2 - 1; out[i] = (w - prev) * Math.exp((-i / SR) * 60); prev = w; }
  return out;
}

const PENTA = [72, 74, 76, 79, 81, 84];              // Do mayor pentatónica
const RHYTHM = [0, 0.5, 1.5, 2, 2.5, 3.5];           // strum: 1, 1&, 2&, 3, 3&, 4&
const MELODY_STEPS = [0, 1, 1.5, 2.5, 3];

BARS.forEach((bar, b) => {
  const t0 = b * 4 * BEAT;
  // Ukelele: rasgueo con un pequeño desfase entre cuerdas
  RHYTHM.forEach((beat, k) => {
    const down = k % 2 === 0;
    const order = down ? bar.notes : [...bar.notes].reverse();
    order.forEach((m, s) => add(t0 + beat * BEAT + s * 0.012, pluck(mtof(m), 0.9, down ? 0.55 : 0.6), down ? 0.16 : 0.11));
  });
  // Bajo en 1 y 3 (con quinta)
  add(t0, bass(mtof(bar.root), BEAT * 1.6), 0.5);
  add(t0 + 2 * BEAT, bass(mtof(bar.root + 7), BEAT * 1.6), 0.4);
  // Shaker en corcheas, acento en el contratiempo
  for (let e = 0; e < 8; e++) add(t0 + e * BEAT / 2, shaker(0.08), e % 2 ? 0.07 : 0.04);
  // Melodía de marimba: notas del acorde + pentatónica, subiendo y bajando
  const chordTones = bar.notes.map((m) => m + 12).filter((m) => m <= 86);
  MELODY_STEPS.forEach((beat, k) => {
    if (b % 4 === 3 && k > 2) return; // respiro al final de cada frase
    const pool = k % 2 ? PENTA : chordTones;
    const m = pool[Math.floor(rnd() * pool.length)];
    add(t0 + beat * BEAT, marimba(mtof(m), 0.6), 0.22);
  });
});

// Compresión suave y normalización
let peak = 0;
for (let i = 0; i < LEN; i++) { mix[i] = Math.tanh(mix[i] * 1.4); peak = Math.max(peak, Math.abs(mix[i])); }

const data = Buffer.alloc(44 + LEN * 2);
data.write('RIFF', 0); data.writeUInt32LE(36 + LEN * 2, 4); data.write('WAVE', 8);
data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22);
data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 2, 28); data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34);
data.write('data', 36); data.writeUInt32LE(LEN * 2, 40);
for (let i = 0; i < LEN; i++) data.writeInt16LE(Math.round((mix[i] / peak) * 0.8 * 32767), 44 + i * 2);
writeFileSync(new URL('musica.wav', OUT), data);

console.log(`Música generada: public/audio/musica.wav (${(LEN / SR).toFixed(1)} s, ${BPM} BPM)`);
