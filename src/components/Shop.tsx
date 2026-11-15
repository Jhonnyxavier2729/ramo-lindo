'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  FLOWERS, RIBBONS, MAX_STEMS, MIN_FOR_RIBBON, NOTE_PRICE, money, orderTotal, receiptLines,
  type FlowerId, type Note, type RibbonId, type Stem,
} from '@/lib/catalog';
import { playSfx, setMusic } from '@/lib/audio';
import { supabase } from '@/lib/supabase';
import { saveOrder } from '@/lib/orders';
import { FlowerHead } from './FlowerHead';
import { Bow } from './Bow';
import { Bouquet } from './Bouquet';
import { Register, MobileBar } from './Register';
import { NoteModal } from './NoteModal';
import { AuthModal } from './AuthModal';
import { Modal } from './Modal';
import { Wall } from './Wall';

gsap.registerPlugin(useGSAP);

type Hist = { t: 'stem' } | { t: 'ribbon'; prev: RibbonId | null } | { t: 'note'; prev: Note | null };
interface Flyer { key: string; id: FlowerId; from: DOMRect; to: DOMRect }

function FlyerView({ f, onDone }: { f: Flyer; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const x0 = f.from.left + f.from.width / 2, y0 = f.from.top + f.from.height / 2;
    const x1 = f.to.left + f.to.width / 2, y1 = f.to.top + f.to.height * 0.32;
    const peak = Math.min(y0, y1) - 90;
    gsap.set(ref.current, { x: x0, y: y0, xPercent: -50, yPercent: -50 });
    gsap.timeline({ onComplete: onDone })
      .to(ref.current, { x: x1, duration: 0.65, ease: 'power1.inOut' }, 0)
      .to(ref.current, { y: peak, duration: 0.3, ease: 'power2.out' }, 0)
      .to(ref.current, { y: y1, duration: 0.35, ease: 'power2.in' }, 0.3)
      .to(ref.current, { rotation: 300, scale: 1.25, duration: 0.65, ease: 'none' }, 0);
  }, []);
  return <div className="flyer" ref={ref}><FlowerHead id={f.id} /></div>;
}

function petals() {
  const colors = ['#ff8cc6', '#ff6a3d', '#c9b6ff', '#5aa9ff', '#fff4e6'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.style.background = colors[i % colors.length];
    document.body.appendChild(p);
    gsap.fromTo(p,
      { x: Math.random() * innerWidth, y: -30, rotation: Math.random() * 360, scale: 0.6 + Math.random() * 0.8 },
      { y: innerHeight + 40, x: `+=${(Math.random() - 0.5) * 200}`, rotation: `+=${360 + Math.random() * 360}`, duration: 2.4 + Math.random() * 2, delay: Math.random() * 0.6, ease: 'power1.in', onComplete: () => p.remove() });
  }
}

