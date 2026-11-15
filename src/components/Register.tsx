'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { money } from '@/lib/catalog';

/** Número que "cuenta" hasta el nuevo total, como una caja registradora. */
export function useCountUp(target: number) {
  const [shown, setShown] = useState(target);
  const obj = useRef({ v: target });
  useEffect(() => {
    const t = gsap.to(obj.current, { v: target, duration: 0.5, ease: 'power3.out', onUpdate: () => setShown(obj.current.v) });
    return () => { t.kill(); };
  }, [target]);
  return money(shown);
}

export function Receipt({ lines, total }: { lines: { label: string; amount: number }[]; total: number }) {
  return (
    <div className="receipt" aria-live="polite">
      {lines.length ? (
        <>
          {lines.map((l) => <div key={l.label} className="r-line"><span>{l.label}</span><span>{money(l.amount)}</span></div>)}
          <hr />
          <div className="r-line tot"><span>TOTAL</span><span>{money(total)}</span></div>
        </>
      ) : <div className="r-line empty">· · · · ·</div>}
    </div>
  );
}

/** Caja registradora completa (escritorio). */
export function Register({ total, lines, stems, onSend, shake }: {
  total: number; lines: { label: string; amount: number }[]; stems: number; onSend: () => void; shake: number;
}) {
  const display = useCountUp(total);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (shake) gsap.fromTo(ref.current, { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
  }, [shake]);
  return (
    <div className="register" ref={ref}>
      <Receipt lines={lines} total={total} />
      <div className="reg-body">
        <div className="reg-plate">RAMO·MATIC</div>
        <div className="display">{display}</div>
        <div className="keys" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} />)}</div>
        <button className="send" onClick={onSend}>ENVIAR FLORES</button>
        <div className="drawer" aria-hidden="true" />
      </div>
      <p className="reg-foot">{stems} {stems === 1 ? 'tallo' : 'tallos'} · hecho para ti</p>
    </div>
  );
}

/** Barra fija inferior en móvil: total + recibo desplegable + enviar. */
export function MobileBar({ total, lines, onSend }: { total: number; lines: { label: string; amount: number }[]; onSend: () => void }) {
  const display = useCountUp(total);
  const [open, setOpen] = useState(false);
  return (
    <div className={`mobile-bar ${open ? 'open' : ''}`}>
      {open && <Receipt lines={lines} total={total} />}
      <div className="mb-row">
        <button className="mb-total" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Ver recibo">
          <span className="display small">{display}</span>
          <span className="mb-toggle">{open ? 'Ocultar ▾' : 'Recibo ▴'}</span>
        </button>
        <button className="send" onClick={onSend}>ENVIAR 💐</button>
      </div>
    </div>
  );
}
