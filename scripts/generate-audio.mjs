// Genera la música ambiental (loop sin cortes) y los efectos de sonido en public/audio.
// Todo es síntesis propia: sin archivos de terceros ni licencias que revisar.
// Uso: npm run audio
import { writeFileSync, mkdirSync } from 'node:fs';

const SR = 22050;
const OUT = new URL('../public/audio/', import.meta.url);
mkdirSync(OUT, { recursive: true });

function wav(samples) {
  const n = samples.length;
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  return b;
}
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const osc = (type, ph) => {
  if (type === 'tri') { const x = ph - Math.floor(ph); return 4 * Math.abs(x - 0.5) - 1; }
  if (type === 'bright') return Math.sin(2 * Math.PI * ph) + 0.4 * Math.sin(4 * Math.PI * ph) + 0.2 * Math.sin(6 * Math.PI * ph);
  return Math.sin(2 * Math.PI * ph);
};
// Suma una nota al buffer. env(t) devuelve la envolvente; freq(t) la frecuencia.
function note(buf, { start, length, type = 'sine', vol, env, freq, wrap = false }) {
  const s0 = Math.floor(start * SR), n = Math.floor(length * SR);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += freq(t) / SR;
    let idx = s0 + i;
    if (wrap) idx %= buf.length; else if (idx >= buf.length) break;
    buf[idx] += osc(type, ph) * env(t) * vol;
  }
}
const pad = (a, d, r) => (t) => (t < a ? t / a : t < d ? 1 : Math.max(0, 1 - (t - d) / r));
const pluck = (a, decay) => (t) => (t < a ? t / a : Math.exp(-(t - a) / decay));
const normalize = (buf, peak) => {
  let m = 0; for (const v of buf) m = Math.max(m, Math.abs(v));
  for (let i = 0; i < buf.length; i++) buf[i] = (buf[i] / m) * peak;
  return buf;
};

/* ---------- Música ambiental: Cmaj7 · Am7 · Fmaj7 · G6, 4 compases de 6 s ---------- */
const BAR = 6;
const CHORDS = [[48, 55, 59, 64, 67], [45, 52, 55, 60, 64], [41, 48, 52, 57, 60], [43, 50, 55, 59, 62]];
const PENTA = [72, 74, 76, 79, 81, 84, 86];
const music = new Float32Array(SR * BAR * CHORDS.length);
CHORDS.forEach((chord, c) => {
  chord.forEach((m, i) => note(music, {
    start: c * BAR, length: BAR + 2.5, type: i < 2 ? 'sine' : 'tri', vol: 0.07, wrap: true,
    env: pad(2, BAR, 2.5), freq: () => mtof(m) * (1 + (rnd() - 0.5) * 0.002),
  }));
  for (let k = 0; k < 4; k++) if (rnd() < 0.6) {
    const m = PENTA[Math.floor(rnd() * PENTA.length)];
    note(music, { start: c * BAR + k * 1.5 + rnd() * 0.3, length: 3, vol: 0.05, wrap: true, env: pluck(0.01, 0.7), freq: () => mtof(m) });
  }
});
// Paso bajo suave (circular, para que el loop no haga "click")
const a = 1 - Math.exp((-2 * Math.PI * 1400) / SR);
let y = 0;
for (let pass = 0; pass < 2; pass++) for (let i = 0; i < music.length; i++) { y += a * (music[i] - y); if (pass) music[i] = y; }
// Eco circular
const D = Math.floor(0.38 * SR), echo = new Float32Array(music.length);
for (let pass = 0; pass < 4; pass++) for (let i = 0; i < music.length; i++) {
  const j = (i - D + music.length) % music.length;
  echo[i] = music[j] + 0.38 * echo[j];
}
for (let i = 0; i < music.length; i++) music[i] += 0.35 * echo[i];
writeFileSync(new URL('ambient.wav', OUT), wav(normalize(music, 0.7)));

/* ---------- Efectos ---------- */
const sfx = (seconds, build) => { const b = new Float32Array(Math.floor(SR * seconds)); build(b); return wav(normalize(b, 0.8)); };
writeFileSync(new URL('pop.wav', OUT), sfx(0.2, (b) => note(b, { start: 0, length: 0.2, vol: 1, env: pluck(0.005, 0.05), freq: (t) => 520 * (900 / 520) ** Math.min(t / 0.1, 1) })));
writeFileSync(new URL('ding.wav', OUT), sfx(1.1, (b) => {
  note(b, { start: 0, length: 1, vol: 1, env: pluck(0.005, 0.25), freq: () => 1320 });
  note(b, { start: 0.08, length: 1, vol: 0.8, env: pluck(0.005, 0.3), freq: () => 1760 });
}));
writeFileSync(new URL('ching.wav', OUT), sfx(1.0, (b) => {
  note(b, { start: 0, length: 0.3, type: 'bright', vol: 0.8, env: pluck(0.003, 0.06), freq: () => 1568 });
  note(b, { start: 0.09, length: 0.9, type: 'bright', vol: 0.8, env: pluck(0.003, 0.22), freq: () => 2093 });
}));
writeFileSync(new URL('undo.wav', OUT), sfx(0.2, (b) => note(b, { start: 0, length: 0.2, type: 'tri', vol: 1, env: pluck(0.005, 0.05), freq: (t) => 420 - t * 400 })));

console.log('Audio generado en public/audio');
