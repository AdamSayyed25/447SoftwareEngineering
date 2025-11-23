import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

console.log('🔧 Fixing MongoDB connection string...\n');

try {
  let content = fs.readFileSync(envPath, 'utf8');
  
  // Fix the connection string - replace any double question marks and fix query params
  let updated = content.replace(
    /(MONGODB_URI=mongodb\+srv:\/\/[^\s]+)/,
    (match) => {
      let uri = match.replace('MONGODB_URI=', '');
      
      // If it has ?appName but also has other params, replace ?appName with &appName
      if (uri.includes('?') && uri.includes('appName=')) {
        uri = uri.replace(/([^?])?appName=/g, (match2, p1) => {
          return p1 ? '&appName=' : '?appName=';
        });
      }
      
      // Ensure we have proper database name and query params
      if (!uri.includes('/umbc_doordash')) {
        uri = uri.replace(/\/\?/, '/umbc_doordash?');
        uri = uri.replace(/\/$/, '/umbc_doordash');
      }
      
      // Ensure proper query string formatting
      if (!uri.includes('?')) {
        uri += '?';
      } else if (uri.split('?').length > 2) {
        // Multiple ? found, fix them
        const parts = uri.split('?');
        uri = parts[0] + '?' + parts.slice(1).join('&');
      }
      
      // Add retryWrites if not present
      if (!uri.includes('retryWrites')) {
        uri += (uri.includes('?') ? '&' : '?') + 'retryWrites=true';
      }
      
      // Add w=majority if not present (for Atlas free tier, use 1 instead)
      if (!uri.includes('w=')) {
        uri += (uri.includes('?') ? '&' : '?') + 'w=1';
      } else {
        // Replace w=majority with w=1 for free tier
        uri = uri.replace(/w=majority/g, 'w=1');
      }
      
      // Fix appName to use & instead of ? if it comes after another ?
      uri = uri.replace(/\?appName=/g, '&appName=');
      
      return 'MONGODB_URI=' + uri;
    }
  );
  
  if (updated !== content) {
    fs.writeFileSync(envPath, updated, 'utf8');
    console.log('✅ Fixed connection string');
  }
  
  console.log('\n📄 Updated MONGODB_URI:');
  console.log('─'.repeat(60));
  const masked = updated.match(/MONGODB_URI=(.*)/)?.[1] || '';
  console.log('MONGODB_URI=' + masked.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)/, '$1****'));
  console.log('─'.repeat(60));
  console.log('\n✅ Connection string fixed!\n');
  
} catch (error) {
  console.error('❌ Error fixing connection string:', error);
  process.exit(1);
}


