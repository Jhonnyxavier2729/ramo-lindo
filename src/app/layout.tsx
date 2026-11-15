import type { Metadata, Viewport } from 'next';
import { Shrikhand, DM_Sans, VT323, Caveat } from 'next/font/google';
import './globals.css';

const display = Shrikhand({ weight: '400', subsets: ['latin'], variable: '--font-display' });
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const led = VT323({ weight: '400', subsets: ['latin'], variable: '--font-led' });
const hand = Caveat({ subsets: ['latin'], variable: '--font-hand' });

export const metadata: Metadata = {
  title: 'Ramo Lindo · arma tu ramo',
  description: 'Florería interactiva: elige flores, envuélvelas con un lazo, escribe una nota a mano y envía tu ramo.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#3455db' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${led.variable} ${hand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
