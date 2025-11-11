# 4️⃣ API Reference

> **Dokumentasi lengkap semua endpoint REST API, MQTT topics, dan integrasi eksternal**

📖 [Kembali ke README](../README.md) | [← Arsitektur Sistem](03-system-architecture.md)

---

## 📋 Daftar Isi

- [Base URLs](#-base-urls)
- [Authentication](#-authentication)
- [REST API Endpoints](#-rest-api-endpoints)
  - [Auth API](#1-auth-api)
  - [Package API](#2-package-api)
  - [Device API](#3-device-api)
  - [WhatsApp API](#4-whatsapp-api)
- [MQTT Topics Reference](#-mqtt-topics-reference)
- [GOWA API Integration](#-gowa-api-integration)
- [Error Codes](#-error-codes)

---

## 🌐 Base URLs

### Development
```
Backend API:  http://localhost:9090/api
Frontend:     http://localhost:5173
MQTT Broker:  mqtt://13.213.57.228:1883
GOWA API:     http://ware-api.flx.web.id
```

### Production
```
Backend API:  https://api.smartparcel.com/api
Frontend:     https://smartparcel.com
MQTT Broker:  mqtt://mqtt.smartparcel.com:1883
GOWA API:     http://ware-api.flx.web.id (external)
```

---

## 🔐 Authentication

### Header Format

**User Authentication (JWT):**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Device Authentication (untuk ESP32):**
```http
Authorization: Bearer device_token_change_this
```

### Token Management

**Get Token:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "session": {
    "id": "abc123def456",
    "expiresAt": "2025-01-16T14:00:00Z"
  },
  "user": {
    "username": "admin",
    "requirePasswordChange": false,
    "isFirstLogin": false
  }
}
```

**Error Response:**
```json
{
  "error": "Invalid credentials"
}
```

---

## 📡 REST API Endpoints

### 1. Auth API

#### POST /api/auth/login
Login dengan username dan password.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "session": {
    "id": "abc123def456",
    "expiresAt": "2025-01-16T14:00:00Z"
  },
  "user": {
    "username": "admin",
    "requirePasswordChange": false,
    "isFirstLogin": false
  }
}
```

---

#### POST /api/auth/verify-pin
Verifikasi PIN untuk quick unlock.

**Request:**
```http
POST /api/auth/verify-pin
Authorization: Bearer <token>
Content-Type: application/json

{
  "pin": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN verified"
}
```

---

#### POST /api/auth/change-password
Ubah password user.

**Request:**
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "admin123",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

#### POST /api/auth/change-pin
Ubah PIN aplikasi.

**Request:**
```http
POST /api/auth/change-pin
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPin": "123456",
  "newPin": "654321"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN updated successfully"
}
```

---

#### POST /api/auth/change-door-pin
Ubah PIN kunci pintu (ESP8266).

**Request:**
```http
POST /api/auth/change-door-pin
Authorization: Bearer <token>
Content-Type: application/json

{
  "newPin": "987654"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Door PIN updated successfully"
}
```

**Validation:**
- PIN harus 4-8 digit angka
- Tidak boleh sequential: 123456, 654321
- Tidak boleh repetitive: 111111, 000000

---

#### POST /api/auth/logout
Logout dan hapus session.

**Request:**
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET /api/auth/session
Get informasi session aktif.

**Request:**
```http
GET /api/auth/session
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "abc123def456",
    "username": "admin",
    "createdAt": "2025-01-15T14:00:00Z",
    "expiresAt": "2025-01-16T14:00:00Z"
  }
}
```

---

### 2. Package API

#### GET /api/packages
Get daftar semua packages dengan pagination.

**Request:**
```http
GET /api/packages?limit=20&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Jumlah data per halaman (default: all)
- `offset` (optional): Offset dari data (default: 0)

**Response:**
```json
{
  "success": true,
  "packages": [
    {
      "id": 1,
      "deviceId": "box-01",
      "timestamp": "2025-01-15T14:30:00Z",
      "ts": "2025-01-15T14:30:00Z",
      "photoUrl": "/storage/package_1234567890.jpg",
      "thumbUrl": "/storage/package_1234567890_thumb.jpg",
      "distanceCm": 12.5,
      "reason": "detect",
      "firmware": "esp32cam-allinone",
      "status": "received",
      "pickedUpAt": null
    }
  ],
  "total": 1
}
```

---

#### GET /api/packages/:id
Get detail single package by ID.

**Request:**
```http
GET /api/packages/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "package": {
    "id": 1,
    "deviceId": "box-01",
    "timestamp": "2025-01-15T14:30:00Z",
    "photoUrl": "/storage/package_1234567890.jpg",
    "thumbUrl": "/storage/package_1234567890_thumb.jpg",
    "distanceCm": 12.5,
    "reason": "detect",
    "firmware": "esp32cam-allinone",
    "status": "received",
    "pickedUpAt": null
  }
}
```

---

#### POST /api/v1/packages
Upload foto paket dari ESP32-CAM.

**Request:**
```http
POST /api/v1/packages
Authorization: Bearer <device_token>
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="meta"
Content-Type: application/json

{"deviceId":"box-01","distanceCm":12.5,"reason":"detect","firmware":"esp32cam-allinone"}

--boundary
Content-Disposition: form-data; name="photo"; filename="capture.jpg"
Content-Type: image/jpeg

[JPEG binary data]
--boundary--
```

**Response:**
```json
{
  "success": true,
  "id": 1,
  "photoUrl": "/storage/package_1234567890.jpg",
  "thumbUrl": "/storage/package_1234567890_thumb.jpg",
  "ts": "2025-01-15T14:30:00Z"
}
```

**Error Responses:**
```json
// No photo uploaded
{
  "error": "No photo uploaded"
}

// Image too large (>5MB)
{
  "error": "File too large"
}

// Invalid device token
{
  "error": "Unauthorized"
}
```

---

#### DELETE /api/packages/:id
Hapus package by ID.

**Request:**
```http
DELETE /api/packages/1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Package deleted successfully",
  "deletedId": 1
}
```

---

#### GET /api/packages/stats/summary
Get statistik packages.

**Request:**
```http
GET /api/packages/stats/summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 128,
    "today": 3,
    "thisWeek": 12,
    "thisMonth": 45
  }
}
```

---

### 3. Device API

#### GET /api/device/status
Get status device real-time.

**Request:**
```http
GET /api/device/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": {
    "isOnline": true,
    "lastSeen": "2025-01-15T14:30:00Z",
    "lastDistance": 12.5,
    "lastCommand": "capture",
    "lastCommandStatus": "success",
    "lastCommandTime": "2025-01-15T14:29:50Z",
    "settingsApplied": true,
    "settingsError": null,
    "lastSettingsUpdate": "2025-01-15T14:25:00Z"
  }
}
```

---

#### GET /api/device/settings
Get konfigurasi device saat ini.

**Request:**
```http
GET /api/device/settings
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "ultra": {
      "min": 12,
      "max": 25
    },
    "lock": {
      "ms": 5000
    },
    "buzzer": {
      "ms": 60000,
      "buzzOn": 500,
      "buzzOff": 300
    },
    "doorLock": {
      "ms": 3000
    },
    "updatedAt": "2025-01-15T14:30:00Z"
  }
}
```

---

#### PUT /api/device/settings
Update konfigurasi device.

**Request:**
```http
PUT /api/device/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "ultra": {
    "min": 12,
    "max": 20
  },
  "lock": {
    "ms": 5000
  },
  "buzzer": {
    "ms": 60000
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {
    "ultra": {
      "min": 12,
      "max": 20
    },
    "lock": {
      "ms": 5000
    },
    "buzzer": {
      "ms": 60000
    },
    "updatedAt": "2025-01-15T14:35:00Z"
  }
}
```

**Validation Errors:**
```json
{
  "error": "ultra.min harus antara 5-50 cm",
  "field": "ultra.min",
  "value": 60,
  "allowedRange": [5, 50]
}
```

---

#### POST /api/device/control/capture
Trigger capture foto manual.

**Request:**
```http
POST /api/device/control/capture
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Capture command sent to device"
}
```

---

#### POST /api/device/control/flash
Kontrol LED flash.

**Request:**
```http
POST /api/device/control/flash
Authorization: Bearer <token>
Content-Type: application/json

{
  "state": "pulse",
  "ms": 1000
}
```

**Parameters:**
- `state`: "on" | "off" | "pulse"
- `ms` (optional): Duration untuk pulse mode (default: 1000ms)

**Response:**
```json
{
  "success": true,
  "message": "Flash command sent to device"
}
```

---

#### POST /api/device/control/buzzer
Kontrol buzzer/speaker.

**Request:**
```http
POST /api/device/control/buzzer
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "start",
  "ms": 3000
}
```

**Parameters:**
- `action`: "start" | "stop"
- `ms` (optional): Duration (default: 3000ms)

**Response:**
```json
{
  "success": true,
  "message": "Buzzer command sent to device"
}
```

---

#### POST /api/device/control/holder
Kontrol solenoid holder (lock box).

**Request:**
```http
POST /api/device/control/holder
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "pulse",
  "ms": 2000
}
```

**Parameters:**
- `action`: "open" | "closed" | "pulse"
- `ms` (optional): Pulse duration (default: 2000ms)

**Response:**
```json
{
  "success": true,
  "message": "Holder command sent to device"
}
```

---

#### POST /api/device/control/stop-pipeline
Stop semua proses pipeline yang sedang berjalan.

**Request:**
```http
POST /api/device/control/stop-pipeline
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Stop pipeline command sent to device"
}
```

---

#### POST /api/device/door/unlock
Unlock pintu dengan PIN verification.

**Request:**
```http
POST /api/device/door/unlock
Authorization: Bearer <token>
Content-Type: application/json

