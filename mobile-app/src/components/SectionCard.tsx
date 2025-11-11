import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function SectionCard({ 
  title, 
  subtitle, 
  actions, 
  children,
  className = ''
}: SectionCardProps) {
  return (
    <div className={`bg-[var(--surface)] dark:bg-[var(--card)] rounded-2xl shadow-[var(--shadow-lg)] p-5 border border-[var(--border)] ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[var(--ink)]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-[var(--muted)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="ml-4 flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  );
}
