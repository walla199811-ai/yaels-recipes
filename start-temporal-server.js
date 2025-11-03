#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting Temporal server directly on HTTP port...');

// Start Temporal server directly on the HTTP port (the only externally accessible port)
const port = process.env.PORT || 3000;
console.log(`🔧 Temporal server will use port: ${port}`);

const temporal = spawn('./temporal', [
  'server',
  'start-dev',
  '--ip', '0.0.0.0',
  '--port', port,
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