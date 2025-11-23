import { connectMongoDB, testConnection, disconnectMongoDB } from '../database/mongodb.js';

async function runTest() {
  console.log('🔌 Testing MongoDB connection...\n');
  
  try {
    // Test connection
    const connected = await testConnection();
    
    if (connected) {
      console.log('\n✅ Connection test passed!');
      console.log('✅ MongoDB is ready to use\n');
      
      // Keep connection alive for a moment to verify
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await disconnectMongoDB();
      process.exit(0);
    } else {
      console.log('\n❌ Connection test failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error during connection test:', error);
    process.exit(1);
  }
}

runTest();

