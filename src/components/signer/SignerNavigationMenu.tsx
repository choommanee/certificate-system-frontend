import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Collapse,
  Chip,
  Badge,
  Avatar,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard,
  PendingActions,
  History,
  Edit,
  Analytics,
  Notifications,
  Settings,
  Person,
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  TrendingUp,
  Today,
  ExpandLess,
  ExpandMore,
  NotificationImportant,
  Speed,
  AssignmentTurnedIn,
  AssignmentLate,
  AssignmentReturn,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSigner } from '../../hooks/useSigner';

interface SignerNavigationItem {
  text: string;
  icon: React.ReactElement;
  path?: string;
  badge?: number | string;
  description?: string;
  color?: string;
  urgent?: boolean;
}

interface SignerNavigationSection {
  title: string;
  items: SignerNavigationItem[];
  color?: string;
  icon?: React.ReactElement;
}

const SignerNavigationMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { stats, loading } = useSigner();
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'documents']);

  const navigationSections: SignerNavigationSection[] = [
    // Main Dashboard
    {
      title: 'หน้าหลัก',
      color: '#1976d2',
      icon: <Dashboard />,
      items: [
        {
          text: 'แดชบอร์ดผู้ลงนาม',
          icon: <Dashboard />,
          path: '/signer/dashboard',
          description: 'ภาพรวมงานลงนาม',
          color: '#1976d2'
        },
        {
          text: 'สถิติและรายงาน',
          icon: <Analytics />,
          path: '/signer/analytics',
          description: 'วิเคราะห์ประสิทธิภาพ',
          color: '#388e3c'
        },
      ]
    },

    // Document Management
    {
      title: 'จัดการเอกสาร',
      color: '#f57c00',
      icon: <Assignment />,
      items: [
        {
          text: 'เอกสารรอลงนาม',
          icon: <PendingActions />,
          path: '/signer/pending',
          badge: stats?.pendingCount || 0,
          description: 'เอกสารที่รอการลงนาม',
          color: '#f57c00',
          urgent: (stats?.urgentPending || 0) > 0
        },
        {
          text: 'เอกสารด่วน',
          icon: <Warning />,
          path: '/signer/urgent',
          badge: stats?.urgentPending || 0,
          description: 'เอกสารที่ต้องลงนามด่วน',
          color: '#d32f2f',
          urgent: true
        },
        {
          text: 'เอกสารที่ลงนามแล้ว',
          icon: <CheckCircle />,
          path: '/signer/completed',
          badge: stats?.completedThisMonth || 0,
          description: 'เอกสารที่ลงนามเสร็จแล้ว',
          color: '#388e3c'
        },
        {
          text: 'เอกสารที่ส่งคืน',
          icon: <AssignmentReturn />,
          path: '/signer/returned',
          badge: stats?.rejectedCount || 0,
          description: 'เอกสารที่ส่งคืนเพื่อแก้ไข',
          color: '#ff9800'
        },
      ]
    },

    // Signature Management
    {
      title: 'จัดการลายเซ็น',
      color: '#7b1fa2',
      icon: <Edit />,
      items: [
        {
          text: 'ลายเซ็นของฉัน',
          icon: <Edit />,
          path: '/signer/signatures',
          description: 'จัดการลายเซ็นดิจิทัล',
          color: '#7b1fa2'
        },
        {
          text: 'อัปโหลดลายเซ็น',
          icon: <Assignment />,
          path: '/signer/signatures/upload',
          description: 'เพิ่มลายเซ็นใหม่',
          color: '#00796b'
        },
      ]
    },

    // History & Reports
    {
      title: 'ประวัติและรายงาน',
      color: '#5d4037',
      icon: <History />,
      items: [
        {
          text: 'ประวัติการลงนาม',
          icon: <History />,
          path: '/signer/history',
          description: 'ประวัติการลงนามทั้งหมด',
          color: '#5d4037'
        },
        {
          text: 'รายงานประจำเดือน',
          icon: <TrendingUp />,
          path: '/signer/reports/monthly',
          description: 'รายงานสถิติรายเดือน',
          color: '#1976d2'
        },
        {
          text: 'รายงานประสิทธิภาพ',
          icon: <Speed />,
          path: '/signer/reports/performance',
          description: 'วิเคราะห์ประสิทธิภาพการทำงาน',
          color: '#388e3c'
        },
      ]
    },

    // Notifications & Alerts
    {
      title: 'การแจ้งเตือน',
      color: '#e91e63',
      icon: <Notifications />,
      items: [
        {
          text: 'ศูนย์การแจ้งเตือน',
          icon: <Notifications />,
          path: '/signer/notifications',
          badge: 5, // This should come from notification state
          description: 'การแจ้งเตือนทั้งหมด',
          color: '#e91e63'
        },
        {
          text: 'การแจ้งเตือนด่วน',
          icon: <NotificationImportant />,
          path: '/signer/notifications/urgent',
          badge: 2,
          description: 'การแจ้งเตือนที่ต้องดำเนินการด่วน',
          color: '#d32f2f',
          urgent: true
        },
        {
          text: 'ตั้งค่าการแจ้งเตือน',
          icon: <Settings />,
          path: '/signer/notifications/settings',
          description: 'กำหนดการแจ้งเตือน',
          color: '#616161'
        },
      ]
    },

    // Profile & Settings
    {
      title: 'โปรไฟล์และตั้งค่า',
      color: '#37474f',
      icon: <Person />,
      items: [
        {
          text: 'โปรไฟล์ของฉัน',
          icon: <Person />,
          path: '/signer/profile',
          description: 'ข้อมูลส่วนตัว',
          color: '#37474f'
        },
        {
          text: 'ตั้งค่าระบบ',
          icon: <Settings />,
          path: '/signer/settings',
          description: 'การตั้งค่าต่างๆ',
          color: '#616161'
        },
      ]
    },
  ];

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const renderNavigationItem = (item: SignerNavigationItem) => (
    <ListItem key={item.path || item.text} disablePadding>
      <ListItemButton
        selected={item.path ? location.pathname === item.path : false}
        onClick={() => item.path && handleNavigation(item.path)}
        sx={{
          borderRadius: 1,
          mx: 1,
          mb: 0.5,
          minHeight: 48,
          position: 'relative',
          '&.Mui-selected': {
            bgcolor: `${item.color}15`,
            color: item.color,
            '& .MuiListItemIcon-root': {
              color: item.color,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 4,
              height: '60%',
              bgcolor: item.color,
              borderRadius: '0 2px 2px 0',
            }
          },
          '&:hover': {
            bgcolor: `${item.color}10`,
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {item.urgent ? (
            <Badge
              badgeContent="!"
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.6rem',
                  minWidth: 16,
                  height: 16,
                }
              }}
            >
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  fontSize: '0.9rem'
                }}
              >
                {item.text}
              </Typography>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <Chip
                  label={item.badge}
                  size="small"
                  color={item.urgent ? "error" : "primary"}
                  sx={{ 
                    height: 18, 
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    minWidth: 24
                  }}
                />
              )}
              {typeof item.badge === 'string' && (
                <Chip
                  label={item.badge}
                  size="small"
                  color="secondary"
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
              )}
            </Box>
          }
          secondary={
            item.description && (
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  lineHeight: 1.2
                }}
              >
                {item.description}
              </Typography>
            )
          }
        />
      </ListItemButton>
    </ListItem>
  );

  return (
    <Box>
      {/* Signer Profile Card */}
      <Box sx={{ p: 2, mb: 2 }}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
            }
          }}
        >
          <CardContent sx={{ pb: '16px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  mr: 2,
                  width: 48,
                  height: 48
                }}
              >
                <Edit />
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                >
                  ✍️ อาจารย์ผู้ลงนาม
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    opacity: 0.9,
                    fontSize: '0.85rem'
                  }}
                >
                  {user?.name || 'ผู้ลงนาม'}
                </Typography>
              </Box>
            </Box>

            {/* Quick Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stats?.pendingCount || 0}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  รอลงนาม
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stats?.completedThisMonth || 0}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  เสร็จแล้ว
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {stats?.totalSigned || 0}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  ทั้งหมด
                </Typography>
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  ความคืบหน้าวันนี้
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {Math.round(((stats?.completedThisMonth || 0) / Math.max((stats?.totalSigned || 1), 1)) * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.round(((stats?.completedThisMonth || 0) / Math.max((stats?.totalSigned || 1), 1)) * 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'rgba(255,255,255,0.8)',
                    borderRadius: 3,
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Navigation Sections */}
      <List sx={{ px: 1 }}>
        {navigationSections.map((section, sectionIndex) => (
          <React.Fragment key={section.title}>
            {/* Section Header */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => toggleSection(section.title)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: `${section.color}08`,
                  border: `1px solid ${section.color}20`,
                  '&:hover': { 
                    bgcolor: `${section.color}15`,
                    borderColor: `${section.color}40`
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: section.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    {section.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 'bold',
                        color: section.color,
                        fontSize: '0.9rem'
                      }}
                    >
                      {section.title}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        color: 'text.secondary',
                        fontSize: '0.7rem'
                      }}
                    >
                      {section.items.length} รายการ
                    </Typography>
                  }
                />
                {expandedSections.includes(section.title) ? 
                  <ExpandLess sx={{ color: section.color }} /> : 
                  <ExpandMore sx={{ color: section.color }} />
                }
              </ListItemButton>
            </ListItem>

            {/* Section Items */}
            <Collapse in={expandedSections.includes(section.title)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {section.items.map((item) => renderNavigationItem(item))}
              </List>
            </Collapse>

            {sectionIndex < navigationSections.length - 1 && (
              <Divider sx={{ my: 2, mx: 2 }} />
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Quick Actions for Signer */}
      <Box sx={{ p: 2, mt: 2 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'Sarabun, sans-serif',
            color: 'text.secondary',
            fontWeight: 'bold',
            mb: 1,
            display: 'block'
          }}
        >
          🚀 การดำเนินการด่วน
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <ListItemButton
            onClick={() => handleNavigation('/signer/pending')}
            sx={{
              borderRadius: 1,
              bgcolor: 'error.50',
              border: '1px solid',
              borderColor: 'error.200',
              '&:hover': { 
                bgcolor: 'error.100',
                borderColor: 'error.300'
              },
              py: 1
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Badge badgeContent={stats?.pendingCount || 0} color="error">
                <PendingActions color="error" fontSize="small" />
              </Badge>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold',
                    color: 'error.main'
                  }}
                >
                  ลงนามเอกสารด่วน
                </Typography>
              }
            />
          </ListItemButton>
          
          <ListItemButton
            onClick={() => handleNavigation('/signer/signatures')}
            sx={{
              borderRadius: 1,
              bgcolor: 'primary.50',
              border: '1px solid',
              borderColor: 'primary.200',
              '&:hover': { 
                bgcolor: 'primary.100',
                borderColor: 'primary.300'
              },
              py: 1
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Edit color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold',
                    color: 'primary.main'
                  }}
                >
                  จัดการลายเซ็น
                </Typography>
              }
            />
          </ListItemButton>
        </Box>
      </Box>

      {/* Today's Summary */}
      <Box sx={{ p: 2, mt: 1 }}>
        <Card sx={{ bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Today color="primary" sx={{ mr: 1, fontSize: '1.2rem' }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                สรุปวันนี้
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Sarabun, sans-serif',
                color: 'text.secondary',
                fontSize: '0.8rem',
                lineHeight: 1.4
              }}
            >
              • เอกสารรอลงนาม: {stats?.pendingCount || 0} ฉบับ<br/>
              • เอกสารด่วน: {stats?.urgentPending || 0} ฉบับ<br/>
              • เวลาเฉลี่ยต่อเอกสาร: {Math.round((stats?.averageProcessingTime || 0) / 60)} นาที
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SignerNavigationMenu;