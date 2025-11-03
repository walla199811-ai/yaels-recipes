#!/usr/bin/env node

const http = require('http');
const { spawn } = require('child_process');

console.log('🚀 Starting Temporal server with HTTP wrapper...');

// Start HTTP health check server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Temporal Server Running\n');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`✅ HTTP health server started on port ${port}`);
});

// Start Temporal server in background
console.log('🔧 Starting Temporal server...');
const temporal = spawn('./temporal', [
  'server',
  'start-dev',
  '--ip', '0.0.0.0',
  '--port', '7233',
  '--headless'
], {
  stdio: 'inherit'
});

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