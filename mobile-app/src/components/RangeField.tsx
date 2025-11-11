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

export default function RangeField({
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

  // Validate range
  useEffect(() => {
    if (minValue >= maxValue) {
      setError('Nilai minimum harus lebih kecil dari maksimum');
    } else {
      setError('');
    }
  }, [minValue, maxValue]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || min;
    if (val < maxValue && val >= min && val <= max) {
      onMinChange(val);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || min;
    if (val > minValue && val >= min && val <= max) {
      onMaxChange(val);
    }
  };

  return (
    <div className="space-y-4">
      {/* Label & Current Range */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </label>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-brand/10 rounded-lg">
          <Ruler className="w-4 h-4 text-brand" />
          <span className="text-sm font-medium text-brand">
            {minValue}{unit} - {maxValue}{unit}
          </span>
        </div>
      </div>

      {/* Number Inputs with Labels */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
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
              className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 p-0"
            />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
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
              className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 p-0"
            />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          </div>
        </div>
      </div>

      {/* Simple Separate Sliders */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Min: {minValue}{unit}</span>
          </div>
          <input
            type="range"
            min={min}
            max={maxValue - step}
            step={step}
            value={minValue}
            onChange={handleMinChange}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand"
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Max: {maxValue}{unit}</span>
          </div>
          <input
            type="range"
            min={minValue + step}
            max={max}
            step={step}
            value={maxValue}
            onChange={handleMaxChange}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand"
          />
        </div>
      </div>

      {/* Help text */}
      {help && !error && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{help}</p>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg text-red-900 dark:text-red-300">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
