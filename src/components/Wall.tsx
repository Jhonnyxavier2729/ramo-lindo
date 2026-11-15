// Pared de cuadros ondulados: patrón + ruido fractal que deforma la cuadrícula.
export function Wall() {
  return (
    <div className="wall" aria-hidden="true">
      <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="chk" width="160" height="160" patternUnits="userSpaceOnUse">
            <rect width="160" height="160" fill="#fff4e6" />
            <rect width="80" height="80" fill="#3455db" />
            <rect x="80" y="80" width="80" height="80" fill="#3455db" />
          </pattern>
          <filter id="wave" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.005" numOctaves="2" seed="11" />
            <feDisplacementMap in="SourceGraphic" scale="90" />
          </filter>
          <radialGradient id="light" cx="20%" cy="0%" r="80%">
            <stop offset="0" stopColor="#fff" stopOpacity=".35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="-80" y="-80" width="1360" height="760" fill="url(#chk)" filter="url(#wave)" />
        <rect width="1200" height="600" fill="url(#light)" />
      </svg>
    </div>
  );
}
