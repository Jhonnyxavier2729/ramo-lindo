'use client';
import type { Howl as HowlType } from 'howler';

// Howler se carga solo en el navegador y solo después del primer toque del usuario.
type Sfx = 'pop' | 'ding' | 'ching' | 'undo';
let ready: Promise<void> | null = null;
let music: HowlType | null = null;
const sfx: Partial<Record<Sfx, HowlType>> = {};
let musicWanted = false;

function init() {
  if (!ready) {
    ready = import('howler').then(({ Howl }) => {
      music = new Howl({ src: ['/audio/ambient.wav'], loop: true, volume: 0, html5: false });
      (['pop', 'ding', 'ching', 'undo'] as Sfx[]).forEach((k) => {
        sfx[k] = new Howl({ src: [`/audio/${k}.wav`], volume: k === 'ching' ? 0.35 : 0.5 });
      });
    });
  }
  return ready;
}

export function playSfx(k: Sfx) {
  init().then(() => sfx[k]?.play());
}

export async function setMusic(on: boolean) {
  musicWanted = on;
  await init();
  if (!music) return;
  if (on) {
    if (!music.playing()) music.play();
    music.fade(music.volume(), 0.55, 1200);
  } else {
    music.fade(music.volume(), 0, 700);
    setTimeout(() => { if (!musicWanted) music?.pause(); }, 750);
  }
}
