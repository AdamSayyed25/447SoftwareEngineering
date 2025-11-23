import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

console.log('🔍 Checking .env file...\n');
console.log(`📁 Expected path: ${envPath}\n`);

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists\n');
  console.log('📄 Contents of .env file:');
  console.log('─'.repeat(50));
  const content = fs.readFileSync(envPath, 'utf8');
  // Mask the password in the connection string for security
  const masked = content.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)/, '$1****');
  console.log(masked);
  console.log('─'.repeat(50));
  
  // Check if MONGODB_URI is defined
  if (content.includes('MONGODB_URI')) {
    console.log('\n✅ MONGODB_URI found in .env file');
  } else {
    console.log('\n❌ MONGODB_URI NOT found in .env file');
    console.log('💡 Make sure your .env file contains:');
    console.log('   MONGODB_URI=mongodb+srv://...');
  }
} else {
  console.log('❌ .env file does NOT exist\n');
  console.log('💡 Creating .env file template...');
  console.log('   Please add your MongoDB connection string to:');
  console.log(`   ${envPath}`);
}


