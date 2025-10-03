import { useState, useEffect, useCallback } from 'react';
import { SignerApiService, handleApiError } from '../services/signerApi';
import { useApiState } from './useApiState';
import { useLocalStorage } from './useLocalStorage';
import { useRealTimeUpdates } from './useRealTimeUpdates';
import {
  PendingDocument,
  DocumentToSign,
  Signature,
  SigningRecord,
  SigningStats,
  SigningActivity,
  DocumentFilter,
  DateRange,
  Notification,
  SigningForm,
  DocumentRejectForm
} from '../types/signer';

// Hook for managing pending documents with enhanced features
export const usePendingDocuments = (initialFilter?: DocumentFilter) => {
  const [filter, setFilter] = useLocalStorage<DocumentFilter>('signer.documentFilter', initialFilter || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const {
    data: documents,
    loading,
    error,
    execute: fetchDocuments,
    refresh: refreshDocuments,
    clearError
  } = useApiState(
    (page = 1) => SignerApiService.getPendingDocuments(filter, page, pagination.limit),
    { 
      initialData: [],
      autoRefresh: true,
      refreshInterval: 30000 // 30 seconds
    }
  );

  // Real-time updates for new documents
  useRealTimeUpdates({
    onMessage: (data) => {
      if (data.type === 'new_document' || data.type === 'document_updated') {
        refreshDocuments();
      }
    }
  });

  const handleFetchDocuments = useCallback(async (page = 1) => {
    try {
      const response = await fetchDocuments(page);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  }, [fetchDocuments]);

  const updateFilter = useCallback((newFilter: DocumentFilter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [setFilter]);

  useEffect(() => {
    handleFetchDocuments(1);
  }, [filter]);

  return {
    documents: documents || [],
    loading,
    error,
    filter,
    pagination,
    fetchDocuments: handleFetchDocuments,
    refreshDocuments,
    updateFilter,
    clearError
  };
};

// Hook for managing document details and signing
export const useDocumentSigning = () => {
  const [currentDocument, setCurrentDocument] = useState<DocumentToSign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  const loadDocument = useCallback(async (documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const document = await SignerApiService.getDocumentDetails(documentId);
      setCurrentDocument(document);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const signDocument = useCallback(async (signingData: SigningForm) => {
    setSigning(true);
    setError(null);
    try {
      await SignerApiService.signDocument(signingData);
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    } finally {
      setSigning(false);
    }
  }, []);

  const rejectDocument = useCallback(async (rejectData: DocumentRejectForm) => {
    setSigning(true);
    setError(null);
    try {
      await SignerApiService.rejectDocument(rejectData);
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    } finally {
      setSigning(false);
    }
  }, []);

  const clearDocument = useCallback(() => {
    setCurrentDocument(null);
    setError(null);
  }, []);

  return {
    currentDocument,
    loading,
    error,
    signing,
    loadDocument,
    signDocument,
    rejectDocument,
    clearDocument
  };
};

// Hook for managing signatures
export const useSignatures = () => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchSignatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SignerApiService.getSignatures();
      setSignatures(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadSignature = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      await SignerApiService.validateSignatureFile(file);
      const formData = new FormData();
      formData.append('signature', file);
      const newSignature = await SignerApiService.uploadSignature(formData);
      setSignatures(prev => [...prev, newSignature]);
      return newSignature;
    } catch (err) {
      setError(handleApiError(err));
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const setActiveSignature = useCallback(async (signatureId: string) => {
    setError(null);
    try {
      await SignerApiService.setActiveSignature(signatureId);
      setSignatures(prev => 
        prev.map(sig => ({
          ...sig,
          isActive: sig.id === signatureId
        }))
      );
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, []);

  const deleteSignature = useCallback(async (signatureId: string) => {
    setError(null);
    try {
      await SignerApiService.deleteSignature(signatureId);
      setSignatures(prev => prev.filter(sig => sig.id !== signatureId));
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, []);

  const getActiveSignature = useCallback(() => {
    return signatures.find(sig => sig.isActive) || null;
  }, [signatures]);

  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);

  return {
    signatures,
    loading,
    error,
    uploading,
    fetchSignatures,
    uploadSignature,
    setActiveSignature,
    deleteSignature,
    getActiveSignature
  };
};

// Hook for signing statistics with caching and real-time updates
export const useSigningStats = () => {
  const {
    data: stats,
    loading,
    error,
    execute: fetchStats,
    refresh: refreshStats,
    clearError
  } = useApiState(
    () => SignerApiService.getSigningStats(),
    { 
      autoRefresh: true,
      refreshInterval: 60000 // 1 minute
    }
  );

  // Real-time updates for stats
  useRealTimeUpdates({
    onMessage: (data) => {
      if (data.type === 'stats_updated' || data.type === 'document_signed') {
        refreshStats();
      }
    }
  });

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    refreshStats,
    clearError
  };
};

// Hook for signing history
export const useSigningHistory = () => {
  const [history, setHistory] = useState<SigningRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchHistory = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await SignerApiService.getSigningHistory(dateRange, page, pagination.limit);
      setHistory(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [dateRange, pagination.limit]);

  const updateDateRange = useCallback((newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const exportReport = useCallback(async (format: 'pdf' | 'excel' = 'pdf') => {
    if (!dateRange) return null;
    
    setError(null);
    try {
      const blob = await SignerApiService.exportSigningReport(dateRange, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signing-report-${dateRange.startDate.toISOString().split('T')[0]}-${dateRange.endDate.toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, [dateRange]);

  useEffect(() => {
    fetchHistory(1);
  }, [dateRange]);

  return {
    history,
    loading,
    error,
    dateRange,
    pagination,
    fetchHistory,
    updateDateRange,
    exportReport
  };
};

// Hook for recent activity
export const useRecentActivity = (limit = 10) => {
  const [activities, setActivities] = useState<SigningActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SignerApiService.getRecentActivity(limit);
      setActivities(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refreshActivities = useCallback(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    refreshActivities
  };
};

// Hook for notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await SignerApiService.getNotifications();
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await SignerApiService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(handleApiError(err));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await SignerApiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(handleApiError(err));
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};

// Main hook that combines all signer functionality
export const useSigner = () => {
  const { stats, loading: statsLoading, error: statsError } = useSigningStats();
  const { documents, loading: documentsLoading } = usePendingDocuments();
  const { notifications, unreadCount } = useNotifications();
  const { activities } = useRecentActivity();

  return {
    stats,
    documents,
    notifications,
    activities,
    unreadCount,
    loading: statsLoading || documentsLoading,
    error: statsError
  };
};