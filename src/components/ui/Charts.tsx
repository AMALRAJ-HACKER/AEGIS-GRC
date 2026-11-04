import React from 'react';

export function ComplianceRing({ score, size = 80, label = '' }: { score: number; size?: number; label?: string }) {
  const r = size / 2 - 8;
  const circumference = 2 * Math.PI * r;
  const percentage = Math.min(score, 100);
  const strokeDashoffset = percentage > 0 ? circumference - (percentage * circumference) / 100 : circumference;
  const rotate = '-90deg';

  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 80 80"
      style={{ transform: `rotate(${rotate})` }}
    >
      <circle
        cx={r}
        cy={r}
        r={r}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={8}
      />
      <circle
        cx={r}
        cy={r}
        r={r}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={8}
        strokeDasharray={`${circumference} ${strokeDashoffset}`}
      />
      <text
        x={r}
        y={r + 5}
        textAnchor="middle"
        fontSize={size / 5}
        fontWeight={600}
        fill={percentage >= 70 ? 'var(--color-primary)' : percentage >= 40 ? 'var(--color-accent-purple)' : 'var(--color-text-muted)'}
      >
        {percentage}%
      </text>
      {label && (
        <text
          x={r}
          y={r + 20}
          textAnchor="middle"
          fontSize={size / 8}
          fill="var(--color-text-muted)"
        >
          {label}
        </text>
      )}
    </svg>
  );
}

export function StackedBar({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  return (
    <div className="space-y-1.5 text-xs">
      {segments.map((seg, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-10 text-navy dark:text-navy">{seg.label}</span>
          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-navy/20 overflow-hidden">
            <div
              className="h-full rounded-tl-sm rounded-bl-sm"
              style={{ width: `${seg.value}%`, background: seg.color }}
            />
          </div>
          <span className="text-navy dark:text-navy">{seg.value}</span>
        </div>
      ))}
    </div>
  );
}