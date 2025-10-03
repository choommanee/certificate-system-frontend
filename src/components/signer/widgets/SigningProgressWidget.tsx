import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Stack,
  Chip,
  Avatar
} from '@mui/material';
import {
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  Schedule as TimeIcon
} from '@mui/icons-material';
import { useSigningStats } from '../../../hooks/useSigner';

interface SigningProgressWidgetProps {
  title?: string;
  showTrend?: boolean;
}

const SigningProgressWidget: React.FC<SigningProgressWidgetProps> = ({
  title = 'ความคืบหน้าการลงนาม',
  showTrend = true
}) => {
  const { stats, loading } = useSigningStats();

  if (loading || !stats) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const completionRate = stats.totalSigned > 0 
    ? Math.round((stats.completedThisMonth / stats.totalSigned) * 100) 
    : 0;

  const pendingRate = stats.pendingCount > 0 
    ? Math.round((stats.pendingCount / (stats.pendingCount + stats.completedThisMonth)) * 100)
    : 0;

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
          >
            {title}
          </Typography>
          
          {showTrend && (
            <Chip
              icon={<TrendUpIcon />}
              label="+12%"
              color="success"
              size="small"
            />
          )}
        </Box>

        <Stack spacing={3}>
          {/* Completion Progress */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                เสร็จสิ้นแล้ว
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {stats.completedThisMonth} / {stats.totalSigned}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionRate}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'success.main',
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {completionRate}% เสร็จสิ้น
            </Typography>
          </Box>

          {/* Pending Progress */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                รอดำเนินการ
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {stats.pendingCount}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pendingRate}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: 'warning.main',
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {pendingRate}% รอดำเนินการ
            </Typography>
          </Box>

          {/* Average Processing Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
              <TimeIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                เวลาเฉลี่ยต่อเอกสาร
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {stats.averageProcessingTime} นาที
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SigningProgressWidget;