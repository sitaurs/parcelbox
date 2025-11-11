import { ReactNode } from 'react';

interface MetricTileProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export default function MetricTile({
  icon,
  label,
  value,
  change,
  trend,
  className = ''
}: MetricTileProps) {
  const trendColors = {
    up: 'text-[var(--success)]',
    down: 'text-[var(--danger)]',
    neutral: 'text-[var(--muted)]'
  };

  const trendBgColors = {
    up: 'bg-[var(--success)]/10',
    down: 'bg-[var(--danger)]/10',
    neutral: 'bg-[var(--gray-100)] dark:bg-[var(--gray-800)]'
  };

  return (
    <div className={`bg-[var(--card)] rounded-2xl shadow-[var(--shadow-md)] p-4 border border-[var(--border)] hover:shadow-[var(--shadow-lg)] transition-smooth ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Icon - PREMIUM */}
          <div className="w-10 h-10 bg-[var(--brand-600)]/10 text-[var(--brand-600)] rounded-xl flex items-center justify-center mb-3 transition-smooth group-hover:scale-110">
            {icon}
          </div>

          {/* Label */}
          <p className="text-xs text-[var(--muted)] mb-1 font-medium">{label}</p>

          {/* Value - PREMIUM */}
          <p className="text-2xl font-bold text-[var(--ink)] tracking-tight">
            {value}
          </p>

          {/* Change indicator - PREMIUM */}
          {change && trend && (
            <div className={`flex items-center gap-1.5 mt-2 text-xs font-semibold ${trendColors[trend]} px-2 py-1 rounded-lg ${trendBgColors[trend]} w-fit`}>
              {trend === 'up' && (
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2L10 6L8 6V10H4V6L2 6L6 2Z" fill="currentColor" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M6 10L10 6L8 6V2H4V6L2 6L6 10Z" fill="currentColor" />
                </svg>
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
