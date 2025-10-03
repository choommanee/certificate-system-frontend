import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Toolbar,
  Tooltip,
  Avatar,
  Badge,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  FilterList,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Person,
  AdminPanelSettings,
  Work,
  School,
  Block,
  CheckCircle,
  Email,
  Phone,
  Assignment,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'staff' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login?: string;
  profile?: {
    phone?: string;
    department?: string;
    student_id?: string;
    position?: string;
  };
  certificate_count?: number;
}

const UserListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      first_name: 'ผู้ดูแล',
      last_name: 'ระบบ',
      role: 'admin',
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      last_login: '2024-03-20T10:30:00Z',
      profile: {
        phone: '02-123-4567',
        department: 'IT',
        position: 'System Administrator'
      },
      certificate_count: 0
    },
    {
      id: '2',
      username: 'staff001',
      email: 'staff@example.com',
      first_name: 'สมหญิง',
      last_name: 'ใจดี',
      role: 'staff',
      status: 'active',
      created_at: '2024-01-15T00:00:00Z',
      last_login: '2024-03-19T14:20:00Z',
      profile: {
        phone: '02-234-5678',
        department: 'เศรษฐศาสตร์',
        position: 'เจ้าหน้าที่'
      },
      certificate_count: 25
    },
    {
      id: '3',
      username: 'student001',
      email: 'somchai@example.com',
      first_name: 'สมชาย',
      last_name: 'ใจดี',
      role: 'student',
      status: 'active',
      created_at: '2024-02-01T00:00:00Z',
      last_login: '2024-03-18T09:15:00Z',
      profile: {
        phone: '08-123-4567',
        department: 'เศรษฐศาสตร์',
        student_id: '6401234567'
      },
      certificate_count: 3
    },
    {
      id: '4',
      username: 'student002',
      email: 'suda@example.com',
      first_name: 'สุดา',
      last_name: 'เก่งมาก',
      role: 'student',
      status: 'active',
      created_at: '2024-02-05T00:00:00Z',
      last_login: '2024-03-17T16:45:00Z',
      profile: {
        phone: '08-234-5678',
        department: 'เศรษฐศาสตร์',
        student_id: '6401234568'
      },
      certificate_count: 2
    },
    {
      id: '5',
      username: 'staff002',
      email: 'inactive@example.com',
      first_name: 'ไม่ใช้งาน',
      last_name: 'ชั่วคราว',
      role: 'staff',
      status: 'inactive',
      created_at: '2024-01-20T00:00:00Z',
      last_login: '2024-02-15T11:30:00Z',
      profile: {
        phone: '02-345-6789',
        department: 'เศรษฐศาสตร์',
        position: 'เจ้าหน้าที่'
      },
      certificate_count: 5
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'staff': return 'warning';
      case 'student': return 'info';
      default: return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'staff': return 'เจ้าหน้าที่';
      case 'student': return 'นักศึกษา';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'staff': return <Work />;
      case 'student': return <School />;
      default: return <Person />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'ใช้งานได้';
      case 'inactive': return 'ไม่ใช้งาน';
      case 'suspended': return 'ถูกระงับ';
      default: return status;
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleView = () => {
    if (selectedUser) {
      navigate(`/users/${selectedUser.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedUser) {
      navigate(`/users/${selectedUser.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => 
      prev.map(u => 
        u.id === userId 
          ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' as const }
          : u
      )
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkActivate = () => {
    setUsers(prev => 
      prev.map(u => 
        selectedUsers.includes(u.id)
          ? { ...u, status: 'active' as const }
          : u
      )
    );
    setSelectedUsers([]);
  };

  const handleBulkDeactivate = () => {
    setUsers(prev => 
      prev.map(u => 
        selectedUsers.includes(u.id)
          ? { ...u, status: 'inactive' as const }
          : u
      )
    );
    setSelectedUsers([]);
  };

  const canCreateUser = user?.role === 'admin';
  const canEditUser = user?.role === 'admin';
  const canDeleteUser = user?.role === 'admin';

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>กำลังโหลดข้อมูล...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              จัดการผู้ใช้งาน
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ดูและจัดการบัญชีผู้ใช้งานทั้งหมดในระบบ
            </Typography>
          </Box>
          {canCreateUser && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/users/create')}
              sx={{ borderRadius: 2 }}
            >
              เพิ่มผู้ใช้ใหม่
            </Button>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AdminPanelSettings color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {users.filter(u => u.role === 'admin').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ผู้ดูแลระบบ
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Work color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {users.filter(u => u.role === 'staff').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                เจ้าหน้าที่
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <School color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {users.filter(u => u.role === 'student').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                นักศึกษา
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {users.filter(u => u.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ใช้งานได้
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                placeholder="ค้นหาชื่อ, อีเมล, หรือชื่อผู้ใช้..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>บทบาท</InputLabel>
                <Select
                  value={roleFilter}
                  label="บทบาท"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
                  <MenuItem value="staff">เจ้าหน้าที่</MenuItem>
                  <MenuItem value="student">นักศึกษา</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={statusFilter}
                  label="สถานะ"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="active">ใช้งานได้</MenuItem>
                  <MenuItem value="inactive">ไม่ใช้งาน</MenuItem>
                  <MenuItem value="suspended">ถูกระงับ</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                sx={{ borderRadius: 2 }}
              >
                ตัวกรองเพิ่มเติม
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flex: 1 }}>
                เลือกแล้ว {selectedUsers.length} รายการ
              </Typography>
              <Button
                startIcon={<CheckCircle />}
                onClick={handleBulkActivate}
                color="success"
                variant="contained"
                sx={{ mr: 1 }}
              >
                เปิดใช้งาน
              </Button>
              <Button
                startIcon={<Block />}
                onClick={handleBulkDeactivate}
                color="warning"
                variant="outlined"
                sx={{ mr: 1 }}
              >
                ปิดใช้งาน
              </Button>
              {canDeleteUser && (
                <Button
                  startIcon={<Delete />}
                  color="error"
                  variant="outlined"
                >
                  ลบ
                </Button>
              )}
            </Toolbar>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < paginatedUsers.length}
                      checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>ผู้ใช้งาน</TableCell>
                  <TableCell>บทบาท</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>เข้าสู่ระบบล่าสุด</TableCell>
                  <TableCell>เกียรติบัตร</TableCell>
                  <TableCell align="center">การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((userData) => (
                  <TableRow key={userData.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(userData.id)}
                        onChange={() => handleSelectUser(userData.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {userData.first_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {userData.first_name} {userData.last_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {userData.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{userData.username}
                          </Typography>
                          {userData.profile?.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <Phone sx={{ fontSize: 12 }} />
                              <Typography variant="caption" color="text.secondary">
                                {userData.profile.phone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(userData.role)}
                        label={getRoleText(userData.role)}
                        color={getRoleColor(userData.role) as any}
                        size="small"
                        variant="outlined"
                      />
                      {userData.profile?.department && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {userData.profile.department}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={getStatusText(userData.status)}
                          color={getStatusColor(userData.status) as any}
                          size="small"
                          variant="outlined"
                        />
                        {canEditUser && (
                          <Switch
                            checked={userData.status === 'active'}
                            onChange={() => handleToggleStatus(userData.id)}
                            size="small"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {userData.last_login ? (
                        <Box>
                          <Typography variant="body2">
                            {new Date(userData.last_login).toLocaleDateString('th-TH')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(userData.last_login).toLocaleTimeString('th-TH')}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          ยังไม่เคยเข้าสู่ระบบ
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={userData.certificate_count} color="primary">
                        <Assignment />
                      </Badge>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ตัวเลือกเพิ่มเติม">
                        <IconButton
                          onClick={(e) => handleMenuClick(e, userData)}
                          size="small"
                        >
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuList>
            <MenuItemComponent onClick={handleView}>
              <ListItemIcon>
                <Visibility />
              </ListItemIcon>
              <ListItemText>ดูรายละเอียด</ListItemText>
            </MenuItemComponent>
            {canEditUser && (
              <MenuItemComponent onClick={handleEdit}>
                <ListItemIcon>
                  <Edit />
                </ListItemIcon>
                <ListItemText>แก้ไข</ListItemText>
              </MenuItemComponent>
            )}
            <MenuItemComponent onClick={() => window.open(`mailto:${selectedUser?.email}`)}>
              <ListItemIcon>
                <Email />
              </ListItemIcon>
              <ListItemText>ส่งอีเมล</ListItemText>
            </MenuItemComponent>
            {canDeleteUser && selectedUser?.id !== user?.id && (
              <MenuItemComponent onClick={handleDelete} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <Delete color="error" />
                </ListItemIcon>
                <ListItemText>ลบ</ListItemText>
              </MenuItemComponent>
            )}
          </MenuList>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
          <DialogContent>
            <Typography>
              คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "{selectedUser?.first_name} {selectedUser?.last_name}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              การดำเนินการนี้ไม่สามารถยกเลิกได้ และจะลบข้อมูลทั้งหมดของผู้ใช้นี้
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              ลบ
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default UserListPage;