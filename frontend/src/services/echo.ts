import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { api } from './auth';

// Define the type for Echo options with correct broadcaster type
interface EchoConfig {
  broadcaster: 'pusher' | 'socket.io' | 'null';
  key: string;
  wsHost: string;
  wsPort: number;
  forceTLS: boolean;
  disableStats: boolean;
  enabledTransports: string[];
  cluster: string;
  auth: {
    headers: {
      Authorization: string;
      Accept: string;
    };
  };
  authEndpoint: string;
  connectOnLogin: boolean;
  disconnectOnLogout: boolean;
}

// We're dealing with a client-side only feature
export const initializeEcho = async () => {
  // Only run on the client side
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Avoid re-initializing Echo
  if ((window as any).Echo) {
    return (window as any).Echo;
  }
  
  // Set up Pusher globally
  (window as any).Pusher = Pusher;
  
  try {
    // Get WebSocket token from cookies if available
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    let token = getCookie('auth_token');
    
    // Instead of using the auth_token cookie directly, fetch a specific WebSocket token
    try {
      const response = await api.get('/ws-token');
      if (response.data && response.data.status && response.data.token) {
        token = response.data.token;
        console.log('Successfully fetched WebSocket token');
      }
    } catch (error) {
      console.error('Failed to fetch WebSocket token, falling back to auth_token cookie:', error);
    }
    
    if (!token) {
      console.warn('No authentication token available for WebSocket connection');
      return null;
    }

    // Configure the WebSocket connection
    const echoConfig: EchoConfig = {
      broadcaster: 'pusher',
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'local',
      wsHost: process.env.NEXT_PUBLIC_WEBSOCKET_HOST || window.location.hostname,
      wsPort: parseInt(process.env.NEXT_PUBLIC_WEBSOCKET_PORT || '6001'),
      forceTLS: process.env.NEXT_PUBLIC_WEBSOCKET_SECURE === 'true',
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      cluster: 'mt1',
      // Add token to connection parameters
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
      // Add the token to the connection query
      authEndpoint: '/broadcasting/auth',
      connectOnLogin: true,
      disconnectOnLogout: true,
    };
    
    console.log('Initializing Echo with config:', {
      ...echoConfig,
      auth: { 
        headers: { 
          ...echoConfig.auth.headers,
          Authorization: 'Bearer [REDACTED]' 
        } 
      }
    });
    
    // Initialize Echo with the configuration
    (window as any).Echo = new Echo(echoConfig as any);
    
    console.log('Laravel Echo initialized successfully');
    return (window as any).Echo;
  } catch (error) {
    console.error('Failed to initialize Laravel Echo:', error);
    return null;
  }
}; 