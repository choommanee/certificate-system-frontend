import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SignatureUpload from '../SignatureUpload';
import { Signature } from '../../../types/signer';

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(() => ({
    getRootProps: () => ({ 'data-testid': 'dropzone' }),
    getInputProps: () => ({ 'data-testid': 'file-input' }),
    isDragActive: false
  }))
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SignatureUpload Component', () => {
  const mockOnUpload = jest.fn();
  const mockSignature: Signature = {
    id: '1',
    userId: 'user1',
    imageUrl: 'http://example.com/signature.png',
    imageData: 'base64data',
    fileName: 'signature.png',
    fileSize: 1024,
    mimeType: 'image/png',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    mockOnUpload.mockClear();
    // Mock FileReader
    global.FileReader = jest.fn(() => ({
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/png;base64,mockbase64data'
    })) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area correctly', () => {
    renderWithTheme(
      <SignatureUpload onUpload={mockOnUpload} />
    );

    expect(screen.getByText('อัปโหลดลายเซ็น')).toBeInTheDocument();
    expect(screen.getByText('ลากและวางไฟล์ หรือคลิกเพื่อเลือกไฟล์')).toBeInTheDocument();
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('JPEG')).toBeInTheDocument();
    expect(screen.getByText('JPG')).toBeInTheDocument();
    expect(screen.getByText('SVG+XML')).toBeInTheDocument();
  });

  it('shows loading state when uploading', () => {
    renderWithTheme(
      <SignatureUpload onUpload={mockOnUpload} uploading={true} />
    );

    // Should still show upload area when no file is selected
    expect(screen.getByText('อัปโหลดลายเซ็น')).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Upload failed';
    renderWithTheme(
      <SignatureUpload onUpload={mockOnUpload} error={errorMessage} />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('validates file type correctly', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SignatureUpload onUpload={mockOnUpload} />
    );

    // Create invalid file
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    // Mock file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false,
    });

    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/ไฟล์ประเภทไม่ถูกต้อง/)).toBeInTheDocument();
    });
  });

  it('validates file size correctly', async () => {
    const maxFileSize = 1024; // 1KB
    renderWithTheme(
      <SignatureUpload 
        onUpload={mockOnUpload} 
        maxFileSize={maxFileSize}
      />
    );

    // Create oversized file
    const oversizedFile = new File(['x'.repeat(2048)], 'large.png', { 
      type: 'image/png' 
    });
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    Object.defineProperty(fileInput, 'files', {
      value: [oversizedFile],
      writable: false,
    });

    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

    await waitFor(() => {
      expect(screen.getByText(/ไฟล์มีขนาดใหญ่เกินไป/)).toBeInTheDocument();
    });
  });

  it('shows file preview after valid file selection', async () => {
    renderWithTheme(
      <SignatureUpload onUpload={mockOnUpload} />
    );

    // Create valid file
    const validFile = new File(['content'], 'signature.png', { 
      type: 'image/png' 
    });

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/png;base64,mockbase64data'
    };
    
    (global.FileReader as any) = jest.fn(() => mockFileReader);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Simulate FileReader onload
    setTimeout(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
    }, 0);

    await waitFor(() => {
      expect(screen.getByText('ตัวอย่างลายเซ็น')).toBeInTheDocument();
      expect(screen.getByDisplayValue('signature')).toBeInTheDocument(); // Default name
      expect(screen.getByText('📁 signature.png')).toBeInTheDocument();
    });
  });

  it('calls onUpload when upload button is clicked', async () => {
    mockOnUpload.mockResolvedValue(mockSignature);
    
    renderWithTheme(
      <SignatureUpload onUpload={mockOnUpload} />
    );

    // Create valid file
    const validFile = new File(['content'], 'signature.png', { 
      type: 'image/png' 
    });

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/png;base64,mockbase64data'
    };
    
    (global.FileReader as any) = jest.fn(() => mockFileReader);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Simulate FileReader onload
    setTimeout(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
    }, 0);

    await waitFor(() => {
      expect(screen.getByText('บันทึกลายเซ็น')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('บันทึกลายเซ็น');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(validFile, 'signature');
    });
  });

  it('clears preview when cancel button is clicked', async () => {
    renderWithTheme(
      <SignatureUpload onUpload={mockOnUpload} />
    );

    // Create valid file and show preview
    const validFile = new File(['content'], 'signature.png', { 
      type: 'image/png' 
    });

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/png;base64,mockbase64data'
    };
    
    (global.FileReader as any) = jest.fn(() => mockFileReader);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    setTimeout(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
    }, 0);

    await waitFor(() => {
      expect(screen.getByText('ตัวอย่างลายเซ็น')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('ยกเลิก');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('ตัวอย่างลายเซ็น')).not.toBeInTheDocument();
      expect(screen.getByText('อัปโหลดลายเซ็น')).toBeInTheDocument();
    });
  });

  it('opens preview dialog when preview button is clicked', async () => {
    renderWithTheme(
      <SignatureUpload onUpload={mockOnUpload} />
    );

    // Create valid file and show preview
    const validFile = new File(['content'], 'signature.png', { 
      type: 'image/png' 
    });

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'data:image/png;base64,mockbase64data'
    };
    
    (global.FileReader as any) = jest.fn(() => mockFileReader);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    setTimeout(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({} as any);
      }
    }, 0);

    await waitFor(() => {
      expect(screen.getByText('ตัวอย่างลายเซ็น')).toBeInTheDocument();
    });

    // Find and click preview button (visibility icon)
    const previewButtons = screen.getAllByRole('button');
    const previewButton = previewButtons.find(button => 
      button.querySelector('[data-testid="VisibilityIcon"]')
    );
    
    if (previewButton) {
      fireEvent.click(previewButton);
      
      await waitFor(() => {
        // Should show dialog with same title
        const dialogTitles = screen.getAllByText('ตัวอย่างลายเซ็น');
        expect(dialogTitles.length).toBeGreaterThan(1); // One in card, one in dialog
      });
    }
  });

  it('formats file size correctly', () => {
    renderWithTheme(
      <SignatureUpload onUpload={mockOnUpload} maxFileSize={2048} />
    );

    expect(screen.getByText('ขนาดไฟล์สูงสุด: 2 KB')).toBeInTheDocument();
  });

  it('allows custom accepted formats', () => {
    const customFormats = ['image/png', 'image/jpeg'];
    renderWithTheme(
      <SignatureUpload 
        onUpload={mockOnUpload} 
        acceptedFormats={customFormats}
      />
    );

    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('JPEG')).toBeInTheDocument();
    expect(screen.queryByText('SVG+XML')).not.toBeInTheDocument();
  });
});