import { useState, useCallback, useRef, useEffect } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

export interface UseApiStateOptions {
  initialData?: any;
  autoRefresh?: boolean;
  refreshInterval?: number;
  retryOnError?: boolean;
  maxRetries?: number;
}

export interface UseApiStateReturn<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<T>;
  refresh: () => Promise<T>;
  reset: () => void;
  clearError: () => void;
  setData: (data: T) => void;
}

export function useApiState<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiStateOptions = {}
): UseApiStateReturn<T> {
  const {
    initialData = null,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    retryOnError = false,
    maxRetries = 3
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastFetch: null
  });

  const lastArgsRef = useRef<any[]>([]);
  const retryCountRef = useRef(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    lastArgsRef.current = args;
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(...args);
      setState({
        data: result,
        loading: false,
        error: null,
        lastFetch: new Date()
      });
      
      retryCountRef.current = 0;
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      // Retry logic
      if (retryOnError && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = Math.pow(2, retryCountRef.current) * 1000; // Exponential backoff
        
        setTimeout(() => {
          execute(...args);
        }, delay);
      }

      throw error;
    }
  }, [apiFunction, retryOnError, maxRetries]);

  const refresh = useCallback(async (): Promise<T> => {
    return execute(...lastArgsRef.current);
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      lastFetch: null
    });
    retryCountRef.current = 0;
  }, [initialData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && state.data && !state.loading) {
      refreshTimeoutRef.current = setTimeout(() => {
        refresh().catch(() => {
          // Silently handle refresh errors
        });
      }, refreshInterval);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, state.data, state.loading, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    execute,
    refresh,
    reset,
    clearError,
    setData
  };
}