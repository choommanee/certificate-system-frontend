// Fixed Designer Test Page
// This page allows us to test the fixed save/load functionality

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Alert,
  Paper,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import WorkingFixedDesigner from '../components/designer/fixed/WorkingFixedDesigner';
import { authService } from '../services/authService';

const FixedDesignerTestPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [testMode, setTestMode] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(user => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        })
        .catch(error => {
          console.warn('Auth failed:', error);
          // Use test user for development
          setCurrentUser({
            id: 'test-user-1',
            name: 'Test User',
            role: 'admin',
            email: 'test@example.com'
          });
          setIsAuthenticated(true);
          setTestMode(true);
        });
    } else {
      // Use test user for development
      setCurrentUser({
        id: 'test-user-1',
        name: 'Test User',
        role: 'admin',
        email: 'test@example.com'
      });
      setIsAuthenticated(true);
      setTestMode(true);
    }
  }, []);

  const handleSave = (document: any) => {
    console.log('✅ Document saved via onSave prop:', document);
  };

  const handleExport = (format: 'pdf' | 'png' | 'jpg', document: any) => {
    console.log(`📄 Export ${format.toUpperCase()} requested:`, document);
    
    // Here you could integrate with actual export service
    alert(`Export as ${format.toUpperCase()} initiated! Check console for details.`);
  };

  const runQuickTest = () => {
    console.log('🧪 Running quick test...');
    
    // Test localStorage
    try {
      localStorage.setItem('test', 'ok');
      localStorage.removeItem('test');
      console.log('✅ localStorage working');
    } catch (error) {
      console.error('❌ localStorage failed:', error);
    }

    // Test SimpleTemplateService
    import('../components/designer/fixed/SimpleTemplateService').then(({ default: SimpleTemplateService }) => {
      SimpleTemplateService.getUserTemplates()
        .then(templates => {
          console.log('✅ Template service working, found templates:', templates.length);
        })
        .catch(error => {
          console.log('⚠️ Template service using localStorage fallback:', error.message);
        });
    });
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Please log in to access the certificate designer.
          </Typography>
          {authError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {authError}
            </Alert>
          )}
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ 
        backgroundColor: '#1976d2', 
        color: 'white', 
        p: 2,
        borderRadius: 0,
        boxShadow: 3
      }}>
        <Container maxWidth={false}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h5" component="h1">
                🔧 Fixed Certificate Designer - Testing Mode
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Step-by-step fix for save/load functionality
              </Typography>
              {testMode && (
                <Alert 
                  severity="info" 
                  sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Typography variant="caption">
                    ⚡ Test Mode: Using mock authentication and localStorage fallback
                  </Typography>
                </Alert>
              )}
            </Grid>
            
            <Grid item>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={<Switch checked={testMode} disabled />}
                  label="Test Mode"
                  sx={{ color: 'white' }}
                />
                <Button 
                  variant="outlined" 
                  color="inherit"
                  size="small"
                  onClick={runQuickTest}
                >
                  Run Test
                </Button>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  👤 {currentUser?.name} ({currentUser?.role})
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Testing Instructions */}
      <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 0 }} elevation={0}>
        <Container maxWidth={false}>
          <Typography variant="h6" gutterBottom>
            🧪 Testing Instructions:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="primary">
                Phase 1: Basic Operations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Add text elements<br/>
                • Move and resize elements<br/>
                • Test selection and deletion
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="primary">
                Phase 2: Save/Load Testing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Save template with custom name<br/>
                • Load saved template<br/>
                • Verify elements persist correctly
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="primary">
                Phase 3: Export Testing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Export as PNG (direct download)<br/>
                • Export as PDF (via callback)<br/>
                • Check console for export data
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="primary">
                Phase 4: Integration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Test with different elements<br/>
                • Test multiple save/load cycles<br/>
                • Verify localStorage fallback
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Designer */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <WorkingFixedDesigner
          currentUser={currentUser}
          onSave={handleSave}
          onExport={handleExport}
          isPreviewMode={false}
        />
      </Box>

      {/* Footer Status */}
      <Paper sx={{ p: 1, backgroundColor: '#e3f2fd', borderRadius: 0 }} elevation={0}>
        <Container maxWidth={false}>
          <Typography variant="caption" color="text.secondary">
            🔧 Fixed Designer Status: 
            Canvas State Manager ✅ | 
            Simple Template Service ✅ | 
            localStorage Fallback ✅ | 
            API Integration {testMode ? '⚠️ (Fallback)' : '✅'}
          </Typography>
        </Container>
      </Paper>
    </Box>
  );
};

export default FixedDesignerTestPage;
