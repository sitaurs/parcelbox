import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package as PackageIcon, LogIn } from 'lucide-react';
import { authAPI, setAuthToken } from '../services/api';
import { useStore } from '../store/useStore';

export default function Login() {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login(username, password);
      setAuthToken(response.token);
      setUser(response.user);
      localStorage.setItem('pinLockTime', Date.now().toString());
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-brand flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 shimmer-premium opacity-20 pointer-events-none" />
      
      <div className="bg-white dark:bg-[var(--card)] rounded-2xl shadow-[var(--shadow-2xl)] p-8 w-full max-w-md scale-in relative z-10 border-2 border-white/50 dark:border-[var(--border)]">
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] p-4 rounded-2xl mb-4 shadow-[var(--shadow-lg)] breathe">
            <PackageIcon className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-800)] bg-clip-text text-transparent mb-2">
            SmartParcel
          </h1>
          <p className="text-[var(--muted)]">Login ke Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-[var(--danger)]/10 border-2 border-[var(--danger)]/30 text-[var(--danger)] px-4 py-3 rounded-xl shake">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[var(--ink)] mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-[var(--brand-600)] bg-[var(--bg)] text-[var(--ink)] transition-smooth shadow-[var(--shadow-sm)] focus:shadow-[var(--shadow-md)]"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--ink)] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-[var(--brand-600)] bg-[var(--bg)] text-[var(--ink)] transition-smooth shadow-[var(--shadow-sm)] focus:shadow-[var(--shadow-md)]"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-brand text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover-lift active-press transition-smooth shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] overflow-hidden relative"
          >
            <div className="absolute inset-0 shimmer-premium opacity-20 pointer-events-none" />
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--muted)]">
          <p>Tugas Akhir Semester</p>
          <p className="mt-1">© 2025 SmartParcel</p>
        </div>
      </div>
    </div>
  );
}