{
  "pin": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Door unlock command sent"
}
```

**Error Response (wrong PIN):**
```json
{
  "error": "Invalid PIN",
  "remainingAttempts": 2
}
```

**Error Response (locked out):**
```json
{
  "error": "Too many failed attempts. Try again later.",
  "lockedUntil": "2025-01-15T14:35:00Z"
}
```

---

#### POST /api/device/door/lock
Lock pintu secara manual.

**Request:**
```http
POST /api/device/door/lock
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Door lock command sent"
}
```

---

### 4. WhatsApp API

#### GET /api/whatsapp/status
Get status koneksi WhatsApp.

**Request:**
```http
GET /api/whatsapp/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": {
    "isConnected": true,
    "devices": [
      {
        "name": "-",
        "device": "6287853462867:7@s.whatsapp.net"
      }
    ],
    "config": {
      "isPaired": true,
      "recipients": ["120363123456789012@g.us"],
      "isBlocked": false
    }
  }
}
```

**Response (not connected):**
```json
{
  "success": true,
  "status": {
    "isConnected": false,
    "devices": [],
    "config": {
      "isPaired": false,
      "recipients": [],
      "isBlocked": false
    }
  }
}
```

---

#### POST /api/whatsapp/pairing-code
Generate pairing code untuk login WhatsApp.

**Request:**
```http
POST /api/whatsapp/pairing-code
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "6287853462867"
}
```

**Response:**
```json
{
  "success": true,
  "pairCode": "1A2B3C4D",
  "message": "Pairing code generated. Enter this code in WhatsApp settings."
}
```

**Usage:**
1. Buka WhatsApp di HP
2. Settings → Linked Devices
3. Link a Device → Link with phone number instead
4. Masukkan code: `1A2B3C4D` (tanpa dash)
5. Tunggu hingga paired

---

#### POST /api/whatsapp/logout
Logout dari WhatsApp dan hapus session.

**Request:**
```http
POST /api/whatsapp/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out from WhatsApp"
}
```

---

#### POST /api/whatsapp/reconnect
Reconnect ke WhatsApp server.

**Request:**
```http
POST /api/whatsapp/reconnect
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully reconnected to WhatsApp"
}
```

---

#### GET /api/whatsapp/recipients
Get daftar recipients (nomor/grup).

**Request:**
```http
GET /api/whatsapp/recipients
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "recipients": [
    "120363123456789012@g.us",
    "6281234567890@s.whatsapp.net"
  ]
}
```

**Format:**
- Group: `<id>@g.us` (contoh: `120363123456789012@g.us`)
- Individual: `<phone>@s.whatsapp.net` (contoh: `6281234567890@s.whatsapp.net`)

---

#### POST /api/whatsapp/recipients
Tambah recipient baru.

**Request:**
```http
POST /api/whatsapp/recipients
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "6281234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recipient added successfully",
  "recipients": [
    "120363123456789012@g.us",
    "6281234567890@s.whatsapp.net"
  ]
}
```

---

#### DELETE /api/whatsapp/recipients/:phone
Hapus recipient.

**Request:**
```http
DELETE /api/whatsapp/recipients/6281234567890
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Recipient removed successfully",
  "recipients": [
    "120363123456789012@g.us"
  ]
}
```

---

#### GET /api/whatsapp/groups
Get daftar WhatsApp groups.

**Request:**
```http
GET /api/whatsapp/groups
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "groups": [
    {
      "JID": "120363123456789012@g.us",
      "Name": "Tim Logistik",
      "Participants": [
        {
          "JID": "6281234567890@s.whatsapp.net",
          "IsAdmin": true,
          "IsSuperAdmin": true
        },
        {
          "JID": "6289876543210@s.whatsapp.net",
          "IsAdmin": false,
          "IsSuperAdmin": false
        }
      ],
      "MemberAddMode": "admin_add"
    }
  ]
}
```

---

#### POST /api/whatsapp/groups/select
Set grup-grup yang akan terima notifikasi.

**Request:**
```http
POST /api/whatsapp/groups/select
Authorization: Bearer <token>
Content-Type: application/json

