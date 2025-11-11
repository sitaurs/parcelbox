# 3️⃣ Arsitektur Sistem

> **Penjelasan mendalam tentang bagaimana semua komponen SmartParcel bekerja bersama**

📖 [Kembali ke README](../README.md) | [← Build & Deploy](02-build-deploy.md) | [API Reference →](04-api-reference.md)

---

## 📋 Daftar Isi

- [Overview Arsitektur](#-overview-arsitektur)
- [Komponen Sistem](#-komponen-sistem)
- [Data Flow](#-data-flow)
- [MQTT Communication](#-mqtt-communication)
- [Database Schema](#-database-schema)
- [Firmware Logic](#-firmware-logic)
- [WhatsApp Integration](#-whatsapp-integration)

---

## 🏗️ Overview Arsitektur

SmartParcel menggunakan arsitektur **event-driven IoT** dengan komunikasi real-time via MQTT.

### Diagram Arsitektur Lengkap

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SMARTPARCEL SYSTEM                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐                    ┌──────────────────────────────┐
│   ESP32-CAM      │                    │   MQTT Broker (Mosquitto)    │
│   + ESP8266      │◄──────────────────►│   Port 1883                  │
│   (Firmware)     │     MQTT Topics    │   13.213.57.228              │
└────────┬─────────┘                    └────────┬─────────────────────┘
         │                                       │
         │ HTTP POST                             │
         │ /api/v1/packages                      │
         │                                       │
         │                              ┌────────▼─────────┐
         └─────────────────────────────►│  Backend Node.js │
                                        │  Express v4.18   │
                                        │  Port 9090       │
                                        └────────┬─────────┘
                                                 │
                         ┌───────────────────────┼───────────────────────┐
                         │                       │                       │
                ┌────────▼────────┐     ┌────────▼────────┐    ┌────────▼────────┐
                │   REST API      │     │   MQTT Client   │    │   GOWA Service  │
                │   /api/auth     │     │   Subscribe &   │    │   WhatsApp API  │
                │   /api/device   │     │   Publish       │    │   Integration   │
                │   /api/packages │     └─────────────────┘    └─────────────────┘
                │   /api/whatsapp │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │   JSON Database │
                │   - users.json  │
                │   - packages.json
                │   - settings.json
                │   - whatsappConfig.json
                └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND APPLICATIONS                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐          ┌───────────────────────────────┐
│   Mobile App (Android APK)   │          │   Web App (Browser)           │
│   React 18 + TypeScript      │◄────────►│   React 18 + TypeScript       │
│   Capacitor + Vite           │   Sync   │   Vite Dev Server             │
│   Installed on Phone         │          │   http://localhost:5173       │
└──────────────────────────────┘          └───────────────────────────────┘
         │                                         │
         └─────────────────┬───────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   API Client    │
                  │   Axios HTTP    │
                  │   REST Calls    │
                  └─────────────────┘
                           │
                           │ HTTP/HTTPS
                           │
                  ┌────────▼────────┐
                  │   Backend API   │
                  │   Port 9090     │
                  └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│   GOWA API (Go-WhatsApp-Web-Multidevice)                                 │
│   http://ware-api.flx.web.id                                             │
│   Version: v7.8.2                                                        │
│                                                                          │
│   Endpoints:                                                             │
│   - POST /app/login-with-code  (Pairing code)                           │
│   - GET  /app/devices          (Connection status)                       │
│   - POST /app/logout           (Disconnect)                              │
│   - POST /send/message         (Send text)                               │
│   - POST /send/image           (Send photo with caption)                 │
│   - GET  /user/my/groups       (List WhatsApp groups)                    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Komponen Sistem

### 1. **Hardware Layer (IoT Devices)**

#### ESP32-CAM (AI-Thinker)
- **Fungsi**: Main controller, capture foto paket
- **Komponen**:
  - Camera OV2640 (2MP)
  - WiFi built-in
  - HC-SR04 ultrasonic sensor (jarak)
  - 2x Relay (solenoid lock & buzzer)
  - LED Flash (GPIO 4)
- **Komunikasi**:
  - MQTT publish/subscribe (sensor data, events, ACK)
  - HTTP POST upload foto ke backend

#### ESP8266 NodeMCU (Optional)
- **Fungsi**: Door lock controller dengan keypad
- **Komponen**:
  - 4x4 Matrix keypad
  - Solenoid door lock
  - Status LED
- **Komunikasi**:
  - MQTT topics: `smartparcel/lock/*`

### 2. **Middleware Layer (MQTT Broker)**

#### Mosquitto MQTT Broker
- **Host**: 13.213.57.228:1883
- **Auth**: Username/Password
- **QoS**: Level 1 (at least once delivery)
- **Persistence**: Session saved untuk reliability
- **Topics**: 12+ topics untuk control & monitoring

### 3. **Backend Layer (Node.js)**

#### Main Backend (`backend-app`)
- **Stack**: Express.js v4.18, Node.js v18+
- **Port**: 9090
- **Fungsi**:
  - REST API untuk mobile app
  - MQTT client (subscribe & publish)
  - Photo storage & processing (Sharp)
  - WhatsApp integration via GOWA API
  - JSON file database
  - Authentication & session management

**File Structure:**
```
backend-app/
├── server.js           # Entry point
├── routes/
│   ├── auth.js         # Login, PIN, password
│   ├── device.js       # Device control & settings
│   ├── packages.js     # Package CRUD & stats
│   └── whatsapp.js     # WhatsApp management
├── mqtt/
│   └── client.js       # MQTT connection & handlers
├── services/
│   └── gowa.js         # GOWA API wrapper
├── middleware/
│   └── auth.js         # JWT auth & rate limiting
├── utils/
│   └── db.js           # JSON database helper
├── db/
│   ├── users.json
│   ├── packages.json
│   ├── settings.json
│   ├── deviceStatus.json
│   ├── whatsappConfig.json
│   ├── pins.json
│   └── sessions.json
└── storage/            # Uploaded photos
```

#### WhatsApp Backend (`backend-whatsapp`) - DEPRECATED
- **Note**: Sudah tidak digunakan, diganti GOWA API integration
- Di v2.0.0, semua WhatsApp logic ada di `backend-app/services/gowa.js`

### 4. **Frontend Layer (React + TypeScript)**

#### Mobile App
- **Stack**: React 18, TypeScript, Vite, TailwindCSS
- **Port**: 5173 (dev), compiled ke APK (production)
- **Deployment**: Capacitor untuk Android build

**Pages:**
```
mobile-app/src/pages/
├── Login.tsx           # Authentication
├── PinLock.tsx         # PIN unlock
├── Dashboard.tsx       # Main dashboard
├── DeviceControl.tsx   # Device settings & control
├── WhatsAppSettings.tsx # WhatsApp configuration
├── Gallery.tsx         # Photo gallery
└── Settings.tsx        # App settings
```

**Components:**
```
mobile-app/src/components/
├── Layout.tsx          # Main layout wrapper
├── BottomSheet.tsx     # Modal bottom sheet
├── ConfirmDialog.tsx   # Confirmation dialog
├── StatusChip.tsx      # Online/offline badge
├── MetricTile.tsx      # Stats card
├── PhotoItem.tsx       # Photo grid item
├── Lightbox.tsx        # Photo viewer
├── EmptyState.tsx      # No data placeholder
└── Toast.tsx           # Notification toast
```

**Services:**
```
mobile-app/src/services/
└── api.ts              # API client with TypeScript interfaces
```

**State Management:**
```
mobile-app/src/store/
└── useStore.ts         # Zustand global state
```

---

## 🔄 Data Flow

### Flow 1: Package Detection → WhatsApp Notification

```
1. [ESP32] HC-SR04 detect jarak < 15cm
   │
   ├─► Trigger pipeline: wait 3s → capture foto
   │
2. [ESP32] Camera capture JPEG
   │
   ├─► Publish MQTT: smartparcel/box-01/event
   │   Payload: {"type":"detect","cm":12.5}
   │
3. [ESP32] HTTP POST /api/v1/packages
   │   Multipart form-data:
   │   - meta: {"deviceId":"box-01","distanceCm":12.5,"reason":"detect"}
   │   - photo: [JPEG binary]
   │
4. [Backend] Terima upload
   │
   ├─► Save to storage/package_<timestamp>.jpg
   ├─► Generate thumbnail (300x300px)
   ├─► Append to packages.json
   │
5. [Backend] MQTT handler terima event "detect"
   │
   ├─► Cek whatsappConfig.json
   │   - isPaired: true?
   │   - recipients: ada?
   │   - isBlocked: false?
   │
6. [Backend] Call GOWA API
   │
   ├─► Loop each recipient in config.recipients
   ├─► POST http://ware-api.flx.web.id/send/image
   │   Body: {
   │     phone: "6281234567890",
   │     caption: "📦 Paket Baru!\n🕒 15 Jan 2025, 14:30\n📏 12.5 cm",
   │     image: "http://13.213.57.228:9090/storage/package_123.jpg",
   │     compress: true
   │   }
   │
7. [GOWA API] Send to WhatsApp Web API
   │
   ├─► Via websocket ke WhatsApp servers
   │
8. [WhatsApp] User terima pesan + foto di grup
```

### Flow 2: Remote Unlock Door via Mobile App

```
1. [Mobile App] User tap tombol "Unlock Door"
   │
   ├─► Show PIN dialog
   │
2. [Mobile App] User masukkan PIN 6-digit
   │
   ├─► POST /api/device/door/unlock
   │   Body: {"pin":"123456"}
   │
3. [Backend] Verify PIN
   │
   ├─► Compare dengan pins.json → doorPin
   │   Valid? Continue
   │   Invalid? Return 401
   │
4. [Backend] Publish MQTT
   │
   ├─► Topic: smartparcel/lock/control
   │   Payload: {"action":"unlock","duration":3000}
   │   QoS: 1
   │
5. [ESP8266] Subscribe & terima message
   │
   ├─► Activate relay → solenoid unlock
   ├─► Wait 3000ms
   ├─► Deactivate relay → solenoid lock
   │
6. [ESP8266] Publish ACK
   │
   ├─► Topic: smartparcel/lock/status
   │   Payload: {"status":"unlocked","method":"remote","timestamp":140759}
   │
7. [Backend] Terima ACK → update deviceStatus.json
   │
8. [Mobile App] Polling /api/device/status → show "Unlocked"
```

### Flow 3: Change Device Settings

```
1. [Mobile App] User ubah threshold sensor: 15cm → 20cm
   │
   ├─► Update local state
   ├─► Show "Simpan" button
   │
2. [Mobile App] User tap "Simpan"
   │
   ├─► PUT /api/device/settings
   │   Body: {"ultra":{"min":12,"max":20},"lock":{"ms":5000}}
   │
3. [Backend] Validate settings
   │
   ├─► ultra.min >= 5 && ultra.min <= 50?
   ├─► ultra.max >= 10 && ultra.max <= 50?
   ├─► ultra.min < ultra.max?
   │   Valid? Save to settings.json
   │
4. [Backend] Publish MQTT
   │
   ├─► Topic: smartparcel/box-01/settings/set
   │   Payload: {"ultra":{"min":12,"max":20},"lock":{"ms":5000}}
   │   QoS: 1
   │
5. [ESP32] Subscribe & terima message
   │
   ├─► Parse JSON
   ├─► Update global variables:
   │   cfgUltraMin = 12
   │   cfgUltraMax = 20
   │   cfgLockMs = 5000
   │
6. [ESP32] Publish ACK
   │
   ├─► Topic: smartparcel/box-01/settings/ack
   │   Payload: {"ok":true}
   │
7. [Backend] Terima ACK → update deviceStatus.json
   │   settingsApplied: true
   │
8. [Mobile App] Show toast: "✅ Pengaturan berhasil diterapkan!"
```

---

## 📡 MQTT Communication

### Topic Structure

```
smartparcel/
├── {deviceId}/                    # Per-device namespace
│   ├── status                     # Device online/offline heartbeat
│   ├── sensor/
│   │   └── distance               # HC-SR04 distance readings
│   ├── event                      # Package detection events
│   ├── photo/
│   │   └── status                 # Photo capture status & URL
│   ├── control                    # Control commands TO device
│   ├── control/ack                # Command acknowledgments FROM device
│   ├── settings/
│   │   ├── set                    # Settings update TO device
│   │   ├── cur                    # Current settings FROM device
│   │   └── ack                    # Settings ACK FROM device
└── lock/                          # ESP8266 door lock (shared)
    ├── control                    # Unlock/lock commands
    ├── status                     # Lock status updates
    ├── pin                        # PIN verification requests
    ├── alert                      # Security alerts
    └── settings                   # Door lock configuration
```

### Message Formats

#### 1. Device Status (Heartbeat)
```json
// Topic: smartparcel/box-01/status
// Direction: ESP32 → Backend
// Frequency: Every 30 seconds

"online"  // Simple string payload
"offline" // On disconnect
```

#### 2. Distance Sensor
```json
// Topic: smartparcel/box-01/sensor/distance
// Direction: ESP32 → Backend
// Frequency: Every 1 second (configurable)

{
  "cm": 12.5,
  "ts": 1234567890
}
```

#### 3. Package Detection Event
```json
// Topic: smartparcel/box-01/event
// Direction: ESP32 → Backend

{
  "type": "detect",
  "cm": 12.5
}

// Or pipeline steps:
{
  "step": "wait_before_photo",
  "ms": 2817
}

{
  "step": "photo_capture"
}

{
  "step": "photo_failed"
}
```

#### 4. Photo Upload Status
```json
// Topic: smartparcel/box-01/photo/status
// Direction: ESP32 → Backend

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

#### 5. Control Commands
```json
// Topic: smartparcel/box-01/control
// Direction: Backend → ESP32

// Capture photo manually
{
  "action": "capture"
}

// Flash control
{
  "action": "flash",
  "state": "on"  // or "off", "pulse"
}

{
  "action": "flash",
  "state": "pulse",
  "ms": 1000  // pulse duration
}

// Buzzer control
{
  "action": "buzzer",
  "state": "start",
  "ms": 3000  // duration
}

{
  "action": "buzzer",
  "state": "stop"
}

// Holder (solenoid lock di box)
{
  "action": "holder",
  "state": "open"
}

{
  "action": "holder",
  "state": "pulse",
  "ms": 2000
}

// Stop all pipeline
{
  "action": "stop_pipeline"
}
```

#### 6. Control Acknowledgment
```json
// Topic: smartparcel/box-01/control/ack
// Direction: ESP32 → Backend

{
  "ok": true,
  "action": "capture"
}

{
  "ok": false,
  "action": "capture",
  "err": "camera_init_failed"
}

{
  "ok": true,
  "action": "flash",
  "detail": "pulse_1000ms"
}
```

#### 7. Settings Update
```json
// Topic: smartparcel/box-01/settings/set
// Direction: Backend → ESP32

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

#### 8. Settings Acknowledgment
```json
// Topic: smartparcel/box-01/settings/ack
// Direction: ESP32 → Backend

{
  "ok": true
}

{
  "ok": false,
  "err": "invalid_range"
}
```

#### 9. Door Lock Control
```json
// Topic: smartparcel/lock/control
// Direction: Backend → ESP8266

{
  "action": "unlock",
  "duration": 3000
}

{
  "action": "lock"
}
```

#### 10. Door Lock Status
```json
// Topic: smartparcel/lock/status
// Direction: ESP8266 → Backend

{
  "status": "locked",
  "method": "auto",  // or "remote", "keypad", "online"
  "timestamp": 114013
}

{
  "status": "unlocked",
  "method": "remote",
  "timestamp": 140759
}

// Security alert on failed attempts
{
  "status": "locked",
  "method": "keypad_lockout",
  "attempts": 3,
  "timestamp": 150000
}
```

---

## 💾 Database Schema

SmartParcel menggunakan **JSON file database** untuk kesederhanaan dan portability.

### 1. users.json
```json
{
  "username": "admin",
  "password": "$2b$10$hashed_password...",
  "requirePasswordChange": false,
  "isFirstLogin": false,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T14:30:00Z"
}
```

### 2. packages.json
```json
[
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
]
```

### 3. settings.json
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
  },
  "doorLock": {
    "ms": 3000
  },
  "updatedAt": "2025-01-15T14:30:00Z"
}
```

### 4. deviceStatus.json
```json
{
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
```

### 5. whatsappConfig.json
```json
{
  "isPaired": true,
  "senderPhone": "6287853462867",
  "recipients": ["120363123456789012@g.us"],
  "isBlocked": false,
  "blockedUntil": null,
  "updatedAt": "2025-01-15T14:30:00Z"
}
```

**Note**: 
- `recipients` berisi JID WhatsApp groups (format: `<id>@g.us`)
- `isBlocked` dan `blockedUntil` untuk handle Error 405 dari GOWA

### 6. pins.json
```json
{
  "appPin": "123456",
  "doorPin": "123456",
  "updatedAt": "2025-01-15T14:30:00Z"
}
```

### 7. sessions.json
```json
[
  {
    "id": "abc123def456",
    "username": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": "2025-01-15T14:00:00Z",
    "expiresAt": "2025-01-16T14:00:00Z"
  }
]
```

---

## ⚙️ Firmware Logic

### ESP32-CAM Main Loop

```cpp
void loop() {
  // 1. Maintain connections
  ensureWiFi();
  if (!mqtt.connected()) reconnectMQTT();
  mqtt.loop();
  
  // 2. Heartbeat (every 30s)
  if (millis() - lastHeartbeat > 30000) {
    mqtt.publish("smartparcel/box-01/status", "online");
    lastHeartbeat = millis();
  }
  
  // 3. Read ultrasonic sensor (every 1s)
  if (millis() - lastDistRead > 1000) {
    float cm = ultraCmStable();  // Median of 3 readings
    String payload = "{\"cm\":" + String(cm,1) + ",\"ts\":" + millis() + "}";
    mqtt.publish("smartparcel/box-01/sensor/distance", payload.c_str());
    lastDistRead = millis();
    
    // 4. Package detection pipeline
    if (!isnan(cm) && cm >= cfgUltraMin && cm <= cfgUltraMax) {
      if (!packageDetected) {
        packageDetected = true;
        
        // Publish detect event
        mqtt.publish("smartparcel/box-01/event", 
          "{\"type\":\"detect\",\"cm\":" + String(cm,1) + "}");
        
        // Wait before photo (avoid blur from vibration)
        mqtt.publish("smartparcel/box-01/event", 
          "{\"step\":\"wait_before_photo\",\"ms\":3000}");
        delay(3000);
        
        // Capture + upload with retry
        bool success = captureAndUploadWithRetry("detect", cm);
        
        if (success) {
          mqtt.publish("smartparcel/box-01/event", "{\"step\":\"photo_success\"}");
          // Activate buzzer
          relayWrite(PIN_REL2, true);
          delay(buzzerMs);
          relayWrite(PIN_REL2, false);
        } else {
          mqtt.publish("smartparcel/box-01/event", "{\"step\":\"photo_failed\"}");
        }
        
        packageDetected = false;
      }
    }
  }
  
  delay(10);
}
```

### MQTT Callback Handler

```cpp
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }
  
  String topicStr = String(topic);
  
  // Control commands
  if (topicStr == "smartparcel/box-01/control") {
    StaticJsonDocument<256> doc;
    deserializeJson(doc, msg);
    
    String action = doc["action"];
    
    if (action == "capture") {
      bool ok = captureAndUploadWithRetry("manual", NAN);
      mqtt.publish("smartparcel/box-01/control/ack", 
        ok ? "{\"ok\":true,\"action\":\"capture\"}" 
           : "{\"ok\":false,\"action\":\"capture\",\"err\":\"failed\"}");
    }
    else if (action == "flash") {
      String state = doc["state"];
      if (state == "on") {
        flashOn(true);
      } else if (state == "off") {
        flashOn(false);
      } else if (state == "pulse") {
        int ms = doc["ms"];
        flashOn(true);
        delay(ms);
        flashOn(false);
      }
      mqtt.publish("smartparcel/box-01/control/ack", "{\"ok\":true,\"action\":\"flash\"}");
    }
    // ... buzzer, holder, dll.
  }
  
  // Settings update
  else if (topicStr == "smartparcel/box-01/settings/set") {
    StaticJsonDocument<512> doc;
    deserializeJson(doc, msg);
    
    if (doc.containsKey("ultra")) {
      cfgUltraMin = doc["ultra"]["min"];
      cfgUltraMax = doc["ultra"]["max"];
    }
    if (doc.containsKey("lock")) {
      lockMs = doc["lock"]["ms"];
    }
    if (doc.containsKey("buzzer")) {
      buzzerMs = doc["buzzer"]["ms"];
    }
    
    mqtt.publish("smartparcel/box-01/settings/ack", "{\"ok\":true}");
  }
}
```

---

## 💬 WhatsApp Integration

### GOWA API Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOWA API Architecture                         │
└─────────────────────────────────────────────────────────────────┘

[SmartParcel Backend]
        │
        │ HTTP POST /app/login-with-code
        │ Body: {"phone":"6287853462867"}
        ▼
[GOWA API Server]
        │
        │ Generate 8-digit pairing code
        ▼
[SmartParcel Frontend]
        │
        │ Display code: "1A2B-3C4D"
        │ User opens WhatsApp → Linked Devices
        │ User enters code: "1A2B3C4D"
        ▼
[WhatsApp Servers]
        │
        │ Validate code & link device
        ▼
[GOWA API Server]
        │
        │ Maintain websocket connection
        │ Save session to local storage
        ▼
[Backend checks status]
        │
        │ GET /app/devices
        │ Response: {"results":[{"device":"6287853462867:7@s.whatsapp.net"}]}
        ▼
[isPaired = true di whatsappConfig.json]
```

### Send Notification Flow

```javascript
// backend-app/services/gowa.js

async function sendPackageNotification(photoUrl, packageData) {
  const config = readDB('whatsappConfig');
  
  // Check if paired
  if (!config.isPaired || config.isBlocked) {
    console.log('WhatsApp not configured');
    return;
  }
  
  // Get recipients (WhatsApp group JIDs)
  const recipients = config.recipients || [];
  
  // Prepare message
  const caption = `📦 *Paket Baru Terdeteksi!*\n\n` +
    `🕒 Waktu: ${new Date(packageData.timestamp).toLocaleString('id-ID')}\n` +
    `📏 Jarak: ${packageData.distanceCm} cm\n` +
    `📍 Device: ${packageData.deviceId}\n\n` +
    `Silakan cek foto terlampir.\n` +
    `_SmartParcel System_`;
  
  // Send to all recipients
  for (const recipient of recipients) {
    try {
      const result = await gowa.sendImage(
        recipient,  // Group JID: 120363123456789012@g.us
        caption,
        photoUrl,   // http://13.213.57.228:9090/storage/package_123.jpg
        true        // compress: true
      );
      
      if (result.success) {
        console.log(`✅ Sent to ${recipient}: ${result.messageId}`);
      } else {
        console.error(`❌ Failed to ${recipient}:`, result.error);
      }
    } catch (error) {
      console.error(`Error sending to ${recipient}:`, error);
    }
  }
}
```

### GOWA API Response Structures

#### Get Devices (Connection Status)
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

// Jika tidak terhubung:
{
  "code": "SUCCESS",
  "message": "Fetch device success",
  "results": null  // atau []
}
```

#### List Groups
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
}
```

#### Send Message
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

## 🔒 Security Considerations

### 1. Authentication
- **JWT tokens** dengan expiry 24 jam
- **Bcrypt** hashing untuk password (salt rounds: 10)
- **Rate limiting** untuk prevent brute force
- **Session cleanup** untuk expired sessions

### 2. API Security
- **Bearer token** authentication untuk device & user
- **CORS** configuration untuk allowed origins
- **Input validation** untuk semua endpoints
- **Error handling** tanpa expose sensitive info

### 3. MQTT Security
- **Username/password** authentication
- **QoS 1** untuk reliability
- **Clean session: false** untuk message persistence
- **Last Will Testament** untuk detect disconnects

### 4. Door Lock Security
- **PIN verification** sebelum unlock
- **Failed attempt tracking** (max 3 attempts)
- **Lockout mechanism** setelah 3x failed
- **WhatsApp alert** untuk security events

---

📖 [Kembali ke README](../README.md) | [← Build & Deploy](02-build-deploy.md) | [API Reference →](04-api-reference.md)
