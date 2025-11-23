import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

console.log('🧹 Cleaning MongoDB connection string...\n');

try {
  let content = fs.readFileSync(envPath, 'utf8');
  
  // Extract the base connection string (everything before the database name)
  const match = content.match(/MONGODB_URI=(mongodb\+srv:\/\/[^\/]+\/)/);
  
  if (!match) {
    console.log('❌ Could not parse MONGODB_URI');
    process.exit(1);
  }
  
  const baseUri = match[1];
  const dbName = 'UMBC-DOOR-DASH';
  
  // Build clean connection string with proper query params
  const cleanUri = `${baseUri}${dbName}?retryWrites=true&w=1&appName=Cluster0`;
  
  // Replace the MONGODB_URI line
  const updated = content.replace(
    /MONGODB_URI=.*/,
    `MONGODB_URI=${cleanUri}`
  );
  
  if (updated !== content) {
    fs.writeFileSync(envPath, updated, 'utf8');
    console.log('✅ Cleaned connection string');
  }
  
  console.log('\n📄 Clean MONGODB_URI:');
  console.log('─'.repeat(60));
  const masked = cleanUri.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)/, '$1****');
  console.log('MONGODB_URI=' + masked);
  console.log('─'.repeat(60));
  console.log(`\n✅ Database: ${dbName}`);
  console.log('✅ Connection string cleaned!\n');
  
} catch (error) {
  console.error('❌ Error cleaning connection string:', error);
  process.exit(1);
}


