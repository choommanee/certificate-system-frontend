import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,

  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  Description,
  People,
  Settings,
  Logout,
  Notifications,
  AccountCircle,
  School,
  Search,
  Verified,
  Category,
  CloudUpload,
  Analytics,
  Folder,
  CheckCircleOutline,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItemType {
  text: string;
  icon: React.ReactElement;
  path: string;
  description: string;
  badge?: number;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };



  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettings = () => {
    navigate('/settings');
    handleClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  // Get user role name (support both string and object format)
  const userRole = typeof user?.role === 'string' ? user?.role : user?.role?.name?.toLowerCase();

  const getRoleInfo = () => {
    switch (userRole) {
      case 'student':
        return {
          title: 'นักศึกษา',
          subtitle: 'Student Portal',
          bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          textColor: '#ffffff',
          icon: '🎓'
        };
      case 'staff':
        return {
          title: 'เจ้าหน้าที่',
          subtitle: 'Staff Portal',
          bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          textColor: '#ffffff',
          icon: '👨‍💼'
        };
      case 'admin':
        return {
          title: 'ผู้ดูแลระบบ',
          subtitle: 'Admin Portal',
          bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          textColor: '#ffffff',
          icon: '⚙️'
        };
      default:
        return {
          title: 'ผู้ใช้งาน',
          subtitle: 'User Portal',
          bgColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          textColor: '#333333',
          icon: '👤'
        };
    }
  };

  const getMenuItems = (): MenuItemType[] => {
    const baseItems = [
      {
        text: 'หน้าแรก',
        icon: <Dashboard />,
        path: '/dashboard',
        description: 'ภาพรวมและสถานะ'
      },
    ];

    if (userRole === 'student') {
      return [
        ...baseItems,
        { 
          text: 'เกียรติบัตรของฉัน', 
          icon: <Assignment />, 
          path: '/certificates',
          description: 'เกียรติบัตรที่ได้รับ',
          badge: 3
        },
        { 
          text: 'ค้นหาขั้นสูง', 
          icon: <Search />, 
          path: '/search',
          description: 'ค้นหาเกียรติบัตรและข้อมูล'
        },
        { 
          text: 'ตรวจสอบเกียรติบัตร', 
          icon: <Verified />, 
          path: '/verify',
          description: 'ตรวจสอบความถูกต้อง'
        },
      ];
    }

    if (userRole === 'staff') {
      return [
        ...baseItems,
        {
          text: 'รอการอนุมัติ',
          icon: <CheckCircleOutline />,
          path: '/approvals/pending',
          description: 'พิจารณาอนุมัติเกียรติบัตร',
          badge: 3
        },
        {
          text: 'จัดการเกียรติบัตร',
          icon: <Assignment />,
          path: '/certificates',
          description: 'จัดการเกียรติบัตรทั้งหมด'
        },
        {
          text: 'แม่แบบเกียรติบัตร',
          icon: <Description />,
          path: '/templates',
          description: 'จัดการเทมเพลต'
        },
        {
          text: 'ออกแบบเกียรติบัตร',
          icon: <Category />,
          path: '/designer',
          description: 'สร้างและแก้ไขเกียรติบัตร'
        },
        {
          text: 'การดำเนินการแบบกลุ่ม',
          icon: <CloudUpload />,
          path: '/bulk-operations',
          description: 'นำเข้าและสร้างเกียรติบัตรจำนวนมาก'
        },
        {
          text: 'รายงานและสถิติ',
          icon: <Analytics />,
          path: '/analytics',
          description: 'ดูสถิติและสร้างรายงาน'
        },
        {
          text: 'ค้นหาขั้นสูง',
          icon: <Search />,
          path: '/search',
          description: 'ค้นหาเกียรติบัตรและข้อมูล'
        },
        {
          text: 'จัดการไฟล์',
          icon: <Folder />,
          path: '/files',
          description: 'จัดการไฟล์และรูปภาพ'
        },
        {
          text: 'จัดการนักศึกษา',
          icon: <People />,
          path: '/students',
          description: 'ข้อมูลนักศึกษา'
        },
      ];
    }

    if (userRole === 'admin') {
      return [
        ...baseItems,
        {
          text: 'รอการอนุมัติ',
          icon: <CheckCircleOutline />,
          path: '/approvals/pending',
          description: 'พิจารณาอนุมัติเกียรติบัตร',
          badge: 5
        },
        {
          text: 'จัดการเกียรติบัตร',
          icon: <Assignment />,
          path: '/certificates',
          description: 'จัดการเกียรติบัตรทั้งหมด'
        },
        { 
          text: 'แม่แบบเกียรติบัตร', 
          icon: <Description />, 
          path: '/templates',
          description: 'จัดการเทมเพลต'
        },
        { 
          text: 'ออกแบบเกียรติบัตร', 
          icon: <Category />, 
          path: '/designer',
          description: 'สร้างและแก้ไขเกียรติบัตร'
        },
        { 
          text: 'การดำเนินการแบบกลุ่ม', 
          icon: <CloudUpload />, 
          path: '/bulk-operations',
          description: 'นำเข้าและสร้างเกียรติบัตรจำนวนมาก'
        },
        { 
          text: 'รายงานและสถิติ', 
          icon: <Analytics />, 
          path: '/analytics',
          description: 'ดูสถิติและสร้างรายงาน'
        },
        { 
          text: 'ค้นหาขั้นสูง', 
          icon: <Search />, 
          path: '/search',
          description: 'ค้นหาเกียรติบัตรและข้อมูล'
        },
        { 
          text: 'จัดการไฟล์', 
          icon: <Folder />, 
          path: '/files',
          description: 'จัดการไฟล์และรูปภาพ'
        },
        { 
          text: 'จัดการผู้ใช้', 
          icon: <People />, 
          path: '/users',
          description: 'จัดการบัญชีผู้ใช้'
        },
        { 
          text: 'ตั้งค่าระบบ', 
          icon: <Settings />, 
          path: '/settings',
          description: 'การตั้งค่าทั่วไป'
        },
      ];
    }

    return baseItems;
  };

  const roleInfo = getRoleInfo();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Role Header */}
      <Box
        sx={{
          background: roleInfo.bgColor,
          color: roleInfo.textColor,
          p: 3,
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}
          >
            {roleInfo.icon}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
              {roleInfo.title}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontFamily: 'Inter, sans-serif' }}>
              {roleInfo.subtitle}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List sx={{ gap: 1 }}>
          {getMenuItems().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '12px',
                    px: 2,
                    py: 1.5,
                    backgroundColor: isActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    border: isActive ? '2px solid #1976d2' : '2px solid transparent',
                    '&:hover': {
                      backgroundColor: isActive ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#1976d2' : '#666',
                      minWidth: 40
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={isActive ? 600 : 500}
                      sx={{
                        color: isActive ? '#1976d2' : '#333',
                        fontFamily: 'Sarabun, sans-serif'
                      }}
                    >
                      {item.text}
                    </Typography>
                    {item.description && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: isActive ? '#1976d2' : '#666',
                          opacity: 0.8,
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.75rem'
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}
                  </Box>
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        backgroundColor: isActive ? '#1976d2' : '#f44336',
                        color: 'white',
                        fontSize: '0.75rem',
                        height: '20px',
                        minWidth: '20px'
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Public Verification Link */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <ListItemButton
          onClick={() => navigate('/verify')}
          sx={{
            borderRadius: '12px',
            backgroundColor: 'rgba(76, 175, 80, 0.08)',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            mb: 2,
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 0.12)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 8px rgba(76, 175, 80, 0.2)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <ListItemIcon sx={{ color: '#4caf50', minWidth: 40 }}>
            <Verified />
          </ListItemIcon>
          <Box>
            <Typography variant="body2" fontWeight="600" sx={{ color: '#4caf50', fontFamily: 'Sarabun, sans-serif' }}>
              ตรวจสอบเกียรติบัตร
            </Typography>
            <Typography variant="caption" sx={{ color: '#4caf50', opacity: 0.8, fontFamily: 'Inter, sans-serif' }}>
              สำหรับบุคคลทั่วไป
            </Typography>
          </Box>
        </ListItemButton>

        <Paper
          sx={{
            p: 2,
            backgroundColor: '#f5f5f5',
            borderRadius: '12px',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'Sarabun, sans-serif', mb: 0.5 }}>
            ต้องการความช่วยเหลือ?
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Inter, sans-serif' }}>
            กด F1 หรือติดต่อ IT Support
          </Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo and Title */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <School sx={{ color: '#1976d2', fontSize: 32, mr: 2 }} />
            <Box>
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  color: '#1976d2',
                  fontWeight: 'bold',
                  fontFamily: 'Sarabun, sans-serif',
                  fontSize: '1.25rem'
                }}
              >
                ระบบเกียรติบัตรออนไลน์
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#666',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.75rem'
                }}
              >
                คณะเศรษฐศาสตร์ มหาวิทยาลัยธรรมศาสตร์
              </Typography>
            </Box>
          </Box>
          
          {/* Right side actions */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* Notifications */}
            <IconButton 
              sx={{ 
                color: '#666',
                backgroundColor: 'rgba(0,0,0,0.04)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.08)'
                }
              }}
            >
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={handleClick}
                sx={{
                  p: 0.5,
                  border: '2px solid transparent',
                  '&:hover': {
                    border: '2px solid #1976d2'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    backgroundColor: roleInfo.bgColor.includes('gradient') ? '#1976d2' : roleInfo.bgColor,
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {user?.profile?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: '1px solid #e0e0e0',
                    minWidth: 200
                  }
                }}
              >
                {/* User Info Header */}
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                    {user?.profile?.firstName || user?.username || 'ผู้ใช้งาน'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Inter, sans-serif' }}>
                    {user?.email || 'user@example.com'}
                  </Typography>
                  <Chip 
                    label={roleInfo.title} 
                    size="small" 
                    sx={{ 
                      mt: 1,
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: '#1976d2',
                      fontSize: '0.75rem'
                    }} 
                  />
                </Box>
                
                <MenuItem 
                  onClick={handleProfile}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  <AccountCircle sx={{ mr: 2, color: '#666' }} />
                  <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>ข้อมูลส่วนตัว</Typography>
                </MenuItem>
                <MenuItem 
                  onClick={handleSettings}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                >
                  <Settings sx={{ mr: 2, color: '#666' }} />
                  <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>ตั้งค่า</Typography>
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    color: '#f44336',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.04)'
                    }
                  }}
                >
                  <Logout sx={{ mr: 2 }} />
                  <Typography sx={{ fontFamily: 'Sarabun, sans-serif' }}>ออกจากระบบ</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
