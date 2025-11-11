import { ReactNode } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface FieldProps {
  label: string;
  children: ReactNode;
  help?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export default function Field({ 
  label, 
  children, 
  help, 
  error,
  required = false,
  className = ''
}: FieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-900 dark:text-white">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      {/* Input */}
      {children}

      {/* Help text */}
      {help && !error && (
        <div className="flex items-start gap-1.5 text-xs text-muted">
          <HelpCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{help}</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-danger">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
