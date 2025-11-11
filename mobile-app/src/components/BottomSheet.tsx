import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children
}: BottomSheetProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - PREMIUM */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] fade-in"
        onClick={onClose}
      />

      {/* Sheet - PREMIUM */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[var(--card)] rounded-t-3xl shadow-[var(--shadow-xl)] slide-up border-t-2 border-[var(--border)]">
        <div className="safe-bottom">
          {/* Handle bar - PREMIUM */}
          <div className="flex justify-center pt-4 pb-3">
            <div className="w-12 h-1.5 bg-[var(--gray-300)] dark:bg-[var(--gray-700)] rounded-full hover:bg-[var(--brand-600)] transition-smooth cursor-pointer" />
          </div>

          {/* Header - PREMIUM */}
          {title && (
            <div className="flex items-center justify-between px-6 pb-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-bold text-[var(--ink)]">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--gray-100)] dark:hover:bg-[var(--gray-800)] rounded-xl transition-smooth min-tap flex items-center justify-center active-press"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Content - PREMIUM */}
          <div className="px-6 pb-6 pt-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
