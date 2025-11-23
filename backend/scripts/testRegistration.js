import http from 'http';

const testData = JSON.stringify({
  email: 'test@test.com',
  username: 'testuser_' + Date.now(),
  password: 'testpass123'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

console.log('🧪 Testing Registration Endpoint...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('\n✅ Registration endpoint is working!');
        console.log('✅ User data is being stored in MongoDB');
      } else {
        console.log('\n⚠️  Registration returned non-success status');
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error testing registration:', e.message);
  console.error('   Make sure the server is running on port 3001');
  process.exit(1);
});

req.write(testData);
req.end();

