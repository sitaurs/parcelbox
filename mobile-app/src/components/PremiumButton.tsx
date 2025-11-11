import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface PremiumButtonProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'info' | 'warning' | 'danger' | 'success' | 'default';
  className?: string;
  fullWidth?: boolean;
  children?: ReactNode;
}

export default function PremiumButton({
  icon: Icon,
  label,
  description,
  onClick,
  disabled = false,
  variant = 'default',
  className = '',
  fullWidth = true,
  children
}: PremiumButtonProps) {
  // Variant color mappings
  const variants = {
    info: {
      bg: 'bg-[var(--card)]',
      hover: 'hover:bg-[var(--info-light)]',
      iconBg: 'bg-[var(--info)]/20',
      iconColor: 'text-[var(--info)]'
    },
    warning: {
      bg: 'bg-[var(--card)]',
      hover: 'hover:bg-[var(--warning)]/10',
      iconBg: 'bg-[var(--warning)]/20',
      iconColor: 'text-[var(--warning)]'
    },
    danger: {
      bg: 'bg-[var(--card)]',
      hover: 'hover:bg-[var(--danger)]/10',
      iconBg: 'bg-[var(--danger)]/20',
      iconColor: 'text-[var(--danger)]'
    },
    success: {
      bg: 'bg-[var(--card)]',
      hover: 'hover:bg-[var(--success)]/10',
      iconBg: 'bg-[var(--success)]/20',
      iconColor: 'text-[var(--success)]'
    },
    default: {
      bg: 'bg-[var(--card)]',
      hover: 'hover:bg-[var(--gray-100)] dark:hover:bg-[var(--gray-800)]',
      iconBg: 'bg-[var(--brand-100)]',
      iconColor: 'text-[var(--brand-600)]'
    }
  };

  const variantStyles = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? 'w-full' : ''} ${variantStyles.bg} ${variantStyles.hover} text-[var(--ink)] font-semibold py-4 px-4 rounded-xl shadow-[var(--shadow-md)] border-2 border-[var(--border)] transition-smooth hover-lift active-press flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100 min-tap ${className}`}
    >
      {Icon && (
        <div className={`${variantStyles.iconBg} p-3 rounded-lg`}>
          <Icon className={`w-5 h-5 ${variantStyles.iconColor}`} />
        </div>
      )}
      <div className="flex-1 text-left">
        <p className="font-semibold">{label}</p>
        {description && (
          <p className="text-sm text-[var(--muted)]">{description}</p>
        )}
      </div>
      {children}
    </button>
  );
}
