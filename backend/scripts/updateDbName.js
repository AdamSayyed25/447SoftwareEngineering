import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

console.log('🔧 Updating MongoDB database name to UMBC-DOOR-DASH...\n');

try {
  let content = fs.readFileSync(envPath, 'utf8');
  
  // Update the database name in the connection string
  const updated = content.replace(
    /(MONGODB_URI=mongodb\+srv:\/\/[^\/]+\/)([^?]+)(\?|$)/,
    (match, prefix, dbAndParams, suffix) => {
      // Remove any existing database name and query params
      const baseUri = prefix;
      const dbName = 'UMBC-DOOR-DASH';
      
      // Extract existing query params (if any) and combine them properly
      let queryParams = '';
      
      // Check if there are query params after the database name
      if (suffix === '?') {
        // The ? was part of the match, check if there's more
        queryParams = '?';
      } else if (suffix && suffix.includes('?')) {
        queryParams = suffix;
      } else {
        queryParams = '?';
      }
      
      // Ensure we have proper query params
      if (!queryParams.includes('retryWrites')) {
        queryParams += (queryParams === '?' ? '' : '&') + 'retryWrites=true';
      }
      if (!queryParams.includes('w=')) {
        queryParams += (queryParams.includes('=') ? '&' : '') + 'w=1';
      } else {
        // Replace w=majority with w=1 for free tier compatibility
        queryParams = queryParams.replace(/w=majority/g, 'w=1');
      }
      if (!queryParams.includes('appName')) {
        queryParams += '&appName=Cluster0';
      }
      
      return baseUri + dbName + queryParams;
    }
  );
  
  // Also handle case where database name might be in the connection string already
  const finalUpdated = updated.replace(
    /(mongodb\+srv:\/\/[^\/]+\/)(umbc[-_]?doordash|UMBC[-_]?DOOR[-_]?DASH)/gi,
    '$1UMBC-DOOR-DASH'
  );
  
  // Fix any double ? in the query string
  const fixed = finalUpdated.replace(/\?([^?&]*)\?/g, '?$1&');
  
  if (fixed !== content) {
    fs.writeFileSync(envPath, fixed, 'utf8');
    console.log('✅ Updated database name to: UMBC-DOOR-DASH');
  } else {
    console.log('✅ Database name already set to UMBC-DOOR-DASH');
  }
  
  console.log('\n📄 Updated MONGODB_URI:');
  console.log('─'.repeat(60));
  const masked = fixed.match(/MONGODB_URI=(.*)/)?.[1] || '';
  console.log('MONGODB_URI=' + masked.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)/, '$1****'));
  console.log('─'.repeat(60));
  console.log('\n✅ Connection string updated!\n');
  
} catch (error) {
  console.error('❌ Error updating database name:', error);
  process.exit(1);
}

