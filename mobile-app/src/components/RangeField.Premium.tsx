import { useState, useEffect } from 'react';
import { Ruler, AlertCircle } from 'lucide-react';

interface RangeFieldProps {
  label: string;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  help?: string;
}

export default function RangeFieldPremium({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  help
}: RangeFieldProps) {
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Validate range
  useEffect(() => {
    if (minValue >= maxValue) {
      setError('Nilai minimum harus lebih kecil dari maksimum');
    } else if (minValue < min || maxValue > max) {
      setError(`Nilai harus antara ${min} - ${max}`);
    } else {
      setError('');
    }
  }, [minValue, maxValue, min, max]);

  // Calculate percentage positions for slider thumbs
  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || min;
    if (val < maxValue && val >= min) {
      onMinChange(val);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || min;
    if (val > minValue && val <= max) {
      onMaxChange(val);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with range display */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[var(--ink)]">
          {label}
        </label>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--brand-50)] dark:bg-[var(--brand-900)]/20 rounded-lg transition-smooth">
          <Ruler className="w-4 h-4 text-[var(--brand-600)]" />
          <span className="text-sm font-semibold text-[var(--brand-600)]">
            {minValue}{unit} - {maxValue}{unit}
          </span>
        </div>
      </div>

      {/* Number inputs with premium styling */}
      <div className="grid grid-cols-2 gap-4">
        {/* Minimum Input */}
        <div className="group bg-[var(--card)] p-4 rounded-xl border-2 border-[var(--border)] hover:border-[var(--brand-300)] transition-smooth shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)]">
          <label className="block text-xs font-medium text-[var(--muted)] mb-2">
            Minimum
          </label>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              value={minValue}
              onChange={handleMinChange}
              min={min}
              max={maxValue - step}
              step={step}
              className="w-full text-2xl font-bold text-[var(--ink)] bg-transparent border-none outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm font-medium text-[var(--muted-light)]">
              {unit}
            </span>
          </div>
        </div>

        {/* Maximum Input */}
        <div className="group bg-[var(--card)] p-4 rounded-xl border-2 border-[var(--border)] hover:border-[var(--brand-300)] transition-smooth shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)]">
          <label className="block text-xs font-medium text-[var(--muted)] mb-2">
            Maksimum
          </label>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              value={maxValue}
              onChange={handleMaxChange}
              min={minValue + step}
              max={max}
              step={step}
              className="w-full text-2xl font-bold text-[var(--ink)] bg-transparent border-none outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm font-medium text-[var(--muted-light)]">
              {unit}
            </span>
          </div>
        </div>
      </div>

      {/* PREMIUM DUAL SLIDER with visual range */}
      <div className="relative pt-6 pb-8">
        {/* Track background */}
        <div className="absolute top-1 left-0 right-0 h-2 bg-[var(--gray-200)] dark:bg-[var(--gray-700)] rounded-full">
          {/* Active range highlight */}
          <div 
            className="absolute h-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-700)] rounded-full transition-all duration-200"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`
            }}
          />
        </div>
        
        {/* Min slider (transparent overlay) */}
        <input
          type="range"
          min={min}
          max={maxValue - step}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer z-20"
          style={{ WebkitAppearance: 'none' }}
        />
        
        {/* Max slider (transparent overlay) */}
        <input
          type="range"
          min={minValue + step}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer z-20"
          style={{ WebkitAppearance: 'none' }}
        />
        
        {/* Thumb indicators (visual only) */}
        <div 
          className={`absolute top-0 w-5 h-5 bg-white border-3 border-[var(--brand-600)] rounded-full shadow-[var(--shadow-lg)] transition-transform duration-200 pointer-events-none ${isDragging ? 'scale-125' : 'scale-100'}`}
          style={{
            left: `calc(${minPercent}% - 10px)`,
          }}
        >
          <div className="absolute inset-0 bg-[var(--brand-600)] rounded-full opacity-20 pulse-soft" />
        </div>
        
        <div 
          className={`absolute top-0 w-5 h-5 bg-white border-3 border-[var(--brand-600)] rounded-full shadow-[var(--shadow-lg)] transition-transform duration-200 pointer-events-none ${isDragging ? 'scale-125' : 'scale-100'}`}
          style={{
            left: `calc(${maxPercent}% - 10px)`,
          }}
        >
          <div className="absolute inset-0 bg-[var(--brand-600)] rounded-full opacity-20 pulse-soft" />
        </div>

        {/* Value labels below thumbs */}
        <div className="absolute top-8 left-0 right-0 h-5">
          <span 
            className="absolute text-xs font-semibold text-[var(--brand-600)] bg-[var(--brand-50)] dark:bg-[var(--brand-900)]/30 px-2 py-0.5 rounded whitespace-nowrap"
            style={{ left: `${minPercent}%`, transform: 'translateX(-50%)' }}
          >
            {minValue}{unit}
          </span>
          <span 
            className="absolute text-xs font-semibold text-[var(--brand-600)] bg-[var(--brand-50)] dark:bg-[var(--brand-900)]/30 px-2 py-0.5 rounded whitespace-nowrap"
            style={{ left: `${maxPercent}%`, transform: 'translateX(-50%)' }}
          >
            {maxValue}{unit}
          </span>
        </div>
      </div>

      {/* Help text */}
      {help && !error && (
        <p className="text-sm text-[var(--muted)] flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {help}
        </p>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-[var(--danger-light)] dark:bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg shake">
          <AlertCircle className="w-4 h-4 text-[var(--danger)] flex-shrink-0" />
          <p className="text-sm text-[var(--danger)] font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
