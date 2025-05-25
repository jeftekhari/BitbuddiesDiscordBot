const WebSocket = require('ws');

// Test WebSocket connection to bitbuds.fun
const WS_URL = 'wss://bitbuds.fun/ws';

console.log('=== WebSocket Connection Test ===');
console.log(`Testing connection to: ${WS_URL}`);
console.log('Starting connection test...\n');

// Test with minimal headers first
console.log('--- Test 1: Minimal Headers ---');
testConnection({
  'User-Agent': 'WebSocket-Test/1.0'
});

setTimeout(() => {
  console.log('\n--- Test 2: Standard WebSocket Headers ---');
  testConnection({
    'User-Agent': 'WebSocket-Test/1.0',
    'Origin': 'https://bitbuds.fun',
    'Sec-WebSocket-Version': '13'
  });
}, 2000);

setTimeout(() => {
  console.log('\n--- Test 3: Full Headers (Like Discord Bot) ---');
  testConnection({
    'User-Agent': 'BitBuddies-Discord-Bot/1.0',
    'Origin': 'https://bitbuds.fun',
    'Sec-WebSocket-Protocol': 'echo-protocol',
    'Sec-WebSocket-Version': '13',
    'Connection': 'Upgrade',
    'Upgrade': 'websocket',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  });
}, 4000);

setTimeout(() => {
  console.log('\n--- Test 4: No Custom Headers (Default) ---');
  testConnection({});
}, 6000);

function testConnection(headers) {
  console.log('Headers being sent:', JSON.stringify(headers, null, 2));
  
  const ws = new WebSocket(WS_URL, {
    headers: headers,
    handshakeTimeout: 5000
  });

  ws.on('open', () => {
    console.log('✅ Connection successful!');
    console.log(`Protocol: ${ws.protocol}`);
    console.log(`Extensions: ${ws.extensions}`);
    ws.close();
  });

  ws.on('error', (error) => {
    console.log('❌ Connection failed:', error.message);
  });

  ws.on('unexpected-response', (request, response) => {
    console.log('❌ Unexpected response:');
    console.log(`Status: ${response.statusCode} ${response.statusMessage}`);
    console.log('Response headers:', response.headers);
    
    let body = '';
    response.on('data', chunk => body += chunk);
    response.on('end', () => {
      if (body) {
        console.log('Response body:', body);
      }
    });
  });

  ws.on('close', (code, reason) => {
    console.log(`Connection closed: ${code} ${reason}`);
  });
}

// Exit after all tests
setTimeout(() => {
  console.log('\n=== Test Complete ===');
  process.exit(0);
}, 10000); 