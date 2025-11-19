/**
 * API Services Export
 * รวม services ทั้งหมดสำหรับเชื่อมต่อกับ Backend API
 */

// Export axios instance และ helper functions
export { default as axios, get, post, put, del, patch, upload, download } from './axios';

// Export types
export * from './types';

// Export services
export { authService } from './authService';
export { activityService } from './activityService';
export { templateService } from './templateService';
export { certificateService } from './certificateService';
export { userService } from './userService';
export { analyticsService } from './analyticsService';
export { emailService } from './emailService';
export { bulkService } from './bulkService';
export { qrService } from './qrService';
export { auditService } from './auditService';
export { settingsService } from './settingsService';
export { signatureService } from './signatureService';

// Default export - รวม services ทั้งหมด
import { authService } from './authService';
import { activityService } from './activityService';
import { templateService } from './templateService';
import { certificateService } from './certificateService';
import { userService } from './userService';
import { analyticsService } from './analyticsService';
import { emailService } from './emailService';
import { bulkService } from './bulkService';
import { qrService } from './qrService';
import { auditService } from './auditService';
import { settingsService } from './settingsService';
import { signatureService } from './signatureService';

const api = {
  auth: authService,
  activities: activityService,
  templates: templateService,
  certificates: certificateService,
  users: userService,
  analytics: analyticsService,
  email: emailService,
  bulk: bulkService,
  qr: qrService,
  audit: auditService,
  settings: settingsService,
  signatures: signatureService,
};

export default api;
