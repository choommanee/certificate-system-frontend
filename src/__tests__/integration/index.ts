// Integration test suite entry point
export * from './setup'
export * from './api.integration.test'
export * from './workflow.integration.test'
export * from './performance.integration.test'

// Test utilities and helpers
export const integrationTestUtils = {
  // Wait for async operations to complete
  waitForAsyncOperations: async (timeout = 5000) => {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, timeout)
    })
  },

  // Mock user interactions
  simulateUserInteraction: async (element: HTMLElement, action: 'click' | 'focus' | 'blur') => {
    const event = new Event(action, { bubbles: true })
    element.dispatchEvent(event)
    
    // Wait for React to process the event
    await new Promise(resolve => setTimeout(resolve, 0))
  },

  // Performance measurement helpers
  measurePerformance: async (operation: () => Promise<void>) => {
    const startTime = performance.now()
    await operation()
    const endTime = performance.now()
    return endTime - startTime
  },

  // Memory usage helpers
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  },

  // Network simulation helpers
  simulateNetworkDelay: (delay: number) => {
    return new Promise(resolve => setTimeout(resolve, delay))
  },

  // Error simulation helpers
  simulateNetworkError: () => {
    throw new Error('Simulated network error')
  },

  // Data generation helpers
  generateMockDocument: (overrides = {}) => ({
    id: `doc-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Mock Certificate Document',
    activityType: 'test',
    recipientCount: 10,
    requestDate: new Date(),
    priority: 'medium' as const,
    requestedBy: {
      id: 'staff-1',
      name: 'Test Staff',
      email: 'staff@example.com'
    },
    certificateTemplate: {
      id: 'template-1',
      name: 'Test Template',
      previewUrl: 'data:image/png;base64,mock-data'
    },
    ...overrides
  }),

  generateMockSignature: (overrides = {}) => ({
    id: `sig-${Math.random().toString(36).substr(2, 9)}`,
    userId: '1',
    imageUrl: '/api/signatures/mock.png',
    imageData: 'data:image/png;base64,mock-signature-data',
    fileName: 'signature.png',
    fileSize: 15000,
    mimeType: 'image/png',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Test environment helpers
  setupTestEnvironment: () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })

    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock
    })

    // Mock window.location
    delete (window as any).location
    window.location = {
      ...window.location,
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    }

    // Mock window.alert, confirm, prompt
    window.alert = vi.fn()
    window.confirm = vi.fn(() => true)
    window.prompt = vi.fn(() => 'test input')

    return {
      localStorage: localStorageMock,
      sessionStorage: sessionStorageMock,
    }
  },

  // Cleanup test environment
  cleanupTestEnvironment: () => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  }
}