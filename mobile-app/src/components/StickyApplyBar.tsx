import { RotateCcw, X, Save } from 'lucide-react';

interface StickyApplyBarProps {
  isDirty: boolean;
  onReset: () => void;
  onCancel: () => void;
  onApply: () => void;
  isLoading?: boolean;
}

export default function StickyApplyBar({
  isDirty,
  onReset,
  onCancel,
  onApply,
  isLoading = false
}: StickyApplyBarProps) {
  if (!isDirty) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-bottom animate-slide-up">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Reset button */}
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 min-tap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          {/* Cancel button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 min-tap"
          >
            <X className="w-4 h-4" />
            <span>Batal</span>
          </button>

          {/* Apply button */}
          <button
            type="button"
            onClick={onApply}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 min-tap"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Menyimpan...' : 'Simpan & Terapkan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
