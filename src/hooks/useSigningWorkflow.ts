import { useState, useCallback, useRef, useEffect } from 'react';
import {
  DocumentToSign,
  Signature,
  SignaturePosition,
  SigningForm
} from '../types/signer';
import {
  signingWorkflow,
  SigningValidationResult,
  BatchSigningProgress,
  SigningWorkflowOptions,
  formatSigningTime
} from '../utils/signingWorkflow';
import { useDocumentSigning } from './useSigner';

export interface UseSigningWorkflowReturn {
  // State
  isValidating: boolean;
  isSigning: boolean;
  isGeneratingPreview: boolean;
  validationResult: SigningValidationResult | null;
  signingProgress: BatchSigningProgress | null;
  previewUrl: string | null;
  estimatedTime: string;
  error: string | null;
  
  // Actions
  validateSigning: (
    document: DocumentToSign,
    signature: Signature,
    position: SignaturePosition
  ) => Promise<SigningValidationResult>;
  
  generatePreview: (
    document: DocumentToSign,
    signature: Signature,
    position: SignaturePosition
  ) => Promise<string | null>;
  
  executeSigning: (
    signingData: SigningForm,
    options?: SigningWorkflowOptions
  ) => Promise<boolean>;
  
  executeBatchSigning: (
    document: DocumentToSign,
    signature: Signature,
    position: SignaturePosition,
    options?: SigningWorkflowOptions
  ) => Promise<BatchSigningProgress>;
  
  cancelSigning: () => void;
  optimizePosition: (position: SignaturePosition, document: DocumentToSign) => SignaturePosition;
  clearError: () => void;
  clearValidation: () => void;
  clearPreview: () => void;
}

export const useSigningWorkflow = (documentId?: string): UseSigningWorkflowReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [validationResult, setValidationResult] = useState<SigningValidationResult | null>(null);
  const [signingProgress, setSigningProgress] = useState<BatchSigningProgress | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { signDocument } = useDocumentSigning();
  const progressCallbackRef = useRef<((progress: BatchSigningProgress) => void) | null>(null);

  // Set up progress callback
  useEffect(() => {
    progressCallbackRef.current = (progress: BatchSigningProgress) => {
      setSigningProgress(progress);
    };
  }, []);

  // Clear states when document changes
  useEffect(() => {
    if (documentId) {
      setValidationResult(null);
      setSigningProgress(null);
      setPreviewUrl(null);
      setError(null);
    }
  }, [documentId]);

  const validateSigning = useCallback(async (
    document: DocumentToSign,
    signature: Signature,
    position: SignaturePosition
  ): Promise<SigningValidationResult> => {
    setIsValidating(true);
    setError(null);
    
    try {
      // Validate signature file first
      const signatureValidation = await signingWorkflow.validateSignatureFile(signature);
      
      // Validate signing form
      const formValidation = signingWorkflow.validateSigningForm(document, signature, position);
      
      // Combine validation results
      const combinedResult: SigningValidationResult = {
        isValid: signatureValidation.isValid && formValidation.isValid,
        errors: [...signatureValidation.errors, ...formValidation.errors],
        warnings: [...signatureValidation.warnings, ...formValidation.warnings]
      };
      
      setValidationResult(combinedResult);
      
      // Calculate estimated time
      const timeInSeconds = signingWorkflow.estimateSigningTime(document.recipients.length);
      setEstimatedTime(formatSigningTime(timeInSeconds));
      
      return combinedResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการตรวจสอบ';
      setError(errorMessage);
      
      const errorResult: SigningValidationResult = {
        isValid: false,
        errors: [errorMessage],
        warnings: []
      };
      
      setValidationResult(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const generatePreview = useCallback(async (
    document: DocumentToSign,
    signature: Signature,
    position: SignaturePosition
  ): Promise<string | null> => {
    setIsGeneratingPreview(true);
    setError(null);
    
    try {
      const preview = await signingWorkflow.generateSigningPreview(document, signature, position);
      setPreviewUrl(preview);
      return preview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ไม่สามารถสร้างตัวอย่างได้';
      setError(errorMessage);
      return null;
    } finally {
      setIsGeneratingPreview(false);
    }
  }, []);

  const executeSigning = useCallback(async (
    signingData: SigningForm,
    options: SigningWorkflowOptions = {}
  ): Promise<boolean> => {
    setIsSigning(true);
    setError(null);
    setSigningProgress(null);
    
    try {
      // Use the signing workflow for validation and processing
      const success = await signingWorkflow.signDocument(signingData, options);
      
      if (success) {
        // Also call the hook's sign method for state management
        await signDocument(signingData);
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลงนาม';
      setError(errorMessage);
      return false;
    } finally {
      setIsSigning(false);
    }
  }, [signDocument]);

  const executeBatchSigning = useCallback(async (
    document: DocumentToSign,
    signature: Signature,
    position: SignaturePosition,
    options: SigningWorkflowOptions = {}
  ): Promise<BatchSigningProgress> => {
    setIsSigning(true);
    setError(null);
    setSigningProgress({
      total: document.recipients.length,
      completed: 0,
      failed: 0,
      current: '',
      errors: []
    });
    
    try {
      const finalOptions: SigningWorkflowOptions = {
        ...options,
        onProgress: progressCallbackRef.current || undefined
      };
      
      const result = await signingWorkflow.signDocumentBatch(
        document,
        signature,
        position,
        finalOptions
      );
      
      setSigningProgress(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลงนามแบบกลุ่ม';
      setError(errorMessage);
      
      // Return current progress even if failed
      return signingProgress || {
        total: document.recipients.length,
        completed: 0,
        failed: document.recipients.length,
        current: '',
        errors: [{ recipientId: 'unknown', error: errorMessage }]
      };
    } finally {
      setIsSigning(false);
    }
  }, [signingProgress]);

  const cancelSigning = useCallback(() => {
    if (documentId) {
      const cancelled = signingWorkflow.cancelSigning(documentId);
      if (cancelled) {
        setIsSigning(false);
        setSigningProgress(null);
        setError('การลงนามถูกยกเลิก');
      }
    }
  }, [documentId]);

  const optimizePosition = useCallback((
    position: SignaturePosition,
    document: DocumentToSign
  ): SignaturePosition => {
    return signingWorkflow.optimizeSignaturePosition(position, document);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewUrl(null);
  }, []);

  return {
    // State
    isValidating,
    isSigning,
    isGeneratingPreview,
    validationResult,
    signingProgress,
    previewUrl,
    estimatedTime,
    error,
    
    // Actions
    validateSigning,
    generatePreview,
    executeSigning,
    executeBatchSigning,
    cancelSigning,
    optimizePosition,
    clearError,
    clearValidation,
    clearPreview
  };
};

// Hook for monitoring signing progress across the app
export const useSigningMonitor = () => {
  const [activeSignings, setActiveSignings] = useState<string[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const active = signingWorkflow.getActiveSignings();
      setActiveSignings(active);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const isDocumentBeingSigned = useCallback((documentId: string): boolean => {
    return signingWorkflow.isSigningInProgress(documentId);
  }, []);
  
  const cancelDocumentSigning = useCallback((documentId: string): boolean => {
    return signingWorkflow.cancelSigning(documentId);
  }, []);
  
  return {
    activeSignings,
    isDocumentBeingSigned,
    cancelDocumentSigning
  };
};