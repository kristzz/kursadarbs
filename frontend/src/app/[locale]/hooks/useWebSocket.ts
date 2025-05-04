import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import websocketService from '@/services/websocket';
import { api } from '@/services/auth';

interface WebSocketHookOptions {
  channelName: string;
  onMessage?: (eventName: string, data: any) => void;
  autoConnect?: boolean;
  onError?: (error: string) => void;
}

interface WebSocketHook {
  connected: boolean;
  error: string;
  sendMessage: (event: string, data: any) => boolean;
  reconnect: () => Promise<void>;
}

async function getWebSocketToken(): Promise<string | null> {
  try {
    // Try to get a token from the API first
    const response = await api.get('/ws-token');
    if (response.data && response.data.status && response.data.token) {
      console.log('Successfully fetched WebSocket token from API');
      return response.data.token;
    }
  } catch (error) {
    console.error('Error fetching WebSocket token:', error);
  }

  // Fallback to cookie token if API request fails
  if (typeof document !== 'undefined') {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    if (cookieValue) {
      console.log('Using auth_token cookie for WebSocket connection');
      return cookieValue;
    }
  }

  console.error('No WebSocket token available');
  return null;
}

export default function useWebSocket({
  channelName,
  onMessage,
  autoConnect = true,
  onError
}: WebSocketHookOptions): WebSocketHook {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const tokenRef = useRef<string | null>(null);
  const connecting = useRef(false);
  const router = useRouter();
  const params = useParams();

  // Function to get token and connect
  const connect = useCallback(async () => {
    if (connecting.current) {
      console.log('Already attempting to connect, skipping duplicate request');
      return;
    }

    try {
      connecting.current = true;
      
      // Clear previous errors
      setError('');
      
      // Get a token for WebSocket authentication
      const token = await getWebSocketToken();
      
      if (!token) {
        const errorMsg = 'Failed to get authentication token for WebSocket';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }
      
      // Store the token for potential reconnects
      tokenRef.current = token;
      
      // Connect to the WebSocket service
      websocketService.connect(channelName, token);
      
      console.log(`WebSocket connecting to channel: ${channelName}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown WebSocket connection error';
      console.error('WebSocket connection error:', errorMsg);
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      connecting.current = false;
    }
  }, [channelName, onError]);

  const reconnect = useCallback(async () => {
    console.log('Manually reconnecting WebSocket...');
    await connect();
  }, [connect]);

  // Listen for WebSocket events
  useEffect(() => {
    // Set up connection status listener
    const unsubscribeConnection = websocketService.onConnectionChange((isConnected) => {
      setConnected(isConnected);
      if (!isConnected && error) {
        // If we're disconnected and there was an error, clear it when reconnecting
        setError('');
      }
    });

    // For each WebSocket message event
    const eventUnsubscribers: (() => void)[] = [];
    const events = ['new_message', 'direct_message', 'connection_established'];
    
    events.forEach(event => {
      // Set up a handler that safely calls onMessage if it's defined
      const handler = (data: any) => {
        console.log(`Received WebSocket event: ${event}`, data);
        if (onMessage && typeof onMessage === 'function') {
          try {
            onMessage(event, data);
          } catch (error) {
            console.error(`Error in onMessage handler for event "${event}":`, error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in message handler';
            setError(errorMsg);
            if (onError) onError(errorMsg);
          }
        } else {
          console.log(`Received ${event} event, but no onMessage handler defined`);
        }
      };
      
      const unsubscribe = websocketService.on(event, handler);
      if (typeof unsubscribe === 'function') {
        eventUnsubscribers.push(unsubscribe);
      }
    });
    
    // Connect if autoConnect is true
    if (autoConnect) {
      connect();
    }

    // Cleanup
    return () => {
      if (typeof unsubscribeConnection === 'function') {
        unsubscribeConnection();
      }
      
      // Call all event unsubscribers
      eventUnsubscribers.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [autoConnect, channelName, connect, onMessage, error]);

  // Send a message through WebSocket
  const sendMessage = useCallback((event: string, data: any): boolean => {
    if (!connected) {
      console.warn('Attempting to send message while disconnected, trying to reconnect...');
      // Store this message attempt for debugging
      const attemptDetails = {
        event,
        timestamp: new Date().toISOString(),
        connectionState: connected ? 'CONNECTED' : 'DISCONNECTED'
      };
      console.warn('Message send attempt details:', attemptDetails);
      
      // Try to reconnect - this will queue the message in pendingMessages
      connect();
      
      // Return false to indicate the message wasn't sent immediately
      return false;
    }
    
    // If we're connected, try to send the message
    try {
      return websocketService.sendMessage(event, data);
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      setError(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (onError) onError(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, [connected, connect, onError]);

  // Debug hook state
  useEffect(() => {
    const logDebugInfo = () => {
      console.log(`[WebSocket] Debug Info:`, {
        hook: {
          channelName,
          connected,
          hasError: !!error,
          autoConnect
        },
        service: {
          currentChannel: websocketService.getCurrentChannel(),
          connectionState: websocketService.getConnectionState(),
          pendingMessageCount: websocketService.getPendingMessageCount()
        }
      });
    };

    logDebugInfo();
    
    // Log again whenever connection state changes
    return () => {
      console.log(`[WebSocket] Hook for channel ${channelName} unmounting`);
      logDebugInfo();
    };
  }, [channelName, connected, error, autoConnect]);

  return { connected, error, sendMessage, reconnect };
} 