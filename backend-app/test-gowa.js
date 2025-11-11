// Test GOWA Integration
// Quick test untuk memastikan service bekerja dengan baik

import GowaService from './services/gowa.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize GOWA service
const gowa = new GowaService({
  baseUrl: process.env.GOWA_API_URL,
  username: process.env.GOWA_USERNAME,
  password: process.env.GOWA_PASSWORD
});

async function runTests() {
  console.log('🧪 Starting GOWA Integration Tests...\n');

  // Test 1: Check connection status
  console.log('📡 Test 1: Checking GOWA connection status...');
  try {
    const status = await gowa.getStatus();
    if (status.isConnected) {
      console.log('✅ GOWA is connected!');
      console.log('   Devices:', status.devices?.length || 0);
    } else {
      console.log('❌ GOWA is NOT connected');
      console.log('   Error:', status.error);
    }
  } catch (error) {
    console.log('❌ Status check failed:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Send test text message
  console.log('📤 Test 2: Sending test text message...');
  const testPhone = process.env.TEST_PHONE || '6281358959349';
  const testMessage = `🧪 *GOWA Integration Test*\n\n` +
    `⏰ Timestamp: ${new Date().toLocaleString('id-ID')}\n` +
    `✅ Status: Backend-app successfully integrated with GOWA!\n\n` +
    `Environment:\n` +
    `- API URL: ${process.env.GOWA_API_URL}\n` +
    `- Username: ${process.env.GOWA_USERNAME}\n` +
    `- Node: ${process.version}`;

  try {
    const result = await gowa.sendText(testPhone, testMessage);
    if (result.success) {
      console.log('✅ Message sent successfully!');
      console.log('   Message ID:', result.messageId);
      console.log('   Status:', result.status);
    } else {
      console.log('❌ Failed to send message');
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Send message failed:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Send test image (if provided)
  if (process.env.TEST_IMAGE_URL) {
    console.log('🖼️ Test 3: Sending test image...');
    const imageCaption = `📸 *GOWA Image Test*\n\n` +
      `This is a test image sent from backend-app via GOWA API.\n` +
      `Timestamp: ${new Date().toLocaleString('id-ID')}`;

    try {
      const result = await gowa.sendImage(
        testPhone,
        imageCaption,
        process.env.TEST_IMAGE_URL,
        true // auto compress
      );

      if (result.success) {
        console.log('✅ Image sent successfully!');
        console.log('   Message ID:', result.messageId);
        console.log('   Status:', result.status);
      } else {
        console.log('❌ Failed to send image');
        console.log('   Error:', result.error);
      }
    } catch (error) {
      console.log('❌ Send image failed:', error.message);
    }
  } else {
    console.log('⏭️ Test 3: Skipped (No TEST_IMAGE_URL provided)');
  }

  console.log('\n---\n');
  console.log('✅ All tests completed!\n');
}

// Run tests
runTests().catch(console.error);
