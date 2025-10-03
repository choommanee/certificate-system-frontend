import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  QrCode2 as QrCodeIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';

interface QRCodeData {
  id: string;
  certificateId: string;
  recipientName: string;
  activityName: string;
  verificationCode: string;
  qrCodeUrl: string;
  createdAt: string;
  lastVerifiedAt?: string;
  verificationCount: number;
  status: 'active' | 'inactive' | 'expired';
}

interface QRCodeStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  totalVerifications: number;
}

const QRCodeManagementPage: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [filteredQrCodes, setFilteredQrCodes] = useState<QRCodeData[]>([]);
  const [stats, setStats] = useState<QRCodeStats>({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    totalVerifications: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQrCode, setSelectedQrCode] = useState<QRCodeData | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQRCodes();
  }, []);

  useEffect(() => {
    filterQRCodes();
  }, [searchTerm, statusFilter, qrCodes]);

  const loadQRCodes = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockQrCodes: QRCodeData[] = [
        {
          id: '1',
          certificateId: 'cert-001',
          recipientName: 'สมชาย ใจดี',
          activityName: 'Workshop AI และ Machine Learning',
          verificationCode: 'ABC123XYZ',
          qrCodeUrl: '/qr/ABC123XYZ.png',
          createdAt: '2024-01-15T10:00:00Z',
          lastVerifiedAt: '2024-01-20T14:30:00Z',
          verificationCount: 5,
          status: 'active',
        },
        {
          id: '2',
          certificateId: 'cert-002',
          recipientName: 'สมหญิง รักดี',
          activityName: 'Workshop AI และ Machine Learning',
          verificationCode: 'DEF456UVW',
          qrCodeUrl: '/qr/DEF456UVW.png',
          createdAt: '2024-01-15T10:00:00Z',
          lastVerifiedAt: '2024-01-18T09:15:00Z',
          verificationCount: 3,
          status: 'active',
        },
        {
          id: '3',
          certificateId: 'cert-003',
          recipientName: 'ประเสริฐ วิชาการ',
          activityName: 'Seminar เศรษฐศาสตร์ดิจิทัล',
          verificationCode: 'GHI789RST',
          qrCodeUrl: '/qr/GHI789RST.png',
          createdAt: '2024-02-01T09:00:00Z',
          verificationCount: 0,
          status: 'active',
        },
      ];

      setQrCodes(mockQrCodes);

      // Calculate stats
      const statsData: QRCodeStats = {
        total: mockQrCodes.length,
        active: mockQrCodes.filter((qr) => qr.status === 'active').length,
        inactive: mockQrCodes.filter((qr) => qr.status === 'inactive').length,
        expired: mockQrCodes.filter((qr) => qr.status === 'expired').length,
        totalVerifications: mockQrCodes.reduce((sum, qr) => sum + qr.verificationCount, 0),
      };
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQRCodes = () => {
    let filtered = qrCodes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (qr) =>
          qr.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qr.verificationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          qr.activityName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((qr) => qr.status === statusFilter);
    }

    setFilteredQrCodes(filtered);
  };

  const handleRegenerateQR = async (qrCodeId: string) => {
    try {
      // TODO: Implement actual API call
      console.log('Regenerating QR code:', qrCodeId);
      loadQRCodes();
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
    }
  };

  const handleDownloadQR = (qrCode: QRCodeData) => {
    // TODO: Implement actual download
    console.log('Downloading QR code:', qrCode.verificationCode);
  };

  const handleDownloadAll = () => {
    // TODO: Implement bulk download
    console.log('Downloading all QR codes...');
  };

  const handleViewDetails = (qrCode: QRCodeData) => {
    setSelectedQrCode(qrCode);
    setOpenDetailDialog(true);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, qrCode: QRCodeData) => {
    setAnchorEl(event.currentTarget);
    setSelectedQrCode(qrCode);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    const colorMap: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' } = {
      active: 'success',
      inactive: 'default',
      expired: 'error',
    };
    return colorMap[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon fontSize="small" />;
      case 'inactive':
        return <InfoIcon fontSize="small" />;
      case 'expired':
        return <ErrorIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          📱 จัดการ QR Code
        </Typography>
        <Button variant="contained" startIcon={<FileDownloadIcon />} onClick={handleDownloadAll}>
          ดาวน์โหลดทั้งหมด
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <QrCodeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    QR Code ทั้งหมด
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
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ใช้งานได้
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
                <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.expired}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    หมดอายุ
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
                <InfoIcon sx={{ fontSize: 40, color: 'info.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.totalVerifications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ครั้งที่ตรวจสอบ
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="ค้นหาด้วยชื่อผู้รับ, รหัสตรวจสอบ, หรือกิจกรรม..."
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>สถานะ</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="สถานะ">
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="active">ใช้งานได้</MenuItem>
                <MenuItem value="inactive">ไม่ได้ใช้งาน</MenuItem>
                <MenuItem value="expired">หมดอายุ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              แสดงผล: {filteredQrCodes.length} รายการ
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* QR Codes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>QR Code</strong></TableCell>
              <TableCell><strong>รหัสตรวจสอบ</strong></TableCell>
              <TableCell><strong>ผู้รับ</strong></TableCell>
              <TableCell><strong>กิจกรรม</strong></TableCell>
              <TableCell align="center"><strong>สถานะ</strong></TableCell>
              <TableCell align="center"><strong>จำนวนการตรวจสอบ</strong></TableCell>
              <TableCell><strong>ตรวจสอบล่าสุด</strong></TableCell>
              <TableCell align="center"><strong>การดำเนินการ</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQrCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    ไม่พบข้อมูล QR Code
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredQrCodes.map((qrCode) => (
                <TableRow key={qrCode.id} hover>
                  <TableCell>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleViewDetails(qrCode)}
                    >
                      <QrCodeIcon sx={{ fontSize: 40 }} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {qrCode.verificationCode}
                    </Typography>
                  </TableCell>
                  <TableCell>{qrCode.recipientName}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{qrCode.activityName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(qrCode.createdAt).toLocaleDateString('th-TH')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={getStatusIcon(qrCode.status)}
                      label={qrCode.status}
                      color={getStatusColor(qrCode.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {qrCode.verificationCount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {qrCode.lastVerifiedAt ? (
                      <>
                        <Typography variant="body2">
                          {new Date(qrCode.lastVerifiedAt).toLocaleDateString('th-TH')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(qrCode.lastVerifiedAt).toLocaleTimeString('th-TH')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        ยังไม่เคยตรวจสอบ
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="ดาวน์โหลด QR Code">
                        <IconButton size="small" color="primary" onClick={() => handleDownloadQR(qrCode)}>
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="สร้าง QR Code ใหม่">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleRegenerateQR(qrCode.id)}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" onClick={(e) => handleMenuClick(e, qrCode)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (selectedQrCode) handleViewDetails(selectedQrCode);
            handleMenuClose();
          }}
        >
          ดูรายละเอียด
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedQrCode) handleDownloadQR(selectedQrCode);
            handleMenuClose();
          }}
        >
          ดาวน์โหลด
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedQrCode) handleRegenerateQR(selectedQrCode.id);
            handleMenuClose();
          }}
        >
          สร้างใหม่
        </MenuItem>
      </Menu>

      {/* Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>รายละเอียด QR Code</DialogTitle>
        <DialogContent>
          {selectedQrCode && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              {/* QR Code Image */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                    border: 2,
                    borderColor: 'divider',
                  }}
                >
                  <QrCodeIcon sx={{ fontSize: 150 }} />
                </Box>
              </Box>

              {/* Details */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  รหัสตรวจสอบ
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'monospace', mb: 2 }}>
                  {selectedQrCode.verificationCode}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  ผู้รับเกียรติบัตร
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedQrCode.recipientName}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  กิจกรรม
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedQrCode.activityName}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  สถานะ
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedQrCode.status)}
                  label={selectedQrCode.status}
                  color={getStatusColor(selectedQrCode.status)}
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle2" color="text.secondary">
                  จำนวนครั้งที่ตรวจสอบ
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedQrCode.verificationCount} ครั้ง
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  สร้างเมื่อ
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(selectedQrCode.createdAt).toLocaleString('th-TH')}
                </Typography>

                {selectedQrCode.lastVerifiedAt && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      ตรวจสอบล่าสุด
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedQrCode.lastVerifiedAt).toLocaleString('th-TH')}
                    </Typography>
                  </>
                )}
              </Box>

              <Alert severity="info" icon={<InfoIcon />}>
                URL สำหรับตรวจสอบ:<br />
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
                  {window.location.origin}/verify/{selectedQrCode.verificationCode}
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>ปิด</Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              if (selectedQrCode) handleRegenerateQR(selectedQrCode.id);
              setOpenDetailDialog(false);
            }}
          >
            สร้างใหม่
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              if (selectedQrCode) handleDownloadQR(selectedQrCode);
            }}
          >
            ดาวน์โหลด
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRCodeManagementPage;
