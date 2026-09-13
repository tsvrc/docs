export function SceneIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <rect x="1" y="2" width="14" height="11" rx="1" fill="none" stroke="#9fb4c4" strokeWidth="1.3" />
      <circle cx="5.2" cy="6.2" r="1.2" fill="#9fb4c4" />
      <path
        d="M2 12l3.5-3.8 2.7 2.6 2.8-3.6L14 12"
        fill="none"
        stroke="#9fb4c4"
        strokeWidth="1.3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ScriptIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <path d="M3 1h6.5L13 4.5V15H3z" fill="#3c3c3c" stroke="#8a8a8a" strokeWidth="1" strokeLinejoin="round" />
      <path d="M9.5 1v3.5H13" fill="none" stroke="#8a8a8a" strokeWidth="1" strokeLinejoin="round" />
      <text x="8" y="12.5" fontSize="5.5" fontWeight="700" fill="#d2d2d2" textAnchor="middle" fontFamily="Inter, sans-serif">
        C#
      </text>
    </svg>
  );
}

export function PrefabIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <polygon points="8,1 14.5,4.6 8,8.2 1.5,4.6" fill="#7fc4ea" />
      <polygon points="8,8.2 14.5,4.6 14.5,11.6 8,15.2" fill="#357fac" />
      <polygon points="8,8.2 1.5,4.6 1.5,11.6 8,15.2" fill="#4c9fd4" />
    </svg>
  );
}

export function SparkleIcon({ size = 11, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
      <path d="M8 1.2l1.1 3.7 3.7 1.1-3.7 1.1L8 10.8l-1.1-3.7-3.7-1.1 3.7-1.1L8 1.2z" />
      <path d="M13 9.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6.6-1.9z" />
    </svg>
  );
}