export default function Shop() {
  const [stems, setStems] = useState<Stem[]>([]);
  const [ribbon, setRibbon] = useState<RibbonId | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [history, setHistory] = useState<Hist[]>([]);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [newest, setNewest] = useState<string | null>(null);
  const [music, setMusicOn] = useState(false);
  const [modal, setModal] = useState<null | 'note' | 'auth' | 'done' | 'how'>(null);
  const [user, setUser] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ mode: 'cloud' | 'demo'; summary: string } | null>(null);
  const [toast, setToast] = useState('');
  const [shake, setShake] = useState(0);
  const bouquetRef = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const total = orderTotal(stems, ribbon, !!note);
  const lines = useMemo(() => receiptLines(stems, ribbon, !!note), [stems, ribbon, note]);
  const n = stems.length;

  // Sesión de Supabase (si está configurado)
  useEffect(() => {
    if (!supabase) return;
    const label = (u: { email?: string; is_anonymous?: boolean } | undefined) => (u ? (u.is_anonymous ? 'invitado' : u.email ?? 'tú') : null);
    supabase.auth.getSession().then(({ data }) => setUser(label(data.session?.user)));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(label(s?.user)));
    return () => data.subscription.unsubscribe();
  }, []);

  // Entrada animada de la escena
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'back.out(1.6)' } })
        .from('.sign', { y: -140, rotation: -10, duration: 0.9, ease: 'bounce.out' })
        .from('.item', { y: 40, opacity: 0, stagger: 0.06, duration: 0.5 }, '-=0.4')
        .from('.bouquet', { scale: 0.6, opacity: 0, duration: 0.6 }, '-=0.3')
        .from('.register, .side > *', { y: 30, opacity: 0, stagger: 0.08, duration: 0.5 }, '-=0.4');
    });
  }, { scope: root });

  const say = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2300);
  }, []);

  const addStem = (id: FlowerId, el: HTMLElement) => {
    if (n + flyers.length >= MAX_STEMS) return say('El ramo está lleno 💐');
    playSfx('pop');
    const key = crypto.randomUUID();
    const to = bouquetRef.current!.getBoundingClientRect();
    setFlyers((f) => [...f, { key, id, from: el.getBoundingClientRect(), to }]);
  };
  const land = (f: Flyer) => {
    setFlyers((all) => all.filter((x) => x.key !== f.key));
    setStems((s) => [...s, { key: f.key, id: f.id, j: Math.random() * 2 - 1, k: Math.random() * 2 - 1 }]);
    setHistory((h) => [...h, { t: 'stem' }]);
    setNewest(f.key);
  };

  const chooseRibbon = (id: RibbonId) => {
    if (ribbon === id) return;
    setHistory((h) => [...h, { t: 'ribbon', prev: ribbon }]);
    setRibbon(id); playSfx('ding');
  };

  const saveNote = (next: Note | null) => {
    setModal(null);
    if (!next && !note) return;
    setHistory((h) => [...h, { t: 'note', prev: note }]);
    setNote(next);
    if (next) { playSfx('ding'); say('Tu nota quedó entre las flores ✉️'); }
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    if (last.t === 'stem') setStems((s) => s.slice(0, -1));
    if (last.t === 'ribbon') setRibbon(last.prev);
    if (last.t === 'note') setNote(last.prev);
    setNewest(null); playSfx('undo');
  };

  const finish = async (who: string) => {
    setUser(who);
    const res = await saveOrder({ stems, ribbon, note, total });
    setSaved({
      mode: res.mode,
      summary: `${n} tallos${ribbon ? ', lazo ' + RIBBONS.find((r) => r.id === ribbon)!.name.toLowerCase() : ''}${note ? ' y tu nota' : ''} · ${money(total)}`,
    });
    setModal('done'); playSfx('ding'); petals();
  };

  const send = () => {
    if (!n) { setShake((s) => s + 1); playSfx('undo'); return say('Primero elige algunas flores 🌷'); }
    playSfx('ching');
    if (user) finish(user); else setModal('auth');
  };

  const reset = () => { setStems([]); setRibbon(null); setNote(null); setHistory([]); setNewest(null); setModal(null); };

  const toggleMusic = () => { const on = !music; setMusicOn(on); setMusic(on); };

  const signOut = async () => { await supabase?.auth.signOut(); setUser(null); say('Sesión cerrada'); };

  const step = !n ? 0 : n < MIN_FOR_RIBBON || !ribbon ? 1 : !note ? 2 : 3;
  const hint = [
    'Toca las flores de la repisa para armar tu ramo.',
    n < MIN_FOR_RIBBON ? `Lleva ${n}. Suma ${MIN_FOR_RIBBON - n} más y elige un lazo.` : '¡Qué lindo! Ahora elige un lazo.',
    '¿Le agregas una nota escrita a mano?',
    'Todo listo. Presiona ENVIAR FLORES.',
  ][step];

  return (
    <div ref={root} className="shop">
      <header className="top">
        <Wall />
        <div className="pills">
          <button className="pill" onClick={() => setModal('how')}>¿Cómo funciona?</button>
          <button className={`pill ${music ? 'on' : ''}`} onClick={toggleMusic} aria-pressed={music}>{music ? '♪ Música on' : '♪ Música'}</button>
          <Link className="pill" href="/mis-ramos">Mis ramos</Link>
          {user && <button className="pill" onClick={signOut} title="Cerrar sesión">👤 {user.split('@')[0]} · salir</button>}
        </div>
        <div className="sign"><h1>Ramo<br />Lindo</h1><span className="sign-sub">florería de barrio</span></div>
        <nav className="shelf-scroll" aria-label="Flores disponibles">
          <div className="shelf">
            {FLOWERS.map((f, i) => {
              const count = stems.filter((s) => s.id === f.id).length;
              return (
                <button key={f.id} className="item" onClick={(e) => addStem(f.id, e.currentTarget.querySelector('.bunch') as HTMLElement)} aria-label={`Agregar ${f.name}, ${money(f.price)}`}>
                  {count > 0 && <span className="badge" key={count}>{count}</span>}
                  <span className="bunch" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((k) => <FlowerHead key={k} id={f.id} className={`b b${k}`} />)}
                  </span>
                  <span className="crate" style={{ '--c': f.crate } as CSSProperties} />
                  <span className="tag" style={{ '--r': `${i % 2 ? 2 : -2}deg` } as CSSProperties}><b>{f.name}</b>{money(f.price)}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="counter">
        <div className="backsplash" aria-hidden="true" />
        <div className="layout">
          <section className="left">
            <Register total={total} lines={lines} stems={n} onSend={send} shake={shake} />
          </section>

          <section className="center">
            <ol className="stepper" aria-label="Progreso">
              {['Flores', 'Lazo', 'Nota', 'Enviar'].map((s, i) => (
                <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''}><span>{i < step ? '✓' : i + 1}</span>{s}</li>
              ))}
            </ol>
            <Bouquet stems={stems} ribbon={ribbon} note={note} newestKey={newest} innerRef={bouquetRef} />
            <p className="hint" aria-live="polite">{hint}</p>
            <button className="undo" onClick={undo} disabled={!history.length}>↶ Deshacer</button>
          </section>

          <section className="side">
            <div className="finish">El toque final</div>
            <div className="ribbons">
              {RIBBONS.map((r) => (
                <button key={r.id} className={`ribbon ${ribbon === r.id ? 'on' : ''}`} disabled={n < MIN_FOR_RIBBON} aria-pressed={ribbon === r.id} onClick={() => chooseRibbon(r.id)}>
                  <Bow ribbon={r} />
                  <small>{r.name}<br />+{money(r.price)}</small>
                </button>
              ))}
            </div>
            <p className="ribbon-hint">{n < MIN_FOR_RIBBON ? `Elige al menos ${MIN_FOR_RIBBON} tallos (${n}/${MIN_FOR_RIBBON})` : 'Toca un lazo para envolver'}</p>
            <button className="note-btn" onClick={() => setModal('note')}>
              <span className="env" aria-hidden="true">✉️</span>
              <span>{note ? 'Nota guardada ✓ · editar' : `Escribe una nota a mano · +${money(NOTE_PRICE)}`}</span>
            </button>
          </section>
        </div>
      </main>

      <MobileBar total={total} lines={lines} onSend={send} />

      {flyers.map((f) => <FlyerView key={f.key} f={f} onDone={() => land(f)} />)}

      <NoteModal open={modal === 'note'} initial={note} onClose={() => setModal(null)} onSave={saveNote} />
      <AuthModal open={modal === 'auth'} total={total} onClose={() => setModal(null)} onAuthed={finish} />

      <Modal open={modal === 'done'} onClose={reset} labelledBy="done-title" className="success">
        <div className="big" aria-hidden="true">💐</div>
        <h2 id="done-title">¡Tu ramo va en camino!</h2>
        <p className="sub">{saved?.summary}</p>
        <p className="sub">{saved?.mode === 'cloud' ? 'Guardado en tu cuenta.' : 'Guardado en este navegador (modo demo).'}</p>
        <div className="row center-row">
          <Link className="btn alt" href="/mis-ramos">Ver mis ramos</Link>
          <button className="btn" onClick={reset}>Armar otro ramo</button>
        </div>
      </Modal>

      <Modal open={modal === 'how'} onClose={() => setModal(null)} labelledBy="how-title" className="howto">
        <h2 id="how-title">¿Cómo funciona?</h2>
        <ol>
          <li>Toca las cajas de la repisa para sumar tallos al ramo.</li>
          <li>Con {MIN_FOR_RIBBON} tallos o más, elige un lazo para envolverlo.</li>
          <li>Si quieres, escribe una nota a mano.</li>
          <li>Presiona <b>ENVIAR FLORES</b> en la caja registradora.</li>
        </ol>
        <p className="sub">Proyecto de portafolio · Next.js, GSAP, Supabase y Vercel.</p>
      </Modal>

      <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast}</div>
    </div>
  );
}

