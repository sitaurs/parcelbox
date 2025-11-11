import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
  className?: string;
}

export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  rightContent,
  className = ''
}: PageHeaderProps) {
  return (
    <div className={`gradient-brand rounded-2xl p-6 text-white shadow-[var(--shadow-xl)] hover-lift transition-smooth overflow-hidden relative ${className}`}>
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 shimmer-premium opacity-10 pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          </div>
          {subtitle && (
            <p className="text-sm opacity-90">{subtitle}</p>
          )}
        </div>
        {rightContent && (
          <div className="flex-shrink-0 ml-4">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}
