import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock API server setup
let mockServer: any

beforeAll(async () => {
  // Setup mock server for integration tests
  // This would typically use MSW (Mock Service Worker) in a real implementation
  console.log('Setting up integration test environment')
})

afterAll(async () => {
  // Cleanup mock server
  if (mockServer) {
    mockServer.close()
  }
  console.log('Cleaning up integration test environment')
})

beforeEach(() => {
  // Reset any mocks or state before each test
})

afterEach(() => {
  // Cleanup after each test
  cleanup()
})

// Mock API responses for integration tests
export const mockApiResponses = {
  // User authentication
  login: {
    success: {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'signer@example.com',
        name: 'Test Signer',
        role: 'signer',
        permissions: ['sign_documents', 'view_documents']
      }
    },
    failure: {
      error: 'Invalid credentials'
    }
  },

  // Pending documents
  pendingDocuments: {
    success: [
      {
        id: '1',
        title: 'Certificate of Achievement - Math Competition',
        activityType: 'competition',
        recipientCount: 25,
        requestDate: new Date('2024-01-15'),
        priority: 'high' as const,
        requestedBy: {
          id: '2',
          name: 'Staff Member',
          email: 'staff@example.com'
        },
        dueDate: new Date('2024-01-20'),
        certificateTemplate: {
          id: '1',
          name: 'Achievement Template',
          previewUrl: 'data:image/png;base64,mock-image-data'
        }
      },
      {
        id: '2',
        title: 'Certificate of Participation - Science Fair',
        activityType: 'event',
        recipientCount: 50,
        requestDate: new Date('2024-01-10'),
        priority: 'medium' as const,
        requestedBy: {
          id: '3',
          name: 'Another Staff',
          email: 'staff2@example.com'
        },
        certificateTemplate: {
          id: '2',
          name: 'Participation Template',
          previewUrl: 'data:image/png;base64,mock-image-data-2'
        }
      }
    ]
  },

  // Document details
  documentDetails: {
    success: {
      id: '1',
      title: 'Certificate of Achievement - Math Competition',
      description: 'Certificates for math competition winners',
      activityDetails: {
        name: 'Math Competition 2024',
        date: new Date('2024-01-15'),
        location: 'School Auditorium'
      },
      recipients: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
      ],
      certificatePreview: 'data:image/png;base64,mock-certificate-preview',
      signaturePosition: {
        x: 400,
        y: 300,
        width: 150,
        height: 50
      },
      metadata: {
        createdBy: 'staff@example.com',
        createdAt: new Date('2024-01-10')
      }
    }
  },

  // Signatures
  signatures: {
    success: [
      {
        id: '1',
        userId: '1',
        imageUrl: '/api/signatures/1.png',
        imageData: 'data:image/png;base64,mock-signature-data',
        fileName: 'signature1.png',
        fileSize: 15000,
        mimeType: 'image/png',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]
  },

  // Signing statistics
  signingStats: {
    success: {
      pendingCount: 5,
      completedThisMonth: 12,
      totalSigned: 150,
      averageProcessingTime: 300, // 5 minutes
      urgentPending: 2,
      rejectedCount: 1
    }
  },

  // Signing history
  signingHistory: {
    success: [
      {
        id: '1',
        documentId: '1',
        documentTitle: 'Certificate of Achievement - Math Competition',
        signatureId: '1',
        signedAt: new Date('2024-01-15T10:30:00'),
        recipientCount: 25,
        activityType: 'competition',
        status: 'completed' as const,
        processingTime: 180
      }
    ]
  }
}

// Mock fetch function for API calls
export const mockFetch = (url: string, options?: RequestInit) => {
  return new Promise<Response>((resolve) => {
    setTimeout(() => {
      let response: any = { ok: false, status: 404 }

      // Route mock responses based on URL
      if (url.includes('/auth/login')) {
        response = {
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockApiResponses.login.success)
        }
      } else if (url.includes('/signer/documents/pending')) {
        response = {
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockApiResponses.pendingDocuments.success)
        }
      } else if (url.includes('/signer/documents/')) {
        response = {
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockApiResponses.documentDetails.success)
        }
      } else if (url.includes('/signer/signatures')) {
        if (options?.method === 'POST') {
          response = {
            ok: true,
            status: 201,
            json: () => Promise.resolve({ id: 'new-signature-id' })
          }
        } else {
          response = {
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockApiResponses.signatures.success)
          }
        }
      } else if (url.includes('/signer/stats')) {
        response = {
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockApiResponses.signingStats.success)
        }
      } else if (url.includes('/signer/history')) {
        response = {
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockApiResponses.signingHistory.success)
        }
      }

      resolve(response as Response)
    }, 100) // Simulate network delay
  })
}

// Setup global fetch mock
beforeAll(() => {
  global.fetch = mockFetch as any
})