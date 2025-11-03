#!/usr/bin/env node

const net = require('net');
const http = require('http');
const { spawn } = require('child_process');

console.log('🚀 Starting Temporal server with TCP proxy...');

const port = process.env.PORT || 3000;
const temporalPort = 7234; // Internal port for Temporal server

console.log(`🔧 TCP proxy will use port: ${port}`);
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

// Create TCP server that handles both HTTP health checks and raw gRPC traffic
const server = net.createServer((clientSocket) => {
  console.log('📡 New connection received');

  // Buffer to peek at the first few bytes to determine if it's HTTP or gRPC
  let isFirstChunk = true;

  clientSocket.on('data', (data) => {
    if (isFirstChunk) {
      isFirstChunk = false;

      // Check if this looks like an HTTP request (starts with HTTP verbs)
      const dataStr = data.toString('ascii', 0, Math.min(data.length, 10));
      const isHTTP = /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH) /.test(dataStr);

      if (isHTTP && dataStr.includes('GET /')) {
        // Handle HTTP health check
        console.log('🔍 Health check request detected');
        const response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 23\r\n\r\nTemporal Server Running\n';
        clientSocket.write(response);
        clientSocket.end();
        return;
      }

      // For gRPC traffic, create proxy connection to Temporal server
      console.log('🔄 Proxying gRPC traffic to Temporal server');
      const serverSocket = net.connect(temporalPort, '127.0.0.1');

      // Forward this initial data
      serverSocket.write(data);

      // Pipe data in both directions
      clientSocket.pipe(serverSocket, { end: false });
      serverSocket.pipe(clientSocket, { end: false });

      // Handle connection cleanup
      clientSocket.on('close', () => {
        console.log('🔌 Client connection closed');
        serverSocket.end();
      });

      serverSocket.on('close', () => {
        console.log('🔌 Server connection closed');
        clientSocket.end();
      });

      serverSocket.on('error', (err) => {
        console.error('❌ Server socket error:', err.message);
        clientSocket.end();
      });

    }
  });

  clientSocket.on('error', (err) => {
    console.error('❌ Client socket error:', err.message);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ TCP proxy server started on port ${port}`);
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