import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

console.log('🔧 Updating MongoDB connection string with database name...\n');

try {
  let content = fs.readFileSync(envPath, 'utf8');
  
  // Update MONGODB_URI to include database name
  const updated = content.replace(
    /(MONGODB_URI=mongodb\+srv:\/\/[^\/]+\/)(\?|$)/,
    '$1umbc_doordash?retryWrites=true&w=majority$2'
  );
  
  if (updated !== content) {
    fs.writeFileSync(envPath, updated, 'utf8');
    console.log('✅ Updated connection string with database name: umbc_doordash');
    console.log('\n📄 Updated MONGODB_URI:');
    console.log('─'.repeat(50));
    const masked = updated.match(/MONGODB_URI=(.*)/)?.[1] || '';
    console.log('MONGODB_URI=' + masked.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)/, '$1****'));
    console.log('─'.repeat(50));
  } else {
    console.log('✅ Connection string already has database name');
  }
  
  console.log('\n');
} catch (error) {
  console.error('❌ Error updating .env file:', error);
  process.exit(1);
}


