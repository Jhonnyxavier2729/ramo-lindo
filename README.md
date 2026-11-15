# 💐 Ramo Lindo

Florería interactiva donde armas un ramo como en una tienda de verdad: tocas las cajas de la repisa y cada flor vuela hasta el papel, eliges un lazo, escribes una nota a mano y lo envías desde una caja registradora que va sumando el total.

> Proyecto de portafolio. Mobile-first: en el celular la repisa es un carrusel y la caja registradora es una barra fija con el total y el botón **Enviar**.

## Funciones
- **6 flores ilustradas en SVG** (rosa, girasol, tulipán, margarita, cosmos, lavanda), dibujadas a mano en código.
- **Animaciones con GSAP**: entrada de la escena, vuelo de cada flor al ramo, tallos que crecen, total que "cuenta".
- **Nota a mano** con `perfect-freehand` (funciona con dedo, mouse o lápiz) y se guarda como SVG.
- **Caja registradora** con recibo que se imprime línea por línea.
- **Música ambiental y efectos** con Howler. El audio se genera con `npm run audio`, sin archivos de terceros.
- **Login con Supabase**: correo/contraseña sin confirmación por email, o **entrar como invitado** con un clic.
- **Mis ramos**: historial de pedidos con la vista previa de cada ramo.
- **Modo demo**: sin claves de Supabase todo funciona y los pedidos se guardan en `localStorage`.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript · GSAP · perfect-freehand · Howler · Supabase (Auth + Postgres + RLS) · Vercel (hosting + cron).

## Correr en local
```bash
npm install
npm run dev
```
Abre http://localhost:3000. Sin `.env.local` funciona en modo demo.

## Conectar Supabase (gratis)
1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor** → pega y ejecuta [`supabase/schema.sql`](supabase/schema.sql).
3. **Authentication → Sign In / Providers**:
   - *Email* → desactiva **Confirm email** (así no se envían correos).
   - Activa **Allow anonymous sign-ins** (botón "Entrar como invitado").
4. **Project Settings → API** → copia la URL y la `anon` key en `.env.local` (usa `.env.example` de guía).

## Deploy en Vercel
1. Importa el repo en [vercel.com/new](https://vercel.com/new).
2. Agrega las variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `CRON_SECRET`.
3. Deploy. El cron de `vercel.json` llama a `/api/keepalive` una vez al día para que Supabase (plan gratis) no se pause por inactividad.

## Estructura
```
src/
  app/            page.tsx (tienda) · mis-ramos/ · api/keepalive/
  components/     Shop, Bouquet, FlowerHead, Bow, Register, NoteModal, AuthModal, Wall, Modal
  lib/            catalog (precios), orders (Supabase/localStorage), audio (Howler), supabase
supabase/schema.sql
scripts/generate-audio.mjs
```
