import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { authAPI } from '../services/api';

export default function PinLock() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await authAPI.verifyPin(pin);
      localStorage.setItem('pinLockTime', Date.now().toString());
      navigate('/');
    } catch (err: any) {
      setError('PIN salah');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 shimmer-premium opacity-20 pointer-events-none" />
      
      <div className="bg-white dark:bg-[var(--card)] rounded-2xl shadow-[var(--shadow-2xl)] w-full max-w-sm p-8 scale-in relative z-10 border-2 border-white/50 dark:border-[var(--border)]">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] p-4 rounded-2xl mb-3 shadow-[var(--shadow-lg)] pulse-soft">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-800)] bg-clip-text text-transparent">
            Masukkan PIN
          </h2>
          <p className="text-[var(--muted)] text-sm mt-1">Verifikasi identitas Anda</p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          {error && (
            <div className="bg-[var(--danger)]/10 border-2 border-[var(--danger)]/30 text-[var(--danger)] px-3 py-2 rounded-xl text-sm text-center shake">
              {error}
            </div>
          )}

          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
            className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border-2 border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-[var(--brand-600)] bg-[var(--bg)] text-[var(--ink)] transition-smooth shadow-[var(--shadow-sm)] focus:shadow-[var(--shadow-md)]"
            placeholder="••••••"
            maxLength={8}
            required
          />

          <button
            type="submit"
            className="w-full gradient-brand text-white font-semibold py-3 rounded-xl hover-lift active-press transition-smooth shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] overflow-hidden relative"
          >
            <div className="absolute inset-0 shimmer-premium opacity-20 pointer-events-none" />
            <span className="relative z-10">Buka Kunci</span>
          </button>
        </form>
      </div>
    </div>
  );
}
