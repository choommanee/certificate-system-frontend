import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Box,
  Button,
  Divider
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Cancel as RejectIcon,
  Schedule as PendingIcon,
  Assignment as DocumentIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useRecentActivity } from '../../../hooks/useSigner';

interface RecentActivityWidgetProps {
  title?: string;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  title = 'กิจกรรมล่าสุด',
  maxItems = 5,
  showViewAll = true,
  onViewAll
}) => {
  const { activities, loading } = useRecentActivity(maxItems);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signed':
        return <SuccessIcon color="success" />;
      case 'rejected':
        return <RejectIcon color="error" />;
      case 'received':
        return <DocumentIcon color="info" />;
      case 'uploaded_signature':
        return <PendingIcon color="warning" />;
      default:
        return <DocumentIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'signed':
        return 'success.main';
      case 'rejected':
        return 'error.main';
      case 'received':
        return 'info.main';
      case 'uploaded_signature':
        return 'warning.main';
      default:
        return 'grey.500';
    }
  };

  const getActivityText = (type: string) => {
    switch (type) {
      case 'signed':
        return 'ลงนามเสร็จสิ้น';
      case 'rejected':
        return 'ปฏิเสธเอกสาร';
      case 'received':
        return 'รับเอกสารใหม่';
      case 'uploaded_signature':
        return 'อัปโหลดลายเซ็น';
      default:
        return 'กิจกรรม';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
    
    return new Date(date).toLocaleDateString('th-TH', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
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

  return (
    <Card elevation={2}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
          >
            {title}
          </Typography>
          
          {showViewAll && activities.length > 0 && (
            <Button
              size="small"
              onClick={onViewAll}
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ดูทั้งหมด
            </Button>
          )}
        </Box>

        {activities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontFamily: 'Sarabun, sans-serif' }}
            >
              ยังไม่มีกิจกรรมล่าสุด
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ p: 0 }}>
            {activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      sx={{
                        bgcolor: getActivityColor(activity.type),
                        width: 32,
                        height: 32
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 'bold' }}
                        >
                          {getActivityText(activity.type)}
                        </Typography>
                        
                        {activity.priority && (
                          <Chip
                            label={activity.priority === 'high' ? 'ด่วน' : 'ปกติ'}
                            color={activity.priority === 'high' ? 'error' : 'default'}
                            size="small"
                            sx={{ height: 16, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        {activity.documentTitle && (
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: 'Sarabun, sans-serif', display: 'block' }}
                          >
                            {activity.documentTitle}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(activity.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    sx={{ 
                      minWidth: 'auto',
                      px: 1,
                      fontSize: '0.7rem'
                    }}
                  >
                    ดู
                  </Button>
                </ListItem>
                
                {index < activities.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;