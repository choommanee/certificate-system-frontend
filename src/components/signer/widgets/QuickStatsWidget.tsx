import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  Assignment as DocumentIcon,
  CheckCircle as SuccessIcon,
  Schedule as PendingIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon
} from '@mui/icons-material';
import { useSigningStats } from '../../../hooks/useSigner';

interface QuickStatsWidgetProps {
  title?: string;
  showTrends?: boolean;
  layout?: 'grid' | 'list';
}

const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({
  title = 'สถิติด่วน',
  showTrends = true,
  layout = 'grid'
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
            กำลังโหลด...
          </Box>
        </CardContent>
      </Card>
    );
  }

  const statsData = [
    {
      icon: <DocumentIcon />,
      label: 'ทั้งหมด',
      value: stats.totalSigned,
      color: 'primary.main',
      bgcolor: 'primary.light',
      trend: '+5%',
      trendUp: true
    },
    {
      icon: <SuccessIcon />,
      label: 'สำเร็จ',
      value: stats.completedThisMonth,
      color: 'success.main',
      bgcolor: 'success.light',
      trend: '+12%',
      trendUp: true
    },
    {
      icon: <PendingIcon />,
      label: 'รอลงนาม',
      value: stats.pendingCount,
      color: 'warning.main',
      bgcolor: 'warning.light',
      trend: '-3%',
      trendUp: false
    },
    {
      icon: <SpeedIcon />,
      label: 'เฉลี่ย (นาที)',
      value: stats.averageProcessingTime,
      color: 'info.main',
      bgcolor: 'info.light',
      trend: '-8%',
      trendUp: false
    }
  ];

  if (layout === 'list') {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
          >
            {title}
          </Typography>
          
          <Stack spacing={2}>
            {statsData.map((stat, index) => (
              <React.Fragment key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: stat.bgcolor, color: stat.color, width: 40, height: 40 }}>
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {showTrends && (
                    <Chip
                      icon={stat.trendUp ? <TrendUpIcon /> : <TrendDownIcon />}
                      label={stat.trend}
                      color={stat.trendUp ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                {index < statsData.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold', mb: 2 }}
        >
          {title}
        </Typography>
        
        <Grid container spacing={2}>
          {statsData.map((stat, index) => (
            <Grid item xs={6} key={index}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                {showTrends && (
                  <Chip
                    icon={stat.trendUp ? <TrendUpIcon /> : <TrendDownIcon />}
                    label={stat.trend}
                    color={stat.trendUp ? 'success' : 'error'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                )}
                
                <Avatar
                  sx={{
                    bgcolor: stat.bgcolor,
                    color: stat.color,
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 1
                  }}
                >
                  {stat.icon}
                </Avatar>
                
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 'bold', color: stat.color, mb: 0.5 }}
                >
                  {stat.value}
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickStatsWidget;