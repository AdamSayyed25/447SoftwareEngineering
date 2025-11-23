import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');

console.log('🔧 Fixing .env file...\n');

try {
  let content = fs.readFileSync(envPath, 'utf8');
  
  // Check if MONGODB_URI is already defined
  if (content.includes('MONGODB_URI=')) {
    console.log('✅ .env file already has MONGODB_URI variable');
    process.exit(0);
  }
  
  // If the file just has the connection string, add MONGODB_URI= prefix
  const lines = content.trim().split('\n');
  let updated = false;
  const newLines = lines.map(line => {
    const trimmed = line.trim();
    // Check if this looks like a MongoDB connection string
    if (trimmed.startsWith('mongodb+srv://') || trimmed.startsWith('mongodb://')) {
      if (!trimmed.startsWith('MONGODB_URI=')) {
        updated = true;
        return `MONGODB_URI=${trimmed}`;
      }
    }
    return line;
  });
  
  if (updated) {
    // Also add other common variables if they don't exist
    let hasPort = newLines.some(line => line.startsWith('PORT='));
    let hasFrontend = newLines.some(line => line.startsWith('FRONTEND_URL='));
    let hasJwt = newLines.some(line => line.startsWith('JWT_SECRET='));
    
    if (!hasPort) {
      newLines.push('PORT=3001');
    }
    if (!hasFrontend) {
      newLines.push('FRONTEND_URL=http://localhost:5173');
    }
    if (!hasJwt) {
      newLines.push('JWT_SECRET=your-secret-key-change-in-production');
    }
    
    fs.writeFileSync(envPath, newLines.join('\n') + '\n', 'utf8');
    console.log('✅ Updated .env file with MONGODB_URI variable');
    console.log('✅ Added other required variables (PORT, FRONTEND_URL, JWT_SECRET)');
  } else {
    // If no connection string found, create a template
    const template = `MONGODB_URI=mongodb+srv://asayyed2_db_user:GLjLT5xV143ErYMz@cluster0.rxwm0fh.mongodb.net/umbc_doordash?retryWrites=true&w=majority&appName=Cluster0
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production
`;
    fs.writeFileSync(envPath, template, 'utf8');
    console.log('✅ Created .env file with proper format');
  }
  
  console.log('\n📄 Updated .env file contents:');
  console.log('─'.repeat(50));
  const newContent = fs.readFileSync(envPath, 'utf8');
  const masked = newContent.replace(/(mongodb\+srv:\/\/[^:]+:)([^@]+)/, '$1****');
  console.log(masked);
  console.log('─'.repeat(50));
  console.log('\n✅ .env file is ready!\n');
  
} catch (error) {
  console.error('❌ Error fixing .env file:', error);
  process.exit(1);
}


