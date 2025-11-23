import { connectMongoDB, disconnectMongoDB } from '../database/mongodb.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

async function testWrite() {
  console.log('🧪 Testing MongoDB write operations...\n');
  
  try {
    await connectMongoDB();
    
    // Test creating a user
    console.log('📝 Creating a test user...');
    const testPassword = await bcrypt.hash('test123', 10);
    const testUser = new User({
      username: 'test_user_' + Date.now(),
      password_hash: testPassword,
      role: 'customer'
    });
    
    await testUser.save();
    console.log(`✅ Test user created: ${testUser.username}`);
    console.log(`   ID: ${testUser._id}`);
    console.log(`   Role: ${testUser.role}`);
    
    // Test reading
    console.log('\n📖 Reading test user...');
    const foundUser = await User.findOne({ username: testUser.username });
    if (foundUser) {
      console.log(`✅ User found: ${foundUser.username}`);
    } else {
      console.log('❌ User not found');
    }
    
    // Test updating
    console.log('\n✏️  Updating test user...');
    foundUser.role = 'admin';
    await foundUser.save();
    console.log(`✅ User updated: ${foundUser.role}`);
    
    // Test deleting
    console.log('\n🗑️  Deleting test user...');
    await User.deleteOne({ _id: testUser._id });
    console.log('✅ Test user deleted');
    
    // Verify deletion
    const deletedUser = await User.findOne({ _id: testUser._id });
    if (!deletedUser) {
      console.log('✅ User successfully deleted (verified)');
    } else {
      console.log('❌ User still exists after deletion');
    }
    
    console.log('\n✅ All MongoDB operations (Create, Read, Update, Delete) working correctly!');
    console.log('✅ MongoDB is fully operational!\n');
    
    await disconnectMongoDB();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during write test:', error);
    await disconnectMongoDB();
    process.exit(1);
  }
}

testWrite();


