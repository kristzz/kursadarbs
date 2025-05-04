const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');
const cookie = require('cookie');
const url = require('url');

// Load environment variables
dotenv.config();

// Get configuration from environment variables with fallbacks
const PORT = process.env.PORT || 6001;
const JWT_SECRET = process.env.JWT_SECRET;
const SKIP_WS_AUTH = process.env.SKIP_WS_AUTH === 'true';
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';

// Parse allowed origins from environment variable or use default
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

// Setup Express app with CORS
const app = express();
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));

// Create HTTP server
const server = http.createServer(app);

// Function to extract user ID from Laravel Sanctum token
const extractUserIdFromSanctumToken = (token) => {
  try {
    // Sanctum tokens are in the format: {id}|{hashedToken}
    // We just need to extract the ID part
    const parts = token.split('|');
    if (parts.length >= 1) {
      return parseInt(parts[0], 10);
    }
  } catch (error) {
    console.error('[WebSocket] Error extracting user ID from Sanctum token:', error);
  }
  return null;
};

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  verifyClient: (info, cb) => {
    if (SKIP_WS_AUTH) {
      console.log('[WebSocket] Authentication skipped (SKIP_WS_AUTH=true)');
      return cb(true);
    }

    try {
      // Get token from query, headers, or cookies
      const { query } = url.parse(info.req.url, true);
      const cookies = cookie.parse(info.req.headers.cookie || '');
      
      // Log connection attempt for debugging
      console.log('[WebSocket] Connection attempt:', {
        url: info.req.url,
        origin: info.origin,
        secure: info.secure,
        hasToken: !!query.token || !!info.req.headers.authorization || !!cookies.auth_token,
      });

      // Try to get token from different sources
      let token = null;
      
      // 1. Check query parameters
      if (query.token) {
        token = query.token;
        console.log('[WebSocket] Using token from query parameter');
      } 
      // 2. Check authorization header
      else if (info.req.headers.authorization) {
        const authHeader = info.req.headers.authorization;
        token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        console.log('[WebSocket] Using token from authorization header');
      } 
      // 3. Check cookies
      else if (cookies.auth_token) {
        token = cookies.auth_token;
        console.log('[WebSocket] Using token from auth_token cookie');
      }

      // Handle case when no token is found
      if (!token) {
        console.error('[WebSocket] No token found in request');
        return cb(false, 401, 'Authentication token is missing');
      }

      // Special case for development
      if (isDevelopment && token === 'development_token') {
        console.log('[WebSocket] Using development token (only in development mode)');
        info.req.user = { sub: 'dev_user', name: 'Development User' };
        return cb(true);
      }

      // Check if it's a Sanctum token (contains a pipe character)
      if (token.includes('|')) {
        console.log('[WebSocket] Detected Sanctum token format');
        const userId = extractUserIdFromSanctumToken(token);
        
        if (userId) {
          console.log('[WebSocket] Authentication successful with Sanctum token for user:', userId);
          info.req.user = { sub: userId, type: 'sanctum' };
          return cb(true);
        } else {
          console.error('[WebSocket] Invalid Sanctum token format');
          return cb(false, 401, 'Invalid Sanctum token format');
        }
      } 
      // Otherwise, treat as JWT token
      else {
        try {
          // Verify JWT token
          jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
              console.error('[WebSocket] JWT verification failed:', err.message);
              return cb(false, 401, 'Invalid JWT token');
            }
            
            // Authentication successful
            console.log('[WebSocket] Authentication successful with JWT for user:', decoded.sub || 'unknown');
            
            // Add decoded token to request for later use
            info.req.user = decoded;
            return cb(true);
          });
        } catch (jwtError) {
          console.error('[WebSocket] Error verifying JWT:', jwtError);
          return cb(false, 401, 'Invalid token format');
        }
      }
    } catch (error) {
      console.error('[WebSocket] Error during client verification:', error);
      return cb(false, 500, 'Internal server error');
    }
  }
});

