import type { Ribbon } from '@/lib/catalog';

export function Bow({ ribbon, className }: { ribbon: Ribbon; className?: string }) {
  const { color: c, dark: d, id } = ribbon;
  return (
    <svg className={className} viewBox="0 0 120 92" aria-hidden="true">
      <defs>
        <linearGradient id={`bow-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M56 44 34 88l11-7 6 9 10-43Z" fill={c} stroke={d} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M64 44l22 44-11-7-6 9-10-43Z" fill={c} stroke={d} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M60 40C42 8 6 6 8 30s34 22 52 12Z" fill={c} stroke={d} strokeWidth="1.5" />
      <path d="M60 40c18-32 54-34 52-10s-34 22-52 12Z" fill={c} stroke={d} strokeWidth="1.5" />
      <path d="M60 40C42 8 6 6 8 30s34 22 52 12Zm0 0c18-32 54-34 52-10s-34 22-52 12Z" fill={`url(#bow-${id})`} />
      <path d="M22 28c8-6 20-2 28 8m48-8c-8-6-20-2-28 8" stroke={d} strokeWidth="1.5" fill="none" opacity=".5" />
      <ellipse cx="60" cy="42" rx="9.5" ry="8.5" fill={d} />
      <ellipse cx="58" cy="39.5" rx="4" ry="2.5" fill="#fff" opacity=".3" />
    </svg>
  );
}
