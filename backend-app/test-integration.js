// Comprehensive Integration Test
// Test complete flow: MQTT → Backend → GOWA → WhatsApp

import { readDB } from './utils/db.js';
import GowaService from './services/gowa.js';
import dotenv from 'dotenv';

dotenv.config();

const gowa = new GowaService();

console.log('🧪 COMPREHENSIVE INTEGRATION TEST\n');
console.log('═══════════════════════════════════════════════════\n');

// Test 1: Check WhatsApp Config
console.log('1️⃣ Checking WhatsApp Configuration...');
try {
  const config = readDB('whatsappConfig');
  console.log('   isPaired:', config.isPaired);
  console.log('   isBlocked:', config.isBlocked);
  console.log('   recipients:', config.recipients);
  
  if (config.recipients.length === 0) {
    console.log('   ⚠️ WARNING: No recipients configured!');
    console.log('   Add recipients in db/whatsappConfig.json');
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

console.log('\n---\n');

// Test 2: Check GOWA API Connection
console.log('2️⃣ Checking GOWA API Connection...');
try {
  const status = await gowa.getStatus();
  if (status.isConnected) {
    console.log('   ✅ GOWA is connected!');
    console.log('   Devices:', status.devices?.length || 0);
    if (status.devices && status.devices.length > 0) {
      console.log('   Device:', status.devices[0].device);
    }
  } else {
    console.log('   ❌ GOWA is NOT connected');
    if (status.error) {
      console.log('   Error:', status.error);
    }
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

console.log('\n---\n');

// Test 3: Check Environment Variables
console.log('3️⃣ Checking Environment Variables...');
const requiredEnv = [
  'GOWA_API_URL',
  'GOWA_USERNAME',
  'GOWA_PASSWORD',
  'BASE_URL',
  'MQTT_BROKER',
  'DEVICE_ID'
];

requiredEnv.forEach(key => {
  const value = process.env[key];
  if (value) {
    // Mask sensitive values
    const displayValue = key.includes('PASSWORD') 
      ? '*'.repeat(value.length) 
      : value;
    console.log(`   ✅ ${key}: ${displayValue}`);
  } else {
    console.log(`   ❌ ${key}: NOT SET`);
  }
});

console.log('\n---\n');

// Test 4: Simulate Package Received Notification
console.log('4️⃣ Simulating Package Received Notification...');
const config = readDB('whatsappConfig');

if (!config.isPaired) {
  console.log('   ⏭️ Skipped: WhatsApp not paired');
} else if (config.isBlocked) {
  console.log('   ⏭️ Skipped: Notifications blocked');
} else if (config.recipients.length === 0) {
  console.log('   ⏭️ Skipped: No recipients');
} else {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:9090';
    const testImageUrl = 'https://cdn.pixabay.com/photo/2023/09/04/17/48/flamingos-8233303_640.jpg';
    
    const message = `📦 *SmartParcel - Paket Diterima (TEST)*\n\n` +
      `⏰ Waktu: ${new Date().toLocaleString('id-ID')}\n` +
      `📍 Device: box-01\n\n` +
      `Paket baru telah diterima dan tersimpan dengan aman.\n\n` +
      `[INTEGRATION TEST - Ignore this message]`;
    
    const recipient = config.recipients[0];
    console.log(`   Sending to: ${recipient}`);
    console.log(`   Image URL: ${testImageUrl.substring(0, 50)}...`);
    
    const result = await gowa.sendImage(recipient, message, testImageUrl, true);
    
    if (result.success) {
      console.log('   ✅ Test notification sent successfully!');
      console.log('   Message ID:', result.messageId);
    } else {
      console.log('   ❌ Failed to send');
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
}

console.log('\n---\n');

// Test 5: Simulate Security Alert
console.log('5️⃣ Simulating Security Alert Notification...');

if (!config.isPaired || config.isBlocked || config.recipients.length === 0) {
  console.log('   ⏭️ Skipped: WhatsApp not configured');
} else {
  try {
    const message = `🚨 *SmartParcel - Peringatan Keamanan (TEST)*\n\n` +
      `⏰ Waktu: ${new Date().toLocaleString('id-ID')}\n` +
      `📍 Device: box-01\n` +
      `⚠️ Alasan: 5 percobaan gagal membuka kunci pintu\n\n` +
      `Mohon segera periksa perangkat Anda.\n\n` +
      `[INTEGRATION TEST - Ignore this message]`;
    
    const recipient = config.recipients[0];
    console.log(`   Sending to: ${recipient}`);
    
    const result = await gowa.sendText(recipient, message);
    
    if (result.success) {
      console.log('   ✅ Test alert sent successfully!');
      console.log('   Message ID:', result.messageId);
    } else {
      console.log('   ❌ Failed to send');
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
}

console.log('\n═══════════════════════════════════════════════════');
console.log('\n✅ INTEGRATION TEST COMPLETED!\n');

// Summary
console.log('📊 SUMMARY:');
console.log('   • GOWA API:', process.env.GOWA_API_URL);
console.log('   • Backend URL:', process.env.BASE_URL);
console.log('   • WhatsApp Paired:', config.isPaired ? 'Yes' : 'No');
console.log('   • Recipients:', config.recipients.length);
console.log('   • Notifications:', config.isBlocked ? 'Blocked' : 'Enabled');

console.log('\n📋 CHECKLIST:');
console.log('   [' + (config.isPaired ? '✓' : ' ') + '] WhatsApp paired with GOWA');
console.log('   [' + (config.recipients.length > 0 ? '✓' : ' ') + '] Recipients configured');
console.log('   [' + (!config.isBlocked ? '✓' : ' ') + '] Notifications enabled');
console.log('   [' + (process.env.BASE_URL ? '✓' : ' ') + '] BASE_URL configured');
console.log('   [' + (process.env.GOWA_API_URL ? '✓' : ' ') + '] GOWA_API_URL configured');

console.log('\n🔗 FLOW:');
console.log('   ESP32 → MQTT → Backend-App → GOWA API → WhatsApp');
console.log('   ');
console.log('   ESP32 detects package');
console.log('   → Sends photo to /api/v1/packages');
console.log('   → Backend publishes to MQTT topic photo/status');
console.log('   → MQTT client receives & converts photoUrl');
console.log('   → Calls gowa.sendImage() with full URL');
console.log('   → GOWA API sends to WhatsApp');
console.log('   → Recipients receive notification with image');

console.log('\n');