// WebSocket server events
wss.on('connection', (ws, req) => {
  // Extract path and channel from URL
  const { pathname, query } = url.parse(req.url, true);
  const channel = pathname.slice(1); // Remove leading slash

  console.log(`[WebSocket] Client connected to channel: ${channel}`);
  
  // Generate a unique client ID
  ws._clientId = `client-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
  
  // Store channel on the connection
  ws.channel = channel;
  ws.isAlive = true;

  // Send connection established message
  ws.send(JSON.stringify({
    event: 'connection_established',
    data: { 
      channel,
      clientId: ws._clientId,
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      activeConnections: Array.from(wss.clients).filter(c => c.channel === channel).length
    }
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Special handling for ping messages - don't log or broadcast these
      if (data.event === 'ping') {
        // Just acknowledge with a pong - no need to broadcast pings
        try {
          ws.send(JSON.stringify({
            event: 'pong',
            data: {
              timestamp: new Date().toISOString(),
              serverTime: new Date().toISOString(),
              clientId: ws._clientId
            }
          }));
        } catch (pongError) {
          console.error('[WebSocket] Failed to send pong response:', pongError);
        }
        return;
      }
      
      console.log(`[WebSocket] Received message on channel ${channel}:`, data);

      // Add debug info about how many clients will receive this message
      const targetClients = Array.from(wss.clients).filter(
        client => client.readyState === WebSocket.OPEN && client.channel === channel
      );
      
      console.log(`[WebSocket] Broadcasting to ${targetClients.length} clients on channel ${channel}`);
      
      // Broadcast message to all clients in the same channel
      let broadcastCount = 0;
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.channel === channel) {
          // Add metadata to help identify the message source
          const messageToSend = {
            ...data,
            _meta: {
              timestamp: new Date().toISOString(),
              channel,
              originalSender: ws._clientId || 'unknown',
              broadcastId: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
            }
          };
          
          try {
            client.send(JSON.stringify(messageToSend));
            broadcastCount++;
          } catch (sendError) {
            console.error('[WebSocket] Failed to send to client:', sendError);
            // Don't let one failed client stop broadcasting to others
          }
        }
      });
      
      console.log(`[WebSocket] Successfully broadcast to ${broadcastCount} clients`);
    } catch (error) {
      console.error('[WebSocket] Error processing message:', error);
      
      // Send error back to the client
      try {
        ws.send(JSON.stringify({
          event: 'error',
          data: {
            message: 'Failed to process message',
            error: error.message
          }
        }));
      } catch (sendError) {
        console.error('[WebSocket] Failed to send error message back to client:', sendError);
      }
    }
  });

  // Handle connection close
  ws.on('close', () => {
    console.log(`[WebSocket] Client disconnected from channel: ${channel}`);
  });

  // Ping to keep connection alive
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// Ping all clients every 30 seconds to keep connections alive
const interval = setInterval(() => {
  let activeCount = 0;
  let terminatedCount = 0;
  
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log(`[WebSocket] Terminating inactive connection for client in channel: ${ws.channel}`);
      terminatedCount++;
      return ws.terminate();
    }
    
    ws.isAlive = false;
    
    try {
      ws.ping(() => {});
      activeCount++;
    } catch (error) {
      console.error('[WebSocket] Error sending ping:', error);
      // Terminate the connection if we can't ping it
      try {
        ws.terminate();
        terminatedCount++;
      } catch (terminateError) {
        console.error('[WebSocket] Error terminating connection:', terminateError);
      }
    }
  });
  
  // Log ping stats
  if (wss.clients.size > 0) {
    console.log(`[WebSocket] Ping status: ${activeCount} active, ${terminatedCount} terminated, ${wss.clients.size} total connections`);
  }
}, 20000); // Reduced from 30s to 20s

// Clear interval on server close
wss.on('close', () => {
  clearInterval(interval);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    connections: wss.clients.size,
    uptime: process.uptime()
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`[WebSocket] Server is running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`[WebSocket] Authentication ${SKIP_WS_AUTH ? 'disabled' : 'enabled'}`);
  console.log(`[WebSocket] Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});