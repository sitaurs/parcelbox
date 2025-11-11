# 1️⃣ Fitur & Cara Penggunaan

> **Panduan lengkap semua fitur SmartParcel dan cara menggunakannya**

📖 [Kembali ke README](../README.md) | [Arsitektur Sistem →](03-system-architecture.md)

---

## 📋 Daftar Isi

- [Login & Autentikasi](#-login--autentikasi)
- [Dashboard](#-dashboard)
- [Device Control](#-device-control)
- [WhatsApp Settings](#-whatsapp-settings)
- [Gallery & History](#-gallery--history)
- [Settings & Konfigurasi](#%EF%B8%8F-settings--konfigurasi)
- [PIN Lock](#-pin-lock)

---

## 🔐 Login & Autentikasi

### Halaman: `/login`

**Default Credentials:**
```
Username: admin
Password: admin123
```

### Fitur:
- ✅ Form login sederhana
- ✅ Remember me (simpan session)
- ✅ Error handling untuk kredensial salah
- ✅ Auto-redirect ke dashboard setelah login

### Cara Menggunakan:

1. Buka aplikasi di browser/mobile
2. Masukkan username dan password
3. Klik tombol **"Login"**
4. Jika berhasil, akan redirect ke `/dashboard`

### Screenshot:
```
┌─────────────────────────┐
│   📦 SmartParcel        │
│                         │
│  👤 Username            │
│  ┌──────────────────┐   │
│  │ admin            │   │
│  └──────────────────┘   │
│                         │
│  🔒 Password            │
│  ┌──────────────────┐   │
│  │ ••••••••         │   │
│  └──────────────────┘   │
│                         │
│  [✓] Remember me        │
│                         │
│  ┌──────────────────┐   │
│  │     LOGIN        │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

---

## 📊 Dashboard

### Halaman: `/dashboard`

Dashboard adalah halaman utama untuk monitoring status device dan statistik paket.

### Komponen Dashboard:

#### 1. **Status Device Card**

Menampilkan status real-time device ESP32/ESP8266:

```
┌─────────────────────────────┐
│ 📡 Status Device            │
│                             │
│ 🟢 Online                   │
│ Terakhir update: 2 detik    │
└─────────────────────────────┘
```

**Indikator:**
- 🟢 **Online** - Device terhubung ke MQTT broker
- 🔴 **Offline** - Device tidak terhubung (lebih dari 30 detik)

#### 2. **Status Kunci Card**

Menampilkan kondisi solenoid lock:

```
┌─────────────────────────────┐
│ 🔒 Status Kunci             │
│                             │
│ 🔓 Unlocked                 │
│ Method: remote              │
│ Timestamp: 14:23:15         │
└─────────────────────────────┘
```

**Status:**
- 🔒 **Locked** - Kunci terkunci
- 🔓 **Unlocked** - Kunci terbuka

**Method:**
- `online` - Kunci manual dari dashboard
- `remote` - Kunci dari remote control
- `auto` - Auto-lock setelah timeout

#### 3. **Sensor Jarak Card**

Menampilkan jarak objek dari sensor ultrasonik:

```
┌─────────────────────────────┐
│ 📏 Sensor Jarak             │
│                             │
│        12.5 cm              │
│                             │
│ Terakhir update: baru saja  │
└─────────────────────────────┘
```

**Threshold:**
- **< 15 cm** → Paket terdeteksi (trigger foto)
- **> 15 cm** → Kotak kosong

#### 4. **Statistik Paket**

Menampilkan jumlah paket berdasarkan periode:

```
┌──────────┬──────────┬──────────┬──────────┐
│ Hari Ini │ Minggu   │ Bulan    │ Total    │
│    3     │    12    │    45    │   128    │
└──────────┴──────────┴──────────┴──────────┘
```

### Auto-refresh:

Dashboard **auto-refresh setiap 3 detik** untuk update data real-time.

### Navigasi:

Dari dashboard, bisa akses menu lain via **Bottom Navigation**:
- 🏠 Dashboard
- 🎮 Control
- 💬 WhatsApp
- 🖼️ Gallery
- ⚙️ Settings

---

## 🎮 Device Control

### Halaman: `/device-control`

Halaman untuk **remote control** semua aktuator di SmartBox.

### Kontrol yang Tersedia:

#### 1. **🔓 Unlock Box**

Membuka kunci solenoid.

**Cara Pakai:**
1. Tap tombol **"Unlock"**
2. Kunci akan terbuka selama 3 detik (default)
3. Setelah timeout, auto-lock kembali

**MQTT Topic:**
```
smartparcel/box-01/control
Payload: {"action": "unlock", "duration": 3000}
```

#### 2. **🔒 Lock Box**

Mengunci solenoid secara manual.

**Cara Pakai:**
1. Tap tombol **"Lock"**
2. Kunci langsung terkunci

**MQTT Topic:**
```
smartparcel/box-01/control
Payload: {"action": "lock"}
```

#### 3. **📸 Capture Photo**

Ambil foto manual tanpa menunggu paket masuk.

**Cara Pakai:**
1. Tap tombol **"Capture Photo"**
2. ESP32-CAM akan ambil foto
3. Foto otomatis upload ke server
4. Muncul di Gallery

**MQTT Topic:**
```
smartparcel/box-01/control
Payload: {"action": "capture"}
```

**Response:**
```json
{
  "ok": true,
  "photoUrl": "https://server.com/photos/img_001.jpg",
  "bytes": 45678,
  "timestamp": "2025-01-15T14:30:00Z"
}
```

#### 4. **💡 Test Flash**

Test LED flash dengan berbagai mode.

**Mode:**
- **Pulse 500ms** - Kedip cepat
- **Pulse 1000ms** - Kedip normal
- **Pulse 2000ms** - Kedip lambat
- **Continuous** - Nyala terus

**MQTT Topic:**
```
smartparcel/box-01/control
Payload: {"action": "flash", "mode": "pulse", "duration": 1000}
```

#### 5. **🔔 Test Buzzer**

Test buzzer/speaker dengan durasi custom.

**Cara Pakai:**
1. Pilih duration: 1s, 2s, 3s, atau custom
2. Tap tombol **"Test Buzzer"**
3. Buzzer akan bunyi sesuai durasi

**MQTT Topic:**
```
smartparcel/box-01/control
Payload: {"action": "buzzer", "duration": 3000}
```

### Layout UI:

```
┌─────────────────────────────┐
│  🎮 Device Control          │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐    │
│  │  🔓 Unlock Box      │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │  🔒 Lock Box        │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │  📸 Capture Photo   │    │
│  └─────────────────────┘    │
│                             │
│  💡 Test Flash              │
│  [500ms] [1s] [2s] [ON]     │
│                             │
│  🔔 Test Buzzer             │
│  [1s] [2s] [3s]             │
│                             │
└─────────────────────────────┘
```

### Status Feedback:

Setiap aksi akan menampilkan **Toast Notification**:
- ✅ **Success** - Aksi berhasil
- ❌ **Error** - Aksi gagal
- ⏳ **Loading** - Sedang proses

---

## 💬 WhatsApp Settings

### Halaman: `/whatsapp-settings`

Halaman untuk **konfigurasi integrasi WhatsApp** menggunakan GOWA API.

### Flow Penggunaan:

#### 1. **Pairing WhatsApp**

**Jika belum terhubung:**

```
┌─────────────────────────────┐
│  💬 WhatsApp Settings       │
├─────────────────────────────┤
│                             │
│  Status: ❌ Tidak Terhubung │
│                             │
│  ┌─────────────────────┐    │
│  │  Request Pairing    │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

**Cara Pakai:**
1. Tap tombol **"Request Pairing Code"**
2. Akan muncul **8-digit code**: `1A2B-3C4D`
3. Buka WhatsApp di HP
4. Masuk ke **Settings > Linked Devices**
5. Tap **"Link a Device"**
6. Pilih **"Link with phone number instead"**
7. Masukkan code: `1A2B3C4D` (tanpa dash)
8. Tunggu sampai status berubah jadi **"Terhubung"**

**Jika sudah terhubung:**

```
┌─────────────────────────────┐
│  💬 WhatsApp Settings       │
├─────────────────────────────┤
│                             │
│  Status: ✅ Terhubung       │
│  Device: +62 878-xxxx-2867  │
│                             │
│  ┌─────────────────────┐    │
│  │  Logout WhatsApp    │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

#### 2. **Pilih Grup Penerima Notifikasi**

Setelah terhubung, bisa pilih grup WhatsApp yang akan terima notifikasi paket:

```
┌─────────────────────────────┐
│  📋 Pilih Grup              │
├─────────────────────────────┤
│                             │
│  🔍 Search groups...        │
│                             │
│  [✓] Tim Logistik (45)      │
│  [ ] Keluarga Besar (12)    │
│  [✓] Apartemen A1 (8)       │
│  [ ] Kantor Pusat (67)      │
│                             │
│  ┌─────────────────────┐    │
│  │  Simpan (2 dipilih) │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

**Cara Pakai:**
1. Scroll list grup
2. Centang grup yang diinginkan (bisa lebih dari 1)
3. Tap **"Simpan"**
4. Notifikasi paket akan dikirim ke grup terpilih

**Format Pesan Notifikasi:**

```
📦 *Paket Baru Terdeteksi!*

🕒 Waktu: 15 Jan 2025, 14:30:15
📏 Jarak: 12.5 cm
📍 Device: SmartBox-01

Silakan cek foto terlampir.
_SmartParcel System_
```

+ Foto paket yang di-capture ESP32-CAM

#### 3. **Logout WhatsApp**

Untuk disconnect WhatsApp:

**Cara Pakai:**
1. Tap **"Logout WhatsApp"**
2. Konfirmasi: **"Yakin ingin logout?"**
3. Tap **"Ya, Logout"**
4. Status kembali **"Tidak Terhubung"**
5. Semua grup terpilih akan di-reset

### Troubleshooting:

**❌ Pairing code tidak muncul:**
- Cek koneksi internet
- Pastikan GOWA API berjalan
- Refresh halaman dan coba lagi

**❌ Status masih "Terhubung" padahal sudah logout:**
- Bug sudah di-fix di v2.0.0
- Status sekarang ambil dari GOWA API `/app/devices`
- Bukan dari database `isPaired` flag

**❌ Grup tidak muncul namanya:**
- Bug sudah di-fix di v2.0.0
- Sekarang ekstrak dari `results.data` nested structure
- Support property `Name`, `name`, atau `GroupName`

---

## 🖼️ Gallery & History

### Halaman: `/gallery`

Halaman untuk **melihat semua foto paket** yang pernah di-capture.

### Fitur:

#### 1. **Timeline Foto**

Foto ditampilkan dalam grid responsif:

```
┌─────────────────────────────┐
│  🖼️ Gallery                 │
├─────────────────────────────┤
│                             │
│  [Foto1] [Foto2] [Foto3]    │
│  12.5cm  14.2cm  10.8cm     │
│  14:30   15:45   16:20      │
│                             │
│  [Foto4] [Foto5] [Foto6]    │
│  13.1cm  11.9cm  12.7cm     │
│  17:05   18:30   19:15      │
│                             │
└─────────────────────────────┘
```

#### 2. **Lightbox View**

Tap foto untuk lihat detail full-screen:

```
┌─────────────────────────────┐
│  ← Foto Paket #45           │
├─────────────────────────────┤
│                             │
│                             │
│      [FOTO FULL SIZE]       │
│                             │
│                             │
├─────────────────────────────┤
│  📏 Jarak: 12.5 cm          │
│  🕒 Waktu: 15 Jan, 14:30    │
│  📱 Device: box-01          │
│                             │
│  ┌──────────────────────┐   │
│  │  📥 Download         │   │
│  └──────────────────────┘   │
│                             │
└─────────────────────────────┘
```

**Navigasi:**
- **Swipe left/right** untuk foto sebelumnya/berikutnya
- **Pinch zoom** untuk zoom in/out
- **Tap X** untuk tutup lightbox

#### 3. **Filter & Search**

*(Coming soon)*

- Filter by date range
- Search by distance
- Sort by newest/oldest

#### 4. **Download Foto**

**Cara Pakai:**
1. Tap foto untuk buka lightbox
2. Tap tombol **"Download"**
3. Foto akan tersimpan ke gallery HP

**Format filename:**
```
smartparcel_20250115_143015_12.5cm.jpg
```

### Empty State:

Jika belum ada foto:

```
┌─────────────────────────────┐
│  🖼️ Gallery                 │
├─────────────────────────────┤
│                             │
│       📦                    │
│                             │
│  Belum ada foto paket       │
│                             │
│  Foto akan muncul otomatis  │
│  saat paket terdeteksi      │
│                             │
└─────────────────────────────┘
```

---

## ⚙️ Settings & Konfigurasi

### Halaman: `/settings`

Halaman untuk **konfigurasi device** dan **preferensi aplikasi**.

### Kategori Settings:

#### 1. **📏 Sensor Settings**

Konfigurasi sensor ultrasonik HC-SR04:

```
┌─────────────────────────────┐
│  📏 Sensor Ultrasonik       │
├─────────────────────────────┤
│                             │
│  Threshold Jarak            │
│  ┌──────────────────────┐   │
│  │ 15         [cm]      │   │
│  └──────────────────────┘   │
│  Jika < 15cm → Paket ada    │
│                             │
│  Interval Pembacaan         │
│  ┌──────────────────────┐   │
│  │ 1000       [ms]      │   │
│  └──────────────────────┘   │
│  Baca sensor tiap 1 detik   │
│                             │
└─────────────────────────────┘
```

**Parameter:**
- **Threshold**: 5-50 cm (default: 15 cm)
- **Interval**: 500-5000 ms (default: 1000 ms)

#### 2. **🔒 Lock Settings**

Konfigurasi solenoid lock:

```
┌─────────────────────────────┐
│  🔒 Solenoid Lock           │
├─────────────────────────────┤
│                             │
│  Auto-Lock Delay            │
│  ┌──────────────────────┐   │
│  │ 5          [detik]   │   │
│  └──────────────────────┘   │
│  Lock otomatis 5 detik      │
│  setelah unlock             │
│                             │
│  Pulse Duration             │
│  ┌──────────────────────┐   │
│  │ 2000       [ms]      │   │
│  └──────────────────────┘   │
│  Durasi pulse saat unlock   │
│                             │
└─────────────────────────────┘
```

**Parameter:**
- **Auto-Lock Delay**: 0-60 detik (0 = disabled)
- **Pulse Duration**: 500-5000 ms

#### 3. **💡 Flash Settings**

Konfigurasi LED flash ESP32-CAM:

```
┌─────────────────────────────┐
│  💡 LED Flash               │
├─────────────────────────────┤
│                             │
│  Brightness (PWM)           │
│  ├──────────────────────┤   │
│  0    128    200    255     │
│         ▲                   │
│                             │
│  Auto Flash saat Capture    │
│  ┌──────────────────────┐   │
│  │ [✓] Enabled          │   │
│  └──────────────────────┘   │
│                             │
│  Flash Duration             │
│  ┌──────────────────────┐   │
│  │ 1000       [ms]      │   │
│  └──────────────────────┘   │
│                             │
└─────────────────────────────┘
```

**Parameter:**
- **Brightness**: 0-255 (PWM duty cycle)
- **Auto Flash**: Enabled/Disabled
- **Duration**: 500-3000 ms

#### 4. **🔔 Buzzer Settings**

Konfigurasi buzzer/speaker:

```
┌─────────────────────────────┐
│  🔔 Buzzer                  │
├─────────────────────────────┤
│                             │
│  Beep saat Paket Terdeteksi │
│  ┌──────────────────────┐   │
│  │ [✓] Enabled          │   │
│  └──────────────────────┘   │
│                             │
│  Beep Duration              │
│  ┌──────────────────────┐   │
│  │ 3000       [ms]      │   │
│  └──────────────────────┘   │
│                             │
│  Beep Pattern               │
│  ┌──────────────────────┐   │
│  │ [Single Beep ▼]     │   │
│  └──────────────────────┘   │
│  • Single Beep              │
│  • Double Beep              │
│  • Triple Beep              │
│                             │
└─────────────────────────────┘
```

#### 5. **🔐 Security Settings**

Konfigurasi PIN lock:

```
┌─────────────────────────────┐
│  🔐 Security                │
├─────────────────────────────┤
│                             │
│  Require PIN at Startup     │
│  ┌──────────────────────┐   │
│  │ [✓] Enabled          │   │
│  └──────────────────────┘   │
│                             │
│  ┌─────────────────────┐    │
│  │  Change PIN         │    │
│  └─────────────────────┘    │
│                             │
│  Auto-Lock Timeout          │
│  ┌──────────────────────┐   │
│  │ 5          [menit]   │   │
│  └──────────────────────┘   │
│  Lock app jika idle 5 menit │
│                             │
└─────────────────────────────┘
```

#### 6. **📱 App Settings**

Konfigurasi aplikasi:

```
┌─────────────────────────────┐
│  📱 Application             │
├─────────────────────────────┤
│                             │
│  Dark Mode                  │
│  ┌──────────────────────┐   │
│  │ [✓] Enabled          │   │
│  └──────────────────────┘   │
│                             │
│  Language                   │
│  ┌──────────────────────┐   │
│  │ [Bahasa Indonesia ▼] │   │
│  └──────────────────────┘   │
│  • Bahasa Indonesia         │
│  • English                  │
│                             │
│  Notification Sound         │
│  ┌──────────────────────┐   │
│  │ [✓] Enabled          │   │
│  └──────────────────────┘   │
│                             │
└─────────────────────────────┘
```

### Simpan Settings:

Semua perubahan **auto-save** saat diubah. Ada konfirmasi toast:

```
✅ Settings berhasil disimpan
```

### Reset to Default:

Tombol **"Reset to Default"** di paling bawah untuk kembalikan semua ke nilai default.

---

## 🔐 PIN Lock

### Halaman: `/pin-lock`

Halaman untuk **input PIN** sebelum akses aplikasi (jika diaktifkan di Settings).

### Flow:

```
┌─────────────────────────────┐
│  🔐 Enter PIN               │
├─────────────────────────────┤
│                             │
│      ⚫ ⚫ ⚫ ⚫ ⚫ ⚫        │
│                             │
│  ┌───┬───┬───┐              │
│  │ 1 │ 2 │ 3 │              │
│  ├───┼───┼───┤              │
│  │ 4 │ 5 │ 6 │              │
│  ├───┼───┼───┤              │
│  │ 7 │ 8 │ 9 │              │
│  ├───┼───┼───┤              │
│  │ ← │ 0 │ ✓ │              │
│  └───┴───┴───┘              │
│                             │
└─────────────────────────────┘
```

**Cara Pakai:**
1. Masukkan PIN 6 digit
2. Tap **"✓"** atau akan auto-submit setelah 6 digit
3. Jika benar → Redirect ke Dashboard
4. Jika salah → Shake animation + error message

**Default PIN:**
```
123456
```

**Ubah PIN:**
Masuk ke Settings > Security > Change PIN

### Lupa PIN:

Jika lupa PIN, bisa reset via:
1. Reinstall aplikasi (data akan hilang)
2. Clear app data dari Settings HP
3. Kontak admin untuk reset dari backend

---

## 💡 Tips & Tricks

### 1. **Shortcut Keyboard** (Web Version)

- `Ctrl + K` - Quick search
- `Ctrl + /` - Toggle sidebar
- `Esc` - Close dialog/modal
- `F5` - Refresh dashboard

### 2. **Gesture Navigation** (Mobile)

- **Swipe right** dari edge kiri → Open sidebar
- **Swipe down** di dashboard → Pull to refresh
- **Long press** foto → Quick actions menu
- **Double tap** status card → Expand details

### 3. **Batch Operations**

*(Coming soon)*

- Select multiple photos untuk delete
- Export multiple photos sekaligus
- Bulk send WhatsApp notification

### 4. **Offline Mode**

Aplikasi support **offline-first**:
- Data ter-cache di IndexedDB
- Foto ter-cache di Service Worker
- Auto-sync saat online kembali

---

## 🆘 Troubleshooting

### ❌ Device Offline Terus

**Penyebab:**
- ESP32/ESP8266 tidak terhubung ke WiFi
- MQTT broker down
- Firewall block port 1883

**Solusi:**
1. Cek koneksi WiFi device
2. Restart ESP32/ESP8266
3. Ping MQTT broker: `ping 13.213.57.228`
4. Cek firewall rules

### ❌ Foto Tidak Muncul

**Penyebab:**
- ESP32-CAM error saat capture
- Upload ke server gagal
- Memori ESP32 penuh

**Solusi:**
1. Test capture manual dari Device Control
2. Cek log serial ESP32-CAM
3. Restart ESP32-CAM
4. Clear storage ESP32

### ❌ WhatsApp Tidak Kirim Pesan

**Penyebab:**
- WhatsApp belum paired
- Grup belum dipilih
- GOWA API error

**Solusi:**
1. Cek status di WhatsApp Settings
2. Re-pair WhatsApp jika perlu
3. Pastikan minimal 1 grup terpilih
4. Cek log backend-whatsapp

### ❌ Auto-Lock Tidak Jalan

**Penyebab:**
- Timer tidak di-set di Settings
- Firmware ESP8266 bug

**Solusi:**
1. Cek Settings > Lock > Auto-Lock Delay
2. Set ke nilai > 0 (misal 5 detik)
3. Re-upload firmware jika perlu

---

## 📞 Bantuan Lebih Lanjut

Jika masih ada masalah:

1. 📖 Baca [API Reference](04-api-reference.md) untuk detail teknis
2. 🏗️ Baca [Arsitektur Sistem](03-system-architecture.md) untuk flow data
3. 💬 Hubungi support via WhatsApp: +62 878-5346-2867
4. 🐛 Laporkan bug di [GitHub Issues](https://github.com/sitaurs/parcelbox/issues)

---

📖 [Kembali ke README](../README.md) | [Build & Deploy →](02-build-deploy.md) | [Arsitektur Sistem →](03-system-architecture.md)
