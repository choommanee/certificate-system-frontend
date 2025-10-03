import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Refresh,
  Api,
  Verified,
  People,
  Assessment,
} from '@mui/icons-material';
import statisticsService from '../services/statisticsService';
import publicService from '../services/publicService';
import activityService from '../services/activityService';

const NewAPITestPage: React.FC = () => {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [verificationCode, setVerificationCode] = useState('TEST123');

  const testAPI = async (name: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const result = await testFn();
      setResults((prev: any) => ({
        ...prev,
        [name]: { success: true, data: result }
      }));
    } catch (error: any) {
      setResults((prev: any) => ({
        ...prev,
        [name]: { success: false, error: error.message || 'Unknown error' }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const runAllTests = async () => {
    // Test Public APIs
    await testAPI('publicStats', () => statisticsService.getPublicStatistics());
    await testAPI('verification', () => publicService.verifyCertificate(verificationCode));
    await testAPI('faqs', () => publicService.getFAQs());
    await testAPI('orgInfo', () => publicService.getOrganizationInfo());

    // Test Activities (will fail without auth, but we test the connection)
    await testAPI('activities', () => activityService.listActivities({ page: 1, limit: 5 }));
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const renderTestResult = (name: string, label: string, icon: React.ReactNode) => {
    const result = results[name];
    const isLoading = loading[name];

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            {icon}
            <Typography variant="h6" sx={{ ml: 1, fontFamily: 'Sarabun, sans-serif' }}>
              {label}
            </Typography>
          </Box>

          {isLoading && (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={30} />
            </Box>
          )}

          {!isLoading && result && (
            <>
              <Box display="flex" alignItems="center" mb={1}>
                {result.success ? (
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                ) : (
                  <Error color="error" sx={{ mr: 1 }} />
                )}
                <Chip
                  label={result.success ? 'สำเร็จ' : 'ล้มเหลว'}
                  color={result.success ? 'success' : 'error'}
                  size="small"
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                />
              </Box>

              {result.success && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {JSON.stringify(result.data, null, 2)}
                  </Typography>
                </Box>
              )}

              {!result.success && (
                <Alert severity="error" sx={{ mt: 1, fontFamily: 'Sarabun, sans-serif' }}>
                  {result.error}
                </Alert>
              )}
            </>
          )}

          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={() => {
              if (name === 'publicStats') testAPI(name, () => statisticsService.getPublicStatistics());
              if (name === 'verification') testAPI(name, () => publicService.verifyCertificate(verificationCode));
              if (name === 'faqs') testAPI(name, () => publicService.getFAQs());
              if (name === 'orgInfo') testAPI(name, () => publicService.getOrganizationInfo());
              if (name === 'activities') testAPI(name, () => activityService.listActivities({ page: 1, limit: 5 }));
            }}
            sx={{ mt: 2, fontFamily: 'Sarabun, sans-serif' }}
          >
            ทดสอบอีกครั้ง
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <Api sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}>
                API Integration Test
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                ทดสอบการเชื่อมต่อระหว่าง Frontend และ Backend API
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={runAllTests}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ทดสอบทั้งหมด
          </Button>
        </Box>

        <Alert severity="info" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
          <strong>Backend API:</strong> http://localhost:8081/api/v1
          <br />
          <strong>Note:</strong> Protected endpoints จะล้มเหลวหากไม่มี authentication token
        </Alert>
      </Paper>

      {/* Verification Code Input */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
          ทดสอบ Verification
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              sx: { fontFamily: 'Sarabun, sans-serif' }
            }}
            InputLabelProps={{
              sx: { fontFamily: 'Sarabun, sans-serif' }
            }}
          />
          <Button
            variant="contained"
            onClick={() => testAPI('verification', () => publicService.verifyCertificate(verificationCode))}
            sx={{ fontFamily: 'Sarabun, sans-serif' }}
          >
            ตรวจสอบ
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }}>
        <Chip label="Public API Endpoints" sx={{ fontFamily: 'Sarabun, sans-serif' }} />
      </Divider>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          {renderTestResult('publicStats', 'Public Statistics', <Assessment color="primary" />)}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderTestResult('verification', 'Certificate Verification', <Verified color="primary" />)}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderTestResult('faqs', 'FAQs', <Api color="primary" />)}
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          {renderTestResult('orgInfo', 'Organization Info', <Api color="primary" />)}
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }}>
        <Chip label="Protected API Endpoints" sx={{ fontFamily: 'Sarabun, sans-serif' }} />
      </Divider>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {renderTestResult('activities', 'Activities List', <People color="primary" />)}
        </Grid>
      </Grid>

      {/* API Endpoints Reference */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
          📋 API Endpoints Reference
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="GET /api/v1/health"
              secondary="Health check endpoint"
              primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
              secondaryTypographyProps={{ fontFamily: 'Sarabun, sans-serif' }}
            />
            <Chip label="Public" color="success" size="small" />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="GET /api/v1/public/statistics"
              secondary="Public statistics"
              primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
              secondaryTypographyProps={{ fontFamily: 'Sarabun, sans-serif' }}
            />
            <Chip label="Public" color="success" size="small" />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="POST /api/v1/public/verify"
              secondary="Verify certificate"
              primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
              secondaryTypographyProps={{ fontFamily: 'Sarabun, sans-serif' }}
            />
            <Chip label="Public" color="success" size="small" />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="GET /api/v1/public/faqs"
              secondary="Get FAQs"
              primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
              secondaryTypographyProps={{ fontFamily: 'Sarabun, sans-serif' }}
            />
            <Chip label="Public" color="success" size="small" />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="GET /api/v1/activities"
              secondary="List activities (requires auth)"
              primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
              secondaryTypographyProps={{ fontFamily: 'Sarabun, sans-serif' }}
            />
            <Chip label="Protected" color="warning" size="small" />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default NewAPITestPage;
