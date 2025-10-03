import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

const AnalyticsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <AnalyticsDashboard />
      </Box>
    </DashboardLayout>
  );
};

export default AnalyticsPage;