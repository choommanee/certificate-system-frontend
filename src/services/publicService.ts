import apiClient from './apiClient';

export interface VerificationRequest {
  verificationCode: string;
  certificateNumber?: string;
  recipientName?: string;
}

export interface VerificationResponse {
  valid: boolean;
  certificate: Certificate | null;
  message: string;
  verificationLog?: {
    id: string;
    verifiedAt: string;
    verificationMethod: string;
  };
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  recipientNameTh: string;
  recipientNameEn?: string;
  activityName: string;
  activityDate: string;
  certificateType: string;
  issueDate: string;
  templateId: string;
  certificateFile?: string;
  qrCode?: string;
  verificationUrl?: string;
  status: string;
  signatures?: Array<{
    id: string;
    signatoryName: string;
    position: string;
    signatureImage: string;
  }>;
}

export interface PublicVerificationRequest {
  requesterName: string;
  requesterEmail: string;
  organization?: string;
  certificateNumber: string;
  recipientName?: string;
  verificationPurpose: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'support' | 'inquiry' | 'bug_report' | 'feature_request';
}

class PublicService {
  /**
   * Verify certificate by verification code
   */
  async verifyCertificate(verificationCode: string): Promise<VerificationResponse> {
    try {
      const response = await apiClient.post<VerificationResponse>('/v1/public/verify', {
        verificationCode
      });
      return response;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return {
        valid: false,
        certificate: null,
        message: 'ไม่พบเกียรติบัตรในระบบ กรุณาตรวจสอบรหัสตรวจสอบอีกครั้ง'
      };
    }
  }

  /**
   * Verify certificate by QR code scan
   */
  async verifyByQRCode(qrData: string): Promise<VerificationResponse> {
    try {
      // Extract verification code from QR data (URL or code)
      const verificationCode = this.extractVerificationCode(qrData);
      return await this.verifyCertificate(verificationCode);
    } catch (error) {
      console.error('Error verifying QR code:', error);
      return {
        valid: false,
        certificate: null,
        message: 'รหัส QR Code ไม่ถูกต้อง'
      };
    }
  }

  /**
   * Get certificate details by verification code (without logging)
   */
  async getCertificateByCode(code: string): Promise<Certificate | null> {
    try {
      const response = await apiClient.get<Certificate>(`/v1/public/certificates/${code}`);
      return response;
    } catch (error) {
      console.error('Error getting certificate:', error);
      return null;
    }
  }

  /**
   * Submit public verification request
   */
  async submitVerificationRequest(request: PublicVerificationRequest): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.post('/v1/public/verification-requests', request);
      return {
        success: true,
        message: 'ส่งคำขอตรวจสอบเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับภายใน 1-2 วันทำการ'
      };
    } catch (error) {
      console.error('Error submitting verification request:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง'
      };
    }
  }

  /**
   * Report fake certificate
   */
  async reportFakeCertificate(
    certificateNumber: string,
    reporterName: string,
    reporterEmail: string,
    details: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.post('/v1/public/report-fake', {
        certificateNumber,
        reporterName,
        reporterEmail,
        details
      });
      return {
        success: true,
        message: 'ขอบคุณสำหรับการรายงาน เราจะดำเนินการตรวจสอบโดยเร็วที่สุด'
      };
    } catch (error) {
      console.error('Error reporting fake certificate:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง'
      };
    }
  }

  /**
   * Get FAQs
   */
  async getFAQs(category?: string): Promise<FAQItem[]> {
    try {
      const response = await apiClient.get<FAQItem[]>('/v1/public/faqs', {
        params: { category }
      });
      return response;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }
  }

  /**
   * Submit contact/support request
   */
  async submitContactRequest(request: ContactRequest): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.post('/v1/public/contact', request);
      return {
        success: true,
        message: 'ส่งข้อความเรียบร้อยแล้ว เราจะติดต่อกลับโดยเร็วที่สุด'
      };
    } catch (error) {
      console.error('Error submitting contact request:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง'
      };
    }
  }

  /**
   * Download certificate PDF
   */
  async downloadCertificate(certificateId: string, filename?: string): Promise<Blob> {
    try {
      const blob = await apiClient.download(
        `/v1/public/certificates/${certificateId}/download`,
        filename || `certificate-${certificateId}.pdf`
      );
      return blob;
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw error;
    }
  }

  /**
   * Get organization info
   */
  async getOrganizationInfo(): Promise<any> {
    try {
      const response = await apiClient.get('/v1/public/organization');
      return response;
    } catch (error) {
      console.error('Error fetching organization info:', error);
      return {
        orgNameTh: 'คณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์',
        orgNameEn: 'Faculty of Economics, Thammasat University',
        orgNameShort: 'ECON TU',
        website: 'https://econ.tu.ac.th',
        email: 'info@econ.tu.ac.th'
      };
    }
  }

  /**
   * Extract verification code from QR data
   */
  private extractVerificationCode(qrData: string): string {
    try {
      // If it's a URL, extract code from URL
      if (qrData.startsWith('http')) {
        const url = new URL(qrData);
        // Try to get code from path or query parameter
        const pathParts = url.pathname.split('/');
        const code = pathParts[pathParts.length - 1] || url.searchParams.get('code');
        return code || qrData;
      }
      // Otherwise, treat as direct code
      return qrData;
    } catch (error) {
      // If parsing fails, return as-is
      return qrData;
    }
  }

  /**
   * Share certificate to social media
   */
  generateShareUrls(certificateId: string, verificationUrl: string) {
    const text = encodeURIComponent('ตรวจสอบเกียรติบัตรของฉัน');
    const url = encodeURIComponent(verificationUrl);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      line: `https://social-plugins.line.me/lineit/share?url=${url}`,
      email: `mailto:?subject=${text}&body=${url}`
    };
  }
}

export default new PublicService();
