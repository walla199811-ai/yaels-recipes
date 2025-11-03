#!/usr/bin/env node

const http = require('http');
const { spawn } = require('child_process');

console.log('🚀 Starting combined Temporal server + worker...');

const port = process.env.PORT || 3000;
const temporalPort = 7234; // Internal port for Temporal server

console.log(`🔧 HTTP health server will use port: ${port}`);
console.log(`🔧 Temporal server will use internal port: ${temporalPort}`);

// Start HTTP health check server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Temporal Server + Worker Running\n');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ HTTP health server started on port ${port}`);
});

// Start Temporal server on internal port
console.log('🔧 Starting Temporal server...');
const temporalBinary = process.env.NODE_ENV === 'production' ? './temporal' : 'temporal';
const temporal = spawn(temporalBinary, [
  'server',
  'start-dev',
  '--ip', '127.0.0.1', // Only bind to localhost
  '--port', temporalPort,
  '--headless'
], {
  stdio: 'inherit'
});

// Wait for Temporal server to start, then start the worker
setTimeout(() => {
  console.log('🔧 Starting Temporal worker...');
  const worker = spawn('npx', ['tsx', 'src/temporal/workers/recipe-worker.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      TEMPORAL_ADDRESS: `127.0.0.1:${temporalPort}`, // Connect locally
      NODE_ENV: process.env.NODE_ENV || 'production'
    }
  });

  worker.on('close', (code) => {
    console.log(`❌ Temporal worker exited with code ${code}`);
    process.exit(code);
  });

  worker.on('error', (err) => {
    console.error('❌ Failed to start Temporal worker:', err);
    process.exit(1);
  });
}, 10000); // Wait 10 seconds for server to start

// Handle Temporal server events
temporal.on('close', (code) => {
  console.log(`❌ Temporal server exited with code ${code}`);
  process.exit(code);
});

temporal.on('error', (err) => {
  console.error('❌ Failed to start Temporal server:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  temporal.kill('SIGTERM');
  server.close();
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  temporal.kill('SIGINT');
  server.close();
});