export interface RealTimeConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (data: any) => void;
}

export interface UseRealTimeUpdatesReturn {
  isConnected: boolean;
  send: (data: any) => void;
  disconnect: () => void;
  reconnect: () => void;
}

// WebSocket connections disabled for development
export function useRealTimeUpdates(
  config: RealTimeConfig
): UseRealTimeUpdatesReturn {
  console.log('WebSocket connections are disabled for development');
  
  // Return mock implementation - no actual WebSocket connections
  return {
    isConnected: false,
    send: (data: any) => {
      console.log('WebSocket send disabled:', data);
    },
    disconnect: () => {
      console.log('WebSocket disconnect disabled');
    },
    reconnect: () => {
      console.log('WebSocket reconnect disabled');
    }
  };
}