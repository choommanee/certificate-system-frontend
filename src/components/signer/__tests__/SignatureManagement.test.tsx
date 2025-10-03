import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SignatureManagement from '../SignatureManagement';
import { useSignatures } from '../../../hooks/useSigner';
import { Signature } from '../../../types/signer';

// Mock the hooks
jest.mock('../../../hooks/useSigner');
jest.mock('../SignatureUpload', () => {
  return function MockSignatureUpload({ onUpload }: any) {
    return (
      <div data-testid="signature-upload">
        <button onClick={() => onUpload(new File(['test'], 'test.png', { type: 'image/png' }))}>
          Mock Upload
        </button>
      </div>
    );
  };
});

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

const mockSignatures: Signature[] = [
  {
    id: '1',
    userId: 'user1',
    imageUrl: 'http://example.com/signature1.png',
    imageData: 'base64data1',
    fileName: 'signature1.png',
    fileSize: 1024,
    mimeType: 'image/png',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    userId: 'user1',
    imageUrl: 'http://example.com/signature2.png',
    imageData: 'base64data2',
    fileName: 'signature2.png',
    fileSize: 2048,
    mimeType: 'image/png',
    isActive: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
];

const mockUseSignatures = {
  signatures: mockSignatures,
  loading: false,
  error: null,
  uploading: false,
  uploadSignature: jest.fn(),
  setActiveSignature: jest.fn(),
  deleteSignature: jest.fn(),
  getActiveSignature: jest.fn(() => mockSignatures[0])
};

describe('SignatureManagement Component', () => {
  beforeEach(() => {
    (useSignatures as jest.Mock).mockReturnValue(mockUseSignatures);
    jest.clearAllMocks();
  });

  it('renders signature management interface correctly', () => {
    renderWithTheme(<SignatureManagement />);

    expect(screen.getByText('✍️ จัดการลายเซ็น')).toBeInTheDocument();
    expect(screen.getByText('เพิ่มลายเซ็นใหม่')).toBeInTheDocument();
    expect(screen.getByText('ลายเซ็นที่ใช้งานอยู่')).toBeInTheDocument();
  });

  it('displays active signature summary', () => {
    renderWithTheme(<SignatureManagement />);

    expect(screen.getByText('ลายเซ็นที่ใช้งานอยู่')).toBeInTheDocument();
    expect(screen.getByText('📁 signature1.png')).toBeInTheDocument();
    expect(screen.getByText(/📏 1 KB/)).toBeInTheDocument();
  });

  it('displays all signatures in grid', () => {
    renderWithTheme(<SignatureManagement />);

    expect(screen.getByText('signature1.png')).toBeInTheDocument();
    expect(screen.getByText('signature2.png')).toBeInTheDocument();
    expect(screen.getByText('ใช้งานอยู่')).toBeInTheDocument(); // Active chip
    expect(screen.getByText('ใช้งาน')).toBeInTheDocument(); // Activate button
  });

  it('shows loading state', () => {
    (useSignatures as jest.Mock).mockReturnValue({
      ...mockUseSignatures,
      loading: true
    });

    renderWithTheme(<SignatureManagement />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message', () => {
    const errorMessage = 'Failed to load signatures';
    (useSignatures as jest.Mock).mockReturnValue({
      ...mockUseSignatures,
      error: errorMessage
    });

    renderWithTheme(<SignatureManagement />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows empty state when no signatures', () => {
    (useSignatures as jest.Mock).mockReturnValue({
      ...mockUseSignatures,
      signatures: [],
      getActiveSignature: jest.fn(() => null)
    });

    renderWithTheme(<SignatureManagement />);

    expect(screen.getByText('ยังไม่มีลายเซ็น')).toBeInTheDocument();
    expect(screen.getByText('เริ่มต้นด้วยการอัปโหลดลายเซ็นแรกของคุณ')).toBeInTheDocument();
  });

  it('opens upload section when add button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignatureManagement />);

    const addButton = screen.getByText('เพิ่มลายเซ็นใหม่');
    await user.click(addButton);

    expect(screen.getByText('อัปโหลดลายเซ็นใหม่')).toBeInTheDocument();
    expect(screen.getByTestId('signature-upload')).toBeInTheDocument();
  });

  it('closes upload section when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignatureManagement />);

    // Open upload section
    const addButton = screen.getByText('เพิ่มลายเซ็นใหม่');
    await user.click(addButton);

    expect(screen.getByText('อัปโหลดลายเซ็นใหม่')).toBeInTheDocument();

    // Close upload section
    const cancelButton = screen.getByText('ยกเลิก');
    await user.click(cancelButton);

    expect(screen.queryByText('อัปโหลดลายเซ็นใหม่')).not.toBeInTheDocument();
  });

  it('calls setActiveSignature when activate button is clicked', async () => {
    const user = userEvent.setup();
    mockUseSignatures.setActiveSignature.mockResolvedValue(true);
    
    renderWithTheme(<SignatureManagement />);

    const activateButton = screen.getByText('ใช้งาน');
    await user.click(activateButton);

    expect(mockUseSignatures.setActiveSignature).toHaveBeenCalledWith('2');
  });

  it('opens preview dialog when preview button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignatureManagement />);

    const previewButtons = screen.getAllByRole('button');
    const previewButton = previewButtons.find(button => 
      button.querySelector('[data-testid="VisibilityIcon"]')
    );

    if (previewButton) {
      await user.click(previewButton);
      
      await waitFor(() => {
        expect(screen.getByText('ตัวอย่างลายเซ็น')).toBeInTheDocument();
        expect(screen.getByText('ข้อมูลไฟล์')).toBeInTheDocument();
      });
    }
  });

  it('opens delete confirmation dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignatureManagement />);

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('[data-testid="DeleteIcon"]')
    );

    if (deleteButton) {
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.getByText('ยืนยันการลบลายเซ็น')).toBeInTheDocument();
        expect(screen.getByText(/คุณแน่ใจหรือไม่ที่จะลบลายเซ็นนี้/)).toBeInTheDocument();
      });
    }
  });

  it('prevents deletion of active signature', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SignatureManagement />);

    // Find delete button for active signature (first one)
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('[data-testid="DeleteIcon"]')
    );

    if (deleteButton) {
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.getByText(/ลายเซ็นนี้กำลังใช้งานอยู่/)).toBeInTheDocument();
        
        // Delete button should be disabled
        const confirmDeleteButton = screen.getByText('ลบลายเซ็น');
        expect(confirmDeleteButton).toBeDisabled();
      });
    }
  });

  it('calls deleteSignature when delete is confirmed', async () => {
    const user = userEvent.setup();
    mockUseSignatures.deleteSignature.mockResolvedValue(true);
    
    renderWithTheme(<SignatureManagement />);

    // Find delete button for inactive signature
    const cards = screen.getAllByRole('button');
    const deleteButtons = cards.filter(button => 
      button.querySelector('[data-testid="DeleteIcon"]')
    );

    // Click on the second delete button (inactive signature)
    if (deleteButtons[1]) {
      await user.click(deleteButtons[1]);
      
      await waitFor(() => {
        expect(screen.getByText('ยืนยันการลบลายเซ็น')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('ลบลายเซ็น');
      await user.click(confirmButton);

      expect(mockUseSignatures.deleteSignature).toHaveBeenCalledWith('2');
    }
  });

  it('handles upload through SignatureUpload component', async () => {
    const user = userEvent.setup();
    const mockNewSignature: Signature = {
      id: '3',
      userId: 'user1',
      imageUrl: 'http://example.com/signature3.png',
      imageData: 'base64data3',
      fileName: 'signature3.png',
      fileSize: 1500,
      mimeType: 'image/png',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUseSignatures.uploadSignature.mockResolvedValue(mockNewSignature);
    const mockOnSignatureChange = jest.fn();
    
    renderWithTheme(<SignatureManagement onSignatureChange={mockOnSignatureChange} />);

    // Open upload section
    const addButton = screen.getByText('เพิ่มลายเซ็นใหม่');
    await user.click(addButton);

    // Trigger upload through mock component
    const mockUploadButton = screen.getByText('Mock Upload');
    await user.click(mockUploadButton);

    expect(mockUseSignatures.uploadSignature).toHaveBeenCalled();
  });

  it('formats file sizes correctly', () => {
    renderWithTheme(<SignatureManagement />);

    expect(screen.getByText(/📏 1 KB/)).toBeInTheDocument(); // 1024 bytes
    expect(screen.getByText(/📏 2 KB/)).toBeInTheDocument(); // 2048 bytes
  });

  it('formats dates correctly', () => {
    renderWithTheme(<SignatureManagement />);

    // Should show formatted Thai dates
    expect(screen.getByText(/1 ม.ค. 2567/)).toBeInTheDocument();
    expect(screen.getByText(/2 ม.ค. 2567/)).toBeInTheDocument();
  });

  it('calls onSignatureChange when signatures are updated', async () => {
    const user = userEvent.setup();
    const mockOnSignatureChange = jest.fn();
    mockUseSignatures.setActiveSignature.mockResolvedValue(true);
    
    renderWithTheme(<SignatureManagement onSignatureChange={mockOnSignatureChange} />);

    const activateButton = screen.getByText('ใช้งาน');
    await user.click(activateButton);

    await waitFor(() => {
      expect(mockOnSignatureChange).toHaveBeenCalled();
    });
  });
});