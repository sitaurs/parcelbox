import { Wifi, WifiOff, Clock } from 'lucide-react';

type StatusType = 'online' | 'offline' | 'pending';

interface StatusChipProps {
  status: StatusType;
  className?: string;
}

export default function StatusChip({ status, className = '' }: StatusChipProps) {
  const config = {
    online: {
      icon: Wifi,
      label: 'Online',
      className: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
      pulseClass: 'pulse-soft'
    },
    offline: {
      icon: WifiOff,
      label: 'Offline',
      className: 'bg-[var(--gray-100)] text-[var(--gray-600)] border-[var(--gray-200)] dark:bg-[var(--gray-800)] dark:text-[var(--gray-400)] dark:border-[var(--gray-700)]',
      pulseClass: ''
    },
    pending: {
      icon: Clock,
      label: 'Menunggu',
      className: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20',
      pulseClass: 'breathe'
    },
  };

  const { icon: Icon, label, className: statusClass, pulseClass } = config[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold shadow-[var(--shadow-sm)] transition-smooth ${statusClass} ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${pulseClass}`} />
      <span>{label}</span>
    </div>
  );
}
