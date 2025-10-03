import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const DebugPage: React.FC = () => {
  const { isAuthenticated, isLoading, user, error } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Debug Page
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Authentication State
          </Typography>
          <Typography>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</Typography>
          <Typography>isLoading: {isLoading ? 'true' : 'false'}</Typography>
          <Typography>error: {error || 'null'}</Typography>
          <Typography>user: {user ? JSON.stringify(user, null, 2) : 'null'}</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            LocalStorage
          </Typography>
          <Typography>
            token: {localStorage.getItem('token') || 'null'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DebugPage;
