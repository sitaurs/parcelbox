import { useState, useEffect } from 'react';
import { Camera, Zap, Volume2, Lock, AlertCircle, Activity, Wifi, Signal } from 'lucide-react';
import { deviceAPI } from '../services/api';
import { toast } from '../hooks/useToast';

// Import new components
import StatusChip from '../components/StatusChip';
import OfflineBanner from '../components/OfflineBanner';
import QuickPulseChips from '../components/QuickPulseChips';
import DangerZone from '../components/DangerZone';
import SectionCard from '../components/SectionCard';

export default function TestDevice() {
  const [deviceStatus, setDeviceStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFlashDuration, setSelectedFlashDuration] = useState(500);

  useEffect(() => {
    loadDeviceStatus();
    const interval = setInterval(loadDeviceStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDeviceStatus = async () => {
    try {
      const response = await deviceAPI.getStatus();
      setDeviceStatus(response.status);
    } catch (error) {
      console.error('Failed to load device status:', error);
    }
  };

  const testAction = async (action: string, handler: () => Promise<any>) => {
    if (!deviceStatus?.isOnline) {
      toast.error('Device offline - tidak dapat mengirim perintah');
      return;
    }
    
    try {
      setIsLoading(true);
      await handler();
      toast.success(`✅ ${action} berhasil!`);
    } catch (error: any) {
      toast.error(`❌ ${action} gagal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[var(--bg)] p-4 pb-24 space-y-4 fade-in">
      {/* Header Card */}
      <div className="gradient-brand rounded-2xl p-6 text-white shadow-[var(--shadow-xl)] hover-lift transition-smooth overflow-hidden relative">
        <div className="absolute inset-0 shimmer-premium opacity-10 pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <Activity className="w-6 h-6 pulse-soft" />
              </div>
              <h1 className="text-2xl font-bold">Test Device</h1>
            </div>
            <p className="text-sm opacity-90 ml-14">Uji fungsi hardware ESP32</p>
          </div>
          <StatusChip 
            status={deviceStatus?.isOnline ? 'online' : 'offline'}
            className="bg-white/20 backdrop-blur-sm border-2 border-white/30"
          />
        </div>
      </div>
      
      {/* Offline Banner */}
      {!deviceStatus?.isOnline && (
        <OfflineBanner message="Device offline - Test tidak dapat dilakukan" />
      )}
      
      {/* Device Status Mini Card */}
      {deviceStatus?.isOnline && (
        <div className="bg-[var(--card)] rounded-xl p-4 shadow-[var(--shadow-md)] border-2 border-[var(--border)] transition-smooth scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-[var(--success)] pulse-soft" />
              <span className="text-sm font-medium text-[var(--ink)]">Device Online</span>
            </div>
            {deviceStatus.lastDistance != null && (
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Signal className="w-4 h-4" />
                <span className="font-mono">{deviceStatus.lastDistance.toFixed(1)} cm</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Actions */}
      <SectionCard title="Uji fungsi foto dan LED" subtitle="Test kamera dan flash LED">
        <div className="space-y-3">
          {/* Camera Test */}
          <button
            onClick={() => testAction('Capture foto', () => deviceAPI.capture())}
            disabled={isLoading || !deviceStatus?.isOnline}
            className="w-full bg-[var(--card)] hover:bg-[var(--info-light)] text-[var(--ink)] font-semibold py-4 px-4 rounded-xl shadow-[var(--shadow-md)] border-2 border-[var(--border)] transition-smooth hover-lift active-press flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
          >
            <div className="bg-[var(--brand-100)] p-3 rounded-lg">
              <Camera className="w-6 h-6 text-[var(--brand-600)]" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">Test Kamera</p>
              <p className="text-sm text-[var(--muted)]">Ambil foto manual sekarang</p>
            </div>
          </button>

          {/* Flash Test with QuickPulse */}
          <div>
            <button
              onClick={() => testAction(`Flash ${selectedFlashDuration}ms`, () => deviceAPI.controlFlash('pulse', selectedFlashDuration))}
              disabled={isLoading || !deviceStatus?.isOnline}
              className="w-full bg-[var(--card)] hover:bg-[var(--warning)]/10 text-[var(--ink)] font-semibold py-4 px-4 rounded-xl shadow-[var(--shadow-md)] border-2 border-[var(--border)] transition-smooth hover-lift active-press flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="bg-[var(--warning)]/20 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-[var(--warning)]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">Test Flash LED</p>
                <p className="text-sm text-[var(--muted)]">Nyalakan flash {selectedFlashDuration}ms</p>
              </div>
            </button>
            
            {/* Quick Duration Selector */}
            <div className="mt-2">
              <QuickPulseChips
                durations={[500, 1000, 2000]}
                activeValue={selectedFlashDuration}
                onSelect={setSelectedFlashDuration}
                label="Durasi:"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Buzzer Tests */}
      <SectionCard title="Uji bunyi notifikasi" subtitle="Test buzzer alarm">
        <div className="space-y-3">
          <button
            onClick={() => testAction('Buzzer test', () => deviceAPI.controlBuzzer('start', 3000))}
            disabled={isLoading || !deviceStatus?.isOnline}
            className="w-full bg-[var(--card)] hover:bg-[var(--info-light)] text-[var(--ink)] font-semibold py-4 px-4 rounded-xl shadow-[var(--shadow-md)] border-2 border-[var(--border)] transition-smooth hover-lift active-press flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
          >
            <div className="bg-[var(--info)]/20 p-3 rounded-lg">
              <Volume2 className="w-6 h-6 text-[var(--info)]" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">Test Buzzer</p>
              <p className="text-sm text-[var(--muted)]">Bunyi buzzer 3 detik</p>
            </div>
          </button>
          
          {/* Stop Buzzer in DangerZone */}
          <DangerZone
            title="Force Stop"
            description="Hentikan buzzer secara paksa jika macet"
          >
            <button
              onClick={() => testAction('Stop buzzer', () => deviceAPI.controlBuzzer('stop'))}
              disabled={isLoading || !deviceStatus?.isOnline}
              className="w-full bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 text-[var(--danger)] font-semibold py-3 px-4 rounded-lg transition-smooth hover-lift active-press shadow-[var(--shadow-sm)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              <AlertCircle className="w-5 h-5" />
              <span>STOP Buzzer Paksa</span>
            </button>
          </DangerZone>
        </div>
      </SectionCard>

      {/* Solenoid Tests */}
      <SectionCard title="Uji solenoid dan servo" subtitle="Test penahan paket dan door lock">
        <div className="space-y-3">
          <button
            onClick={() => testAction('Test penahan', () => deviceAPI.controlHolder('pulse', 2000))}
            disabled={isLoading || !deviceStatus?.isOnline}
            className="w-full bg-[var(--card)] hover:bg-[var(--success)]/10 text-[var(--ink)] font-semibold py-4 px-4 rounded-xl shadow-[var(--shadow-md)] border-2 border-[var(--border)] transition-smooth hover-lift active-press flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
          >
            <div className="bg-[var(--success)]/20 p-3 rounded-lg">
              <Lock className="w-6 h-6 text-[var(--success)]" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">Test Penahan Paket</p>
              <p className="text-sm text-[var(--muted)]">Lepas solenoid penahan 2 detik</p>
            </div>
          </button>

          {/* NOTE: Door unlock test removed - requires PIN validation in real usage */}
        </div>
      </SectionCard>
      
      {/* Info Card */}
      <div className="bg-[var(--brand-50)] border-2 border-[var(--brand-200)] rounded-xl p-4 shadow-[var(--shadow-sm)]">
        <p className="text-sm text-[var(--brand-700)]">
          <strong>💡 Tips:</strong> Semua test akan mengirim perintah langsung ke ESP32. Pastikan device online dan berfungsi normal.
        </p>
      </div>
    </div>
  );
}