{
  "groupIds": [
    "120363123456789012@g.us",
    "120363987654321098@g.us"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 groups selected for notifications",
  "recipients": [
    "120363123456789012@g.us",
    "120363987654321098@g.us"
  ]
}
```

---

#### POST /api/whatsapp/send-test
Kirim test message ke recipients.

**Request:**
```http
POST /api/whatsapp/send-test
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "🧪 Test message from SmartParcel"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test message sent to 2 recipients",
  "results": [
    {
      "recipient": "120363123456789012@g.us",
      "success": true,
      "messageId": "3EB0123456789ABCDEF"
    },
    {
      "recipient": "120363987654321098@g.us",
      "success": true,
      "messageId": "3EB0FEDCBA987654321"
    }
  ]
}
```

---

## 📡 MQTT Topics Reference

### Topic Naming Convention

```
smartparcel/{deviceId}/{category}/{subcategory}
```

### Complete Topic List

#### 1. Device Status

**Topic:** `smartparcel/box-01/status`  
**Direction:** ESP32 → Backend  
**QoS:** 1  
**Payload:**
```
"online"  // String literal
"offline" // Last Will Testament
```

**Frequency:** Every 30 seconds

---

#### 2. Distance Sensor

**Topic:** `smartparcel/box-01/sensor/distance`  
**Direction:** ESP32 → Backend  
**QoS:** 1  
**Payload:**
```json
{
  "cm": 12.5,
  "ts": 1234567890
}
```

**Frequency:** Every 1 second (configurable via settings)

---

#### 3. Event

**Topic:** `smartparcel/box-01/event`  
**Direction:** ESP32 → Backend  
**QoS:** 1  
**Payload:**

Package detection:
```json
{
  "type": "detect",
  "cm": 12.5
}
```

Pipeline steps:
```json
{"step": "wait_before_photo", "ms": 2817}
{"step": "photo_capture"}
{"step": "photo_success"}
{"step": "photo_failed"}
```

---

#### 4. Photo Status

**Topic:** `smartparcel/box-01/photo/status`  
**Direction:** ESP32 → Backend  
**QoS:** 1  
**Payload:**
```json
{
  "ok": true,
  "http": 201,
  "try": 1,
  "bytes": 45678,
  "id": 123,
  "photoUrl": "/storage/package_1234567890.jpg",
  "thumbUrl": "/storage/package_1234567890_thumb.jpg",
  "ts": "2025-01-15T14:30:00Z",
  "deviceId": "box-01",
  "meta": {
    "cm": 12.5
  }
}
```

---

#### 5. Control Commands

**Topic:** `smartparcel/box-01/control`  
**Direction:** Backend → ESP32  
**QoS:** 1  
**Payloads:**

Capture photo:
```json
{"action": "capture"}
```

Flash control:
```json
{"action": "flash", "state": "on"}
{"action": "flash", "state": "off"}
{"action": "flash", "state": "pulse", "ms": 1000}
```

Buzzer control:
```json
{"action": "buzzer", "state": "start", "ms": 3000}
{"action": "buzzer", "state": "stop"}
```

Holder control:
```json
{"action": "holder", "state": "open"}
{"action": "holder", "state": "closed"}
{"action": "holder", "state": "pulse", "ms": 2000}
```

Stop pipeline:
```json
{"action": "stop_pipeline"}
```

---

#### 6. Control ACK

**Topic:** `smartparcel/box-01/control/ack`  
**Direction:** ESP32 → Backend  
**QoS:** 1  
**Payload:**
```json
{
  "ok": true,
  "action": "capture"
}

