// Test GOWA Session Management APIs
import GowaService from './services/gowa.js';
import dotenv from 'dotenv';

dotenv.config();

const gowa = new GowaService();

async function testSessionAPIs() {
  console.log('🧪 Testing GOWA Session Management APIs\n');

  // Test 1: Check current status
  console.log('1️⃣ Checking current connection status...');
  const status = await gowa.getStatus();
  if (status.isConnected) {
    console.log('✅ Connected! Devices:', status.devices?.length || 0);
    console.log('   Device info:', JSON.stringify(status.devices, null, 2));
  } else {
    console.log('❌ Not connected');
  }

  console.log('\n---\n');

  // Test 2: Reconnect (safe to test, won't logout)
  console.log('2️⃣ Testing RECONNECT (safe - keeps session)...');
  const reconnect = await gowa.reconnect();
  if (reconnect.success) {
    console.log('✅ Reconnect successful!');
    console.log('   Message:', reconnect.message);
  } else {
    console.log('❌ Reconnect failed');
    console.log('   Error:', reconnect.error);
  }

  console.log('\n---\n');

  // Test 3: Get pairing code (if needed)
  console.log('3️⃣ Testing GET PAIRING CODE...');
  const testPhone = process.env.TEST_PHONE || '6281358959349';
  console.log('   ⚠️ Note: This will generate a NEW pairing code');
  console.log('   ⚠️ Only use if you want to re-pair the device\n');
  
  // Uncomment to actually test:
  // const pairCode = await gowa.getPairingCode(testPhone);
  // if (pairCode.success) {
  //   console.log('✅ Pairing code generated:', pairCode.pairCode);
  // } else {
  //   console.log('❌ Failed:', pairCode.error);
  // }
  console.log('   ⏭️ Skipped (uncomment to test)');

  console.log('\n---\n');

  // Test 4: Logout (DANGEROUS - removes session!)
  console.log('4️⃣ Testing LOGOUT (DANGEROUS - removes all session!)...');
  console.log('   ⚠️ WARNING: This will disconnect WhatsApp and delete session!');
  console.log('   ⚠️ You will need to re-pair with pairing code\n');
  
  // Uncomment ONLY if you want to test logout:
  // const logout = await gowa.logout();
  // if (logout.success) {
  //   console.log('✅ Logged out successfully');
  //   console.log('   Message:', logout.message);
  // } else {
  //   console.log('❌ Logout failed');
  //   console.log('   Error:', logout.error);
  // }
  console.log('   ⏭️ Skipped (uncomment ONLY if you want to logout)');

  console.log('\n---\n');
  console.log('✅ Session management tests completed!\n');

  console.log('📚 Available Methods:');
  console.log('   - gowa.getStatus() → Check connection');
  console.log('   - gowa.reconnect() → Reconnect (safe)');
  console.log('   - gowa.getPairingCode(phone) → Generate pairing code');
  console.log('   - gowa.logout() → Logout and remove session (DANGEROUS)');
}

testSessionAPIs().catch(console.error);
