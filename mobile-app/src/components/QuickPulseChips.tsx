import { Zap } from 'lucide-react';

interface QuickPulseChipsProps {
  durations: number[]; // in milliseconds
  onSelect: (duration: number) => void;
  activeValue?: number;
  label?: string;
}

export default function QuickPulseChips({
  durations,
  onSelect,
  activeValue,
  label = 'Quick Pulse'
}: QuickPulseChipsProps) {
  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <Zap className="w-4 h-4" />
          <span>{label}</span>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {durations.map((duration) => (
          <button
            key={duration}
            onClick={() => onSelect(duration)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeValue === duration
                ? 'bg-brand text-white scale-105'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {formatDuration(duration)}
          </button>
        ))}
      </div>
    </div>
  );
}