{
  "ok": false,
  "action": "capture",
  "err": "camera_init_failed"
}
```

---

#### 7. Settings Update

**Topic:** `smartparcel/box-01/settings/set`  
**Direction:** Backend → ESP32  
**QoS:** 1  
**Payload:**
```json
{
  "ultra": {
    "min": 12,
    "max": 25
  },
  "lock": {
    "ms": 5000
  },
  "buzzer": {
    "ms": 60000,
    "buzzOn": 500,
    "buzzOff": 300
  }
}
```

---

#### 8. Settings ACK

**Topic:** `smartparcel/box-01/settings/ack`  
**Direction:** ESP32 → Backend  
**QoS:** 1  
**Payload:**
```json
{
  "ok": true
}

{
  "ok": false,
  "err": "invalid_range"
}
```

---

#### 9. Door Lock Control

**Topic:** `smartparcel/lock/control`  
**Direction:** Backend → ESP8266  
**QoS:** 1  
**Payload:**
```json
{
  "action": "unlock",
  "duration": 3000
}

{
  "action": "lock"
}
```

---

#### 10. Door Lock Status

**Topic:** `smartparcel/lock/status`  
**Direction:** ESP8266 → Backend  
**QoS:** 1  
**Payload:**
```json
{
  "status": "locked",
  "method": "auto",
  "timestamp": 114013
}

{
  "status": "unlocked",
  "method": "remote",
  "timestamp": 140759
}

// Security alert
{
  "status": "locked",
  "method": "keypad_lockout",
  "attempts": 3,
  "timestamp": 150000
}
```

**Methods:**
- `auto` - Auto-lock after timeout
- `remote` - Unlocked via mobile app
- `keypad` - Unlocked via physical keypad
- `online` - Manual lock via app
- `keypad_lockout` - Locked due to failed attempts

---

## 🔌 GOWA API Integration

### Base URL
```
http://ware-api.flx.web.id
```

### Authentication
```
Basic Auth:
Username: smartparcel
Password: SmartParcel2025!
```

### 1. Get Pairing Code

**Endpoint:** `POST /app/login-with-code`

**Request:**
```http
POST /app/login-with-code
Authorization: Basic c21hcnRwYXJjZWw6U21hcnRQYXJjZWwyMDI1IQ==
Content-Type: application/json

{
  "phone": "6287853462867"
}
```

**Response:**
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "results": {
    "code": "1A2B3C4D"
  }
}
```

---

### 2. Get Connection Status

**Endpoint:** `GET /app/devices`

**Request:**
```http
GET /app/devices
Authorization: Basic c21hcnRwYXJjZWw6U21hcnRQYXJjZWwyMDI1IQ==
```

**Response (connected):**
```json
{
  "code": "SUCCESS",
  "message": "Fetch device success",
  "results": [
    {
      "name": "-",
      "device": "6287853462867:7@s.whatsapp.net"
    }
  ]
}
```

**Response (not connected):**
```json
{
  "code": "SUCCESS",
  "message": "Fetch device success",
  "results": null
}
```

---

### 3. Logout

**Endpoint:** `POST /app/logout`

**Request:**
```http
POST /app/logout
Authorization: Basic c21hcnRwYXJjZWw6U21hcnRQYXJjZWwyMDI1IQ==
```

**Response:**
```json
{
  "code": "SUCCESS",
  "message": "Device logged out successfully"
}
```

---

### 4. Send Text Message

**Endpoint:** `POST /send/message`

**Request:**
```http
POST /send/message
Authorization: Basic c21hcnRwYXJjZWw6U21hcnRQYXJjZWwyMDI1IQ==
Content-Type: application/json

{
  "phone": "6281234567890",
  "message": "📦 Paket baru terdeteksi!"
}
```

**Response:**
```json
{
  "code": "SUCCESS",
  "message": "Message sent successfully",
  "results": {
    "message_id": "3EB0123456789ABCDEF",
    "status": "SUCCESS"
  }
}
```

---

### 5. Send Image

**Endpoint:** `POST /send/image`

**Request:**
```http
POST /send/image
Authorization: Basic c21hcnRwYXJjZWw6U21hcnRQYXJjZWwyMDI1IQ==
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="phone"

120363123456789012@g.us

--boundary
Content-Disposition: form-data; name="caption"

📦 *Paket Baru Terdeteksi!*

🕒 Waktu: 15 Jan 2025, 14:30
📏 Jarak: 12.5 cm
📍 Device: box-01

--boundary
Content-Disposition: form-data; name="image_url"

http://13.213.57.228:9090/storage/package_1234567890.jpg

--boundary
Content-Disposition: form-data; name="compress"

true

--boundary--
```

