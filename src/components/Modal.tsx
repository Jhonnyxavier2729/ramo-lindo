'use client';
import { useEffect, type ReactNode } from 'react';

export function Modal({ open, onClose, labelledBy, children, className = '' }: {
  open: boolean; onClose: () => void; labelledBy: string; children: ReactNode; className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  return (
    <div className={`backdrop ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()} inert={!open}>
      <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <button className="close" onClick={onClose} aria-label="Cerrar">×</button>
        {children}
      </div>
    </div>
  );
}
