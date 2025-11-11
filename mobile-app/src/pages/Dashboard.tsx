import { useEffect, useState } from 'react';
import { Package, Signal, Unlock, VolumeX, BoxIcon, TrendingUp, Activity, Camera, ArrowUp } from 'lucide-react';
import { deviceAPI, packageAPI } from '../services/api';
import { useStore } from '../store/useStore';
import { toast } from '../hooks/useToast';
import { getPhotoURL } from '../utils/url';

// Import new components
import StatusChip from '../components/StatusChip';
import OfflineBanner from '../components/OfflineBanner';
import MetricTile from '../components/MetricTile';
import BottomSheet from '../components/BottomSheet';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';
import PhotoItem from '../components/PhotoItem';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 });
  const [deviceStatus, setDeviceStatus] = useState<any>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [doorPin, setDoorPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [lastPhoto, setLastPhoto] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showConfirmHolder, setShowConfirmHolder] = useState(false);
  const user = useStore((state) => state.user);

  useEffect(() => {
    loadData();
    
    // Poll only when page is visible AND device is online
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && deviceStatus?.isOnline) {
        loadData();
        setLastUpdate(new Date());
      }
    }, 10000); // Refresh every 10s (optimized for battery & server load)
    
    return () => clearInterval(interval);
  }, []); // FIXED: Empty dependency to prevent multiple intervals

  const loadData = async () => {
    try {
      const [statsData, statusData, packagesData] = await Promise.all([
        packageAPI.getStats(),
        deviceAPI.getStatus(),
        packageAPI.getPackages(1, 0) // Get last photo
      ]);
      setStats(statsData.stats);
      setDeviceStatus(statusData.status);
      if (packagesData.packages && packagesData.packages.length > 0) {
        setLastPhoto(packagesData.packages[0]);
      }
      setIsPageLoading(false);
    } catch (error) {
      console.error('Load data error:', error);
      setIsPageLoading(false);
    }
  };

  const handleRetryConnection = () => {
    setIsPageLoading(true);
    loadData();
  };

  // Quick action: Release holder
  const handleReleaseHolder = async () => {
    setShowConfirmHolder(false);
    setIsLoading(true);
    try {
      await deviceAPI.testHolder();
      toast.success('Penahan paket berhasil dilepas!');
    } catch (error: any) {
      toast.error('Gagal: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action: Stop buzzer
  const handleStopBuzzer = async () => {
    setIsLoading(true);
    try {
      await deviceAPI.stopBuzzer();
      toast.success('Buzzer berhasil dihentikan!');
    } catch (error: any) {
      toast.error('Gagal: ' + (error.message || 'Terjadi kesalahan'));
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action: Unlock door (with PIN)
  const handleUnlockDoor = () => {
    setPinError('');
    setDoorPin('');
    setShowPinModal(true);
  };

  const submitUnlockDoor = async () => {
    if (!doorPin) {
      setPinError('PIN harus diisi');
      return;
    }
    
    // Validate numeric input
    if (!/^\d+$/.test(doorPin)) {
      setPinError('PIN harus berisi angka saja');
      return;
    }
    
    if (doorPin.length < 4 || doorPin.length > 8) {
      setPinError('PIN harus 4-8 digit');
      return;
    }

    setIsLoading(true);
    setPinError('');

    try {
      await deviceAPI.unlockDoor(doorPin);
      setShowPinModal(false);
      setDoorPin('');
      toast.success('Pintu berhasil dibuka!');
    } catch (error: any) {
      setPinError(error.message || 'PIN salah atau gagal membuka pintu');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeDiff = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 10) return 'baru saja';
    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    return `${Math.floor(diff / 3600)} jam lalu`;
  };

  return (
    <div className="min-h-full bg-[var(--bg)] p-4 space-y-4 pb-24 page-enter">
      {/* Header Card with Gradient - PREMIUM */}
      <div className="gradient-brand rounded-2xl p-6 text-white shadow-[var(--shadow-xl)] hover-lift transition-smooth overflow-hidden relative">
        {/* Animated background shimmer */}
        <div className="absolute inset-0 shimmer-premium opacity-10 pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight fade-in truncate">SmartParcel</h1>
            <p className="mt-1 opacity-90 text-sm truncate">Selamat datang, <span className="font-semibold">{user?.username || 'zamn'}</span>!</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusChip 
              status={deviceStatus?.isOnline ? 'online' : 'offline'} 
              className="bg-white/20 backdrop-blur-sm border border-white/30 scale-in" 
            />
            <p className="text-xs opacity-75 flex items-center gap-1">
              <Activity className="w-3 h-3 pulse-soft" />
              {formatTimeDiff(lastUpdate)}
            </p>
          </div>
        </div>
      </div>

      {/* Offline Banner */}
      {!deviceStatus?.isOnline && (
        <OfflineBanner 
          onRetry={handleRetryConnection}
          message="Koneksi ke ESP32 terputus"
        />
      )}

      {/* Loading State */}
      {isPageLoading ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => <SkeletonCard key={i} lines={2} />)}
          </div>
          <SkeletonCard lines={4} />
        </>
      ) : (
        <>
          {/* Package Stats with MetricTile - PREMIUM */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 fade-in">
            <MetricTile
              icon={<Package className="w-5 h-5" />}
              label="Total Paket"
              value={stats.total}
              trend="neutral"
              className="hover-lift transition-smooth"
            />
            <MetricTile
              icon={<TrendingUp className="w-5 h-5" />}
              label="Hari Ini"
              value={stats.today}
              trend={stats.today > 0 ? 'up' : 'neutral'}
              change={stats.today > 0 ? `+${stats.today}` : ''}
              className="hover-lift transition-smooth"
            />
            <MetricTile
              icon={<Activity className="w-5 h-5" />}
              label="Minggu Ini"
              value={stats.thisWeek}
              trend={stats.thisWeek > 0 ? 'up' : 'neutral'}
              change={stats.thisWeek > 0 ? `+${stats.thisWeek}` : ''}
              className="hover-lift transition-smooth"
            />
          </div>

          {/* Live Sensor Status - PREMIUM */}
          <div className="bg-[var(--card)] rounded-2xl shadow-[var(--shadow-md)] p-5 hover-lift transition-smooth border border-[var(--border)] fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Signal className="w-5 h-5 text-[var(--brand-600)]" />
              <h3 className="font-semibold text-[var(--ink)]">Status Sensor</h3>
            </div>
            {deviceStatus?.lastDistance != null ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">Jarak Terdeteksi</p>
                  <p className="text-3xl font-bold text-[var(--ink)] transition-all">
                    {deviceStatus.lastDistance.toFixed(1)} <span className="text-lg text-[var(--muted)]">cm</span>
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  deviceStatus.lastDistance >= 12 && deviceStatus.lastDistance <= 25
                    ? 'bg-[var(--success)]/10 text-[var(--success)] pulse-soft'
                    : 'bg-[var(--gray-100)] dark:bg-[var(--gray-800)] text-[var(--muted)]'
                }`}>
                  <ArrowUp className="w-7 h-7" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <p className="text-sm text-[var(--muted)]">Tidak ada data sensor</p>
              </div>
            )}
          </div>

          {/* Quick Actions - PREMIUM */}
          <div className="bg-[var(--card)] rounded-2xl shadow-[var(--shadow-md)] p-5 border border-[var(--border)] fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-[var(--brand-600)]" />
              <h3 className="font-semibold text-[var(--ink)]">Kontrol Cepat</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Release Holder - PREMIUM */}
              <button
                onClick={() => setShowConfirmHolder(true)}
                disabled={isLoading}
                className="flex flex-col items-center gap-2 p-4 bg-[var(--card)] hover:bg-[var(--warning-50)] dark:hover:bg-[var(--warning)]/10 border-2 border-[var(--warning-200)] dark:border-[var(--warning-800)] rounded-xl transition-smooth hover-lift active-press disabled:opacity-50 group shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
              >
                <div className="w-12 h-12 bg-[var(--warning)] text-white rounded-xl flex items-center justify-center group-hover:shadow-[var(--shadow-lg)] transition-smooth group-hover:scale-110">
                  <BoxIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[var(--ink)] text-center leading-tight">Lepas Penahan</span>
              </button>

              {/* Stop Buzzer - PREMIUM */}
              <button
                onClick={handleStopBuzzer}
                disabled={isLoading}
                className="flex flex-col items-center gap-2 p-4 bg-[var(--card)] hover:bg-[var(--danger-50)] dark:hover:bg-[var(--danger)]/10 border-2 border-[var(--danger-200)] dark:border-[var(--danger-800)] rounded-xl transition-smooth hover-lift active-press disabled:opacity-50 group shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
              >
                <div className="w-12 h-12 bg-[var(--danger)] text-white rounded-xl flex items-center justify-center group-hover:shadow-[var(--shadow-lg)] transition-smooth group-hover:scale-110">
                  <VolumeX className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[var(--ink)] text-center leading-tight">Stop Buzzer</span>
              </button>

              {/* Unlock Door - PREMIUM */}
              <button
                onClick={handleUnlockDoor}
                disabled={isLoading}
                className="flex flex-col items-center gap-2 p-4 bg-[var(--card)] hover:bg-[var(--success-50)] dark:hover:bg-[var(--success)]/10 border-2 border-[var(--success-200)] dark:border-[var(--success-800)] rounded-xl transition-smooth hover-lift active-press disabled:opacity-50 group shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
              >
                <div className="w-12 h-12 bg-[var(--success)] text-white rounded-xl flex items-center justify-center group-hover:shadow-[var(--shadow-lg)] transition-smooth group-hover:scale-110">
                  <Unlock className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[var(--ink)] text-center leading-tight">Buka Pintu</span>
              </button>
            </div>
          </div>

          {/* Last Photo Card - PREMIUM */}
          <div className="bg-[var(--card)] rounded-2xl shadow-[var(--shadow-md)] p-5 border border-[var(--border)] fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[var(--brand-600)]" />
                <h3 className="font-semibold text-[var(--ink)]">Foto Terakhir</h3>
              </div>
            </div>
            {lastPhoto ? (
              <div className="hover-lift transition-smooth">
                <PhotoItem
                  src={getPhotoURL(lastPhoto.photoUrl)}
                  thumbSrc={getPhotoURL(lastPhoto.thumbUrl)}
                  timestamp={new Date(lastPhoto.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  status="success"
                  className="h-48 rounded-xl shadow-[var(--shadow-sm)]"
                />
              </div>
            ) : (
              <EmptyState
                icon={<Camera className="w-10 h-10" />}
                title="Belum ada foto"
                subtitle="Foto paket akan muncul di sini"
                action={{
                  label: 'Test Kamera',
                  onClick: async () => {
                    try {
                      await deviceAPI.capture();
                      toast.success('Perintah capture dikirim!');
                    } catch (error) {
                      toast.error('Gagal mengirim perintah');
                    }
                  }
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Modals - PREMIUM */}
      <BottomSheet
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setDoorPin('');
          setPinError('');
        }}
        title="Buka Pintu - Masukkan PIN"
      >
        <div className="space-y-4 fade-in">
          <div>
            <input
              type="password"
              value={doorPin}
              onChange={(e) => setDoorPin(e.target.value)}
              placeholder="Masukkan PIN (4-8 digit)"
              maxLength={8}
              className={`w-full px-4 py-4 border-2 ${pinError ? 'border-[var(--danger)] shake' : 'border-[var(--border)] dark:border-[var(--gray-600)]'} rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono dark:bg-[var(--gray-800)] dark:text-white shadow-[var(--shadow-sm)] transition-smooth`}
              autoFocus
            />
            {pinError && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-[var(--danger-light)] dark:bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg shake">
                <div className="w-1 h-10 bg-[var(--danger)] rounded-full" />
                <p className="text-sm text-[var(--danger)] font-medium">{pinError}</p>
              </div>
            )}
            <p className="text-xs text-[var(--muted)] mt-3 text-center flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Default PIN: 123456
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowPinModal(false);
                setDoorPin('');
                setPinError('');
              }}
              className="flex-1 px-4 py-3 bg-[var(--gray-100)] dark:bg-[var(--gray-800)] hover:bg-[var(--gray-200)] dark:hover:bg-[var(--gray-700)] text-[var(--ink-light)] rounded-xl font-medium transition-smooth active-press shadow-[var(--shadow-sm)]"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              onClick={submitUnlockDoor}
              disabled={isLoading || !doorPin}
              className="flex-1 px-4 py-3 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-xl font-medium transition-smooth flex items-center justify-center gap-2 disabled:opacity-50 hover-lift shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full rotate-smooth" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Buka</span>
                </>
              )}
            </button>
          </div>
        </div>
      </BottomSheet>

      {showConfirmHolder && (
        <ConfirmDialog
          title="Lepas Penahan Paket"
          message="Apakah Anda yakin ingin melepas penahan paket?"
          onConfirm={handleReleaseHolder}
          onCancel={() => setShowConfirmHolder(false)}
          type="warning"
        />
      )}
    </div>
  );
}
