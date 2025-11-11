import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'warning'
}: ConfirmDialogProps) {
  const colors = {
    danger: 'bg-[var(--danger)] hover:bg-[var(--danger-dark)]',
    warning: 'bg-[var(--warning)] hover:bg-[var(--warning-dark)]',
    info: 'bg-[var(--info)] hover:bg-[var(--info-dark)]',
  };

  const iconBgColors = {
    danger: 'bg-[var(--danger-light)]',
    warning: 'bg-[var(--warning-light)]',
    info: 'bg-[var(--info-light)]',
  };

  const iconColors = {
    danger: 'text-[var(--danger)]',
    warning: 'text-[var(--warning)]',
    info: 'text-[var(--info)]',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] fade-in">
      <div className="bg-[var(--card)] rounded-2xl p-6 w-full max-w-sm shadow-[var(--shadow-xl)] border-2 border-[var(--border)] scale-in">
        {/* Header with Icon - PREMIUM */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`${iconBgColors[type]} p-3 rounded-xl pulse-soft`}>
            <AlertTriangle className={`w-6 h-6 ${iconColors[type]}`} />
          </div>
          <h3 className="font-bold text-lg text-[var(--ink)]">{title}</h3>
        </div>

        {/* Message */}
        <p className="text-[var(--muted)] mb-6 leading-relaxed">{message}</p>

        {/* Actions - PREMIUM */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-[var(--gray-100)] dark:bg-[var(--gray-800)] hover:bg-[var(--gray-200)] dark:hover:bg-[var(--gray-700)] text-[var(--ink-light)] font-semibold rounded-xl transition-smooth active-press shadow-[var(--shadow-sm)]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${colors[type]} text-white font-semibold py-3 px-4 rounded-xl transition-smooth hover-lift active-press shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
