'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { canCopyImage, canShareFile, copyImage, download, fileFrom, renderPng, shareText } from '@/lib/share';
import { Modal } from './Modal';
import { FlowerHead } from './FlowerHead';
import { ShareCard, type ShareData } from './ShareCard';

type Status = 'idle' | 'working' | 'ready' | 'error';

/**
 * Exportar el ramo: genera un PNG y ofrece las salidas que el dispositivo soporte.
 * - Celular / Windows / macOS: menú nativo de compartir (WhatsApp, Instagram, correo…)
 * - Siempre: descargar PNG
 * - PC: copiar la imagen para pegarla (WhatsApp Web, Slack, Word…)
 */
export function ShareModal({ open, data, onClose }: { open: boolean; data: ShareData | null; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [nativeShare, setNativeShare] = useState(false);
  const [copyOk, setCopyOk] = useState(false);

  useEffect(() => {
    if (!open || !data) return;
    let cancelled = false;
    setStatus('working'); setMsg(''); setBlob(null);
    // Esperamos un par de frames para que la tarjeta oculta termine de pintarse.
    const t = setTimeout(async () => {
      try {
        const b = await renderPng(cardRef.current!);
        if (cancelled) return;
        setBlob(b);
        setPreview((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(b); });
        setNativeShare(canShareFile(fileFrom(b)));
        setCopyOk(canCopyImage());
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }, 120);
    return () => { cancelled = true; clearTimeout(t); };
  }, [open, data]);

  const text = shareText(data?.recipient ?? '');

  const share = async () => {
    if (!blob) return;
    try {
      await navigator.share({ files: [fileFrom(blob)], title: 'Mi ramo · Ramo Lindo', text });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setMsg('No se pudo abrir el menú de compartir. Descarga la imagen.');
    }
  };
  const save = () => { if (blob) { download(blob); setMsg('Imagen descargada ✓'); } };
  const copy = async () => {
    if (!blob) return;
    try { await copyImage(blob); setMsg('Imagen copiada ✓'); }
    catch { setMsg('Tu navegador no dejó copiar la imagen. Descárgala.'); }
  };
  const whatsapp = () => {
    if (blob) download(blob);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    setMsg('Descargamos la imagen: adjúntala en el chat de WhatsApp que se abrió.');
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="share-title" className="share-modal">
      <h2 id="share-title">Exporta tu ramo</h2>
      <p className="sub">Guárdalo como imagen o compártelo donde quieras.</p>

      <div className="share-body">
      <div className={`share-preview ${status === 'working' ? 'loading' : ''}`}>
        {status === 'working' && (
          <div className="share-wait" role="status">
            <FlowerHead id="margarita" className="spin" />
            <span>Preparando tu imagen…</span>
          </div>
        )}
        {status === 'error' && <p className="share-wait">No pudimos crear la imagen. Intenta de nuevo.</p>}
        {status === 'ready' && preview && <img src={preview} alt="Vista previa de tu ramo" />}
      </div>
      <div>

      {/* Los botones aparecen cuando ya sabemos qué soporta el dispositivo: así no "saltan" de color. */}
      {status === 'ready' ? (
        <div className="share-actions">
          {nativeShare && <button className="btn wide send-btn" onClick={share}>Compartir…</button>}
          <button className={`btn wide ${nativeShare ? 'alt' : 'send-btn'}`} onClick={save}>Descargar PNG</button>
          <div className="share-row">
            {copyOk && <button className="btn alt" onClick={copy}>Copiar imagen</button>}
            {!nativeShare && <button className="btn alt whatsapp" onClick={whatsapp}>WhatsApp</button>}
          </div>
        </div>
      ) : (
        <div className="share-actions" aria-hidden="true">
          <span className="btn-skeleton" /><span className="btn-skeleton" /><span className="btn-skeleton" />
        </div>
      )}
      <p className="share-msg" role="status">{msg}</p>
      </div>
      </div>

      {open && data && createPortal(<ShareCard data={data} innerRef={cardRef} />, document.body)}
    </Modal>
  );
}
