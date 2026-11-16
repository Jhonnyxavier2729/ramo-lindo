'use client';
import { useRef, type CSSProperties, type Ref } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { R, type Note, type RibbonId, type Stem } from '@/lib/catalog';
import { FlowerHead } from './FlowerHead';
import { Bow } from './Bow';

gsap.registerPlugin(useGSAP);

// Orden de llenado: del centro hacia afuera, como un ramo real.
const SLOTS = [0, -12, 12, -24, 24, -6, 6, -18, 18, -32, 32, -3, 3, -28, 28];

function StemView({ stem, i, isNew }: { stem: Omit<Stem, 'key'>; i: number; isNew: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const stalkRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  // Primero crece el tallo desde el papel y después la flor aparece arriba con un "pop".
  // (Antes se estiraba todo junto y la flor se veía aplastada o separada del tallo.)
  useGSAP(() => {
    if (!isNew) return;
    gsap.from(stalkRef.current, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.42, ease: 'power2.out' });
    gsap.from(popRef.current, { scale: 0, transformOrigin: '50% 65%', duration: 0.45, delay: 0.3, ease: 'back.out(2.4)' });
  }, []);
  const slot = SLOTS[i % SLOTS.length];
  const style = {
    '--a': `${slot + stem.j * 3}deg`,
    '--L': `${240 - Math.abs(slot) * 1.1 + stem.k * 12}px`,
    '--s': 1 + stem.k * 0.1,
    zIndex: Math.abs(slot),
  } as CSSProperties;
  return (
    <div className="stem" style={style}>
      <div className="stem-inner" ref={ref}>
        <span className="stalk" ref={stalkRef} />
        <span className={`head head-${stem.id}`}><span className="head-pop" ref={popRef}><FlowerHead id={stem.id} /></span></span>
      </div>
    </div>
  );
}

// Hojas de relleno: unas pocas hojas anchas que solo asoman por el borde del papel,
// detrás de las flores (más bajas que cualquier flor, así nunca parecen ramas sueltas).
const LEAVES = [
  { a: -36, L: 182, dark: false }, { a: 34, L: 178, dark: true }, { a: -10, L: 196, dark: true }, { a: 16, L: 190, dark: false },
];
function Leaf({ a, L, dark }: { a: number; L: number; dark: boolean }) {
  return (
    <svg className="leaf" style={{ '--a': `${a}deg`, height: L } as CSSProperties} viewBox={`0 0 40 ${L}`} aria-hidden="true">
      <path d={`M20 ${L}V66`} stroke="#3f8a35" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 70C2 54 3 18 20 2c17 16 18 52 0 68Z" fill={dark ? '#3f8a35' : '#5aa646'} />
      <path d="M20 66V10" stroke="#2f6b2c" strokeWidth="1.4" opacity=".5" />
    </svg>
  );
}

export function NoteCard({ note }: { note: Note }) {
  return (
    <div className="note-card">
      {note.svg && <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(note.svg)}`} alt="Nota escrita a mano" />}
      {note.text && <p>{note.text}</p>}
    </div>
  );
}

export function Bouquet({
  stems, ribbon, note, newestKey, innerRef, className = '',
}: {
  stems: (Omit<Stem, 'key'> & { key?: string })[];
  ribbon: RibbonId | null;
  note: Note | null;
  newestKey?: string | null;
  innerRef?: Ref<HTMLDivElement>;
  className?: string;
}) {
  return (
    <div className={`bouquet ${stems.length ? 'wrapped' : ''} ${className}`} ref={innerRef}>
      <svg className="paper-flat" viewBox="0 0 220 140" aria-hidden="true">
        <path d="M110 4 214 60 110 136 6 64Z" fill="#c9b6ff" stroke="#a58ff0" strokeWidth="2" />
        <path d="M110 4v132M6 64l208-4" stroke="#b7a1fa" strokeWidth="1.5" />
      </svg>
      <svg className="cone-back" viewBox="0 0 280 180" aria-hidden="true">
        <path d="M18 34 140 0l122 26-110 152h-24Z" fill="#b39cf5" />
      </svg>
      <div className="stems">
        {stems.length > 0 && LEAVES.slice(0, stems.length > 4 ? 4 : 3).map((l, i) => <Leaf key={i} {...l} />)}
        {stems.map((s, i) => <StemView key={s.key ?? i} stem={s} i={i} isNew={!!newestKey && s.key === newestKey} />)}
      </div>
      {note && <div className="tucked"><NoteCard note={note} /></div>}
      <svg className="cone" viewBox="0 0 280 180" aria-hidden="true">
        <defs>
          <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e4d9ff" /><stop offset=".55" stopColor="#cbb8ff" /><stop offset="1" stopColor="#ad94f2" />
          </linearGradient>
        </defs>
        <path d="M4 40q66 32 136 14t136-32L156 178h-32Z" fill="url(#paper)" stroke="#9a80e8" strokeWidth="2" />
        <path d="M140 54v124M66 64l66 114M214 40l-66 138" stroke="#9a80e8" strokeWidth="1.2" opacity=".55" />
      </svg>
      {ribbon && <div className="bow" key={ribbon}><Bow ribbon={R[ribbon]} /></div>}
    </div>
  );
}
