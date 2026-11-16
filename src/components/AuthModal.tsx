'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { getSupabase, hasSupabase } from '@/lib/supabase';
import { money } from '@/lib/catalog';
import { Modal } from './Modal';

type Mode = 'login' | 'signup';

/**
 * Confirmación del pedido.
 * - Sin cuentas conectadas, o con sesión ya iniciada: solo resumen + "¿Para quién es?" + Enviar.
 * - Con cuentas y sin sesión: el invitado es el camino principal; el correo queda plegado.
 */
export function CheckoutModal({ open, total, lines, signedIn, onClose, onConfirm }: {
  open: boolean;
  total: number;
  lines: { label: string; amount: number }[];
  signedIn: boolean;
  onClose: () => void;
  onConfirm: (recipient: string, who?: string) => void;
}) {
  const needsAccount = hasSupabase && !signedIn;
  const [recipient, setRecipient] = useState('');
  const [useEmail, setUseEmail] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (open) { setErr(''); setBusy(false); setUseEmail(false); } }, [open]);

  const to = recipient.trim();

  const sendDirect = () => onConfirm(to);

  const sendAsGuest = async () => {
    const supabase = await getSupabase();
    if (!supabase) return onConfirm(to);
    setBusy(true); setErr('');
    const { error } = await supabase.auth.signInAnonymously();
    setBusy(false);
    if (error) { setUseEmail(true); return setErr('Ahora no podemos enviarlo sin cuenta. Usa tu correo.'); }
    onConfirm(to, 'invitado');
  };

  const sendWithEmail = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = await getSupabase();
    if (!supabase) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Escribe un correo válido.');
    if (pass.length < 6) return setErr('La contraseña necesita al menos 6 caracteres.');
    setBusy(true); setErr('');
    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password: pass })
      : await supabase.auth.signUp({ email, password: pass });
    setBusy(false);
    if (error) return setErr(mode === 'login' ? 'Correo o contraseña incorrectos. ¿Quieres crear una cuenta?' : 'No pudimos crear la cuenta. Revisa los datos.');
    onConfirm(to, email);
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="checkout-title" className="checkout">
      <h2 id="checkout-title">Confirma tu ramo</h2>

      <ul className="summary">
        {lines.map((l) => <li key={l.label}><span>{l.label}</span><span>{money(l.amount)}</span></li>)}
        <li className="summary-total"><span>Total</span><span>{money(total)}</span></li>
      </ul>

      <label className="field">¿Para quién es? <span className="optional">(opcional)</span>
        <input value={recipient} onChange={(e) => setRecipient(e.target.value)} maxLength={40} placeholder="Ej: Mamá, Laura…" autoComplete="off" />
      </label>

      {!needsAccount && (
        <button type="button" className="btn wide send-btn" onClick={sendDirect}>Enviar ramo · {money(total)}</button>
      )}

      {needsAccount && (
        <>
          <button type="button" className="btn wide send-btn" onClick={sendAsGuest} disabled={busy}>
            {busy && !useEmail ? 'Enviando…' : `Enviar ramo · ${money(total)}`}
          </button>
          {!useEmail ? (
            <button type="button" className="link center-link" onClick={() => setUseEmail(true)}>¿Quieres guardarlo en tu cuenta? Usa tu correo</button>
          ) : (
            <div className="email-box">
              <div className="tabs" role="tablist">
                <button role="tab" aria-selected={mode === 'login'} onClick={() => setMode('login')}>Ya tengo cuenta</button>
                <button role="tab" aria-selected={mode === 'signup'} onClick={() => setMode('signup')}>Crear cuenta</button>
              </div>
              <form onSubmit={sendWithEmail} noValidate>
                <label className="field">Correo<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="tu@correo.com" /></label>
                <label className="field">Contraseña<input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Mínimo 6 caracteres" /></label>
                <button type="submit" className="btn wide alt" disabled={busy}>{busy ? 'Un momento…' : mode === 'login' ? 'Entrar y enviar' : 'Crear cuenta y enviar'}</button>
              </form>
            </div>
          )}
        </>
      )}
      <p className="err" role="alert">{err}</p>
    </Modal>
  );
}
