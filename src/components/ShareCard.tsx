import type { Ref } from 'react';
import { R, type Note, type RibbonId, type Stem } from '@/lib/catalog';
import { Bouquet } from './Bouquet';
import { InlineFlowers } from './FlowerHead';

export interface ShareData {
  stems: Omit<Stem, 'key'>[];
  ribbon: RibbonId | null;
  note: Note | null;
  recipient: string;
  total: number;
}

/** Tarjeta 1080×1350 que se convierte en PNG. Vive fuera de pantalla mientras se exporta. */
export function ShareCard({ data, innerRef }: { data: ShareData; innerRef: Ref<HTMLDivElement> }) {
  const n = data.stems.length;
  const details = [
    `${n} ${n === 1 ? 'tallo' : 'tallos'}`,
    data.ribbon ? `lazo ${R[data.ribbon].name.toLowerCase()}` : null,
    data.note ? 'nota a mano' : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="share-stage" aria-hidden="true">
      <InlineFlowers.Provider value={true}>
      <div className="share-card" ref={innerRef}>
        <div className="sc-wall" />
        <div className="sc-sign"><span>Ramo<br />Lindo</span></div>
        <p className="sc-for">{data.recipient ? `Para ${data.recipient}` : 'Hecho con cariño'}</p>
        <div className="sc-bouquet">
          <Bouquet stems={data.stems} ribbon={data.ribbon} note={data.note} />
        </div>
        <div className="sc-ticket">
          <span className="sc-details">{details}</span>
          <span className="sc-url">Arma el tuyo en ramo-lindo.vercel.app</span>
        </div>
      </div>
      </InlineFlowers.Provider>
    </div>
  );
}
