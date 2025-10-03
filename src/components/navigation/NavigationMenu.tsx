import React from 'react';
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
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  Description,
  People,
  Settings,
  Analytics,
  Search,
  CloudUpload,
  Verified,
  Folder,
  Category,
  Event as ActivityIcon,
  Add as AddIcon,
  AutoAwesome as AutoIcon,
  Send as SendIcon,
  Email as EmailIcon,
  Draw as SignatureIcon,
  History as HistoryIcon,
  QrCode as QrCodeIcon,
  GetApp as DownloadIcon,
  Person as PersonIcon,
  ExpandLess,
  ExpandMore,
  Security as AuditIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationItem {
  text: string;
  icon: React.ReactElement;
  path?: string;
  roles: string[];
  divider?: boolean;
  children?: NavigationItem[];
  badge?: string;
  description?: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
  roles: string[];
  color?: string;
}

const NavigationMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['main']);

  const navigationSections: NavigationSection[] = [
    // Dashboard & Overview
    {
      title: 'Dashboard & Overview',
      roles: ['student', 'staff', 'signer', 'admin'],
      color: '#1976d2',
      items: [
        {
          text: 'Dashboard',
          icon: <Dashboard />,
          path: '/dashboard',
          roles: ['student', 'staff', 'signer', 'admin'],
          description: 'ภาพรวมระบบ'
        },
        {
          text: 'Analytics',
          icon: <Analytics />,
          path: '/analytics',
          roles: ['staff', 'admin'],
          description: 'รายงานและสถิติ'
        },
      ]
    },

    // Activity Management (Admin & Staff)
    {
      title: 'Activity Management',
      roles: ['staff', 'admin'],
      color: '#388e3c',
      items: [
        {
          text: 'Activities',
          icon: <ActivityIcon />,
          path: '/activities',
          roles: ['staff', 'admin'],
          description: 'จัดการกิจกรรม'
        },
        {
          text: 'Create Activity',
          icon: <AddIcon />,
          path: '/activities/create',
          roles: ['staff', 'admin'],
          description: 'สร้างกิจกรรมใหม่'
        },
        {
          text: 'Import Data',
          icon: <CloudUpload />,
          path: '/bulk-operations',
          roles: ['staff', 'admin'],
          description: 'นำเข้าข้อมูล CSV/Excel'
        },
      ]
    },

    // Certificate Management
    {
      title: 'Certificate Management',
      roles: ['student', 'staff', 'signer', 'admin'],
      color: '#f57c00',
      items: [
        {
          text: 'My Certificates',
          icon: <Assignment />,
          path: '/certificates',
          roles: ['student'],
          description: 'เกียรติบัตรของฉัน'
        },
        {
          text: 'Certificates',
          icon: <Assignment />,
          path: '/certificates',
          roles: ['staff', 'admin'],
          description: 'รายการเกียรติบัตร'
        },
        {
          text: 'Pending Certificates',
          icon: <Assignment />,
          path: '/certificates?status=pending',
          roles: ['signer'],
          description: 'เกียรติบัตรรอลงนาม',
          badge: 'New'
        },
        {
          text: 'Auto Generation',
          icon: <AutoIcon />,
          path: '/certificates/generate',
          roles: ['staff', 'admin'],
          description: 'สร้างเกียรติบัตรอัตโนมัติ'
        },
        {
          text: 'Distribution',
          icon: <SendIcon />,
          path: '/distribution',
          roles: ['staff', 'admin'],
          description: 'จัดการการส่งออก'
        },
        {
          text: 'Email Management',
          icon: <EmailIcon />,
          path: '/distribution/email',
          roles: ['staff', 'admin'],
          description: 'จัดการอีเมล'
        },
      ]
    },

    // Template & Design
    {
      title: 'Template & Design',
      roles: ['staff', 'admin'],
      color: '#7b1fa2',
      items: [
        {
          text: 'Templates',
          icon: <Description />,
          path: '/templates',
          roles: ['staff', 'admin'],
          description: 'รายการเทมเพลต'
        },
        {
          text: 'Template Designer',
          icon: <Category />,
          path: '/designer',
          roles: ['staff', 'admin'],
          description: 'ออกแบบเทมเพลต'
        },
      ]
    },

    // Signatory Management
    {
      title: 'Signatory Management',
      roles: ['signer', 'admin'],
      color: '#d32f2f',
      items: [
        {
          text: 'Pending Documents',
          icon: <Assignment />,
          path: '/signer/pending',
          roles: ['signer'],
          description: 'เอกสารรอลงนาม',
          badge: 'New'
        },
        {
          text: 'Sign Document',
          icon: <SignatureIcon />,
          path: '/signer/sign',
          roles: ['signer'],
          description: 'ลงนามเอกสาร'
        },
        {
          text: 'My Signatures',
          icon: <SignatureIcon />,
          path: '/signatures',
          roles: ['signer'],
          description: 'ลายเซ็นของฉัน'
        },
        {
          text: 'Signatories',
          icon: <SignatureIcon />,
          path: '/signatories',
          roles: ['admin'],
          description: 'จัดการผู้ลงนาม'
        },
        {
          text: 'Signature History',
          icon: <HistoryIcon />,
          path: '/signatures/history',
          roles: ['signer', 'admin'],
          description: 'ประวัติการลงนาม'
        },
      ]
    },

    // Verification & Security
    {
      title: 'Verification & Security',
      roles: ['student', 'staff', 'admin'],
      color: '#00796b',
      items: [
        {
          text: 'Verify Certificate',
          icon: <Verified />,
          path: '/verify',
          roles: ['student', 'staff', 'admin'],
          description: 'ตรวจสอบเกียรติบัตร'
        },
        {
          text: 'Public Verification',
          icon: <Verified />,
          path: '/public-verify',
          roles: ['student', 'staff', 'admin'],
          description: 'ตรวจสอบสาธารณะ'
        },
        {
          text: 'Verification History',
          icon: <HistoryIcon />,
          path: '/verification-history',
          roles: ['staff', 'admin'],
          description: 'ประวัติการตรวจสอบ'
        },
        {
          text: 'QR Code Management',
          icon: <QrCodeIcon />,
          path: '/qr-management',
          roles: ['staff', 'admin'],
          description: 'จัดการ QR Code'
        },
      ]
    },

    // Tools & Utilities
    {
      title: 'Tools & Utilities',
      roles: ['student', 'staff', 'admin'],
      color: '#616161',
      items: [
        {
          text: 'Advanced Search',
          icon: <Search />,
          path: '/search',
          roles: ['student', 'staff', 'admin'],
          description: 'ค้นหาขั้นสูง'
        },
        {
          text: 'File Manager',
          icon: <Folder />,
          path: '/files',
          roles: ['staff', 'admin'],
          description: 'จัดการไฟล์'
        },
        {
          text: 'Download Center',
          icon: <DownloadIcon />,
          path: '/downloads',
          roles: ['student'],
          description: 'ดาวน์โหลดเกียรติบัตร'
        },
      ]
    },

    // System Management (Admin only)
    {
      title: 'System Management',
      roles: ['admin'],
      color: '#e65100',
      items: [
        {
          text: 'Users',
          icon: <People />,
          path: '/users',
          roles: ['admin'],
          description: 'จัดการผู้ใช้'
        },
        {
          text: 'Audit Logs',
          icon: <AuditIcon />,
          path: '/audit-logs',
          roles: ['admin'],
          description: 'บันทึกการใช้งานระบบ'
        },
        {
          text: 'System Settings',
          icon: <Settings />,
          path: '/settings',
          roles: ['admin'],
          description: 'ตั้งค่าระบบ'
        },
      ]
    },

    // Profile Section
    {
      title: 'Profile',
      roles: ['student', 'staff', 'signer', 'admin'],
      color: '#5d4037',
      items: [
        {
          text: 'My Profile',
          icon: <PersonIcon />,
          path: '/profile',
          roles: ['student', 'staff', 'signer', 'admin'],
          description: 'โปรไฟล์ของฉัน'
        },
      ]
    },
  ];

  // Filter sections based on user role
  const filteredSections = navigationSections.filter(section =>
    user?.role && section.roles.includes(user.role)
  ).map(section => ({
    ...section,
    items: section.items.filter(item =>
      user?.role && item.roles.includes(user.role)
    )
  })).filter(section => section.items.length > 0);

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

  const renderNavigationItem = (item: NavigationItem, isChild = false) => (
    <ListItem key={item.path || item.text} disablePadding sx={{ pl: isChild ? 2 : 0 }}>
      <ListItemButton
        selected={item.path ? location.pathname === item.path : false}
        onClick={() => item.path && handleNavigation(item.path)}
        sx={{
          borderRadius: 1,
          mx: 1,
          mb: 0.5,
          minHeight: 48,
          '&.Mui-selected': {
            bgcolor: 'primary.100',
            color: 'primary.main',
            '& .MuiListItemIcon-root': {
              color: 'primary.main',
            },
          },
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Sarabun, sans-serif',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
              >
                {item.text}
              </Typography>
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  color="error"
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
                  fontSize: '0.7rem'
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
      {/* User Role Badge */}
      <Box sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: user?.role === 'admin' ? 'linear-gradient(135deg, #e65100 0%, #ff9800 100%)' :
                       user?.role === 'staff' ? 'linear-gradient(135deg, #388e3c 0%, #4caf50 100%)' :
                       user?.role === 'signer' ? 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)' :
                       'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 'bold',
              mb: 0.5
            }}
          >
            {user?.role === 'admin' ? '👑 ผู้ดูแลระบบ' :
             user?.role === 'staff' ? '👨‍💼 เจ้าหน้าที่' :
             user?.role === 'signer' ? '✍️ อาจารย์ผู้ลงนาม' :
             '🎓 นักศึกษา'}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'Sarabun, sans-serif',
              opacity: 0.9,
              fontSize: '0.7rem'
            }}
          >
            {user?.first_name} {user?.last_name}
          </Typography>
        </Box>
      </Box>

      {/* Navigation Sections */}
      <List sx={{ px: 1 }}>
        {filteredSections.map((section, sectionIndex) => (
          <React.Fragment key={section.title}>
            {/* Section Header */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => toggleSection(section.title)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: `${section.color}10`,
                  '&:hover': { bgcolor: `${section.color}20` },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: section.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 'bold' }}
                    >
                      {section.items.length}
                    </Typography>
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily: 'Sarabun, sans-serif',
                        fontWeight: 'bold',
                        color: section.color
                      }}
                    >
                      {section.title}
                    </Typography>
                  }
                />
                {expandedSections.includes(section.title) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            {/* Section Items */}
            <Collapse in={expandedSections.includes(section.title)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {section.items.map((item) => renderNavigationItem(item))}
              </List>
            </Collapse>

            {sectionIndex < filteredSections.length - 1 && (
              <Divider sx={{ my: 1, mx: 2 }} />
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Quick Actions */}
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
          🚀 QUICK ACTIONS
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {user?.role === 'student' && (
            <ListItemButton
              onClick={() => handleNavigation('/verify')}
              sx={{
                borderRadius: 1,
                bgcolor: 'success.50',
                '&:hover': { bgcolor: 'success.100' },
                py: 1
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Verified color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                    ตรวจสอบเกียรติบัตร
                  </Typography>
                }
              />
            </ListItemButton>
          )}
          
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <ListItemButton
              onClick={() => handleNavigation('/certificates/generate')}
              sx={{
                borderRadius: 1,
                bgcolor: 'warning.50',
                '&:hover': { bgcolor: 'warning.100' },
                py: 1
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <AutoIcon color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                    สร้างเกียรติบัตร
                  </Typography>
                }
              />
            </ListItemButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NavigationMenu;