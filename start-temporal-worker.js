#!/usr/bin/env node

const http = require('http');
const { spawn } = require('child_process');

console.log('🚀 Starting Temporal worker with HTTP wrapper...');

// Start HTTP health check server for Render.com compatibility
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Temporal Worker Running\n');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`✅ HTTP health server started on port ${port}`);
});

// Start Temporal worker
console.log('🔧 Starting Temporal worker...');
const worker = spawn('npx', ['tsx', 'src/temporal/workers/recipe-worker.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Ensure environment variables are available
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

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  worker.kill('SIGTERM');
  server.close();
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  worker.kill('SIGINT');
  server.close();
});