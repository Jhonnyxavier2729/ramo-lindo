import type { FlowerId } from '@/lib/catalog';

// Ilustraciones vectoriales propias. viewBox centrado en (0,0); el tallo entra por abajo.
const ring = (n: number, offset = 0) => Array.from({ length: n }, (_, i) => offset + (i * 360) / n);
const GOLDEN = Array.from({ length: 34 }, (_, i) => {
  const r = 2.6 * Math.sqrt(i + 1), a = i * 137.508 * (Math.PI / 180);
  return [r * Math.cos(a), r * Math.sin(a)] as const;
});
const LAVENDER = Array.from({ length: 16 }, (_, i) => ({ y: 30 - i * 4.6, x: i % 2 ? 4.5 : -4.5, s: 1 - i * 0.035 }));

function Rosa() {
  return (
    <>
      <defs>
        <radialGradient id="g-rosa" cx="45%" cy="40%" r="60%">
          <stop offset="0" stopColor="#ff5a85" /><stop offset="1" stopColor="#b8103c" />
        </radialGradient>
      </defs>
      {ring(5, 18).map((a) => (
        <ellipse key={a} cx="0" cy="-20" rx="17" ry="14" fill="#d41b4c" stroke="#9e0f33" strokeWidth="1.2" transform={`rotate(${a})`} />
      ))}
      <circle r="23" fill="url(#g-rosa)" />
      <path d="M-2-2c6-6 12 0 8 6-6 6-16 2-16-6 0-10 12-16 22-10 10 6 6 22-6 26-14 4-26-6-24-18" fill="none" stroke="#8c0b2c" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M-14 12c6 6 18 6 24 0" fill="none" stroke="#ff8aa8" strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
    </>
  );
}
function Girasol() {
  return (
    <>
      {ring(16, 11).map((a) => <path key={'b' + a} d="M0-14C7-26 5-38 0-47-5-38-7-26 0-14Z" fill="#f2a20c" transform={`rotate(${a})`} />)}
      {ring(16).map((a) => <path key={a} d="M0-14C7-25 5-36 0-44-5-36-7-25 0-14Z" fill="#ffc928" stroke="#e59a00" strokeWidth=".8" transform={`rotate(${a})`} />)}
      <circle r="18" fill="#5b3010" />
      {GOLDEN.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.5" fill="#8a5420" />)}
    </>
  );
}
function Tulipan() {
  return (
    <>
      <path d="M-22-4c-4-24 8-38 18-40 2 14 0 30 2 54-12 2-18-4-20-14Z" fill="#b3123f" />
      <path d="M22-4c4-24-8-38-18-40-2 14 0 30-2 54 12 2 18-4 20-14Z" fill="#c4174a" />
      <path d="M-15 2c-2-26 9-40 15-46 6 6 17 20 15 46-4 14-26 14-30 0Z" fill="#ec3d6e" stroke="#b3123f" strokeWidth="1" />
      <path d="M-6-20c2-8 6-14 8-16" stroke="#ff9ab6" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".7" />
    </>
  );
}
function Margarita() {
  return (
    <>
      {ring(14).map((a) => <ellipse key={a} cx="0" cy="-24" rx="6.5" ry="19" fill="#fffdf6" stroke="#e8dcc6" strokeWidth="1" transform={`rotate(${a})`} />)}
      <circle r="11" fill="#ffc83a" stroke="#e6a21a" strokeWidth="1.5" />
      {GOLDEN.slice(0, 12).map(([x, y], i) => <circle key={i} cx={x * 0.6} cy={y * 0.6} r=".9" fill="#d48a10" />)}
    </>
  );
}
function Cosmos() {
  return (
    <>
      {ring(8, 22).map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0-7C12-13 17-34 11-45L5-41 0-46-5-41-11-45C-17-34-12-13 0-7Z" fill="#ff8cc6" stroke="#e5629f" strokeWidth="1" />
          <path d="M0-10V-38" stroke="#e5629f" strokeWidth=".8" opacity=".6" />
        </g>
      ))}
      <circle r="8" fill="#ffd23a" />
      <circle r="8" fill="none" stroke="#e8a500" strokeWidth="2" strokeDasharray="1.5 2" />
    </>
  );
}
function Lavanda() {
  return (
    <>
      <path d="M0 40V-42" stroke="#4f8a3d" strokeWidth="2.5" />
      {LAVENDER.map((p, i) => (
        <ellipse key={i} cx={p.x * p.s} cy={p.y} rx={5.5 * p.s} ry={4 * p.s} fill={i % 3 ? '#9a7ee0' : '#7c5cc9'} transform={`rotate(${p.x > 0 ? 25 : -25} ${p.x * p.s} ${p.y})`} />
      ))}
    </>
  );
}

const MAP: Record<FlowerId, () => React.ReactElement> = { rosa: Rosa, girasol: Girasol, tulipan: Tulipan, margarita: Margarita, cosmos: Cosmos, lavanda: Lavanda };

export function FlowerHead({ id, className }: { id: FlowerId; className?: string }) {
  const Comp = MAP[id];
  return (
    <svg className={className} viewBox="-50 -50 100 100" aria-hidden="true" overflow="visible">
      <Comp />
    </svg>
  );
}
