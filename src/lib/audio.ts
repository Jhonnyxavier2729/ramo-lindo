'use client';
import type { Howl as HowlType } from 'howler';

// Solo música de fondo, opcional (botón "♪ Música"). Sin efectos en los clics.
// Howler se carga en el navegador únicamente cuando el usuario activa la música.
let ready: Promise<void> | null = null;
let music: HowlType | null = null;
let musicWanted = false;

function init() {
  if (!ready) {
    ready = import('howler').then(({ Howl }) => {
      music = new Howl({ src: ['/audio/musica.wav'], loop: true, volume: 0 });
    });
  }
  return ready;
}

export async function setMusic(on: boolean) {
  musicWanted = on;
  await init();
  if (!music) return;
  if (on) {
    if (!music.playing()) music.play();
    music.fade(music.volume(), 0.45, 900);
  } else {
    music.fade(music.volume(), 0, 600);
    setTimeout(() => { if (!musicWanted) music?.pause(); }, 650);
  }
}
