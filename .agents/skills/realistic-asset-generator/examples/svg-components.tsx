import React from 'react';

/**
 * 1. Holographic Pass Card SVG
 * Bespoke vector graphic representing a high-end insurance or VIP membership card
 */
export const HolographicPassCardSVG: React.FC<{
  cardholderName: string;
  memberId: string;
  tierLabel: string;
  qrCodeUrl?: string;
}> = ({ cardholderName, memberId, tierLabel }) => (
  <svg
    viewBox="0 0 540 340"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto rounded-2xl shadow-2xl overflow-hidden"
  >
    <defs>
      <linearGradient id="cardGrad" x1="0" y1="0" x2="540" y2="340" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1A253D" />
        <stop offset="0.5" stopColor="#141C2E" />
        <stop offset="1" stopColor="#0A0F1D" />
      </linearGradient>
      <linearGradient id="borderSheen" x1="0" y1="0" x2="540" y2="340" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00D084" stopOpacity="0.8" />
        <stop offset="0.5" stopColor="#00B4D8" stopOpacity="0.6" />
        <stop offset="1" stopColor="#00D084" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id="chipGrad" x1="0" y1="0" x2="60" y2="45" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="0.5" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <pattern id="guilloche" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 0 15 Q 7.5 0, 15 15 T 30 15" stroke="rgba(255,255,255,0.03)" fill="none" strokeWidth="1" />
      </pattern>
    </defs>

    {/* Background Surface */}
    <rect width="540" height="340" rx="16" fill="url(#cardGrad)" />
    <rect width="540" height="340" rx="16" fill="url(#guilloche)" />
    <rect x="1" y="1" width="538" height="338" rx="15" stroke="url(#borderSheen)" strokeWidth="2" fill="none" />

    {/* Holographic glowing orb in corner */}
    <circle cx="480" cy="60" r="120" fill="#00D084" fillOpacity="0.08" filter="blur(40px)" />
    <circle cx="80" cy="280" r="100" fill="#00B4D8" fillOpacity="0.06" filter="blur(30px)" />

    {/* Card Header & Brand */}
    <g transform="translate(32, 32)">
      <rect width="36" height="36" rx="8" fill="#00D084" fillOpacity="0.15" stroke="#00D084" strokeWidth="1.5" />
      <path d="M18 10L10 14V20C10 24.5 13.5 28.5 18 29.5C22.5 28.5 26 24.5 26 20V14L18 10Z" fill="#00D084" fillOpacity="0.4" stroke="#00D084" strokeWidth="1.5" />
      <text x="48" y="18" fill="#F8FAFC" fontSize="16" fontWeight="700" letterSpacing="-0.5" fontFamily="Plus Jakarta Sans, sans-serif">
        NUSANTARA SHIELD
      </text>
      <text x="48" y="32" fill="#00D084" fontSize="10" fontWeight="600" letterSpacing="1" fontFamily="Plus Jakarta Sans, sans-serif">
        {tierLabel.toUpperCase()}
      </text>
    </g>

    {/* Microchip */}
    <g transform="translate(32, 95)">
      <rect width="54" height="42" rx="6" fill="url(#chipGrad)" stroke="#B45309" strokeWidth="1" />
      <path d="M 0 14 H 54 M 0 28 H 54 M 18 0 V 42 M 36 0 V 42" stroke="#92400E" strokeWidth="0.8" opacity="0.6" />
      <rect x="20" y="14" width="14" height="14" rx="2" fill="#FEF3C7" opacity="0.8" />
    </g>

    {/* Member Details */}
    <g transform="translate(32, 230)">
      <text x="0" y="0" fill="#94A3B8" fontSize="10" fontWeight="500" letterSpacing="1" fontFamily="Plus Jakarta Sans, sans-serif">
        PEMEGANG POLIS / CARDHOLDER
      </text>
      <text x="0" y="24" fill="#F8FAFC" fontSize="18" fontWeight="800" letterSpacing="1.5" fontFamily="monospace">
        {cardholderName.toUpperCase()}
      </text>
      <text x="0" y="46" fill="#00D084" fontSize="12" fontWeight="600" fontFamily="monospace">
        ID: {memberId}
      </text>
    </g>

    {/* Instant QR Verification Graphic */}
    <g transform="translate(420, 200)">
      <rect width="88" height="88" rx="8" fill="#FFFFFF" />
      {/* QR matrix markers */}
      <rect x="6" y="6" width="24" height="24" fill="#0A0F1D" rx="2" />
      <rect x="10" y="10" width="16" height="16" fill="#FFFFFF" rx="1" />
      <rect x="14" y="14" width="8" height="8" fill="#0A0F1D" />

      <rect x="58" y="6" width="24" height="24" fill="#0A0F1D" rx="2" />
      <rect x="62" y="10" width="16" height="16" fill="#FFFFFF" rx="1" />
      <rect x="66" y="14" width="8" height="8" fill="#0A0F1D" />

      <rect x="6" y="58" width="24" height="24" fill="#0A0F1D" rx="2" />
      <rect x="10" y="62" width="16" height="16" fill="#FFFFFF" rx="1" />
      <rect x="14" y="66" width="8" height="8" fill="#0A0F1D" />

      {/* Decorative center logo */}
      <circle cx="44" cy="44" r="8" fill="#00D084" />
      <text x="44" y="102" fill="#94A3B8" fontSize="8" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif">
        SCAN ADMISI RS
      </text>
    </g>
  </svg>
);

/**
 * 2. Financial Telemetry Area Chart SVG
 * Parametric interactive chart showing claim payout performance
 */
export const TelemetryAreaChartSVG: React.FC<{
  points?: number[];
  color?: string;
}> = ({ points = [35, 42, 38, 55, 62, 58, 74, 82, 91, 88, 96], color = '#00D084' }) => {
  const width = 600;
  const height = 180;
  const padding = 20;

  const max = Math.max(...points);
  const min = Math.min(...points) * 0.8;

  const getX = (idx: number) => padding + (idx * (width - 2 * padding)) / (points.length - 1);
  const getY = (val: number) => height - padding - ((val - min) / (max - min)) * (height - 2 * padding);

  const pathD = points.reduce((acc, curr, idx) => {
    const x = getX(idx);
    const y = getY(curr);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getX(points.length - 1)} ${height} L ${getX(0)} ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} fill="none" className="w-full h-auto">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Subtle gridlines */}
      <line x1={padding} y1={height / 4} x2={width - padding} y2={height / 4} stroke="#243049" strokeDasharray="4 4" />
      <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#243049" strokeDasharray="4 4" />
      <line x1={padding} y1={(3 * height) / 4} x2={width - padding} y2={(3 * height) / 4} stroke="#243049" strokeDasharray="4 4" />

      {/* Area fill */}
      <path d={areaD} fill="url(#chartGradient)" />

      {/* Line curve */}
      <path d={pathD} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Active end point */}
      <circle cx={getX(points.length - 1)} cy={getY(points[points.length - 1])} r="5" fill={color} />
      <circle cx={getX(points.length - 1)} cy={getY(points[points.length - 1])} r="10" fill={color} fillOpacity="0.3" className="animate-ping" />
    </svg>
  );
};
