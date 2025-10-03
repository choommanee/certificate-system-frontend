import { describe, it, expect, beforeEach, vi } from 'vitest'
import { signerApi } from '../../services/signerApi'
import { mockApiResponses, mockFetch } from './setup'

// Mock the global fetch
global.fetch = mockFetch as any

describe('Signer API Integration Tests', () => {
  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks()
  })

  describe('Authentication API', () => {
    it('should successfully authenticate signer', async () => {
      const credentials = {
        email: 'signer@example.com',
        password: 'password123'
      }

      const result = await signerApi.login(credentials)
      
      expect(result).toEqual(mockApiResponses.login.success)
      expect(result.user.role).toBe('signer')
      expect(result.token).toBeDefined()
    })

    it('should handle authentication failure', async () => {
      // Mock failed login
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve(mockApiResponses.login.failure)
      })

      const credentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }

      await expect(signerApi.login(credentials)).rejects.toThrow()
    })
  })

  describe('Document Management API', () => {
    it('should fetch pending documents', async () => {
      const documents = await signerApi.getPendingDocuments()
      
      expect(documents).toHaveLength(2)
      expect(documents[0].title).toBe('Certificate of Achievement - Math Competition')
      expect(documents[0].priority).toBe('high')
      expect(documents[1].activityType).toBe('event')
    })

    it('should fetch document details', async () => {
      const documentId = '1'
      const document = await signerApi.getDocumentDetails(documentId)
      
      expect(document.id).toBe(documentId)
      expect(document.title).toBe('Certificate of Achievement - Math Competition')
      expect(document.recipients).toHaveLength(2)
      expect(document.signaturePosition).toBeDefined()
    })

    it('should handle document not found', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Document not found' })
      })

      await expect(signerApi.getDocumentDetails('nonexistent')).rejects.toThrow()
    })
  })

  describe('Signature Management API', () => {
    it('should fetch user signatures', async () => {
      const signatures = await signerApi.getSignatures()
      
      expect(signatures).toHaveLength(1)
      expect(signatures[0].isActive).toBe(true)
      expect(signatures[0].mimeType).toBe('image/png')
    })

    it('should upload new signature', async () => {
      const mockFile = new File(['signature data'], 'signature.png', {
        type: 'image/png'
      })

      const result = await signerApi.uploadSignature(mockFile)
      
      expect(result.id).toBe('new-signature-id')
    })

    it('should set active signature', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true })
      })

      const result = await signerApi.setActiveSignature('1')
      
      expect(result.success).toBe(true)
    })

    it('should delete signature', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true })
      })

      const result = await signerApi.deleteSignature('1')
      
      expect(result.success).toBe(true)
    })
  })

  describe('Document Signing API', () => {
    it('should sign document successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          signedDocumentId: 'signed-doc-1',
          signedAt: new Date().toISOString()
        })
      })

      const signingData = {
        documentId: '1',
        signatureId: '1',
        position: { x: 400, y: 300, width: 150, height: 50 }
      }

      const result = await signerApi.signDocument(signingData)
      
      expect(result.success).toBe(true)
      expect(result.signedDocumentId).toBeDefined()
      expect(result.signedAt).toBeDefined()
    })

    it('should reject document with reason', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          rejectedAt: new Date().toISOString()
        })
      })

      const rejectionData = {
        documentId: '1',
        reason: 'Incorrect recipient information'
      }

      const result = await signerApi.rejectDocument(rejectionData)
      
      expect(result.success).toBe(true)
      expect(result.rejectedAt).toBeDefined()
    })
  })

  describe('Statistics and History API', () => {
    it('should fetch signing statistics', async () => {
      const stats = await signerApi.getSigningStats()
      
      expect(stats.pendingCount).toBe(5)
      expect(stats.completedThisMonth).toBe(12)
      expect(stats.totalSigned).toBe(150)
      expect(stats.averageProcessingTime).toBe(300)
    })

    it('should fetch signing history', async () => {
      const history = await signerApi.getSigningHistory()
      
      expect(history).toHaveLength(1)
      expect(history[0].status).toBe('completed')
      expect(history[0].documentTitle).toBe('Certificate of Achievement - Math Competition')
    })

    it('should fetch signing history with date range', async () => {
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponses.signingHistory.success)
      })

      const history = await signerApi.getSigningHistory(dateRange)
      
      expect(history).toHaveLength(1)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-01-01'),
        expect.any(Object)
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(signerApi.getPendingDocuments()).rejects.toThrow('Network error')
    })

    it('should handle server errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' })
      })

      await expect(signerApi.getPendingDocuments()).rejects.toThrow()
    })

    it('should handle timeout errors', async () => {
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      )

      await expect(signerApi.getPendingDocuments()).rejects.toThrow('Request timeout')
    })
  })

  describe('API Rate Limiting', () => {
    it('should handle rate limiting responses', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({
          'Retry-After': '60'
        }),
        json: () => Promise.resolve({ error: 'Rate limit exceeded' })
      })

      await expect(signerApi.getPendingDocuments()).rejects.toThrow()
    })
  })

  describe('Data Validation', () => {
    it('should validate signature file types', async () => {
      const invalidFile = new File(['invalid'], 'document.pdf', {
        type: 'application/pdf'
      })

      await expect(signerApi.uploadSignature(invalidFile)).rejects.toThrow()
    })

    it('should validate signature file size', async () => {
      const largeFile = new File([new ArrayBuffer(10 * 1024 * 1024)], 'large.png', {
        type: 'image/png'
      })

      await expect(signerApi.uploadSignature(largeFile)).rejects.toThrow()
    })
  })
})