# 2️⃣ Build & Deployment

> **Panduan lengkap build APK Android dan deployment ke VPS**

📖 [Kembali ke README](../README.md) | [← Fitur & Usage](01-features-usage.md) | [Arsitektur Sistem →](03-system-architecture.md)

---

## 📋 Daftar Isi

- [Build APK Android](#-build-apk-android)
- [Deploy ke VPS](#-deploy-ke-vps)
- [Environment Setup](#%EF%B8%8F-environment-setup)
- [SSL/HTTPS Configuration](#-sslhttps-configuration)
- [Troubleshooting](#-troubleshooting)

---

## 📦 Build APK Android

### Prerequisites

```bash
# Install dependencies
npm install -g @capacitor/cli
npm install @capacitor/core @capacitor/android
```

### Step 1: Setup Capacitor

```bash
cd mobile-app

# Initialize Capacitor
npx cap init

# Nama aplikasi: SmartParcel
# Package ID: com.smartparcel.app
```

### Step 2: Build Frontend

```bash
# Build production
npm run build

# Output: dist/
```

### Step 3: Copy ke Android

```bash
# Sync web assets to Android
npx cap sync android

# Atau manual:
npx cap copy android
npx cap update android
```

### Step 4: Configure Android Project

Edit `android/app/build.gradle`:

```gradle
android {
    compileSdkVersion 33
    defaultConfig {
        applicationId "com.smartparcel.app"
        minSdkVersion 22
        targetSdkVersion 33
        versionCode 1
        versionName "2.0.0"
    }
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="SmartParcel"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:theme="@style/AppTheme.SplashScreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### Step 5: Generate Icon & Splash Screen

Gunakan online tool seperti:
- https://icon.kitchen (icon generator)
- https://apetools.webprofusion.com (splash screen)

**Icon Requirements:**
- 512x512px PNG
- Transparent background

**Splash Screen:**
- 2732x2732px PNG
- Logo centered

Copy hasil generate ke:
```
android/app/src/main/res/
├── mipmap-hdpi/
├── mipmap-mdpi/
├── mipmap-xhdpi/
├── mipmap-xxhdpi/
└── mipmap-xxxhdpi/
```

### Step 6: Build APK

#### A. Debug Build

```bash
cd android
./gradlew assembleDebug

# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

#### B. Release Build (Signed)

**Generate Keystore:**

```bash
keytool -genkey -v -keystore smartparcel.keystore -alias smartparcel -keyalg RSA -keysize 2048 -validity 10000

# Masukkan password: SmartParcel2025!
# CN: SmartParcel
# OU: IoT Division
# O: SmartParcel Inc.
# L: Jakarta
# ST: DKI Jakarta
# C: ID
```

**Sign APK:**

Edit `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('../smartparcel.keystore')
            storePassword 'SmartParcel2025!'
            keyAlias 'smartparcel'
            keyPassword 'SmartParcel2025!'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

Build:

```bash
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Step 7: Install APK

**Via ADB:**

```bash
adb install app-release.apk
```

**Via USB:**

1. Copy APK ke HP via USB
2. Buka File Manager
3. Tap APK
4. Install (enable "Unknown Sources" jika perlu)

### Step 8: Publish ke Play Store

*(Optional)*

1. Buat akun Google Play Console
2. Buat aplikasi baru
3. Upload APK/AAB
4. Fill app details, screenshots, description
5. Submit for review

**Generate AAB (Android App Bundle):**

```bash
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🚀 Deploy ke VPS

### Server Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+
- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 2 cores minimum
- **Storage**: 20GB SSD
- **Network**: 100Mbps

### Step 1: Server Setup

```bash
# SSH ke VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js v18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Git
apt install -y git

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx

# Install Certbot (SSL certificate)
apt install -y certbot python3-certbot-nginx
```

### Step 2: Clone Repository

```bash
# Create app directory
mkdir -p /var/www/smartparcel
cd /var/www/smartparcel

# Clone repo
git clone https://github.com/sitaurs/parcelbox.git .

# Install dependencies
cd backend-app
npm install --production

cd ../backend-whatsapp
npm install --production

cd ../mobile-app
npm install
npm run build
```

### Step 3: Configure Environment

**Backend App:**

```bash
cd /var/www/smartparcel/backend-app
nano .env
```

```env
PORT=9090
NODE_ENV=production
MQTT_BROKER=mqtt://13.213.57.228:1883
MQTT_USERNAME=smartparcel
MQTT_PASSWORD=SmartParcel2025!
GOWA_API_URL=http://ware-api.flx.web.id
GOWA_API_USERNAME=smartparcel
GOWA_API_PASSWORD=SmartParcel2025!
API_BASE_URL=https://api.smartparcel.com
FRONTEND_URL=https://smartparcel.com
```

**WhatsApp Backend:**

```bash
cd /var/www/smartparcel/backend-whatsapp
nano .env
```

```env
PORT=3000
NODE_ENV=production
WHATSAPP_SESSION_PATH=/var/www/smartparcel/backend-whatsapp/auth_info
BACKEND_API_URL=http://localhost:9090
LOG_LEVEL=info
```

### Step 4: Setup PM2

**Backend App:**

```bash
cd /var/www/smartparcel/backend-app
pm2 start server.js --name smartparcel-api
```

**WhatsApp Backend:**

```bash
cd /var/www/smartparcel/backend-whatsapp
pm2 start server.js --name smartparcel-whatsapp
```

**Save PM2 Config:**

```bash
pm2 save
pm2 startup systemd
# Copy & execute command yang muncul
```

**PM2 Commands:**

```bash
# List processes
pm2 list

# View logs
pm2 logs smartparcel-api
pm2 logs smartparcel-whatsapp

# Restart
pm2 restart smartparcel-api
pm2 restart all

# Stop
pm2 stop smartparcel-api

# Delete
pm2 delete smartparcel-api

# Monitor
pm2 monit
```

### Step 5: Configure Nginx

**API Backend:**

```bash
nano /etc/nginx/sites-available/smartparcel-api
```

```nginx
server {
    listen 80;
    server_name api.smartparcel.com;

    location / {
        proxy_pass http://localhost:9090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Frontend:**

```bash
nano /etc/nginx/sites-available/smartparcel-web
```

```nginx
server {
    listen 80;
    server_name smartparcel.com www.smartparcel.com;

    root /var/www/smartparcel/mobile-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:9090/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
}
```

**Enable sites:**

```bash
ln -s /etc/nginx/sites-available/smartparcel-api /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/smartparcel-web /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 6: Setup SSL Certificate

```bash
# Generate SSL for API
certbot --nginx -d api.smartparcel.com

# Generate SSL for Frontend
certbot --nginx -d smartparcel.com -d www.smartparcel.com

# Auto-renewal (cron)
certbot renew --dry-run
```

Certbot akan auto-update Nginx config jadi:

```nginx
server {
    listen 443 ssl http2;
    server_name api.smartparcel.com;

    ssl_certificate /etc/letsencrypt/live/api.smartparcel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.smartparcel.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # ... rest of config
}

server {
    listen 80;
    server_name api.smartparcel.com;
    return 301 https://$server_name$request_uri;
}
```

### Step 7: Configure Firewall

```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow SSH
ufw allow 22/tcp

# Allow MQTT (jika MQTT broker di VPS yang sama)
ufw allow 1883/tcp

# Enable firewall
ufw enable
```

### Step 8: Setup MQTT Broker (Optional)

Jika ingin host MQTT broker sendiri di VPS:

```bash
# Install Mosquitto
apt install -y mosquitto mosquitto-clients

# Configure
nano /etc/mosquitto/mosquitto.conf
```

```conf
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd

# Logging
log_dest file /var/log/mosquitto/mosquitto.log
log_type all
```

**Create user:**

```bash
mosquitto_passwd -c /etc/mosquitto/passwd smartparcel
# Password: SmartParcel2025!
```

**Restart:**

```bash
systemctl restart mosquitto
systemctl enable mosquitto
```

### Step 9: Setup Monitoring

**Install Netdata:**

```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access: http://your-vps-ip:19999
```

**Setup PM2 Monitoring:**

```bash
pm2 install pm2-logrotate

# Set max log size
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Setup Alert via Telegram:**

```bash
# Install pm2-telegram
pm2 install pm2-telegram

# Configure
pm2 set pm2-telegram:token YOUR_TELEGRAM_BOT_TOKEN
pm2 set pm2-telegram:chat_id YOUR_TELEGRAM_CHAT_ID
```

---

## ⚙️ Environment Setup

### Local Development

**Backend App `.env`:**

```env
PORT=9090
NODE_ENV=development
MQTT_BROKER=mqtt://13.213.57.228:1883
MQTT_USERNAME=smartparcel
MQTT_PASSWORD=SmartParcel2025!
GOWA_API_URL=http://ware-api.flx.web.id
GOWA_API_USERNAME=smartparcel
GOWA_API_PASSWORD=SmartParcel2025!
API_BASE_URL=http://localhost:9090
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

**WhatsApp Backend `.env`:**

```env
PORT=3000
NODE_ENV=development
WHATSAPP_SESSION_PATH=./auth_info
BACKEND_API_URL=http://localhost:9090
LOG_LEVEL=debug
```

**Mobile App `.env`:**

```env
VITE_API_URL=http://localhost:9090/api
VITE_WS_URL=ws://localhost:9090
```

### Production

**Backend App `.env`:**

```env
PORT=9090
NODE_ENV=production
MQTT_BROKER=mqtt://13.213.57.228:1883
MQTT_USERNAME=smartparcel
MQTT_PASSWORD=SmartParcel2025!
GOWA_API_URL=http://ware-api.flx.web.id
GOWA_API_USERNAME=smartparcel
GOWA_API_PASSWORD=SmartParcel2025!
API_BASE_URL=https://api.smartparcel.com
FRONTEND_URL=https://smartparcel.com
CORS_ORIGIN=https://smartparcel.com
```

**Mobile App `.env.production`:**

```env
VITE_API_URL=https://api.smartparcel.com/api
VITE_WS_URL=wss://api.smartparcel.com
```

---

## 🔒 SSL/HTTPS Configuration

### Let's Encrypt (Free)

**Auto Setup via Certbot:**

```bash
certbot --nginx -d api.smartparcel.com
```

**Manual Certificate Request:**

```bash
certbot certonly --standalone -d api.smartparcel.com
```

**Nginx Manual Config:**

```nginx
server {
    listen 443 ssl http2;
    server_name api.smartparcel.com;

    ssl_certificate /etc/letsencrypt/live/api.smartparcel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.smartparcel.com/privkey.pem;

    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:9090;
        # ... proxy config
    }
}
```

### CloudFlare (CDN + SSL)

**Setup:**

1. Add domain ke CloudFlare
2. Update nameservers di domain registrar
3. CloudFlare > SSL/TLS > Full (strict)
4. Origin Certificates → Generate
5. Install origin cert di Nginx

**Nginx Config:**

```nginx
server {
    listen 443 ssl http2;
    server_name api.smartparcel.com;

    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;

    # CloudFlare origin pull
    ssl_client_certificate /etc/ssl/cloudflare/origin-pull-ca.pem;
    ssl_verify_client on;

    # ... rest config
}
```

---

## 🛠️ Troubleshooting

### ❌ PM2 Process Crash

**Check logs:**

```bash
pm2 logs smartparcel-api --lines 100
```

**Common issues:**

1. **Port already in use:**
```bash
lsof -i :9090
kill -9 <PID>
pm2 restart smartparcel-api
```

2. **Database connection error:**
```bash
# Check DB files
ls -la /var/www/smartparcel/backend-app/db/

# Fix permissions
chown -R www-data:www-data /var/www/smartparcel/backend-app/db/
```

3. **MQTT connection timeout:**
```bash
# Test MQTT connection
mosquitto_sub -h 13.213.57.228 -p 1883 -u smartparcel -P SmartParcel2025! -t '#'

# Check firewall
ufw status
```

### ❌ Nginx 502 Bad Gateway

**Causes:**

1. Backend not running
2. Wrong proxy_pass port
3. SELinux blocking

**Solutions:**

```bash
# Check backend
pm2 list
curl http://localhost:9090

# Check Nginx error log
tail -f /var/log/nginx/error.log

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx
```

### ❌ SSL Certificate Error

**Issue:** Certificate expired

```bash
# Renew manually
certbot renew

# Check expiry
certbot certificates
```

**Issue:** HTTPS redirect loop

```nginx
# Fix Nginx config
proxy_set_header X-Forwarded-Proto $scheme;
```

### ❌ Build APK Failed

**Error:** `AAPT2 error`

```bash
# Update Android SDK
cd android
./gradlew clean
./gradlew assembleRelease
```

**Error:** `Duplicate resources`

```bash
# Remove duplicates
rm -rf android/app/src/main/res/drawable-*
rm -rf android/app/src/main/res/mipmap-*

# Re-generate
npx capacitor-assets generate
```

**Error:** `Out of memory`

```bash
# Increase heap size
export GRADLE_OPTS="-Xmx4g -XX:MaxPermSize=512m"
./gradlew assembleRelease
```

---

## 📦 Update & Maintenance

### Update Application

```bash
# Pull latest code
cd /var/www/smartparcel
git pull origin main

# Backend
cd backend-app
npm install --production
pm2 restart smartparcel-api

# WhatsApp Backend
cd ../backend-whatsapp
npm install --production
pm2 restart smartparcel-whatsapp

# Frontend
cd ../mobile-app
npm install
npm run build
# Nginx will serve updated dist/
```

### Backup

**Database:**

```bash
# Backup JSON files
tar -czf backup-$(date +%Y%m%d).tar.gz backend-app/db/

# Upload to S3 (optional)
aws s3 cp backup-$(date +%Y%m%d).tar.gz s3://smartparcel-backups/
```

**Full Server Snapshot:**

Gunakan VPS provider snapshot feature (DigitalOcean, Linode, AWS, dll).

### Monitoring

**PM2 Dashboard:**

```bash
pm2 web
# Access: http://your-vps-ip:9615
```

**Netdata Dashboard:**

```
http://your-vps-ip:19999
```

**Log Rotation:**

```bash
# PM2 auto log rotate
pm2 install pm2-logrotate
```

---

## 🔗 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [PM2 Guide](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Best Practices](https://www.nginx.com/blog/nginx-best-practices/)
- [Let's Encrypt Tutorial](https://certbot.eff.org/)

---

📖 [Kembali ke README](../README.md) | [← Fitur & Usage](01-features-usage.md) | [Arsitektur Sistem →](03-system-architecture.md)
