import { api } from './auth';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageListeners: Map<string, Set<(data: any) => void>> = new Map();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private pendingMessages: Array<{event: string, data: any}> = [];
  private wsUrl: string;
  private isDevelopment: boolean;
  private isConnecting: boolean = false;
  private currentChannelName: string | null = null;
  private currentToken: string | null = null;
  private connectionAttempts: number = 0;
  private maxRetries: number = 5;
  private _clientId: string | null = null;

  constructor() {
    const host = process.env.NEXT_PUBLIC_WEBSOCKET_HOST || window.location.hostname;
    const port = process.env.NEXT_PUBLIC_WEBSOCKET_PORT || 6001;
    const secure = process.env.NEXT_PUBLIC_WEBSOCKET_SECURE === 'true';
    const protocol = secure ? 'wss' : 'ws';
    this.wsUrl = `${protocol}://${host}:${port}`;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    // Add window event listener to check for online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }
  
  private handleOnline = () => {
    console.log('Browser is online - attempting to reconnect WebSocket');
    if (this.currentChannelName && this.currentToken) {
      this.connect(this.currentChannelName, this.currentToken);
    }
  }
  
  private handleOffline = () => {
    console.log('Browser is offline - WebSocket connections will fail');
    this.notifyConnectionListeners(false);
  }

  async connect(channelName: string, token: string) {
    // Store current connection parameters for potential reconnection
    this.currentChannelName = channelName;
    
    if (this.isConnecting) {
      console.log('Connection already in progress, not starting another');
      return;
    }
    
    // Close existing connection if any
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        console.log('Closing existing WebSocket connection');
        this.socket.close();
      }
      this.socket = null;
    }

    this.isConnecting = true;
    
    try {
      // Get a new token if none provided or if token was cleared due to auth error
      if (!token || token === '') {
        console.log('No token provided or token was cleared, fetching new one');
        try {
          // Try to get a fresh WebSocket token
          const response = await api.get('/ws-token');
          if (response.data && response.data.status && response.data.token) {
            token = response.data.token;
            console.log('Successfully fetched new WebSocket token');
          } else {
            console.warn('Failed to get token from API, response was:', response.data);
          }
        } catch (err) {
          console.error('Error fetching WebSocket token:', err);
          
          // Try to get token from cookies as fallback
          if (typeof document !== 'undefined') {
            const getCookie = (name: string) => {
              const value = `; ${document.cookie}`;
              const parts = value.split(`; ${name}=`);
              if (parts.length === 2) return parts.pop()?.split(';').shift();
              return null;
            };
            
            const cookieToken = getCookie('auth_token');
            if (cookieToken) {
              token = cookieToken;
              console.log('Using auth_token cookie as fallback for WebSocket connection');
            }
          }
        }
      }
      
      // Use development token if in development mode and still no token
      if (this.isDevelopment && (!token || token === 'null' || token === 'undefined')) {
        console.log('Using development token for WebSocket connection');
        token = 'development_token';
      }
      
      // If we still don't have a token, we can't connect
      if (!token) {
        throw new Error('No authentication token available for WebSocket connection');
      }
      
      // Store the token for future reconnections
      this.currentToken = token;
      
      // Connect to the WebSocket server with the channel name in the URL
      const wsUrl = `${this.wsUrl}/${channelName}?token=${encodeURIComponent(token)}`;
      console.log(`Connecting to WebSocket: ${wsUrl.split('?')[0]}?token=***`); 
      
      this.socket = new WebSocket(wsUrl);

      // Setup ping interval to keep connection alive
      let pingInterval: NodeJS.Timeout | null = null;
      
      this.socket.onopen = () => {
        console.log(`Connected to WebSocket server on channel: ${channelName}`);
        this.isConnecting = false;
        this.connectionAttempts = 0;
        this.notifyConnectionListeners(true);
        
        // Set up regular pings to keep the connection alive
        pingInterval = setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            try {
              // Send a simple ping message
              this.socket.send(JSON.stringify({ 
                event: 'ping', 
                data: { 
                  timestamp: new Date().toISOString(),
                  clientId: this.getClientId()
                } 
              }));
              console.log('[WebSocket] Ping sent to keep connection alive');
            } catch (err) {
              console.warn('[WebSocket] Failed to send ping:', err);
            }
          } else {
            // If socket is not open, clear the interval
            if (pingInterval) {
              clearInterval(pingInterval);
              pingInterval = null;
            }
          }
        }, 25000); // Send ping every 25 seconds
        
        // Clear any reconnect timer
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        
        // Send any pending messages
        if (this.pendingMessages.length > 0) {
          console.log(`Sending ${this.pendingMessages.length} pending messages`);
          this.pendingMessages.forEach(msg => {
            this.sendMessage(msg.event, msg.data);
          });
          this.pendingMessages = [];
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          
          const eventName = data.event || 'message';
          if (this.messageListeners.has(eventName)) {
            this.messageListeners.get(eventName)?.forEach(listener => {
              listener(data.data);
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        this.isConnecting = false;
        this.notifyConnectionListeners(false);
        
        // Clean up ping interval if it exists
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
        
        // Provide more detailed information about the close event
        const closeCodeMessages = {
          1000: 'Normal closure',
          1001: 'Going away',
          1002: 'Protocol error',
          1003: 'Unsupported data',
          1005: 'No status received',
          1006: 'Abnormal closure',
          1007: 'Invalid frame payload data',
          1008: 'Policy violation',
          1009: 'Message too big',
          1010: 'Mandatory extension',
          1011: 'Internal server error',
          1012: 'Service restart',
          1013: 'Try again later',
          1014: 'Bad gateway',
          1015: 'TLS handshake',
        };
        
        const codeDescription = closeCodeMessages[event.code as keyof typeof closeCodeMessages] || 'Unknown';
        console.log(`WebSocket connection closed. Code: ${event.code} (${codeDescription}), Reason: ${event.reason || 'No reason provided'}, Clean: ${event.wasClean ? 'Yes' : 'No'}`);
        
        // If it's an authentication error, we might want to re-fetch the token
        if (event.code === 1008 || event.code === 1011 || event.reason?.includes('auth')) {
          console.error('WebSocket authentication error - will refresh token on next attempt');
          // Clear the current token to force a new token fetch
          this.currentToken = null;
        }
        
        // For code 1006 (abnormal closure), try to reconnect immediately once
        if (event.code === 1006 && this.connectionAttempts === 0) {
          console.log('Abnormal closure detected - attempting immediate reconnection');
          setTimeout(() => {
            if (this.currentChannelName) {
              this.connect(this.currentChannelName, this.currentToken || '');
            }
          }, 500);
          return;
        }
        
        // Attempt to reconnect after a delay, with backoff
        if (this.connectionAttempts < this.maxRetries) {
          this.connectionAttempts++;
          const delay = Math.min(3000 * Math.pow(1.5, this.connectionAttempts), 30000);
          console.log(`Attempting to reconnect in ${delay/1000} seconds... (Attempt ${this.connectionAttempts}/${this.maxRetries})`);
          
          this.reconnectTimer = setTimeout(() => {
            if (this.currentChannelName) {
              // If token was cleared, we'll get a new one on next connect
              this.connect(this.currentChannelName, this.currentToken || '');
            }
          }, delay);
        } else {
          console.error(`Failed to reconnect after ${this.maxRetries} attempts.`);
        }
      };

      this.socket.onerror = (error) => {
        // Extract more information about the error
        let errorDetail = 'Unknown error';
        try {
          // Try to get more details about the error
          if (error instanceof Error) {
            errorDetail = error.message;
          } else if (error instanceof Event) {
            errorDetail = `Event type: ${error.type}`;
            
            // Try to extract target info if available
            const target = error.target as WebSocket;
            if (target) {
              errorDetail += `, URL: ${target.url}, ReadyState: ${target.readyState}`;
            }
          } else {
            errorDetail = JSON.stringify(error);
          }
        } catch (e) {
          errorDetail = 'Error details unavailable';
        }
        
        console.error('WebSocket error:', errorDetail);
        // The onclose handler will be called after this
      };
    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  disconnect() {
    console.log('Disconnecting WebSocket');
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.messageListeners.clear();
    this.connectionListeners.clear();
    this.pendingMessages = [];
    this.currentChannelName = null;
    this.currentToken = null;
    this.connectionAttempts = 0;
    
    // Remove window event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  on(eventName: string, callback: (data: any) => void) {
    if (!this.messageListeners.has(eventName)) {
      this.messageListeners.set(eventName, new Set());
    }
    this.messageListeners.get(eventName)?.add(callback);
    
    return () => {
      this.messageListeners.get(eventName)?.delete(callback);
    };
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.add(callback);
    
    // Immediately notify with current state
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      callback(true);
    } else {
      callback(false);
    }
    
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => {
      listener(connected);
    });
  }

  isConnected() {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
  
  getConnectionState() {
    return {
      isConnected: this.isConnected(),
      isConnecting: this.isConnecting,
      hasSocket: this.socket !== null,
      readyState: this.socket?.readyState
    };
  }
  
  getCurrentChannel() {
    return this.currentChannelName;
  }
  
  getPendingMessageCount() {
    return this.pendingMessages.length;
  }

  sendMessage(event: string, data: any): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log(`Sending WebSocket message: ${event}`, {
        ...data,
        channel: this.currentChannelName,
        clientId: this.getClientId()
      });
      
      // Add sender information to help identify own messages
      const messageToSend = { 
        event, 
        data: {
          ...data,
          _sender: {
            id: data.user_id || data.senderId || 'unknown',
            timestamp: new Date().toISOString(),
            clientId: this.getClientId()
          }
        } 
      };
      
      this.socket.send(JSON.stringify(messageToSend));
      return true;
    } else {
      console.warn(`Cannot send message: WebSocket is not connected (ReadyState: ${this.socket?.readyState || 'null'})`);
      
      // Add more diagnostic information
      const diagnosticInfo = {
        readyState: this.socket?.readyState,
        readyStateText: this.getReadyStateText(this.socket?.readyState),
        connecting: this.isConnecting,
        attempts: this.connectionAttempts,
        channel: this.currentChannelName,
        hasPendingMessages: this.pendingMessages.length > 0
      };
      console.warn('WebSocket diagnostic information:', diagnosticInfo);
      
      // Store message to send later when connection is established
      this.pendingMessages.push({ event, data });
      
      // Try to reconnect if not already connecting
      if (!this.isConnecting && this.currentChannelName && this.currentToken) {
        console.log('Attempting to reconnect WebSocket before sending message');
        this.connect(this.currentChannelName, this.currentToken);
      }
      
      return false;
    }
  }

  // Helper to get a readable state description
  private getReadyStateText(readyState?: number): string {
    switch(readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
  
  // Generate a consistent client ID to help identify this client instance
  private getClientId(): string {
    if (!this._clientId) {
      // Generate a random client ID when first needed
      this._clientId = `client-${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
    }
    return this._clientId;
  }

  // Method to broadcast message through the HTTP API as fallback
  async broadcastMessage(channel: string, event: string, data: any) {
    try {
      console.log(`Attempting HTTP fallback broadcast to channel ${channel}`, { event, data });
      const response = await api.post('/broadcast', { channel, event, data });
      return response.data;
    } catch (error) {
      console.error('Error broadcasting message via HTTP:', error);
      throw error;
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService; 