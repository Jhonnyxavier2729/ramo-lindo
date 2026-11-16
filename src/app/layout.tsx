import type { Metadata, Viewport } from 'next';
import { Shrikhand, DM_Sans, VT323, Caveat } from 'next/font/google';
import { FlowerSprite } from '@/components/FlowerHead';
import './globals.css';

// Solo se precargan las fuentes que se ven al entrar; las demás llegan sin bloquear.
const display = Shrikhand({ weight: '400', subsets: ['latin'], variable: '--font-display' });
const body = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body' });
const led = VT323({ weight: '400', subsets: ['latin'], variable: '--font-led', preload: false });
const hand = Caveat({ subsets: ['latin'], weight: ['500'], variable: '--font-hand', preload: false });

const DESCRIPTION = 'Elige tus flores, envuélvelas con un lazo, escribe una nota a mano y comparte tu ramo.';

// Open Graph: lo que WhatsApp, Instagram, Facebook o X muestran al pegar el link.
// La imagen 1200×630 está en src/app/opengraph-image.png (Next la enlaza sola).
export const metadata: Metadata = {
  metadataBase: new URL('https://ramo-lindo.vercel.app'),
  title: 'Ramo Lindo · arma tu ramo',
  description: DESCRIPTION,
  openGraph: {
    title: 'Ramo Lindo 💐 Arma tu ramo',
    description: DESCRIPTION,
    url: '/',
    siteName: 'Ramo Lindo',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Ramo Lindo 💐 Arma tu ramo', description: DESCRIPTION },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ef7fae' };

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
