import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Api as ApiIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { apiTest } from '../utils/apiTest';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

interface AllTestResults {
  connection: TestResult;
  auth: TestResult;
  userManagement: TestResult;
  overall: TestResult;
}

const ApiTestPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AllTestResults | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      const testResults = await apiTest.runAllTests();
      setResults(testResults);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <SuccessIcon sx={{ color: 'success.main' }} />
    ) : (
      <ErrorIcon sx={{ color: 'error.main' }} />
    );
  };

  const getStatusChip = (success: boolean) => {
    return (
      <Chip
        label={success ? 'PASSED' : 'FAILED'}
        color={success ? 'success' : 'error'}
        size="small"
        variant="filled"
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          🧪 API Connection Test
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          ทดสอบการเชื่อมต่อระหว่าง Frontend และ Backend API
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          startIcon={isRunning ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
          onClick={runTests}
          disabled={isRunning}
          sx={{ px: 4, py: 1.5 }}
        >
          {isRunning ? 'กำลังทดสอบ...' : 'เริ่มทดสอบ'}
        </Button>
      </Box>

      {/* API Configuration Info */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: 'primary.50' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon sx={{ mr: 1 }} />
          การตั้งค่า API
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Environment:</strong> {process.env.REACT_APP_ENV || 'development'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Test Results */}
      {results && (
        <Box sx={{ mb: 4 }}>
          {/* Overall Result */}
          <Alert 
            severity={results.overall.success ? 'success' : 'error'} 
            sx={{ mb: 3, fontSize: '1.1rem' }}
            icon={getStatusIcon(results.overall.success)}
          >
            <Typography variant="h6" component="div">
              {results.overall.message}
            </Typography>
          </Alert>

          {/* Individual Test Results */}
          <Grid container spacing={3}>
            {/* Connection Test */}
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ApiIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      การเชื่อมต่อ API
                    </Typography>
                    {getStatusChip(results.connection.success)}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {results.connection.message}
                  </Typography>
                  
                  {results.connection.details && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                        {JSON.stringify(results.connection.details, null, 2)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Authentication Test */}
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      การยืนยันตัวตน
                    </Typography>
                    {getStatusChip(results.auth.success)}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {results.auth.message}
                  </Typography>
                  
                  {results.auth.details && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                        {JSON.stringify(results.auth.details, null, 2)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* User Management Test */}
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      จัดการผู้ใช้
                    </Typography>
                    {getStatusChip(results.userManagement.success)}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {results.userManagement.message}
                  </Typography>
                  
                  {results.userManagement.details && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                        {JSON.stringify(results.userManagement.details, null, 2)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Test Instructions */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          วิธีการทดสอบ
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <ApiIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="ทดสอบการเชื่อมต่อ API"
              secondary="ตรวจสอบว่า Backend API Server ทำงานอยู่และตอบสนองได้"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <SecurityIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="ทดสอบการยืนยันตัวตน"
              secondary="ทดสอบ Login/Logout และการดึงข้อมูลผู้ใช้ปัจจุบัน"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <PeopleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="ทดสอบการจัดการผู้ใช้"
              secondary="ทดสอบการดึงรายการผู้ใช้, บทบาท, และสถิติ"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary">
          <strong>หมายเหตุ:</strong> ก่อนทดสอบ ให้แน่ใจว่า Backend API Server ทำงานอยู่ที่ {process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}
        </Typography>
      </Paper>
    </Container>
  );
};

export default ApiTestPage;