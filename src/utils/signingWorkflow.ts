import { SigningForm, DocumentToSign, Signature, SignaturePosition } from '../types/signer';
import { SignerApiService } from '../services/signerApi';

export interface SigningValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BatchSigningProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
  errors: Array<{ recipientId: string; error: string }>;
}

export interface SigningWorkflowOptions {
  validatePosition?: boolean;
  generatePreview?: boolean;
  batchSize?: number;
  retryAttempts?: number;
  onProgress?: (progress: BatchSigningProgress) => void;
}

export class SigningWorkflowManager {
  private static instance: SigningWorkflowManager;
  private activeSignings: Map<string, AbortController> = new Map();

  static getInstance(): SigningWorkflowManager {
    if (!SigningWorkflowManager.instance) {
      SigningWorkflowManager.instance = new SigningWorkflowManager();
    }
    return SigningWorkflowManager.instance;
  }

  /**
   * Validate signing form data
   */
  validateSigningForm(
    document: DocumentToSign,
    signature: Signature,
    position: SignaturePosition
  ): SigningValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate signature
    if (!signature) {
      errors.push('กรุณาเลือกลายเซ็น');
    } else {
      if (!signature.isActive) {
        warnings.push('ลายเซ็นที่เลือกไม่ใช่ลายเซ็นหลัก');
      }
      
      if (signature.fileSize > 5 * 1024 * 1024) {
        warnings.push('ลายเซ็นมีขนาดใหญ่ อาจส่งผลต่อประสิทธิภาพ');
      }
    }

    // Validate position
    if (position.x < 0 || position.x > 100) {
      errors.push('ตำแหน่งลายเซ็นแนวนอนไม่ถูกต้อง');
    }
    
    if (position.y < 0 || position.y > 100) {
      errors.push('ตำแหน่งลายเซ็นแนวตั้งไม่ถูกต้อง');
    }

    if (position.width < 50 || position.width > 500) {
      errors.push('ความกว้างลายเซ็นต้องอยู่ระหว่าง 50-500 พิกเซล');
    }

    if (position.height < 20 || position.height > 250) {
      errors.push('ความสูงลายเซ็นต้องอยู่ระหว่าง 20-250 พิกเซล');
    }

    // Check if signature overlaps with important areas
    if (this.isOverlappingImportantArea(position, document)) {
      warnings.push('ลายเซ็นอาจทับกับข้อมูลสำคัญในเกียรติบัตร');
    }

    // Validate document
    if (!document.recipients || document.recipients.length === 0) {
      errors.push('ไม่พบรายชื่อผู้รับเกียรติบัตร');
    }

    if (document.recipients.length > 1000) {
      warnings.push('จำนวนผู้รับเกียรติบัตรมาก อาจใช้เวลานานในการประมวลผล');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if signature position overlaps with important areas
   */
  private isOverlappingImportantArea(
    position: SignaturePosition,
    document: DocumentToSign
  ): boolean {
    // Define important areas (these would typically come from template metadata)
    const importantAreas = [
      { x: 10, y: 10, width: 80, height: 20 }, // Header area
      { x: 20, y: 40, width: 60, height: 30 }, // Content area
      { x: 30, y: 85, width: 40, height: 10 }  // Footer area
    ];

    return importantAreas.some(area => 
      this.isRectangleOverlapping(position, area)
    );
  }

  /**
   * Check if two rectangles overlap
   */
  private isRectangleOverlapping(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    );
  }

  /**
   * Generate preview of signed certificate
   */
  async generateSigningPreview(
    document: DocumentToSign,
    signature: Signature,
    position: SignaturePosition
  ): Promise<string> {
    try {
      return await SignerApiService.previewCertificate(
        document.id,
        signature.id,
        { x: position.x, y: position.y }
      );
    } catch (error) {
      throw new Error('ไม่สามารถสร้างตัวอย่างได้: ' + (error as Error).message);
    }
  }

  /**
   * Execute single document signing
   */
  async signDocument(
    signingData: SigningForm,
    options: SigningWorkflowOptions = {}
  ): Promise<boolean> {
    const { validatePosition = true, generatePreview = false } = options;

    try {
      // Create abort controller for this signing operation
      const abortController = new AbortController();
      this.activeSignings.set(signingData.documentId, abortController);

      // Validate if required
      if (validatePosition) {
        // Additional validation would be performed here
        console.log('Validating signing data...');
      }

      // Generate preview if requested
      if (generatePreview) {
        console.log('Generating preview...');
        // Preview generation logic would go here
      }

      // Execute signing
      await SignerApiService.signDocument(signingData);

      // Clean up
      this.activeSignings.delete(signingData.documentId);
      
      return true;
    } catch (error) {
      this.activeSignings.delete(signingData.documentId);
      throw error;
    }
  }

