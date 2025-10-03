import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  ExitToApp,
  Settings,
  Person,
  Edit,
  School,
  NotificationImportant,
  Speed,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SignerNavigationMenu from './SignerNavigationMenu';
import { useSigner } from '../../hooks/useSigner';

const drawerWidth = 320;

interface SignerDashboardLayoutProps {
  children: React.ReactNode;
}

const SignerDashboardLayout: React.FC<SignerDashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { stats, loading } = useSigner();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/signer/profile');
    handleClose();
  };

  const handleSettings = () => {
    navigate('/signer/settings');
    handleClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa' }}>
      {/* Signer Navigation Menu */}
      <SignerNavigationMenu />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 20px rgba(211, 47, 47, 0.3)',
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important', px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo and Title */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Edit sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                noWrap 
                component="div" 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  fontFamily: 'Sarabun, sans-serif',
                  fontSize: '1.4rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                ระบบลงนามเกียรติบัตร
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontFamily: 'Sarabun, sans-serif',
                  fontSize: '0.9rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                สำหรับอาจารย์ผู้ลงนาม • คณะเศรษฐศาสตร์
              </Typography>
            </Box>
          </Box>
          
          {/* Stats Summary */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mr: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {stats?.pendingCount || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  รอลงนาม
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {stats?.completedThisMonth || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  เสร็จแล้ว
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {Math.round((stats?.averageProcessingTime || 0) / 60)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  นาที/ฉบับ
                </Typography>
              </Box>
            </Box>
          )}
          
          {/* Right side actions */}
          <Box display="flex" alignItems="center" gap={2}>
            {/* Urgent Notifications */}
            <IconButton 
              onClick={() => navigate('/signer/notifications/urgent')}
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <Badge 
                badgeContent={stats?.urgentPending || 0} 
                color="warning"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#ff9800',
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              >
                <NotificationImportant />
              </Badge>
            </IconButton>

            {/* Regular Notifications */}
            <IconButton 
              onClick={() => navigate('/signer/notifications')}
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <Badge badgeContent={5} color="info">
                <Notifications />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={handleClick}
                sx={{
                  p: 0.5,
                  border: '2px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    border: '2px solid rgba(255,255,255,0.5)',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 44, 
                    height: 44,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <Edit />
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
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1,
                      borderRadius: 3,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                      border: '1px solid #e0e0e0',
                      minWidth: 280,
                      overflow: 'hidden'
                    }
                  }
                }}
              >
                {/* User Info Header */}
                <Box 
                  sx={{ 
                    p: 3, 
                    background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                    color: 'white'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        mr: 2,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        border: '2px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      <Edit />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                        {user?.name || 'อาจารย์ผู้ลงนาม'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Sarabun, sans-serif' }}>
                        {user?.email || 'signer@example.com'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip 
                      icon={<Speed sx={{ fontSize: '16px !important' }} />}
                      label={`${stats?.totalSigned || 0} ลงนามแล้ว`}
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.75rem',
                        '& .MuiChip-icon': { color: 'white' }
                      }} 
                    />
                    <Chip 
                      icon={<TrendingUp sx={{ fontSize: '16px !important' }} />}
                      label={`${Math.round(((stats?.completedThisMonth || 0) / Math.max((stats?.totalSigned || 1), 1)) * 100)}% เดือนนี้`}
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.75rem',
                        '& .MuiChip-icon': { color: 'white' }
                      }} 
                    />
                  </Box>
                </Box>
                
                <MenuItem 
                  onClick={handleProfile}
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.04)'
                    }
                  }}
                >
                  <Person sx={{ mr: 2, color: '#d32f2f' }} />
                  <Box>
                    <Typography sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 500 }}>
                      ข้อมูลส่วนตัว
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Sarabun, sans-serif' }}>
                      จัดการโปรไฟล์และลายเซ็น
                    </Typography>
                  </Box>
                </MenuItem>
                
                <MenuItem 
                  onClick={handleSettings}
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.04)'
                    }
                  }}
                >
                  <Settings sx={{ mr: 2, color: '#d32f2f' }} />
                  <Box>
                    <Typography sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 500 }}>
                      ตั้งค่า
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Sarabun, sans-serif' }}>
                      การแจ้งเตือนและความปลอดภัย
                    </Typography>
                  </Box>
                </MenuItem>
                
                <Divider sx={{ my: 1 }} />
                
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    py: 2,
                    px: 3,
                    color: '#f44336',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.04)'
                    }
                  }}
                >
                  <ExitToApp sx={{ mr: 2 }} />
                  <Box>
                    <Typography sx={{ fontFamily: 'Sarabun, sans-serif', fontWeight: 500 }}>
                      ออกจากระบบ
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontFamily: 'Sarabun, sans-serif' }}>
                      ออกจากระบบอย่างปลอดภัย
                    </Typography>
                  </Box>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Navigation Drawer */}
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
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#fafafa'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#fafafa',
              borderRight: '1px solid #e0e0e0'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#f8f9fa'
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important' }} />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default SignerDashboardLayout;