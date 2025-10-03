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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'paused';
  totalRecipients: number;
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface DeliveryStatus {
  certificateId: string;
  recipientEmail: string;
  recipientName: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  error?: string;
}

const DistributionManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [deliveryStatuses, setDeliveryStatuses] = useState<DeliveryStatus[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // New campaign form
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    templateId: '',
    certificateIds: [] as string[],
    scheduledAt: '',
  });

  useEffect(() => {
    loadCampaigns();
    loadEmailTemplates();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockCampaigns: EmailCampaign[] = [
        {
          id: '1',
          name: 'Workshop Certificate Distribution - Jan 2024',
          templateId: 'template-1',
          status: 'completed',
          totalRecipients: 150,
          sent: 150,
          delivered: 148,
          failed: 2,
          opened: 120,
          clicked: 95,
          scheduledAt: '2024-01-15T10:00:00Z',
          startedAt: '2024-01-15T10:00:00Z',
          completedAt: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-14T15:00:00Z',
        },
        {
          id: '2',
          name: 'Seminar Certificates - Feb 2024',
          templateId: 'template-2',
          status: 'sending',
          totalRecipients: 200,
          sent: 120,
          delivered: 115,
          failed: 5,
          opened: 80,
          clicked: 60,
          startedAt: '2024-02-01T09:00:00Z',
          createdAt: '2024-01-31T14:00:00Z',
        },
        {
          id: '3',
          name: 'Conference Certificates - Scheduled',
          templateId: 'template-1',
          status: 'scheduled',
          totalRecipients: 300,
          sent: 0,
          delivered: 0,
          failed: 0,
          opened: 0,
          clicked: 0,
          scheduledAt: '2024-03-01T08:00:00Z',
          createdAt: '2024-02-15T10:00:00Z',
        },
      ];
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailTemplates = async () => {
    try {
      // TODO: Replace with actual API call
      const mockTemplates: EmailTemplate[] = [
        {
          id: 'template-1',
          name: 'Certificate Delivery - Standard',
          subject: 'Your Certificate is Ready!',
          body: 'Dear {{recipientName}}, your certificate for {{activityName}} is ready...',
        },
        {
          id: 'template-2',
          name: 'Certificate Delivery - Formal',
          subject: 'Certificate of Achievement',
          body: 'Dear {{recipientName}}, we are pleased to inform you...',
        },
      ];
      setEmailTemplates(mockTemplates);
    } catch (error) {
      console.error('Failed to load email templates:', error);
    }
  };

  const loadDeliveryStatuses = async (campaignId: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockStatuses: DeliveryStatus[] = [
        {
          certificateId: 'cert-1',
          recipientEmail: 'student1@example.com',
          recipientName: 'สมชาย ใจดี',
          status: 'delivered',
          sentAt: '2024-01-15T10:05:00Z',
          deliveredAt: '2024-01-15T10:05:30Z',
          openedAt: '2024-01-15T14:20:00Z',
        },
        {
          certificateId: 'cert-2',
          recipientEmail: 'student2@example.com',
          recipientName: 'สมหญิง รักดี',
          status: 'delivered',
          sentAt: '2024-01-15T10:05:00Z',
          deliveredAt: '2024-01-15T10:06:00Z',
        },
        {
          certificateId: 'cert-3',
          recipientEmail: 'invalid@example.com',
          recipientName: 'ทดสอบ ล้มเหลว',
          status: 'failed',
          sentAt: '2024-01-15T10:05:00Z',
          error: 'Invalid email address',
        },
      ];
      setDeliveryStatuses(mockStatuses);
    } catch (error) {
      console.error('Failed to load delivery statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      // TODO: Implement actual API call
      console.log('Creating campaign:', newCampaign);
      setOpenCreateDialog(false);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleCampaignAction = async (campaignId: string, action: 'start' | 'pause' | 'stop' | 'retry') => {
    try {
      // TODO: Implement actual API call
      console.log('Campaign action:', campaignId, action);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to perform campaign action:', error);
    }
  };

  const handleViewDetails = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    loadDeliveryStatuses(campaign.id);
    setOpenDetailDialog(true);
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' => {
    const colorMap: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' } = {
      draft: 'default',
      scheduled: 'info',
      sending: 'warning',
      completed: 'success',
      failed: 'error',
      paused: 'default',
    };
    return colorMap[status] || 'default';
  };

  const calculateDeliveryRate = (campaign: EmailCampaign): number => {
    return campaign.totalRecipients > 0 ? (campaign.delivered / campaign.totalRecipients) * 100 : 0;
  };

  const calculateOpenRate = (campaign: EmailCampaign): number => {
    return campaign.delivered > 0 ? (campaign.opened / campaign.delivered) * 100 : 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          📧 จัดการการส่งออกเกียรติบัตร
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          สร้าง Campaign ใหม่
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {campaigns.reduce((sum, c) => sum + c.totalRecipients, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ผู้รับทั้งหมด
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
                <SendIcon sx={{ fontSize: 40, color: 'info.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {campaigns.reduce((sum, c) => sum + c.sent, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ส่งแล้ว
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
                    {campaigns.reduce((sum, c) => sum + c.delivered, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    จัดส่งสำเร็จ
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
                    {campaigns.reduce((sum, c) => sum + c.failed, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ล้มเหลว
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Campaigns ทั้งหมด" />
          <Tab label="กำลังดำเนินการ" />
          <Tab label="เสร็จสิ้น" />
          <Tab label="ล้มเหลว" />
        </Tabs>
      </Paper>

      {/* Campaigns List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ชื่อ Campaign</strong></TableCell>
              <TableCell><strong>สถานะ</strong></TableCell>
              <TableCell align="center"><strong>ผู้รับทั้งหมด</strong></TableCell>
              <TableCell align="center"><strong>ส่งแล้ว</strong></TableCell>
              <TableCell align="center"><strong>สำเร็จ</strong></TableCell>
              <TableCell align="center"><strong>ล้มเหลว</strong></TableCell>
              <TableCell align="center"><strong>อัตราเปิดอ่าน</strong></TableCell>
              <TableCell align="center"><strong>ความคืบหน้า</strong></TableCell>
              <TableCell align="center"><strong>การดำเนินการ</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    ไม่มี Campaign
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              campaigns
                .filter((campaign) => {
                  if (activeTab === 1) return campaign.status === 'sending' || campaign.status === 'scheduled';
                  if (activeTab === 2) return campaign.status === 'completed';
                  if (activeTab === 3) return campaign.status === 'failed';
                  return true;
                })
                .map((campaign) => (
                  <TableRow key={campaign.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{campaign.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        สร้างเมื่อ: {new Date(campaign.createdAt).toLocaleDateString('th-TH')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={campaign.status} color={getStatusColor(campaign.status)} size="small" />
                    </TableCell>
                    <TableCell align="center">{campaign.totalRecipients}</TableCell>
                    <TableCell align="center">{campaign.sent}</TableCell>
                    <TableCell align="center">
                      <Typography color="success.main">{campaign.delivered}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography color="error.main">{campaign.failed}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography>{calculateOpenRate(campaign).toFixed(1)}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calculateDeliveryRate(campaign)}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {calculateDeliveryRate(campaign).toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {campaign.status === 'scheduled' && (
                          <Tooltip title="เริ่มส่ง">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleCampaignAction(campaign.id, 'start')}
                            >
                              <PlayArrowIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {campaign.status === 'sending' && (
                          <>
                            <Tooltip title="หยุดชั่วคราว">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleCampaignAction(campaign.id, 'pause')}
                              >
                                <PauseIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="หยุด">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCampaignAction(campaign.id, 'stop')}
                              >
                                <StopIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {campaign.status === 'failed' && (
                          <Tooltip title="ลองใหม่">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleCampaignAction(campaign.id, 'retry')}
                            >
                              <RefreshIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="ดูรายละเอียด">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(campaign)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Campaign Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>สร้าง Email Campaign ใหม่</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="ชื่อ Campaign"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>เทมเพลตอีเมล</InputLabel>
              <Select
                value={newCampaign.templateId}
                onChange={(e) => setNewCampaign({ ...newCampaign, templateId: e.target.value })}
                label="เทมเพลตอีเมล"
              >
                {emailTemplates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="datetime-local"
              label="กำหนดเวลาส่ง (ถ้าต้องการ)"
              value={newCampaign.scheduledAt}
              onChange={(e) => setNewCampaign({ ...newCampaign, scheduledAt: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <Alert severity="info">
              เลือกเกียรติบัตรที่ต้องการส่งในขั้นตอนถัดไป
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleCreateCampaign} variant="contained">
            สร้าง
          </Button>
        </DialogActions>
      </Dialog>

      {/* Campaign Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>รายละเอียด Campaign: {selectedCampaign?.name}</DialogTitle>
        <DialogContent>
          {selectedCampaign && (
            <Box sx={{ mt: 2 }}>
              {/* Campaign Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">{selectedCampaign.sent}</Typography>
                    <Typography variant="body2" color="text.secondary">อีเมลที่ส่งออก</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" color="success.main">{selectedCampaign.delivered}</Typography>
                    <Typography variant="body2" color="text.secondary">จัดส่งสำเร็จ</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" color="error.main">{selectedCampaign.failed}</Typography>
                    <Typography variant="body2" color="text.secondary">ล้มเหลว</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Delivery Status List */}
              <Typography variant="h6" sx={{ mb: 2 }}>สถานะการจัดส่ง</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ผู้รับ</TableCell>
                      <TableCell>อีเมล</TableCell>
                      <TableCell>สถานะ</TableCell>
                      <TableCell>เวลาส่ง</TableCell>
                      <TableCell>เวลาที่จัดส่ง</TableCell>
                      <TableCell>เปิดอ่านเมื่อ</TableCell>
                      <TableCell>หมายเหตุ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliveryStatuses.map((status, index) => (
                      <TableRow key={index}>
                        <TableCell>{status.recipientName}</TableCell>
                        <TableCell>{status.recipientEmail}</TableCell>
                        <TableCell>
                          <Chip
                            label={status.status}
                            size="small"
                            color={
                              status.status === 'delivered'
                                ? 'success'
                                : status.status === 'failed'
                                ? 'error'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {status.sentAt ? new Date(status.sentAt).toLocaleString('th-TH') : '-'}
                        </TableCell>
                        <TableCell>
                          {status.deliveredAt ? new Date(status.deliveredAt).toLocaleString('th-TH') : '-'}
                        </TableCell>
                        <TableCell>
                          {status.openedAt ? new Date(status.openedAt).toLocaleString('th-TH') : '-'}
                        </TableCell>
                        <TableCell>
                          {status.error ? (
                            <Typography variant="caption" color="error">
                              {status.error}
                            </Typography>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>ปิด</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            ดาวน์โหลดรายงาน
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DistributionManagementPage;
