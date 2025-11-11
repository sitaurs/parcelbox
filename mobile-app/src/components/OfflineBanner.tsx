import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  onRetry?: () => void;
  message?: string;
}

export default function OfflineBanner({ 
  onRetry,
  message = 'Koneksi ke perangkat terputus'
}: OfflineBannerProps) {
  return (
    <div className="bg-[var(--warning)]/10 border-2 border-[var(--warning)]/20 rounded-xl p-4 flex items-start gap-3 slide-down shadow-[var(--shadow-md)]">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-[var(--warning)]/20 rounded-xl flex items-center justify-center">
          <WifiOff className="w-5 h-5 text-[var(--warning)] pulse-soft" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--warning)]">
          {message}
        </p>
        <p className="text-xs text-[var(--warning)]/80 mt-1">
          Pastikan ESP32 menyala dan terhubung ke WiFi
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[var(--warning)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--warning-dark)] transition-smooth min-tap shadow-[var(--shadow-sm)] hover-lift active-press"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Coba Lagi</span>
        </button>
      )}
    </div>
  );
}
