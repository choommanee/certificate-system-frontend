import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('localStorage', {
        detail: { key, value: valueToStore }
      }));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('localStorage', {
        detail: { key, value: null }
      }));
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Listen for changes from current tab
    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value ?? initialValue);
      }
    };

    window.addEventListener('localStorage', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorage', handleCustomEvent as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Hook for managing multiple localStorage keys
export function useLocalStorageState<T extends Record<string, any>>(
  prefix: string,
  initialState: T
): [T, (updates: Partial<T>) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    const savedState: Partial<T> = {};
    
    Object.keys(initialState).forEach(key => {
      try {
        const item = window.localStorage.getItem(`${prefix}.${key}`);
        if (item) {
          savedState[key as keyof T] = JSON.parse(item);
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${prefix}.${key}":`, error);
      }
    });

    return { ...initialState, ...savedState };
  });

  const updateState = useCallback((updates: Partial<T>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      
      // Save each updated key to localStorage
      Object.entries(updates).forEach(([key, value]) => {
        try {
          window.localStorage.setItem(`${prefix}.${key}`, JSON.stringify(value));
        } catch (error) {
          console.error(`Error setting localStorage key "${prefix}.${key}":`, error);
        }
      });

      return newState;
    });
  }, [prefix]);

  const clearState = useCallback(() => {
    Object.keys(state).forEach(key => {
      try {
        window.localStorage.removeItem(`${prefix}.${key}`);
      } catch (error) {
        console.error(`Error removing localStorage key "${prefix}.${key}":`, error);
      }
    });
    
    setState(initialState);
  }, [prefix, state, initialState]);

  return [state, updateState, clearState];
}