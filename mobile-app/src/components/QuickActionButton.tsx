import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: 'warning' | 'danger' | 'success' | 'info';
  className?: string;
}

export default function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  color = 'info',
  className = ''
}: QuickActionButtonProps) {
  // Color mappings
  const colors = {
    warning: {
      cardHover: 'hover:bg-[var(--warning-50)] dark:hover:bg-[var(--warning)]/10',
      border: 'border-[var(--warning-200)] dark:border-[var(--warning-800)]',
      iconBg: 'bg-[var(--warning)]',
    },
    danger: {
      cardHover: 'hover:bg-[var(--danger-50)] dark:hover:bg-[var(--danger)]/10',
      border: 'border-[var(--danger-200)] dark:border-[var(--danger-800)]',
      iconBg: 'bg-[var(--danger)]',
    },
    success: {
      cardHover: 'hover:bg-[var(--success-50)] dark:hover:bg-[var(--success)]/10',
      border: 'border-[var(--success-200)] dark:border-[var(--success-800)]',
      iconBg: 'bg-[var(--success)]',
    },
    info: {
      cardHover: 'hover:bg-[var(--info-50)] dark:hover:bg-[var(--info)]/10',
      border: 'border-[var(--info-200)] dark:border-[var(--info-800)]',
      iconBg: 'bg-[var(--info)]',
    }
  };

  const colorStyles = colors[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-2 p-4 bg-[var(--card)] ${colorStyles.cardHover} border-2 ${colorStyles.border} rounded-xl transition-smooth hover-lift active-press disabled:opacity-50 group shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] min-tap ${className}`}
      aria-label={label}
    >
      <div className={`w-12 h-12 ${colorStyles.iconBg} text-white rounded-xl flex items-center justify-center group-hover:shadow-[var(--shadow-lg)] transition-smooth group-hover:scale-110`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-semibold text-[var(--ink)] text-center leading-tight">{label}</span>
    </button>
  );
}
