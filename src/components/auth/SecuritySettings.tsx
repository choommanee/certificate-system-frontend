import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  LinearProgress,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Security as SecurityIcon,
  VpnKey as VpnKeyIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Shield as ShieldIcon,
  Smartphone as SmartphoneIcon,
  Key as KeyIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useEnhancedAuth } from '../../hooks/useEnhancedAuth';
import EnhancedAuthManager from '../../utils/enhancedAuth';

const SecuritySettings: React.FC = () => {
  const {
    session,
    hasPermission,
    changePassword,
    enableMFA,
    disableMFA,
    getSecurityHealth,
    error,
    clearError,
    isLoading
  } = useEnhancedAuth();

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showMFADialog, setShowMFADialog] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [mfaData, setMfaData] = useState<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  } | null>(null);
  const [securityHealth, setSecurityHealth] = useState<{
    score: number;
    issues: string[];
    recommendations: string[];
  }>({ score: 0, issues: [], recommendations: [] });
  const [loginAttempts, setLoginAttempts] = useState<any[]>([]);

  // Load security data on mount
  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = () => {
    // Load security health
    const health = getSecurityHealth();
    setSecurityHealth(health);

    // Load login attempts
    const attempts = EnhancedAuthManager.getLoginAttempts();
    setLoginAttempts(attempts.slice(-10)); // Last 10 attempts

    // Check MFA status (would come from API in real implementation)
    setMfaEnabled(session?.mfaVerified || false);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      return;
    }

    const success = await changePassword(passwordForm.current, passwordForm.new);
    if (success) {
      setShowPasswordDialog(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      loadSecurityData();
    }
  };

  const handleEnableMFA = async () => {
    try {
      const data = await enableMFA();
      setMfaData(data);
      setShowMFADialog(true);
    } catch (err) {
      console.error('Failed to enable MFA:', err);
    }
  };

  const handleDisableMFA = async () => {
    const password = prompt('กรุณากรอกรหัสผ่านเพื่อยืนยัน:');
    if (password) {
      const success = await disableMFA(password);
      if (success) {
        setMfaEnabled(false);
        loadSecurityData();
      }
    }
  };

  const downloadBackupCodes = () => {
    if (!mfaData?.backupCodes) return;

    const content = mfaData.backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSecurityLogs = () => {
    const logs = EnhancedAuthManager.getSecurityLogs();
    const content = JSON.stringify(logs, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security-logs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircleIcon color="success" />;
    if (score >= 60) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Sarabun, sans-serif',
          fontWeight: 'bold',
          mb: 3,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <SecurityIcon sx={{ mr: 2 }} />
        การตั้งค่าความปลอดภัย
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Security Health Score */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getHealthIcon(securityHealth.score)}
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'Sarabun, sans-serif', ml: 1 }}
                >
                  คะแนนความปลอดภัย
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold',
                    mr: 2
                  }}
                >
                  {securityHealth.score}
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  / 100
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={securityHealth.score}
                color={getHealthColor(securityHealth.score)}
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />

              {securityHealth.issues.length > 0 && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontFamily: 'Sarabun, sans-serif', mb: 1 }}
                  >
                    ปัญหาที่พบ:
                  </Typography>
                  {securityHealth.issues.map((issue, index) => (
                    <Chip
                      key={index}
                      label={issue}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}
              >
                การดำเนินการด่วน
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <VpnKeyIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="เปลี่ยนรหัสผ่าน"
                    secondary="อัปเดตรหัสผ่านเป็นประจำ"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      เปลี่ยน
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <SmartphoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="การยืนยันตัวตนแบบสองขั้นตอน"
                    secondary={mfaEnabled ? 'เปิดใช้งานแล้ว' : 'ไม่ได้เปิดใช้งาน'}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={mfaEnabled}
                      onChange={mfaEnabled ? handleDisableMFA : handleEnableMFA}
                      disabled={isLoading}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <DownloadIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="ส่งออกบันทึกความปลอดภัย"
                    secondary="ดาวน์โหลดบันทึกการเข้าใช้งาน"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      onClick={exportSecurityLogs}
                    >
                      ส่งออก
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Login Attempts */}
        <Grid item xs={12}>
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
              <HistoryIcon sx={{ mr: 1 }} />
              ประวัติการเข้าสู่ระบบล่าสุด
            </Typography>

            <List>
              {loginAttempts.map((attempt, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    {attempt.success ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                          {attempt.email}
                        </Typography>
                        <Chip
                          label={attempt.success ? 'สำเร็จ' : 'ไม่สำเร็จ'}
                          size="small"
                          color={attempt.success ? 'success' : 'error'}
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {new Date(attempt.timestamp).toLocaleString('th-TH')}
                        {attempt.failureReason && ` - ${attempt.failureReason}`}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Security Recommendations */}
        {securityHealth.recommendations.length > 0 && (
          <Grid item xs={12}>
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
                <ShieldIcon sx={{ mr: 1 }} />
                คำแนะนำด้านความปลอดภัย
              </Typography>

              <List>
                {securityHealth.recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation}
                      sx={{ fontFamily: 'Sarabun, sans-serif' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Password Change Dialog */}
      <Dialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          เปลี่ยนรหัสผ่าน
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="รหัสผ่านปัจจุบัน"
            value={passwordForm.current}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="รหัสผ่านใหม่"
            value={passwordForm.new}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="ยืนยันรหัสผ่านใหม่"
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
            margin="normal"
            error={passwordForm.new !== passwordForm.confirm && passwordForm.confirm !== ''}
            helperText={
              passwordForm.new !== passwordForm.confirm && passwordForm.confirm !== ''
                ? 'รหัสผ่านไม่ตรงกัน'
                : ''
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={
              !passwordForm.current ||
              !passwordForm.new ||
              passwordForm.new !== passwordForm.confirm ||
              isLoading
            }
          >
            เปลี่ยนรหัสผ่าน
          </Button>
        </DialogActions>
      </Dialog>

      {/* MFA Setup Dialog */}
      <Dialog
        open={showMFADialog}
        onClose={() => setShowMFADialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          ตั้งค่าการยืนยันตัวตนแบบสองขั้นตอน
        </DialogTitle>
        <DialogContent>
          {mfaData && (
            <Box>
              <Typography sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                1. สแกน QR Code ด้วยแอป Google Authenticator
              </Typography>
              
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <img
                  src={mfaData.qrCode}
                  alt="QR Code"
                  style={{ maxWidth: '200px' }}
                />
              </Box>

              <Typography sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                2. หรือกรอกรหัสลับนี้ในแอป:
              </Typography>
              
              <TextField
                fullWidth
                value={mfaData.secret}
                InputProps={{ readOnly: true }}
                sx={{ mb: 3 }}
              />

              <Typography sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
                3. บันทึกรหัสสำรองเหล่านี้ไว้ในที่ปลอดภัย:
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {mfaData.backupCodes.map((code, index) => (
                  <Chip
                    key={index}
                    label={code}
                    variant="outlined"
                    sx={{ fontFamily: 'monospace' }}
                  />
                ))}
              </Box>

              <Button
                startIcon={<DownloadIcon />}
                onClick={downloadBackupCodes}
                sx={{ mb: 2 }}
              >
                ดาวน์โหลดรหัสสำรอง
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMFADialog(false)}>
            ปิด
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setMfaEnabled(true);
              setShowMFADialog(false);
              loadSecurityData();
            }}
          >
            เสร็จสิ้น
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;