**Response:**
```json
{
  "code": "SUCCESS",
  "message": "Image sent successfully",
  "results": {
    "message_id": "3EB0987654321FEDCBA",
    "status": "SUCCESS"
  }
}
```

---

### 6. List Groups

**Endpoint:** `GET /user/my/groups`

**Request:**
```http
GET /user/my/groups
Authorization: Basic c21hcnRwYXJjZWw6U21hcnRQYXJjZWwyMDI1IQ==
```

**Response:**
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "results": {
    "data": [
      {
        "JID": "120363123456789012@g.us",
        "Name": "Tim Logistik",
        "Participants": [
          {
            "JID": "6281234567890@s.whatsapp.net",
            "IsAdmin": true,
            "IsSuperAdmin": true,
            "DisplayName": "",
            "Error": 0,
            "AddRequest": null
          }
        ],
        "MemberAddMode": "admin_add"
      }
    ]
  }
}
```

---

## ❌ Error Codes

### HTTP Status Codes

| Code | Description | Meaning |
|------|-------------|---------|
| 200 | OK | Request berhasil |
| 201 | Created | Resource berhasil dibuat (upload foto) |
| 400 | Bad Request | Request tidak valid (missing params, validation error) |
| 401 | Unauthorized | Token tidak valid atau expired |
| 403 | Forbidden | Tidak memiliki permission |
| 404 | Not Found | Resource tidak ditemukan |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | Backend service down |
| 503 | Service Unavailable | Service maintenance |

### Application Error Codes

#### Auth Errors
```json
{"error": "Invalid credentials"}
{"error": "Invalid PIN", "remainingAttempts": 2}
{"error": "Too many failed attempts. Try again later.", "lockedUntil": "2025-01-15T14:35:00Z"}
{"error": "Session expired"}
{"error": "Token invalid"}
```

#### Validation Errors
```json
{
  "error": "ultra.min harus antara 5-50 cm",
  "field": "ultra.min",
  "value": 60,
  "allowedRange": [5, 50]
}

{
  "error": "PIN harus 4-8 digit",
  "field": "pin",
  "value": "12"
}
```

#### Device Errors
```json
{"error": "Device offline"}
{"error": "Command timeout"}
{"error": "MQTT publish failed"}
```

#### WhatsApp Errors
```json
{"error": "WhatsApp not connected"}
{"error": "No recipients configured"}
{"error": "Failed to send message", "detail": "Network error"}
{"error": "GOWA API error: 405 Method Not Allowed"}
```

#### GOWA Specific Errors
```json
// Error 405 (spam protection)
{
  "code": "ERROR",
  "message": "405 Method Not Allowed - Too many requests"
}

// Solution: Wait 5-10 minutes before retry
// isBlocked flag will be set in whatsappConfig.json
```

---

## 🔗 Resources

### Official Documentation
- [Express.js Docs](https://expressjs.com/)
- [MQTT.js Docs](https://github.com/mqttjs/MQTT.js)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Capacitor Docs](https://capacitorjs.com/docs)

### Third-Party Services
- [GOWA GitHub](https://github.com/aldinokemal/go-whatsapp-web-multidevice)
- [Baileys WhatsApp Library](https://github.com/WhiskeySockets/Baileys)
- [Mosquitto MQTT Broker](https://mosquitto.org/documentation/)

### Related Projects
- [SmartParcel Repository](https://github.com/sitaurs/parcelbox)
- [Arduino ESP32-CAM](https://github.com/espressif/arduino-esp32)
- [ESP8266 NodeMCU](https://github.com/esp8266/Arduino)
- [PubSubClient](https://github.com/knolleary/pubsubclient)

---

## 📞 Support

Jika ada pertanyaan atau issue terkait API:

1. 📖 Baca [Features & Usage Guide](01-features-usage.md)
2. 🏗️ Pahami [System Architecture](03-system-architecture.md)
3. 💬 Hubungi support: support@smartparcel.com
4. 🐛 Report bug: [GitHub Issues](https://github.com/sitaurs/parcelbox/issues)

---

**📝 Last Updated:** November 11, 2025  
**🔖 Version:** 2.0.0

📖 [Kembali ke README](../README.md) | [← Arsitektur Sistem](03-system-architecture.md) | [🔝 Back to Top](#4%EF%B8%8F⃣-api-reference)
