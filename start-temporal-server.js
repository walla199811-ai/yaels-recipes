#!/usr/bin/env node

const http = require('http');
const httpProxy = require('http-proxy');
const { spawn } = require('child_process');

console.log('🚀 Starting Temporal server with gRPC proxy...');

const port = process.env.PORT || 3000;
const temporalPort = 7234; // Internal port for Temporal server

console.log(`🔧 HTTP/gRPC proxy will use port: ${port}`);
console.log(`🔧 Temporal server will use internal port: ${temporalPort}`);

// Start Temporal server on internal port
const temporal = spawn('./temporal', [
  'server',
  'start-dev',
  '--ip', '127.0.0.1', // Only bind to localhost for internal access
  '--port', temporalPort,
  '--headless'
], {
  stdio: 'inherit'
});

// Create proxy for gRPC requests
const proxy = httpProxy.createProxyServer({});

// Create HTTP server that handles both health checks and gRPC proxying
const server = http.createServer((req, res) => {
  // Handle health check requests
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Temporal Server Running\n');
    return;
  }

  // For all other requests (gRPC), proxy to internal Temporal server
  proxy.web(req, res, {
    target: `http://127.0.0.1:${temporalPort}`,
    changeOrigin: true,
  });
});

// Handle WebSocket upgrades for gRPC streams
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, {
    target: `ws://127.0.0.1:${temporalPort}`,
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ gRPC proxy server started on port ${port}`);
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