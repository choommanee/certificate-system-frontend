import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MFAVerification from '../MFAVerification';
import { useEnhancedAuth } from '../../../hooks/useEnhancedAuth';

// Mock the useEnhancedAuth hook
jest.mock('../../../hooks/useEnhancedAuth');
const mockUseEnhancedAuth = useEnhancedAuth as jest.MockedFunction<typeof useEnhancedAuth>;

// Mock props
const mockProps = {
  onSuccess: jest.fn(),
  onCancel: jest.fn()
};

describe('MFAVerification', () => {
  const mockAuthReturn = {
    verifyMFA: jest.fn(),
    error: null,
    clearError: jest.fn(),
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEnhancedAuth.mockReturnValue(mockAuthReturn as any);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('should render MFA verification form', () => {
      render(<MFAVerification {...mockProps} />);

      expect(screen.getByText('ยืนยันตัวตน')).toBeInTheDocument();
      expect(screen.getByText('กรอกรหัส 6 หลักจากแอป Authenticator')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ยืนยัน' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ยกเลิก' })).toBeInTheDocument();
    });

    test('should show countdown timer', () => {
      render(<MFAVerification {...mockProps} />);

      expect(screen.getByText(/เหลือเวลา:/)).toBeInTheDocument();
      expect(screen.getByText('5:00')).toBeInTheDocument();
    });

    test('should show backup code option', () => {
      render(<MFAVerification {...mockProps} />);

      const backupCodeLink = screen.getByText('ใช้รหัสสำรอง');
      expect(backupCodeLink).toBeInTheDocument();
    });
  });

  describe('TOTP Code Input', () => {
    test('should accept numeric input only', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');

      await user.type(input, '123abc456');
      expect(input).toHaveValue('123456');
    });

    test('should limit input to 6 digits', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');

      await user.type(input, '1234567890');
      expect(input).toHaveValue('123456');
    });

    test('should enable submit button when code is complete', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');
      const submitButton = screen.getByRole('button', { name: 'ยืนยัน' });

      expect(submitButton).toBeDisabled();

      await user.type(input, '123456');
      expect(submitButton).toBeEnabled();
    });
  });

  describe('Backup Code Input', () => {
    test('should switch to backup code mode', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MFAVerification {...mockProps} />);

      const backupCodeLink = screen.getByText('ใช้รหัสสำรอง');
      await user.click(backupCodeLink);

      expect(screen.getByText('กรอกรหัสสำรองเพื่อเข้าสู่ระบบ')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('XXXXXXXX')).toBeInTheDocument();
      expect(screen.getByText('ใช้รหัสจากแอป Authenticator')).toBeInTheDocument();
    });

    test('should accept alphanumeric input for backup codes', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MFAVerification {...mockProps} />);

      const backupCodeLink = screen.getByText('ใช้รหัสสำรอง');
      await user.click(backupCodeLink);

      const input = screen.getByPlaceholderText('XXXXXXXX');

      await user.type(input, 'abc123!@#def');
      expect(input).toHaveValue('ABC123DE');
    });

    test('should limit backup code to 8 characters', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MFAVerification {...mockProps} />);

      const backupCodeLink = screen.getByText('ใช้รหัสสำรอง');
      await user.click(backupCodeLink);

      const input = screen.getByPlaceholderText('XXXXXXXX');

      await user.type(input, 'ABCDEFGHIJKLMNOP');
      expect(input).toHaveValue('ABCDEFGH');
    });
  });

  describe('Form Submission', () => {
    test('should submit TOTP code successfully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockAuthReturn.verifyMFA.mockResolvedValue(true);

      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');
      const submitButton = screen.getByRole('button', { name: 'ยืนยัน' });

      await user.type(input, '123456');
      await user.click(submitButton);

      expect(mockAuthReturn.verifyMFA).toHaveBeenCalledWith('123456', false);
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });

    test('should submit backup code successfully', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockAuthReturn.verifyMFA.mockResolvedValue(true);

      render(<MFAVerification {...mockProps} />);

      const backupCodeLink = screen.getByText('ใช้รหัสสำรอง');
      await user.click(backupCodeLink);

      const input = screen.getByPlaceholderText('XXXXXXXX');
      const submitButton = screen.getByRole('button', { name: 'ยืนยัน' });

      await user.type(input, 'ABCD1234');
      await user.click(submitButton);

      expect(mockAuthReturn.verifyMFA).toHaveBeenCalledWith('ABCD1234', true);
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });

    test('should handle verification failure', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockAuthReturn.verifyMFA.mockResolvedValue(false);

      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');
      const submitButton = screen.getByRole('button', { name: 'ยืนยัน' });

      await user.type(input, '123456');
      await user.click(submitButton);

      expect(mockAuthReturn.verifyMFA).toHaveBeenCalledWith('123456', false);
      expect(mockProps.onSuccess).not.toHaveBeenCalled();
      expect(input).toHaveValue(''); // Should clear input
    });

    test('should prevent submission with empty code', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MFAVerification {...mockProps} />);

      const submitButton = screen.getByRole('button', { name: 'ยืนยัน' });
      await user.click(submitButton);

      expect(mockAuthReturn.verifyMFA).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should display error message', () => {
      mockUseEnhancedAuth.mockReturnValue({
        ...mockAuthReturn,
        error: 'Invalid MFA code'
      } as any);

      render(<MFAVerification {...mockProps} />);

      expect(screen.getByText('Invalid MFA code')).toBeInTheDocument();
    });

    test('should clear error when switching modes', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockUseEnhancedAuth.mockReturnValue({
        ...mockAuthReturn,
        error: 'Invalid MFA code'
      } as any);

      render(<MFAVerification {...mockProps} />);

      const backupCodeLink = screen.getByText('ใช้รหัสสำรอง');
      await user.click(backupCodeLink);

      expect(mockAuthReturn.clearError).toHaveBeenCalled();
    });
  });

  describe('Attempt Limiting', () => {
    test('should track failed attempts', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockAuthReturn.verifyMFA.mockResolvedValue(false);

      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');
      const submitButton = screen.getByRole('button', { name: 'ยืนยัน' });

      // First failed attempt
      await user.type(input, '123456');
      await user.click(submitButton);

      expect(screen.getByText('ความพยายามที่ 1 จาก 3 ครั้ง')).toBeInTheDocument();
    });

    test('should disable form after max attempts', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockAuthReturn.verifyMFA.mockResolvedValue(false);

      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');
      const submitButton = screen.getByRole('button', { name: 'ยืนยัน' });

      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        await user.clear(input);
        await user.type(input, '123456');
        await user.click(submitButton);
      }

      expect(screen.getByText(/ครบจำนวนครั้งที่อนุญาต/)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('should auto-cancel after max attempts', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      mockAuthReturn.verifyMFA.mockResolvedValue(false);

      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');
      const submitButton = screen.getByRole('button', { name: 'ยืนยัน' });

      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        await user.clear(input);
        await user.type(input, '123456');
        await user.click(submitButton);
      }

      // Fast-forward time to trigger auto-cancel
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockProps.onCancel).toHaveBeenCalled();
      });
    });
  });

  describe('Timer Functionality', () => {
    test('should countdown timer', () => {
      render(<MFAVerification {...mockProps} />);

      expect(screen.getByText('5:00')).toBeInTheDocument();

      // Advance timer by 1 second
      jest.advanceTimersByTime(1000);

      expect(screen.getByText('4:59')).toBeInTheDocument();
    });

    test('should auto-cancel when timer expires', () => {
      render(<MFAVerification {...mockProps} />);

      // Fast-forward to timer expiry
      jest.advanceTimersByTime(300000); // 5 minutes

      expect(mockProps.onCancel).toHaveBeenCalled();
    });

    test('should show warning when time is low', () => {
      render(<MFAVerification {...mockProps} />);

      // Fast-forward to last minute
      jest.advanceTimersByTime(240000); // 4 minutes

      const timerElement = screen.getByText('1:00');
      expect(timerElement.closest('div')).toHaveStyle('background-color: rgb(255, 235, 238)'); // error.light color
    });
  });

  describe('Loading State', () => {
    test('should show loading state during verification', () => {
      mockUseEnhancedAuth.mockReturnValue({
        ...mockAuthReturn,
        isLoading: true
      } as any);

      render(<MFAVerification {...mockProps} />);

      expect(screen.getByText('กำลังตรวจสอบ...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /กำลังตรวจสอบ/ })).toBeDisabled();
    });

    test('should disable inputs during loading', () => {
      mockUseEnhancedAuth.mockReturnValue({
        ...mockAuthReturn,
        isLoading: true
      } as any);

      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');
      const cancelButton = screen.getByRole('button', { name: 'ยกเลิก' });

      expect(input).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Cancel Functionality', () => {
    test('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MFAVerification {...mockProps} />);

      const cancelButton = screen.getByRole('button', { name: 'ยกเลิก' });
      await user.click(cancelButton);

      expect(mockProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');
      expect(input).toHaveAttribute('autoComplete', 'one-time-code');
    });

    test('should focus input on mount', () => {
      render(<MFAVerification {...mockProps} />);

      const input = screen.getByPlaceholderText('000000');
      expect(input).toHaveFocus();
    });

    test('should focus input when switching modes', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MFAVerification {...mockProps} />);

      const backupCodeLink = screen.getByText('ใช้รหัสสำรอง');
      await user.click(backupCodeLink);

      const backupInput = screen.getByPlaceholderText('XXXXXXXX');
      expect(backupInput).toHaveFocus();
    });
  });

  describe('Help Text', () => {
    test('should show appropriate help text for TOTP', () => {
      render(<MFAVerification {...mockProps} />);

      expect(screen.getByText(/เปิดแอป Google Authenticator/)).toBeInTheDocument();
    });

    test('should show appropriate help text for backup codes', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<MFAVerification {...mockProps} />);

      const backupCodeLink = screen.getByText('ใช้รหัสสำรอง');
      await user.click(backupCodeLink);

      expect(screen.getByText(/รหัสสำรองคือรหัส 8 หลัก/)).toBeInTheDocument();
    });
  });
});