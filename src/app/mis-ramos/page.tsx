'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listOrders, type SavedOrder } from '@/lib/orders';
import { money } from '@/lib/catalog';
import { Bouquet } from '@/components/Bouquet';

export default function MisRamos() {
  const [state, setState] = useState<{ orders: SavedOrder[]; mode: 'cloud' | 'demo' } | null>(null);
  useEffect(() => { listOrders().then(setState); }, []);

  return (
    <main className="orders-page">
      <header className="orders-head">
        <Link href="/" className="pill">← Volver a la tienda</Link>
        <h1>Mis ramos</h1>
        {state && <p className="sub">Los ramos que has enviado.</p>}
      </header>
      {!state && <p className="sub center-text">Cargando…</p>}
      {state && !state.orders.length && (
        <div className="empty-orders">
          <p>Todavía no has enviado ningún ramo.</p>
          <Link href="/" className="btn">Armar mi primer ramo</Link>
        </div>
      )}
      <ul className="orders-grid">
        {state?.orders.map((o) => (
          <li key={o.id} className="order-card">
            <div className="mini"><Bouquet stems={o.stems} ribbon={o.ribbon} note={o.note_text || o.note_svg ? { text: o.note_text ?? '', svg: o.note_svg } : null} /></div>
            <div className="order-meta">
              <b>{money(Number(o.total))}</b>
              <span>{o.stems.length} tallos</span>
              <time dateTime={o.created_at}>{new Date(o.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
