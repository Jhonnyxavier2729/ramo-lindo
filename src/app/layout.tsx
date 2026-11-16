import type { Metadata, Viewport } from 'next';
import { Shrikhand, DM_Sans, VT323, Caveat } from 'next/font/google';
import { FlowerSprite } from '@/components/FlowerHead';
import './globals.css';

// Solo se precargan las fuentes que se ven al entrar; las demás llegan sin bloquear.
const display = Shrikhand({ weight: '400', subsets: ['latin'], variable: '--font-display' });
const body = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body' });
const led = VT323({ weight: '400', subsets: ['latin'], variable: '--font-led', preload: false });
const hand = Caveat({ subsets: ['latin'], weight: ['500'], variable: '--font-hand', preload: false });

export const metadata: Metadata = {
  title: 'Ramo Lindo · arma tu ramo',
  description: 'Florería interactiva: elige flores, envuélvelas con un lazo, escribe una nota a mano y envía tu ramo.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#3455db' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${led.variable} ${hand.variable}`}>
      <head>
        <link rel="preload" href="/wall.webp" as="image" type="image/webp" fetchPriority="high" />
      </head>
      <body>
        <FlowerSprite />
        {children}
      </body>
    </html>
  );
}
