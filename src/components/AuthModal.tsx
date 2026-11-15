'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase, isDemo } from '@/lib/supabase';
import { money } from '@/lib/catalog';
import { Modal } from './Modal';

type Mode = 'login' | 'signup';

/** Pide sesión antes de enviar. Si ya hay sesión, el padre ni lo abre. */
export function AuthModal({ open, total, onClose, onAuthed }: {
  open: boolean; total: number; onClose: () => void; onAuthed: (label: string) => void;
}) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) { setErr(''); setBusy(false); } }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Escribe un correo válido.');
    if (pass.length < 6) return setErr('La contraseña necesita al menos 6 caracteres.');
    if (!supabase) return onAuthed(email);
    setBusy(true); setErr('');
    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password: pass })
      : await supabase.auth.signUp({ email, password: pass });
    setBusy(false);
    if (error) return setErr(mode === 'login' && error.message.includes('Invalid') ? 'Correo o contraseña incorrectos. ¿Quieres crear una cuenta?' : error.message);
    onAuthed(email);
  };

  const guest = async () => {
    if (!supabase) return onAuthed('invitado');
    setBusy(true); setErr('');
    const { error } = await supabase.auth.signInAnonymously();
    setBusy(false);
    if (error) return setErr('El acceso como invitado no está activo en Supabase. ' + error.message);
    onAuthed('invitado');
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="auth-title">
      <h2 id="auth-title">Un último paso</h2>
      <p className="sub">Inicia sesión para enviar tu ramo de <b>{money(total)}</b>.</p>
      <button type="button" className="btn guest" onClick={guest} disabled={busy}>Entrar como invitado ⚡</button>
      <div className="divider"><span>o con tu correo</span></div>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={mode === 'login'} onClick={() => setMode('login')}>Iniciar sesión</button>
        <button role="tab" aria-selected={mode === 'signup'} onClick={() => setMode('signup')}>Crear cuenta</button>
      </div>
      <form onSubmit={submit} noValidate>
        <label className="field">Correo<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@correo.com" /></label>
        <label className="field">Contraseña<input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="••••••" /></label>
        <p className="err" role="alert">{err}</p>
        <button type="submit" className="btn wide" disabled={busy}>{busy ? 'Un momento…' : mode === 'login' ? 'Entrar y enviar' : 'Crear cuenta y enviar'}</button>
      </form>
      {isDemo && <p className="demo-tag">Modo demo: sin claves de Supabase el pedido se guarda en este navegador.</p>}
    </Modal>
  );
}
