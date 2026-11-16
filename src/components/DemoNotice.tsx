'use client';
import { useEffect, useState } from 'react';
import { Modal } from './Modal';

const KEY = 'ramo-lindo:demo-notice';

/** Aviso al entrar: es una versión demo. Se muestra una vez por visita (pestaña). */
export function DemoNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === '1'; } catch { /* modo privado */ }
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 900); // deja ver primero la entrada animada
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try { sessionStorage.setItem(KEY, '1'); } catch { /* modo privado */ }
  };

  return (
    <Modal open={open} onClose={close} labelledBy="demo-title" className="demo-notice">
      <span className="demo-badge">Versión demo</span>
      <h2 id="demo-title">¡Bienvenido a Ramo Lindo!</h2>
      <p className="sub">Arma tu ramo, escribe una nota y “envíalo” para ver cómo funciona. Al ser una demo, no tiene todas las funciones completas:</p>
      <ul className="demo-list">
        <li><span aria-hidden="true">🚫</span>No se hacen pedidos, entregas ni pagos reales.</li>
        <li><span aria-hidden="true">📱</span>Tus ramos se guardan solo en este dispositivo.</li>
        <li><span aria-hidden="true">📤</span>Puedes exportar tu ramo como imagen y compartirlo cuando quieras.</li>
      </ul>
      <button className="btn wide send-btn" onClick={close}>Empezar a armar 💐</button>
    </Modal>
  );
}