  /**
   * Execute batch signing for multiple recipients
   */
  async signDocumentBatch(
    document: DocumentToSign,
    signature: Signature,
    position: SignaturePosition,
    options: SigningWorkflowOptions = {}
  ): Promise<BatchSigningProgress> {
    const {
      batchSize = 10,
      retryAttempts = 3,
      onProgress
    } = options;

    const progress: BatchSigningProgress = {
      total: document.recipients.length,
      completed: 0,
      failed: 0,
      current: '',
      errors: []
    };

    const abortController = new AbortController();
    this.activeSignings.set(document.id, abortController);

    try {
      // Process recipients in batches
      for (let i = 0; i < document.recipients.length; i += batchSize) {
        if (abortController.signal.aborted) {
          throw new Error('การลงนามถูกยกเลิก');
        }

        const batch = document.recipients.slice(i, i + batchSize);
        
        // Process batch concurrently
        const batchPromises = batch.map(async (recipient) => {
          progress.current = `${recipient.first_name} ${recipient.last_name}`;
          onProgress?.(progress);

          let attempts = 0;
          while (attempts < retryAttempts) {
            try {
              // In a real implementation, this would sign individual certificates
              await this.signSingleRecipientCertificate(
                document,
                recipient,
                signature,
                position
              );
              
              progress.completed++;
              onProgress?.(progress);
              return;
            } catch (error) {
              attempts++;
              if (attempts >= retryAttempts) {
                progress.failed++;
                progress.errors.push({
                  recipientId: recipient.id,
                  error: (error as Error).message
                });
                onProgress?.(progress);
              } else {
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
              }
            }
          }
        });

        await Promise.allSettled(batchPromises);
        
        // Small delay between batches to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      this.activeSignings.delete(document.id);
      return progress;
    } catch (error) {
      this.activeSignings.delete(document.id);
      throw error;
    }
  }

  /**
   * Sign certificate for a single recipient
   */
  private async signSingleRecipientCertificate(
    document: DocumentToSign,
    recipient: any,
    signature: Signature,
    position: SignaturePosition
  ): Promise<void> {
    // This would implement the actual signing logic for individual certificates
    // For now, we'll simulate the process
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.05) {
      throw new Error(`ไม่สามารถลงนามเกียรติบัตรสำหรับ ${recipient.first_name} ${recipient.last_name}`);
    }
  }

  /**
   * Cancel ongoing signing operation
   */
  cancelSigning(documentId: string): boolean {
    const controller = this.activeSignings.get(documentId);
    if (controller) {
      controller.abort();
      this.activeSignings.delete(documentId);
      return true;
    }
    return false;
  }

  /**
   * Check if document is currently being signed
   */
  isSigningInProgress(documentId: string): boolean {
    return this.activeSignings.has(documentId);
  }

  /**
   * Get all active signing operations
   */
  getActiveSignings(): string[] {
    return Array.from(this.activeSignings.keys());
  }

  /**
   * Optimize signature position for better visibility
   */
  optimizeSignaturePosition(
    currentPosition: SignaturePosition,
    document: DocumentToSign
  ): SignaturePosition {
    const optimized = { ...currentPosition };

    // Ensure signature is within safe bounds
    optimized.x = Math.max(5, Math.min(85, optimized.x));
    optimized.y = Math.max(5, Math.min(90, optimized.y));

    // Adjust size based on document dimensions
    const aspectRatio = document.metadata.totalPages > 1 ? 0.4 : 0.5;
    optimized.height = Math.min(optimized.height, optimized.width * aspectRatio);

    // Avoid overlapping with common text areas
    if (optimized.y < 30) {
      optimized.y = 75; // Move to bottom area
    }

    return optimized;
  }

  /**
   * Calculate estimated signing time
   */
  estimateSigningTime(recipientCount: number, batchSize: number = 10): number {
    const baseTimePerRecipient = 2; // seconds
    const batchOverhead = 1; // seconds per batch
    const batches = Math.ceil(recipientCount / batchSize);
    
    return (recipientCount * baseTimePerRecipient) + (batches * batchOverhead);
  }

  /**
   * Validate signature file before signing
   */
  async validateSignatureFile(signature: Signature): Promise<SigningValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (signature.fileSize > 5 * 1024 * 1024) {
      errors.push('ไฟล์ลายเซ็นมีขนาดใหญ่เกินไป (สูงสุด 5MB)');
    }

    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(signature.mimeType)) {
      errors.push('ประเภทไฟล์ลายเซ็นไม่ถูกต้อง');
    }

    // Check if signature has transparent background (for PNG)
    if (signature.mimeType === 'image/png') {
      // This would require actual image analysis
      // For now, we'll just add a warning
      warnings.push('แนะนำให้ใช้ลายเซ็นที่มีพื้นหลังโปร่งใส');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export singleton instance
export const signingWorkflow = SigningWorkflowManager.getInstance();

// Utility functions
export const formatSigningTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} วินาที`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} นาที`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} ชั่วโมง ${minutes} นาที`;
  }
};

export const generateSigningId = (): string => {
  return `signing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createSigningAuditLog = (
  documentId: string,
  signatureId: string,
  position: SignaturePosition,
  recipientCount: number
) => {
  return {
    id: generateSigningId(),
    documentId,
    signatureId,
    position,
    recipientCount,
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    ipAddress: 'client-side', // Would be filled by backend
    status: 'initiated'
  };
};