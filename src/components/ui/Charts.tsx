import React from 'react';

const TONE_COLORS: Record<string, string> = {
  crimson: '#EF4444',
  red: '#EF4444',
  amber: '#F59E0B',
  orange: '#F59E0B',
  blue: '#1D6FE8',
  emerald: '#10B981',
  green: '#10B981',
  navy: '#0F2D52',
  purple: '#8B5CF6',
  indigo: '#6366F1',
  slate: '#94A3B8',
};

function toneColor(color: string) {
  if (!color) return '#1D6FE8';
  if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('var(')) return color;
  return TONE_COLORS[color.toLowerCase()] ?? '#1D6FE8';
}

export function ComplianceRing({
  score,
  size = 80,
  label = '',
  strokeWidth = 8,
}: {
  score: number;
  size?: number;
  label?: string;
  strokeWidth?: number;
}) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
  const radius = 50 - strokeWidth / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (safeScore / 100) * circumference;
  const color = safeScore >= 70 ? '#10B981' : safeScore >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${label ? `${label}: ` : ''}${safeScore}% complete`}
    >
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#EEF2F7" strokeWidth={strokeWidth} />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray 400ms ease' }}
      />
      <text
        x="50"
        y={label ? 48 : 55}
        textAnchor="middle"
        fontSize="22"
        fontWeight={700}
        fill="#0F2D52"
      >
        {safeScore}%
      </text>
      {label && (
        <text x="50" y="64" textAnchor="middle" fontSize="9" fill="#64748B">
          {label}
        </text>
      )}
    </svg>
  );
}

export function StackedBar({
  segments,
  showLegend = true,
}: {
  segments: { label: string; value: number; color: string }[];
  showLegend?: boolean;
}) {
  const total = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0);

  return (
    <div className="space-y-3 text-xs">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        {total === 0 ? (
          <div className="h-full w-full bg-slate-100" />
        ) : (
          segments.map((seg, i) => (
            <div
              key={i}
              title={`${seg.label}: ${seg.value}`}
              style={{ width: `${((Number(seg.value) || 0) / total) * 100}%`, background: toneColor(seg.color) }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          ))
        )}
      </div>
      {showLegend && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {segments.map((seg, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ background: toneColor(seg.color) }} />
              {seg.label}
              <span className="font-semibold text-navy">{seg.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
