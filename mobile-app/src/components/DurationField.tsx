import { useState, useEffect } from 'react';
import { Clock, Minus, Plus } from 'lucide-react';
import Field from './Field';

interface DurationFieldProps {
  label: string;
  value: number; // value in milliseconds
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  error?: string;
  required?: boolean;
}

export default function DurationField({
  label,
  value,
  onChange,
  min = 0,
  max = 300000, // 5 minutes max
  step = 100,
  help,
  error,
  required = false
}: DurationFieldProps) {
  const [inputValue, setInputValue] = useState(String(value));
  const [isDragging, setIsDragging] = useState(false);
  const seconds = (value / 1000).toFixed(1);

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const numVal = parseInt(val) || 0;
    if (numVal >= min && numVal <= max) {
      onChange(numVal);
    }
  };

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <Field 
      label={label} 
      help={help || `${min}ms - ${max}ms`}
      error={error}
      required={required}
    >
      <div className="space-y-4">
        {/* Duration Display Card - PREMIUM */}
        <div className="bg-[var(--brand-50)] dark:bg-[var(--brand-900)]/20 rounded-xl p-4 border-2 border-[var(--brand-200)] dark:border-[var(--brand-800)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--brand-600)]" />
              <span className="text-sm font-medium text-[var(--brand-600)]">Durasi</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[var(--brand-600)]">
                {seconds} <span className="text-sm">detik</span>
              </p>
              <p className="text-xs text-[var(--brand-600)]/70">{value} ms</p>
            </div>
          </div>
        </div>

        {/* Input with controls - PREMIUM */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className="w-12 h-12 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] disabled:bg-[var(--gray-300)] dark:disabled:bg-[var(--gray-700)] text-white rounded-xl transition-smooth hover-lift active-press disabled:opacity-50 shadow-[var(--shadow-sm)] flex items-center justify-center"
            aria-label="Kurangi"
          >
            <Minus className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              min={min}
              max={max}
              step={step}
              className="w-full px-4 py-3 pr-14 border-2 border-[var(--border)] dark:border-[var(--gray-600)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent dark:bg-[var(--gray-800)] dark:text-white font-mono text-lg font-semibold transition-smooth shadow-[var(--shadow-sm)]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)] pointer-events-none font-medium">
              ms
            </span>
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            className="w-12 h-12 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] disabled:bg-[var(--gray-300)] dark:disabled:bg-[var(--gray-700)] text-white rounded-xl transition-smooth hover-lift active-press disabled:opacity-50 shadow-[var(--shadow-sm)] flex items-center justify-center"
            aria-label="Tambah"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* PREMIUM Slider */}
        <div className="relative pt-2 pb-6">
          {/* Track background */}
          <div className="absolute top-1 left-0 right-0 h-2 bg-[var(--gray-200)] dark:bg-[var(--gray-700)] rounded-full">
            {/* Progress fill */}
            <div 
              className="absolute h-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-700)] rounded-full transition-all duration-200"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Slider input (invisible) */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer z-10"
            style={{ WebkitAppearance: 'none' }}
          />

          {/* Thumb indicator */}
          <div 
            className={`absolute top-0 w-5 h-5 bg-white border-3 border-[var(--brand-600)] rounded-full shadow-[var(--shadow-lg)] transition-transform duration-200 pointer-events-none ${isDragging ? 'scale-125' : 'scale-100'}`}
            style={{
              left: `calc(${percentage}% - 10px)`,
            }}
          >
            <div className="absolute inset-0 bg-[var(--brand-600)] rounded-full opacity-20 pulse-soft" />
          </div>

          {/* Min/Max labels */}
          <div className="absolute top-8 left-0 right-0 flex justify-between text-xs text-[var(--muted)] font-medium">
            <span>{(min / 1000).toFixed(1)}s</span>
            <span>{(max / 1000).toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </Field>
  );
}
