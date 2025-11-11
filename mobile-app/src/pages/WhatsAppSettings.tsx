import { useEffect, useState } from 'react';
import { MessageCircle, Check, X, Plus, Copy, RefreshCw, LogOut, Users } from 'lucide-react';
import { whatsappAPI } from '../services/api';
import { toast } from '../hooks/useToast';

// Import new components
import StatusChip from '../components/StatusChip';
import SectionCard from '../components/SectionCard';
import Field from '../components/Field';
import EmptyState from '../components/EmptyState';
import BottomSheet from '../components/BottomSheet';

interface WhatsAppGroup {
  JID: string;
  // Support different property names from GOWA/whatsmeow
  Name?: string;              // whatsmeow GroupInfo uses "Name"
  name?: string;              // lowercase fallback
  GroupName?: string;         // Custom property
  Participants?: any[];       // whatsmeow GroupInfo has Participants array
  ParticipantsCount?: number; // Custom count property
  OwnerJID?: string;
  GroupCreated?: number;
  [key: string]: any;         // Allow additional properties
}

interface Recipient {
  phone: string;
  name: string;
  type: 'individual' | 'group';
}

export default function WhatsAppSettings() {
  const [status, setStatus] = useState<any>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [senderPhone, setSenderPhone] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [newRecipientName, setNewRecipientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const [statusResponse, recipientsData] = await Promise.all([
        whatsappAPI.getStatus(),
        whatsappAPI.getRecipients(),
      ]);
      // Backend returns {success: true, status: {...}}
      const statusData = statusResponse.status || statusResponse;
      
      console.log('🔍 RAW STATUS DATA:', statusData);
      console.log('🔍 isConnected:', statusData.isConnected);
      console.log('🔍 isPaired:', statusData.config?.isPaired);
      
      // ONLY use isConnected from GOWA API - DO NOT use isPaired as fallback
      setStatus({
        ...statusData,
        isConnected: statusData.isConnected || false
      });
      
      console.log('✅ STATUS SET:', {
        isConnected: statusData.isConnected || false,
        senderPhone: statusData.senderPhone
      });
      
      // Convert old format (string[]) to new format (Recipient[])
      const recipientsList = recipientsData.recipients || [];
      const formattedRecipients = recipientsList.map((phone: string, index: number) => ({
        phone,
        name: phone.includes('@g.us') ? `Grup ${index + 1}` : `Penerima ${index + 1}`,
        type: phone.includes('@g.us') ? 'group' : 'individual'
      }));
      setRecipients(formattedRecipients);
    } catch (error) {
      console.error('Load status error:', error);
    }
  };

  const handleRequestPairing = async () => {
    if (!senderPhone || senderPhone.length < 10) {
      toast.error('Nomor telepon tidak valid (min 10 digit)');
      return;
    }

    try {
      setIsLoading(true);
      const response = await whatsappAPI.requestPairingCode(senderPhone);
      
      console.log('🎯 PAIRING CODE RESPONSE:', response);
      
      const code = response.pairCode || response.code;
      
      if (!code) {
        throw new Error('Pairing code tidak diterima dari server');
      }
      
      setPairingCode(code);
      
      // Auto-copy to clipboard for better mobile UX
      try {
        await navigator.clipboard.writeText(code);
        toast.success('✅ Pairing code dibuat & disalin ke clipboard!');
      } catch {
        toast.success('✅ Pairing code berhasil dibuat!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal membuat pairing code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRecipient = async () => {
    if (!newRecipient || newRecipient.length < 10) {
      toast.error('Nomor telepon tidak valid (min 10 digit)');
      return;
    }

    if (!newRecipientName.trim()) {
      toast.error('Nama penerima harus diisi');
      return;
    }

    try {
      setIsLoading(true);
      await whatsappAPI.addRecipient(newRecipient);
      setRecipients([...recipients, {
        phone: newRecipient,
        name: newRecipientName.trim(),
        type: 'individual'
      }]);
      setNewRecipient('');
      setNewRecipientName('');
      toast.success('✅ Penerima berhasil ditambahkan');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambah penerima');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRecipient = async (phone: string) => {
    try {
      await whatsappAPI.removeRecipient(phone);
      setRecipients(recipients.filter(r => r.phone !== phone));
      toast.success('Penerima dihapus');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus penerima');
    }
  };

  const handleLoadGroups = async () => {
    try {
      setIsLoading(true);
      const response = await whatsappAPI.getGroups();
      
      console.log('🔍 GET GROUPS RESPONSE:', response);
      
      if (response.success && Array.isArray(response.groups)) {
        // Keep original format from GOWA API
        console.log('📋 First group structure:', response.groups[0]);
        setGroups(response.groups);
        setShowGroupPicker(true);
      } else {
        console.error('❌ Invalid groups response:', response);
        setGroups([]); // Reset to empty array
        toast.error('Gagal memuat daftar grup');
      }
    } catch (error: any) {
      console.error('❌ Load groups error:', error);
      setGroups([]); // Reset to empty array on error
      toast.error(error.message || 'Gagal memuat grup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGroup = async (groupJid: string, groupName: string) => {
    try {
      // Group JID already in correct format from GOWA
      await whatsappAPI.addRecipient(groupJid);
      setRecipients([...recipients, {
        phone: groupJid,
        name: groupName,
        type: 'group'
      }]);
      setShowGroupPicker(false);
      toast.success('✅ Grup berhasil ditambahkan');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambah grup');
    }
  };
  
  const handleSendTest = async () => {
    if (recipients.length === 0) {
      toast.error('Belum ada penerima');
      return;
    }
    try {
      setIsLoading(true);
      await whatsappAPI.testMessage(recipients[0].phone, 'Test dari SmartParcel 📦');
      toast.success('📱 Pesan test dikirim!');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim test');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    if (!confirm('Logout dari WhatsApp? Session akan dihapus dan perlu pairing ulang.')) return;
    
    try {
      setIsLoading(true);
      await whatsappAPI.logout();
      setPairingCode('');
      setSenderPhone('');
      toast.success('✅ Logout berhasil');
      setTimeout(() => loadStatus(), 1000);
    } catch (error: any) {
      toast.error(error.message || 'Gagal logout');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReconnect = async () => {
    if (!confirm('Reconnect ke WhatsApp server?')) return;
    
    try {
      setIsLoading(true);
      await whatsappAPI.reconnect();
      toast.success('🔄 Reconnect berhasil!');
      setTimeout(() => loadStatus(), 1000);
    } catch (error: any) {
      toast.error(error.message || 'Gagal reconnect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-full bg-[var(--bg)] p-4 pb-24 space-y-4 fade-in">
      {/* Header Card */}
      <div className="gradient-brand rounded-2xl p-6 text-white shadow-[var(--shadow-xl)] hover-lift transition-smooth overflow-hidden relative">
        <div className="absolute inset-0 shimmer-premium opacity-10 pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <MessageCircle className="w-6 h-6 pulse-soft" />
              </div>
              <h1 className="text-2xl font-bold">WhatsApp</h1>
            </div>
            <p className="text-sm opacity-90 ml-14">Notifikasi paket via WhatsApp</p>
          </div>
          <StatusChip 
            status={status?.isConnected ? 'online' : 'offline'}
            className="bg-white/20 backdrop-blur-sm border-2 border-white/30"
          />
        </div>
      </div>

      {/* Connection Status Card */}
      <SectionCard
        title="Status Koneksi"
        subtitle={status?.senderPhone ? `Terhubung sebagai +${status.senderPhone}` : 'Belum terhubung'}
        actions={status?.isConnected ? (
          <button
            onClick={handleSendTest}
            disabled={isLoading}
            className="px-4 py-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white text-sm font-medium rounded-lg transition-smooth hover-lift active-press shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-50"
          >
            Kirim Test
          </button>
        ) : undefined}
      >
        <div className="flex items-center gap-3 p-4 bg-[var(--card)] rounded-xl border-2 border-[var(--border)] shadow-[var(--shadow-sm)] transition-smooth">
          <div className={`p-3 rounded-xl transition-smooth ${
            status?.isConnected
              ? 'bg-[var(--success)]/10 text-[var(--success)]' 
              : 'bg-[var(--muted)]/20 text-[var(--muted)]'
          }`}>
            <MessageCircle className={`w-6 h-6 ${status?.isConnected ? 'pulse-soft' : ''}`} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[var(--ink)]">
              {status?.isConnected ? '✅ Terhubung' : '❌ Belum Terhubung'}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {status?.isConnected ? 'Siap mengirim notifikasi' : 'Hubungkan WhatsApp terlebih dahulu'}
            </p>
          </div>
          {status?.isConnected ? (
            <Check className="w-6 h-6 text-[var(--success)] pulse-soft" />
          ) : (
            <X className="w-6 h-6 text-[var(--muted)]" />
          )}
        </div>
      </SectionCard>

      {/* Pairing Section - SELALU TAMPIL */}
      <SectionCard title="Hubungkan WhatsApp" subtitle="Dapatkan pairing code untuk menghubungkan">
        <div className="space-y-4">
          <Field label="Nomor Pengirim" help="Format: 628XXXXXXXXX (tanpa +)">
            <input
              type="tel"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="628123456789"
              maxLength={15}
              className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-[var(--brand-600)] text-lg bg-[var(--card)] text-[var(--ink)] transition-smooth shadow-[var(--shadow-sm)] focus:shadow-[var(--shadow-md)]"
            />
          </Field>

          <button
            onClick={handleRequestPairing}
            disabled={isLoading || senderPhone.length < 10}
            className="w-full bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white font-semibold py-3 px-4 rounded-xl transition-smooth hover-lift active-press shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                <span>Dapatkan Pairing Code</span>
              </>
            )}
          </button>

          {pairingCode && (
            <div className="bg-[var(--success)]/10 border-2 border-[var(--success)]/20 rounded-xl p-6 space-y-3 scale-in shadow-[var(--shadow-md)]">
              <p className="text-sm font-medium text-[var(--success)] text-center">
                🎉 Pairing Code Berhasil Dibuat:
              </p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-4xl font-mono font-bold text-[var(--success)] text-center tracking-[0.3em] select-all pulse-soft">
                  {pairingCode}
                </p>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(pairingCode);
                      toast.success('📋 Kode disalin!');
                    } catch {
                      toast.error('Gagal menyalin kode');
                    }
                  }}
                  className="p-2 hover:bg-[var(--success)]/20 rounded-lg transition-smooth active-press"
                  title="Salin kode"
                >
                  <Copy className="w-5 h-5 text-[var(--success)]" />
                </button>
              </div>
              <div className="bg-[var(--card)] rounded-lg p-4 space-y-2 border border-[var(--border)]">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  👉 Langkah selanjutnya:
                </p>
                <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
                  <li>Buka WhatsApp di ponsel</li>
                  <li>Pengaturan → Perangkat Tertaut</li>
                  <li>Tautkan dengan nomor telepon</li>
                  <li>Masukkan kode di atas</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Connection Management Actions */}
      <SectionCard 
        title="Kelola Koneksi" 
        subtitle="Reset koneksi atau logout dari WhatsApp"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Reconnect */}
          <button
            onClick={handleReconnect}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium rounded-xl transition-smooth hover-lift active-press shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-50 border-2 border-blue-200 dark:border-blue-800"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Reconnect</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 font-medium rounded-xl transition-smooth hover-lift active-press shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-50 border-2 border-red-200 dark:border-red-800"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
        
        {/* Info Text */}
        <div className="mt-4 p-4 bg-[var(--card)] rounded-xl border-2 border-[var(--border)]">
          <p className="text-sm text-[var(--muted)] space-y-2">
            <span className="block"><strong className="text-[var(--ink)]">Reconnect:</strong> Hubungkan ulang ke server WhatsApp jika API tidak berfungsi</span>
            <span className="block"><strong className="text-[var(--ink)]">Logout:</strong> Hapus session dan keluar dari WhatsApp (perlu pairing ulang)</span>
          </p>
        </div>
      </SectionCard>

      {/* Recipients Section */}
      <SectionCard 
        title="Penerima Notifikasi" 
        subtitle={`${recipients.length} penerima terdaftar`}
      >
        <div className="space-y-4">
          {/* Add Individual Recipient */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[var(--ink)]">
              Tambah Penerima Individu
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
                placeholder="Nama penerima (cth: Pak Budi)"
                maxLength={50}
                className="px-4 py-3 border-2 border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-[var(--brand-600)] bg-[var(--card)] text-[var(--ink)] transition-smooth shadow-[var(--shadow-sm)] focus:shadow-[var(--shadow-md)]"
              />
              <input
                type="tel"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value.replace(/\D/g, ''))}
                placeholder="628111222333"
                maxLength={15}
                className="px-4 py-3 border-2 border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--brand-600)] focus:border-[var(--brand-600)] bg-[var(--card)] text-[var(--ink)] transition-smooth shadow-[var(--shadow-sm)] focus:shadow-[var(--shadow-md)]"
              />
            </div>
            <button
              onClick={handleAddRecipient}
              disabled={isLoading || newRecipient.length < 10 || !newRecipientName.trim()}
              className="w-full bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white py-3 px-4 rounded-xl transition-smooth hover-lift active-press shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Tambah Penerima</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[var(--border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--bg)] text-[var(--muted)] font-medium">ATAU</span>
            </div>
          </div>

          {/* Add Group Button */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[var(--ink)]">
              Tambah Grup WhatsApp
            </label>
            <button
              onClick={handleLoadGroups}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-smooth hover-lift active-press shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 font-medium"
            >
              <Users className="w-5 h-5" />
              <span>Pilih dari Daftar Grup</span>
            </button>
          </div>

          {/* Recipients List */}
          {recipients.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="w-10 h-10" />}
              title="Belum ada penerima"
              subtitle="Tambahkan nomor WhatsApp atau grup untuk menerima notifikasi"
            />
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Daftar Penerima ({recipients.length})
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recipients.map((recipient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl hover:border-[var(--brand-300)] transition-smooth"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-2 mb-1">
                        {recipient.type === 'group' ? (
                          <Users className="w-4 h-4 text-green-600" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-blue-600" />
                        )}
                        <h3 className="font-semibold text-[var(--ink)] truncate">
                          {recipient.name}
                        </h3>
                      </div>
                      <p className="text-sm text-[var(--muted)] truncate">
                        {recipient.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveRecipient(recipient.phone)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-smooth hover-lift active-press"
                      title="Hapus"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Info Card */}
      <div className="bg-[var(--brand-50)] border-2 border-[var(--brand-200)] rounded-xl p-4 shadow-[var(--shadow-sm)]">
        <p className="text-sm text-[var(--brand-700)]">
          <strong>💡 Info:</strong> Semua penerima akan mendapat notifikasi foto paket dan alert keamanan secara real-time.
        </p>
      </div>
    </div>

    {/* Group Picker Bottom Sheet */}
    <BottomSheet
      isOpen={showGroupPicker}
      onClose={() => setShowGroupPicker(false)}
      title="Pilih Grup WhatsApp"
    >
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {!Array.isArray(groups) || groups.length === 0 ? (
          <EmptyState
            icon={<Users className="w-10 h-10" />}
            title="Tidak ada grup"
            subtitle="Anda belum tergabung dalam grup WhatsApp"
          />
        ) : (
          groups.map((group) => {
            // GOWA returns whatsmeow types.GroupInfo structure:
            // { JID, Name, OwnerJID, GroupCreated, Participants: [...] }
            const groupName = group.Name || group.GroupName || group.name || 'Grup Tanpa Nama';
            const participantsCount = group.Participants?.length || group.ParticipantsCount || 0;
            
            return (
            <div
              key={group.JID}
              className="flex items-center justify-between p-4 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl hover:border-[var(--brand-300)] transition-smooth"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--ink)] truncate">
                  {groupName}
                </h3>
                <p className="text-sm text-[var(--muted)] flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {participantsCount} anggota
                </p>
              </div>
              <button
                onClick={() => handleAddGroup(group.JID, groupName)}
                disabled={recipients.some(r => r.phone === group.JID)}
                className="ml-4 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white px-4 py-2 rounded-lg transition-smooth hover-lift active-press disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
              >
                {recipients.some(r => r.phone === group.JID) ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Ditambahkan</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Tambahkan</span>
                  </>
                )}
              </button>
            </div>
            );
          })
        )}
      </div>
    </BottomSheet>
    </>
  );
}
