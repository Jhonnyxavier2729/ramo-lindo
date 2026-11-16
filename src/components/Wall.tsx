// Pared de cuadros ondulados.
// Rendimiento: antes era un filtro SVG (feTurbulence + feDisplacementMap) calculado en
// vivo, lo que costaba segundos de CPU en celulares. Ahora es una imagen pre-renderizada
// (public/wall.webp, 63 KB) generada a partir del mismo SVG.
export function Wall() {
  return <div className="wall" aria-hidden="true" />;
}
