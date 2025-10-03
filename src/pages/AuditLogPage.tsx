import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface AuditLogStats {
  totalLogs: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
  topResources: Array<{ resourceType: string; count: number }>;
}

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats>({
    totalLogs: 0,
    uniqueUsers: 0,
    topActions: [],
    topResources: [],
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalRows, setTotalRows] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  // Available filter options
  const actionTypes = [
    'all',
    'create',
    'update',
    'delete',
    'login',
    'logout',
    'download',
    'upload',
    'approve',
    'reject',
    'send_email',
  ];

  const resourceTypes = [
    'all',
    'user',
    'certificate',
    'template',
    'activity',
    'role',
    'signature',
    'qr_code',
  ];

  useEffect(() => {
    loadAuditLogs();
    loadStats();
  }, [page, rowsPerPage, searchTerm, actionFilter, resourceTypeFilter, userFilter, dateFrom, dateTo]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          userId: 'user-1',
          userName: 'Admin User',
          userRole: 'admin',
          action: 'create',
          resourceType: 'certificate',
          resourceId: 'cert-001',
          resourceName: 'Workshop Certificate',
          details: {
            recipientName: 'สมชาย ใจดี',
            activityName: 'Workshop AI 2024',
          },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          userId: 'user-2',
          userName: 'Staff User',
          userRole: 'staff',
          action: 'update',
          resourceType: 'template',
          resourceId: 'template-001',
          resourceName: 'Modern Template',
          details: {
            changes: ['Updated background color', 'Changed font size'],
          },
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          createdAt: '2024-01-15T11:00:00Z',
        },
        {
          id: '3',
          userId: 'user-1',
          userName: 'Admin User',
          userRole: 'admin',
          action: 'delete',
          resourceType: 'user',
          resourceId: 'user-999',
          resourceName: 'Deleted User',
          details: {
            reason: 'Account requested deletion',
          },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          createdAt: '2024-01-15T14:30:00Z',
        },
        {
          id: '4',
          userId: 'user-3',
          userName: 'Signer User',
          userRole: 'signer',
          action: 'approve',
          resourceType: 'certificate',
          resourceId: 'cert-002',
          resourceName: 'Seminar Certificate',
          details: {
            signatureName: 'ผศ.ดร.สมชาย วิชาการ',
          },
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0...',
          createdAt: '2024-01-15T15:00:00Z',
        },
        {
          id: '5',
          userId: 'user-2',
          userName: 'Staff User',
          userRole: 'staff',
          action: 'send_email',
          resourceType: 'certificate',
          resourceId: 'cert-001',
          resourceName: 'Workshop Certificate',
          details: {
            recipientEmail: 'somchai@example.com',
            emailTemplate: 'Certificate Delivery',
          },
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          createdAt: '2024-01-15T16:00:00Z',
        },
      ];

      setLogs(mockLogs);
      setTotalRows(mockLogs.length);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // TODO: Replace with actual API call
      const mockStats: AuditLogStats = {
        totalLogs: 1250,
        uniqueUsers: 45,
        topActions: [
          { action: 'create', count: 450 },
          { action: 'update', count: 320 },
          { action: 'download', count: 280 },
          { action: 'send_email', count: 150 },
          { action: 'delete', count: 50 },
        ],
        topResources: [
          { resourceType: 'certificate', count: 600 },
          { resourceType: 'template', count: 250 },
          { resourceType: 'user', count: 200 },
          { resourceType: 'activity', count: 150 },
          { resourceType: 'qr_code', count: 50 },
        ],
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setOpenDetailDialog(true);
  };

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      // TODO: Implement actual export
      console.log('Exporting audit logs as:', format);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getActionColor = (action: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    const colorMap: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' } = {
      create: 'success',
      update: 'info',
      delete: 'error',
      login: 'primary',
      logout: 'default',
      download: 'secondary',
      upload: 'secondary',
      approve: 'success',
      reject: 'error',
      send_email: 'info',
    };
    return colorMap[action] || 'default';
  };

  const getRoleColor = (role: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    const colorMap: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' } = {
      admin: 'error',
      staff: 'primary',
      signer: 'secondary',
      student: 'info',
    };
    return colorMap[role] || 'default';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            📋 Audit Logs
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('csv')}>
              CSV
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('excel')}>
              Excel
            </Button>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => handleExport('pdf')}>
              PDF
            </Button>
          </Stack>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <HistoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {stats.totalLogs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Logs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PersonIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {stats.uniqueUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unique Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Top Actions
                </Typography>
                {stats.topActions.slice(0, 3).map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.action}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.count}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Top Resources
                </Typography>
                {stats.topResources.slice(0, 3).map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.resourceType}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.count}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} label="Action">
                  {actionTypes.map((action) => (
                    <MenuItem key={action} value={action}>
                      {action}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Resource Type</InputLabel>
                <Select
                  value={resourceTypeFilter}
                  onChange={(e) => setResourceTypeFilter(e.target.value)}
                  label="Resource Type"
                >
                  {resourceTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Date From"
                value={dateFrom}
                onChange={(newValue) => setDateFrom(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Date To"
                value={dateTo}
                onChange={(newValue) => setDateTo(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} md={1}>
              <Tooltip title="Clear Filters">
                <IconButton
                  onClick={() => {
                    setSearchTerm('');
                    setActionFilter('all');
                    setResourceTypeFilter('all');
                    setUserFilter('');
                    setDateFrom(null);
                    setDateTo(null);
                  }}
                >
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>

        {/* Audit Logs Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Resource Type</strong></TableCell>
                <TableCell><strong>Resource</strong></TableCell>
                <TableCell><strong>IP Address</strong></TableCell>
                <TableCell align="center"><strong>Details</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      No audit logs found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.createdAt).toLocaleDateString('th-TH')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.createdAt).toLocaleTimeString('th-TH')}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell>
                      <Chip label={log.userRole} color={getRoleColor(log.userRole)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={log.action} color={getActionColor(log.action)} size="small" />
                    </TableCell>
                    <TableCell>{log.resourceType}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{log.resourceName || '-'}</Typography>
                      {log.resourceId && (
                        <Typography variant="caption" color="text.secondary">
                          ID: {log.resourceId}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {log.ipAddress || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" onClick={() => handleViewDetails(log)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalRows}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TableContainer>

        {/* Detail Dialog */}
        <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogContent>
            {selectedLog && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Timestamp
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedLog.createdAt).toLocaleString('th-TH')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User
                    </Typography>
                    <Typography variant="body1">{selectedLog.userName}</Typography>
                    <Chip label={selectedLog.userRole} color={getRoleColor(selectedLog.userRole)} size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Action
                    </Typography>
                    <Chip label={selectedLog.action} color={getActionColor(selectedLog.action)} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Resource Type
                    </Typography>
                    <Typography variant="body1">{selectedLog.resourceType}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Resource
                    </Typography>
                    <Typography variant="body1">{selectedLog.resourceName || 'N/A'}</Typography>
                    {selectedLog.resourceId && (
                      <Typography variant="caption" color="text.secondary">
                        ID: {selectedLog.resourceId}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      IP Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {selectedLog.ipAddress || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User Agent
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {selectedLog.userAgent || 'N/A'}
                    </Typography>
                  </Grid>
                  {selectedLog.details && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Details
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                        <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
                          {JSON.stringify(selectedLog.details, null, 2)}
                        </pre>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AuditLogPage;
