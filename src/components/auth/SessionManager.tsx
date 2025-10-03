import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  ExitToApp as ExitToAppIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useEnhancedAuth } from '../../hooks/useEnhancedAuth';
import EnhancedAuthManager from '../../utils/enhancedAuth';

interface SessionInfo {
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location?: string;
  loginTime: number;
  lastActivity: number;
  isCurrentSession: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

const SessionManager: React.FC = () => {
  const {
    session,
    logout,
    refreshSession,
    getSessionInfo,
    error,
    clearError
  } = useEnhancedAuth();

  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    suspiciousSessions: 0
  });

  useEffect(() => {
    loadSessionData();
    const interval = setInterval(loadSessionData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSessionData = () => {
    // In a real implementation, this would fetch from API
    // For now, we'll simulate session data
    const currentSession = getSessionInfo();
    if (!currentSession) return;

    const mockSessions: SessionInfo[] = [
      {
        id: currentSession.sessionToken,
        deviceType: getDeviceType(),
        browser: getBrowserName(),
        location: 'Bangkok, Thailand',
        loginTime: currentSession.loginTime,
        lastActivity: currentSession.lastActivity,
        isCurrentSession: true,
        riskLevel: 'low'
      },
      // Add mock additional sessions for demonstration
      {
        id: 'session-2',
        deviceType: 'mobile',
        browser: 'Chrome Mobile',
        location: 'Chiang Mai, Thailand',
        loginTime: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        lastActivity: Date.now() - 30 * 60 * 1000, // 30 minutes ago
        isCurrentSession: false,
        riskLevel: 'medium'
      }
    ];

    setSessions(mockSessions);
    setSessionStats({
      totalSessions: mockSessions.length,
      activeSessions: mockSessions.filter(s => 
        Date.now() - s.lastActivity < 30 * 60 * 1000
      ).length,
      suspiciousSessions: mockSessions.filter(s => s.riskLevel === 'high').length
    });
  };

  const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  };

  const getBrowserName = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <SmartphoneIcon />;
      case 'tablet': return <TabletIcon />;
      default: return <ComputerIcon />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'ความเสี่ยงสูง';
      case 'medium': return 'ความเสี่ยงปานกลาง';
      default: return 'ความเสี่ยงต่ำ';
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} วันที่แล้ว`;
    if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`;
    if (minutes > 0) return `${minutes} นาทีที่แล้ว`;
    return 'เมื่อสักครู่';
  };

  const getSessionDuration = (loginTime: number): string => {
    const duration = Date.now() - loginTime;
    const hours = Math.floor(duration / (60 * 60 * 1000));
    const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) return `${hours} ชม. ${minutes} นาที`;
    return `${minutes} นาที`;
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessionToTerminate(sessionId);
    setShowTerminateDialog(true);
  };

  const confirmTerminateSession = () => {
    if (sessionToTerminate) {
      if (sessions.find(s => s.id === sessionToTerminate)?.isCurrentSession) {
        // Terminate current session (logout)
        logout();
      } else {
        // Terminate other session
        setSessions(prev => prev.filter(s => s.id !== sessionToTerminate));
        EnhancedAuthManager.logSecurityEvent('session_terminated_remotely', {
          terminatedSessionId: sessionToTerminate
        });
      }
    }
    setShowTerminateDialog(false);
    setSessionToTerminate(null);
  };

  const terminateAllOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.isCurrentSession));
    EnhancedAuthManager.logSecurityEvent('all_other_sessions_terminated');
  };

  const getActivityStatus = (lastActivity: number): { status: string; color: string } => {
    const timeSinceActivity = Date.now() - lastActivity;
    const minutes = Math.floor(timeSinceActivity / 60000);

    if (minutes < 5) return { status: 'ใช้งานอยู่', color: 'success' };
    if (minutes < 30) return { status: 'ไม่ได้ใช้งาน', color: 'warning' };
    return { status: 'ไม่ได้ใช้งานนาน', color: 'error' };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Sarabun, sans-serif',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <SecurityIcon sx={{ mr: 2 }} />
          จัดการเซสชัน
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="รีเฟรชข้อมูล">
            <IconButton onClick={loadSessionData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={terminateAllOtherSessions}
            disabled={sessions.filter(s => !s.isCurrentSession).length === 0}
          >
            ยกเลิกเซสชันอื่นทั้งหมด
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Session Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                {sessionStats.totalSessions}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                เซสชันทั้งหมด
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                {sessionStats.activeSessions}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                เซสชันที่ใช้งานอยู่
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error.main" sx={{ fontWeight: 'bold' }}>
                {sessionStats.suspiciousSessions}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                เซสชันที่น่าสงสัย
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Sessions */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Sarabun, sans-serif',
            mb: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ScheduleIcon sx={{ mr: 1 }} />
          เซสชันที่ใช้งานอยู่
        </Typography>

        <List>
          {sessions.map((sessionInfo) => {
            const activityStatus = getActivityStatus(sessionInfo.lastActivity);
            
            return (
              <ListItem
                key={sessionInfo.id}
                sx={{
                  border: sessionInfo.isCurrentSession ? '2px solid' : '1px solid',
                  borderColor: sessionInfo.isCurrentSession ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  mb: 2,
                  bgcolor: sessionInfo.isCurrentSession ? 'primary.50' : 'background.paper'
                }}
              >
                <ListItemIcon>
                  {getDeviceIcon(sessionInfo.deviceType)}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
                      >
                        {sessionInfo.browser} บน {sessionInfo.deviceType}
                      </Typography>
                      
                      {sessionInfo.isCurrentSession && (
                        <Chip
                          label="เซสชันปัจจุบัน"
                          size="small"
                          color="primary"
                          variant="filled"
                        />
                      )}
                      
                      <Chip
                        label={getRiskLabel(sessionInfo.riskLevel)}
                        size="small"
                        color={getRiskColor(sessionInfo.riskLevel) as any}
                        variant="outlined"
                      />
                      
                      <Chip
                        label={activityStatus.status}
                        size="small"
                        color={activityStatus.color as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        📍 {sessionInfo.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        🕐 เข้าสู่ระบบ: {new Date(sessionInfo.loginTime).toLocaleString('th-TH')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ⏱️ ใช้งานล่าสุด: {formatTimeAgo(sessionInfo.lastActivity)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ⏳ ระยะเวลาการใช้งาน: {getSessionDuration(sessionInfo.loginTime)}
                      </Typography>
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<ExitToAppIcon />}
                    onClick={() => handleTerminateSession(sessionInfo.id)}
                  >
                    {sessionInfo.isCurrentSession ? 'ออกจากระบบ' : 'ยกเลิกเซสชัน'}
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>

        {sessions.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              ไม่พบเซสชันที่ใช้งานอยู่
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Security Tips */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.50' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Sarabun, sans-serif',
            mb: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <WarningIcon sx={{ mr: 1, color: 'info.main' }} />
          เคล็ดลับด้านความปลอดภัย
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText
              primary="ตรวจสอบเซสชันที่ใช้งานอยู่เป็นประจำ"
              secondary="หากพบเซสชันที่ไม่คุ้นเคย ให้ยกเลิกทันที"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="ออกจากระบบเมื่อใช้งานเสร็จ"
              secondary="โดยเฉพาะเมื่อใช้งานบนคอมพิวเตอร์สาธารณะ"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="ใช้งานจากอุปกรณ์ที่เชื่อถือได้เท่านั้น"
              secondary="หลีกเลี่ยงการเข้าสู่ระบบจากอุปกรณ์ที่ไม่รู้จัก"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Terminate Session Dialog */}
      <Dialog
        open={showTerminateDialog}
        onClose={() => setShowTerminateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ยืนยันการยกเลิกเซสชัน
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            {sessions.find(s => s.id === sessionToTerminate)?.isCurrentSession
              ? 'คุณต้องการออกจากระบบหรือไม่? คุณจะต้องเข้าสู่ระบบใหม่'
              : 'คุณต้องการยกเลิกเซสชันนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTerminateDialog(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={confirmTerminateSession}
            color="error"
            variant="contained"
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionManager;