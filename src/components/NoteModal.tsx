'use client';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { getStroke } from 'perfect-freehand';
import { NOTE_PRICE, money, type Note } from '@/lib/catalog';
import { Modal } from './Modal';

const W = 480, H = 230;
const INK = '#3b1424';
const OPTIONS = { size: 5, thinning: 0.6, smoothing: 0.55, streamline: 0.5 };

// Convierte el contorno de perfect-freehand en un path SVG (receta de la librería).
function toPath(points: number[][]) {
  const stroke = getStroke(points, OPTIONS);
  if (!stroke.length) return '';
  const d = stroke.reduce<(string | number)[]>(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0.toFixed(1), y0.toFixed(1), ((x0 + x1) / 2).toFixed(1), ((y0 + y1) / 2).toFixed(1));
      return acc;
    },
    ['M', ...stroke[0].map((n) => n.toFixed(1)), 'Q'],
  );
  return d.join(' ') + ' Z';
}

export function NoteModal({ open, initial, onClose, onSave }: {
  open: boolean; initial: Note | null; onClose: () => void; onSave: (n: Note | null) => void;
}) {
  const [paths, setPaths] = useState<string[]>([]);
  const [current, setCurrent] = useState<number[][] | null>(null);
  const [text, setText] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!open) return;
    setText(initial?.text ?? '');
    setPaths(initial?.svg ? [...initial.svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]) : []);
  }, [open, initial]);

  const point = (e: PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H, e.pressure || 0.5];
  };
  const down = (e: PointerEvent<SVGSVGElement>) => { e.currentTarget.setPointerCapture(e.pointerId); setCurrent([point(e)]); };
  const move = (e: PointerEvent<SVGSVGElement>) => { if (current) setCurrent([...current, point(e)]); };
  const up = () => { if (current && current.length > 1) setPaths((p) => [...p, toPath(current)]); setCurrent(null); };

  const save = () => {
    const t = text.trim();
    const svg = paths.length
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${paths.map((d) => `<path fill="${INK}" d="${d}"/>`).join('')}</svg>`
      : null;
    onSave(t || svg ? { text: t, svg } : null);
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="note-title" className="note-modal">
      <h2 id="note-title">Una notita. Mucho amor.</h2>
      <p className="sub">Escribe sobre la tarjeta con el dedo o el mouse, o tipea abajo. +{money(NOTE_PRICE)}</p>
      <div className="card-area">
        <svg
          ref={svgRef} className="pad" viewBox={`0 0 ${W} ${H}`}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          role="img" aria-label="Área para escribir a mano"
        >
          {paths.map((d, i) => <path key={i} d={d} fill={INK} />)}
          {current && <path d={toPath(current)} fill={INK} />}
          {!paths.length && !current && <text x={W / 2} y={H / 2} textAnchor="middle" className="pad-hint">Escribe aquí ✍️</text>}
        </svg>
      </div>
      <label className="field">Tu mensaje
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={80} placeholder="Para ti. Porque sí ♡" />
      </label>
      <div className="row">
        <button className="link" onClick={() => setPaths([])}>Borrar trazo</button>
        <button className="btn" onClick={save}>Meterla en el ramo ↗</button>
      </div>
    </Modal>
  );
}
