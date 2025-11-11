import GowaService from './services/gowa.js';

const gowa = new GowaService();

const msg = `📚 *GOWA Session Management APIs*

✅ *3 API Tersedia:*

1️⃣ *GET /app/reconnect*
   • Reconnect ke WhatsApp server
   • Session tetap aman (tidak logout)
   • Gunakan jika koneksi terputus

2️⃣ *GET /app/logout*
   • Logout dan hapus database session
   • ⚠️ HARUS pairing ulang setelah ini
   • Gunakan untuk reset complete

3️⃣ *GET /app/login-with-code?phone=62xxx*
   • Generate pairing code baru
   • Untuk setup awal atau re-pair
   • Code format: XXXX-XXXX

---

🔧 *Penggunaan di Backend:*

const gowa = new GowaService();

// Reconnect (safe)
await gowa.reconnect();

// Logout (dangerous!)
await gowa.logout();

// Get pairing code
await gowa.getPairingCode("62xxx");

---

✅ Semua method sudah ditambahkan ke:
   services/gowa.js

🧪 Test file tersedia di:
   test-session.js`;

const result = await gowa.sendText('6281358959349', msg);
console.log(result.success ? '✅ Info sent: ' + result.messageId : '❌ Error: ' + result.error);
