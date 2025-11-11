import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Key, LogOut, User, Settings as SettingsIcon, Info, Smartphone, Cpu, Copy } from 'lucide-react';
import { authAPI, setAuthToken } from '../services/api';
import { useStore } from '../store/useStore';
import { toast } from '../hooks/useToast';

// Import new components
import SectionCard from '../components/SectionCard';
import BottomSheet from '../components/BottomSheet';
import ConfirmDialog from '../components/ConfirmDialog';
import Field from '../components/Field';

export default function Settings() {
  const navigate = useNavigate();
  const logout = useStore((state) => state.logout);
  const user = useStore((state) => state.user);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showDoorPinModal, setShowDoorPinModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newDoorPin, setNewDoorPin] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('✅ Password berhasil diubah!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah password');
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authAPI.changePin(currentPin, newPin);
      toast.success('✅ PIN aplikasi berhasil diubah!');
      setShowPinModal(false);
      setCurrentPin('');
      setNewPin('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah PIN');
    }
  };

  const handleChangeDoorPin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate PIN length (4-8 digits)
    if (newDoorPin.length < 4 || newDoorPin.length > 8) {
      toast.error('PIN harus 4-8 digit');
      return;
    }
    
    try {
      await authAPI.changeDoorPin(newDoorPin);
      toast.success('✅ PIN kunci pintu berhasil diubah!');
      setShowDoorPinModal(false);
      setNewDoorPin('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengubah PIN pintu');
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setAuthToken(null);
      logout();
      navigate('/login');
      toast.success('Logout berhasil');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Gagal logout');
    }
  };
  
  const copyDiagnostics = () => {
    const info = `SmartParcel Diagnostics\n` +
      `App Version: 2.0.0\n` +
      `User: ${user?.username || 'zamn'}\n` +
      `Browser: ${navigator.userAgent}\n` +
      `Platform: ${navigator.platform}`;
    
    navigator.clipboard.writeText(info);
    toast.success('📋 Info diagnostik disalin!');
  };

  return (
    <div className="min-h-full bg-[var(--bg)] p-4 pb-24 space-y-4 page-enter">
      {/* Header Card - PREMIUM */}
      <div className="gradient-brand rounded-2xl p-6 text-white shadow-[var(--shadow-xl)] hover-lift transition-smooth overflow-hidden relative">
        <div className="absolute inset-0 shimmer-premium opacity-10 pointer-events-none" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
            <p className="text-sm opacity-90">Kelola akun dan keamanan</p>
          </div>
        </div>
      </div>

      {/* User Info - PREMIUM */}
      <SectionCard title="Informasi Akun">
        <div className="flex items-center gap-4 p-4 bg-[var(--brand-50)] dark:bg-[var(--brand-900)]/20 rounded-xl border-2 border-[var(--brand-200)] dark:border-[var(--brand-800)] shadow-[var(--shadow-sm)]">
          <div className="w-14 h-14 bg-[var(--brand-600)]/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <User className="w-7 h-7 text-[var(--brand-600)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg text-[var(--ink)] truncate">{user?.username || 'zamn'}</p>
            <p className="text-sm text-[var(--brand-600)] font-medium">Administrator</p>
          </div>
        </div>
      </SectionCard>

      {/* Security Section - PREMIUM */}
      <SectionCard title="Keamanan" subtitle="Ubah password dan PIN">
        <div className="space-y-3">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between p-4 bg-[var(--bg)] hover:bg-[var(--brand-50)] dark:hover:bg-[var(--brand-900)]/20 rounded-xl transition-smooth border-2 border-[var(--border)] hover:border-[var(--brand-400)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] active-press group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-smooth">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-[var(--ink)]">Ubah Password</p>
                <p className="text-xs text-[var(--muted)]">Password login aplikasi</p>
              </div>
            </div>
            <span className="text-[var(--muted)] group-hover:text-[var(--brand-600)] transition-smooth">›</span>
          </button>
          
          <button
            onClick={() => setShowPinModal(true)}
            className="w-full flex items-center justify-between p-4 bg-[var(--bg)] hover:bg-[var(--brand-50)] dark:hover:bg-[var(--brand-900)]/20 rounded-xl transition-smooth border-2 border-[var(--border)] hover:border-[var(--brand-400)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] active-press group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-smooth">
                <Key className="w-5 h-5 text-green-600 dark:text-green-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-[var(--ink)]">Ubah PIN Aplikasi</p>
                <p className="text-xs text-[var(--muted)]">PIN untuk quick access</p>
              </div>
            </div>
            <span className="text-[var(--muted)] group-hover:text-[var(--brand-600)] transition-smooth">›</span>
          </button>
          
          <button
            onClick={() => setShowDoorPinModal(true)}
            className="w-full flex items-center justify-between p-4 bg-[var(--bg)] hover:bg-[var(--brand-50)] dark:hover:bg-[var(--brand-900)]/20 rounded-xl transition-smooth border-2 border-[var(--border)] hover:border-[var(--brand-400)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] active-press group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-smooth">
                <Key className="w-5 h-5 text-purple-600 dark:text-purple-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-[var(--ink)]">Ubah PIN Kunci Pintu</p>
                <p className="text-xs text-[var(--muted)]">PIN untuk unlock door</p>
              </div>
            </div>
            <span className="text-[var(--muted)] group-hover:text-[var(--brand-600)] transition-smooth">›</span>
          </button>
        </div>
      </SectionCard>

      {/* About Section - PREMIUM */}
      <SectionCard title="Tentang Aplikasi">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[var(--bg)] border-2 border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[var(--brand-600)]" />
              <span className="text-sm text-[var(--ink)] font-semibold">Versi Aplikasi</span>
            </div>
            <span className="text-sm font-bold text-[var(--brand-600)]">2.0.0</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[var(--bg)] border-2 border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-[var(--brand-600)]" />
              <span className="text-sm text-[var(--ink)] font-semibold">Platform</span>
            </div>
            <span className="text-sm font-bold text-[var(--brand-600)]">Web</span>
          </div>
          <button
            onClick={copyDiagnostics}
            className="w-full flex items-center justify-center gap-2 p-3 bg-[var(--brand-600)]/10 hover:bg-[var(--brand-600)]/20 text-[var(--brand-600)] rounded-xl transition-smooth hover-lift shadow-[var(--shadow-sm)] border-2 border-[var(--brand-600)]/30 font-semibold"
          >
            <Copy className="w-5 h-5" />
            <span>Salin Info Diagnostik</span>
          </button>
        </div>
      </SectionCard>

      {/* Logout Button - PREMIUM */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 text-[var(--danger)] font-bold py-4 px-4 rounded-xl transition-smooth hover-lift active-press flex items-center justify-center gap-2 border-2 border-[var(--danger)]/20 shadow-[var(--shadow-md)]"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout dari Akun</span>
      </button>

      {/* Footer - PREMIUM */}
      <div className="text-center text-sm text-[var(--muted)] space-y-1 pt-4 fade-in">
        <p className="flex items-center justify-center gap-1">
          <Info className="w-4 h-4" />
          <span>SmartParcel IoT Package Tracker</span>
        </p>
        <p>Tugas Akhir Semester © 2025</p>
      </div>
      
      {/* Modals - PREMIUM */}
      <BottomSheet
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Ubah Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4 fade-in">
          <Field label="Password Saat Ini">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--border)] dark:border-[var(--gray-600)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent dark:bg-[var(--gray-800)] dark:text-white transition-smooth shadow-[var(--shadow-sm)]"
              required
            />
          </Field>
          <Field label="Password Baru" help="Minimal 6 karakter">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--border)] dark:border-[var(--gray-600)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent dark:bg-[var(--gray-800)] dark:text-white transition-smooth shadow-[var(--shadow-sm)]"
              required
              minLength={6}
            />
          </Field>
          <button
            type="submit"
            className="w-full bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white font-bold py-3 px-4 rounded-xl transition-smooth hover-lift shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
          >
            Simpan Password
          </button>
        </form>
      </BottomSheet>

      <BottomSheet
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        title="Ubah PIN Aplikasi"
      >
        <form onSubmit={handleChangePin} className="space-y-4 fade-in">
          <Field label="PIN Saat Ini" help="4-8 digit">
            <input
              type="password"
              inputMode="numeric"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className="w-full px-4 py-3 border-2 border-[var(--border)] dark:border-[var(--gray-600)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono dark:bg-[var(--gray-800)] dark:text-white transition-smooth shadow-[var(--shadow-sm)]"
              required
            />
          </Field>
          <Field label="PIN Baru" help="4-8 digit">
            <input
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className="w-full px-4 py-3 border-2 border-[var(--border)] dark:border-[var(--gray-600)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono dark:bg-[var(--gray-800)] dark:text-white transition-smooth shadow-[var(--shadow-sm)]"
              required
              minLength={4}
              maxLength={8}
            />
          </Field>
          <button
            type="submit"
            className="w-full bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white font-bold py-3 px-4 rounded-xl transition-smooth hover-lift shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
          >
            Simpan PIN Aplikasi
          </button>
        </form>
      </BottomSheet>

      <BottomSheet
        isOpen={showDoorPinModal}
        onClose={() => setShowDoorPinModal(false)}
        title="Ubah PIN Kunci Pintu"
      >
        <form onSubmit={handleChangeDoorPin} className="space-y-4 fade-in">
          <Field label="PIN Kunci Pintu Baru" help="4-8 digit">
            <input
              type="password"
              inputMode="numeric"
              value={newDoorPin}
              onChange={(e) => setNewDoorPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className="w-full px-4 py-3 border-2 border-[var(--border)] dark:border-[var(--gray-600)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono dark:bg-[var(--gray-800)] dark:text-white transition-smooth shadow-[var(--shadow-sm)]"
              required
              minLength={4}
              maxLength={8}
            />
          </Field>
          <button
            type="submit"
            className="w-full bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white font-bold py-3 px-4 rounded-xl transition-smooth hover-lift shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
          >
            Simpan PIN Pintu
          </button>
        </form>
      </BottomSheet>

      {showLogoutConfirm && (
        <ConfirmDialog
          title="Logout"
          message="Apakah Anda yakin ingin keluar dari aplikasi?"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
          type="warning"
        />
      )}
    </div>
  );
}
