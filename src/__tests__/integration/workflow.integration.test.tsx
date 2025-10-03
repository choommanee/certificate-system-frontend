import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { EnhancedAuthProvider } from '../../contexts/EnhancedAuthContext'
import SignerDashboardPage from '../../pages/SignerDashboardPage'
import DocumentSigningInterface from '../../components/signer/DocumentSigningInterface'
import SignatureManagement from '../../components/signer/SignatureManagement'
import { mockApiResponses, mockFetch } from './setup'

// Mock the global fetch
global.fetch = mockFetch as any

// Mock file reader for signature uploads
Object.defineProperty(global, 'FileReader', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    readAsDataURL: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    result: 'data:image/png;base64,mock-signature-data'
  }))
})

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <EnhancedAuthProvider>
      {children}
    </EnhancedAuthProvider>
  </BrowserRouter>
)

describe('Signer Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock authenticated user
    localStorage.setItem('auth_token', 'mock-jwt-token')
    localStorage.setItem('user_data', JSON.stringify({
      id: '1',
      email: 'signer@example.com',
      name: 'Test Signer',
      role: 'signer'
    }))
  })

  describe('Complete Signing Workflow', () => {
    it('should complete full document signing workflow', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <SignerDashboardPage />
        </TestWrapper>
      )

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Signer Dashboard')).toBeInTheDocument()
      })

      // Verify pending documents are displayed
      await waitFor(() => {
        expect(screen.getByText('Certificate of Achievement - Math Competition')).toBeInTheDocument()
        expect(screen.getByText('Certificate of Participation - Science Fair')).toBeInTheDocument()
      })

      // Click on high priority document
      const highPriorityDoc = screen.getByText('Certificate of Achievement - Math Competition')
      await user.click(highPriorityDoc)

      // Verify document details are shown
      await waitFor(() => {
        expect(screen.getByText('25 recipients')).toBeInTheDocument()
        expect(screen.getByText('Math Competition 2024')).toBeInTheDocument()
      })

      // Click sign button
      const signButton = screen.getByRole('button', { name: /sign document/i })
      await user.click(signButton)

      // Verify signing interface opens
      await waitFor(() => {
        expect(screen.getByText('Document Signing')).toBeInTheDocument()
        expect(screen.getByText('Certificate Preview')).toBeInTheDocument()
      })

      // Mock successful signing
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          signedDocumentId: 'signed-doc-1',
          signedAt: new Date().toISOString()
        })
      })

      // Confirm signing
      const confirmSignButton = screen.getByRole('button', { name: /confirm signature/i })
      await user.click(confirmSignButton)

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/document signed successfully/i)).toBeInTheDocument()
      })

      // Verify document is removed from pending list
      await waitFor(() => {
        expect(screen.queryByText('Certificate of Achievement - Math Competition')).not.toBeInTheDocument()
      })
    })

    it('should handle document rejection workflow', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <SignerDashboardPage />
        </TestWrapper>
      )

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Signer Dashboard')).toBeInTheDocument()
      })

      // Click on a document
      const document = screen.getByText('Certificate of Participation - Science Fair')
      await user.click(document)

      // Click reject button
      const rejectButton = screen.getByRole('button', { name: /reject/i })
      await user.click(rejectButton)

      // Enter rejection reason
      const reasonInput = screen.getByLabelText(/rejection reason/i)
      await user.type(reasonInput, 'Incorrect recipient information')

      // Mock successful rejection
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          rejectedAt: new Date().toISOString()
        })
      })

      // Confirm rejection
      const confirmRejectButton = screen.getByRole('button', { name: /confirm rejection/i })
      await user.click(confirmRejectButton)

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/document rejected successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe('Signature Management Workflow', () => {
    it('should complete signature upload and management workflow', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <SignatureManagement
            signatures={[]}
            activeSignatureId=""
            onUpload={vi.fn()}
            onSetActive={vi.fn()}
            onDelete={vi.fn()}
          />
        </TestWrapper>
      )

      // Upload new signature
      const fileInput = screen.getByLabelText(/upload signature/i)
      const file = new File(['signature'], 'signature.png', { type: 'image/png' })
      
      await user.upload(fileInput, file)

      // Verify file is processed
      await waitFor(() => {
        expect(screen.getByText('signature.png')).toBeInTheDocument()
      })

      // Mock successful upload
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ 
          id: 'new-signature-id',
          imageUrl: '/api/signatures/new-signature-id.png'
        })
      })

      // Confirm upload
      const uploadButton = screen.getByRole('button', { name: /upload/i })
      await user.click(uploadButton)

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/signature uploaded successfully/i)).toBeInTheDocument()
      })
    })

    it('should handle signature validation errors', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <SignatureManagement
            signatures={[]}
            activeSignatureId=""
            onUpload={vi.fn()}
            onSetActive={vi.fn()}
            onDelete={vi.fn()}
          />
        </TestWrapper>
      )

      // Try to upload invalid file type
      const fileInput = screen.getByLabelText(/upload signature/i)
      const invalidFile = new File(['document'], 'document.pdf', { type: 'application/pdf' })
      
      await user.upload(fileInput, invalidFile)

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
      })
    })
  })

  describe('Dashboard Statistics Workflow', () => {
    it('should display and update statistics correctly', async () => {
      render(
        <TestWrapper>
          <SignerDashboardPage />
        </TestWrapper>
      )

      // Wait for statistics to load
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument() // Pending count
        expect(screen.getByText('12')).toBeInTheDocument() // Completed this month
        expect(screen.getByText('150')).toBeInTheDocument() // Total signed
      })

      // Verify priority indicators
      expect(screen.getByText('2 urgent')).toBeInTheDocument()
    })
  })

  describe('Real-time Updates Workflow', () => {
    it('should handle real-time document updates', async () => {
      render(
        <TestWrapper>
          <SignerDashboardPage />
        </TestWrapper>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Signer Dashboard')).toBeInTheDocument()
      })

      // Simulate new document notification
      const newDocument = {
        id: '3',
        title: 'New Urgent Certificate',
        priority: 'high' as const,
        activityType: 'urgent',
        recipientCount: 10,
        requestDate: new Date()
      }

      // Mock updated API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve([...mockApiResponses.pendingDocuments.success, newDocument])
      })

      // Trigger refresh (simulate real-time update)
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)

      // Verify new document appears
      await waitFor(() => {
        expect(screen.getByText('New Urgent Certificate')).toBeInTheDocument()
      })
    })
  })

  describe('Error Recovery Workflow', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      render(
        <TestWrapper>
          <SignerDashboardPage />
        </TestWrapper>
      )

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/unable to load documents/i)).toBeInTheDocument()
      })

      // Verify retry button is available
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('should recover from temporary failures', async () => {
      let callCount = 0
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.reject(new Error('Temporary error'))
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockApiResponses.pendingDocuments.success)
        })
      })

      const user = userEvent.setup()

      render(
        <TestWrapper>
          <SignerDashboardPage />
        </TestWrapper>
      )

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/unable to load documents/i)).toBeInTheDocument()
      })

      // Click retry
      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)

      // Verify successful recovery
      await waitFor(() => {
        expect(screen.getByText('Certificate of Achievement - Math Competition')).toBeInTheDocument()
      })
    })
  })

  describe('Mobile Responsiveness Workflow', () => {
    it('should adapt to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })

      render(
        <TestWrapper>
          <SignerDashboardPage />
        </TestWrapper>
      )

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Signer Dashboard')).toBeInTheDocument()
      })

      // Verify mobile-specific elements
      const mobileMenu = screen.getByRole('button', { name: /menu/i })
      expect(mobileMenu).toBeInTheDocument()

      // Verify responsive layout
      const documentList = screen.getByTestId('document-list')
      expect(documentList).toHaveClass('mobile-layout')
    })
  })

  describe('Accessibility Workflow', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <SignerDashboardPage />
        </TestWrapper>
      )

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Signer Dashboard')).toBeInTheDocument()
      })

      // Navigate using keyboard
      await user.tab() // Focus first interactive element
      await user.keyboard('{Enter}') // Activate focused element

      // Verify keyboard navigation works
      const focusedElement = document.activeElement
      expect(focusedElement).toHaveAttribute('tabindex')
    })

    it('should provide proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <SignerDashboardPage />
        </TestWrapper>
      )

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Signer Dashboard')).toBeInTheDocument()
      })

      // Verify ARIA labels
      const documentList = screen.getByRole('list', { name: /pending documents/i })
      expect(documentList).toBeInTheDocument()

      const signButton = screen.getByRole('button', { name: /sign document/i })
      expect(signButton).toHaveAttribute('aria-label')
    })
  })
})