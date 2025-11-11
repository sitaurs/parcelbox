import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface DangerZoneProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function DangerZone({
  title = 'Danger Zone',
  description,
  children,
  className = ''
}: DangerZoneProps) {
  return (
    <div className={`border-2 border-danger/20 bg-danger/5 rounded-2xl p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-danger/10 text-danger rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-danger mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-danger/80">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pl-13">
        {children}
      </div>
    </div>
  );
}
