'use client';

export const CARD_W = 1080;
export const CARD_H = 1350; // 4:5, el formato vertical que mejor se ve en WhatsApp e Instagram
export const SITE_URL = 'https://ramo-lindo.vercel.app';

/** Convierte la tarjeta del ramo (un nodo del DOM) en un PNG. */
export async function renderPng(node: HTMLElement): Promise<Blob> {
  const { toBlob } = await import('html-to-image');
  await document.fonts?.ready;
  const opts = { width: CARD_W, height: CARD_H, pixelRatio: 1, cacheBust: true };
  // Safari a veces omite fuentes/imágenes en la primera pasada: hacemos una de calentamiento.
  await toBlob(node, opts).catch(() => null);
  const blob = await toBlob(node, opts);
  if (!blob) throw new Error('No se pudo crear la imagen');
  return blob;
}

export const fileFrom = (blob: Blob, name = 'mi-ramo-lindo.png') => new File([blob], name, { type: 'image/png' });

/** Menú nativo de compartir con archivo (celulares y Windows/macOS en navegadores compatibles). */
export function canShareFile(file: File) {
  return typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });
}

export function canCopyImage() {
  return typeof window !== 'undefined' && 'ClipboardItem' in window && !!navigator.clipboard?.write;
}

export function download(blob: Blob, name = 'mi-ramo-lindo.png') {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function copyImage(blob: Blob) {
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

export const shareText = (recipient: string) =>
  `${recipient ? `Un ramo para ${recipient} 💐` : 'Mira el ramo que armé 💐'} · Arma el tuyo en ${SITE_URL}`;
