import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Paper,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  PendingActions,
  Warning,
  Schedule,
  Person,
  Assignment,
  Edit,
  Visibility,
  CheckCircle,
  Cancel,
  FilterList,
  Sort,
  Search,
  Refresh,
  NotificationImportant,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SignerDashboardLayout from '../../components/signer/SignerDashboardLayout';
import { useSigner } from '../../hooks/useSigner';
import PendingDocumentsList from '../../components/signer/PendingDocumentsList';
import DocumentSigningInterface from '../../components/signer/DocumentSigningInterface';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pending-tabpanel-${index}`}
      aria-labelledby={`pending-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SignerPendingDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { pendingDocuments, stats, loading, refreshData } = useSigner();
  const [tabValue, setTabValue] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [signingDialogOpen, setSigningDialogOpen] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDocumentSelect = (document: any) => {
    setSelectedDocument(document);
    setSigningDialogOpen(true);
  };

  const handleSignDocument = async (documentId: string, signatureData: any) => {
    try {
      // Implementation for signing document
      console.log('Signing document:', documentId, signatureData);
      setSigningDialogOpen(false);
      refreshData();
    } catch (error) {
      console.error('Error signing document:', error);
    }
  };

  const handleRejectDocument = async (documentId: string, reason: string) => {
    try {
      // Implementation for rejecting document
      console.log('Rejecting document:', documentId, reason);
      setSigningDialogOpen(false);
      refreshData();
    } catch (error) {
      console.error('Error rejecting document:', error);
    }
  };

  const filteredDocuments = pendingDocuments?.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.requestedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  }) || [];

  const urgentDocuments = filteredDocuments.filter(doc => doc.priority === 'urgent' || doc.priority === 'high');
  const regularDocuments = filteredDocuments.filter(doc => doc.priority === 'medium' || doc.priority === 'low');

  return (
    <SignerDashboardLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'warning.main',
                  width: 48,
                  height: 48
                }}
              >
                <PendingActions />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontFamily: 'Sarabun, sans-serif',
                    fontWeight: 'bold',
                    color: '#f57c00'
                  }}
                >
                  เอกสารรอลงนาม
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontFamily: 'Sarabun, sans-serif' }}
                >
                  จัดการเอกสารที่รอการลงนามทั้งหมด
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilterOpen(true)}
                sx={{ fontFamily: 'Sarabun, sans-serif' }}
              >
                ตัวกรอง
              </Button>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={refreshData}
                disabled={loading}
                sx={{ fontFamily: 'Sarabun, sans-serif' }}
              >
                รีเฟรช
              </Button>
            </Box>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                        {urgentDocuments.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'error.main', fontFamily: 'Sarabun, sans-serif' }}>
                        เอกสารด่วน
                      </Typography>
                    </Box>
                    <NotificationImportant sx={{ color: 'error.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                        {filteredDocuments.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'warning.main', fontFamily: 'Sarabun, sans-serif' }}>
                        ทั้งหมด
                      </Typography>
                    </Box>
                    <PendingActions sx={{ color: 'warning.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                        {Math.round((stats?.averageProcessingTime || 0) / 60)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'info.main', fontFamily: 'Sarabun, sans-serif' }}>
                        นาที/ฉบับ
                      </Typography>
                    </Box>
                    <Schedule sx={{ color: 'info.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        {stats?.completedThisMonth || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.main', fontFamily: 'Sarabun, sans-serif' }}>
                        เสร็จแล้ว
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="ค้นหาเอกสาร, กิจกรรม, หรือผู้ขอ..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>ความสำคัญ</InputLabel>
              <Select
                value={priorityFilter}
                label="ความสำคัญ"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="urgent">ด่วนมาก</MenuItem>
                <MenuItem value="high">สูง</MenuItem>
                <MenuItem value="medium">ปานกลาง</MenuItem>
                <MenuItem value="low">ต่ำ</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>เรียงตาม</InputLabel>
              <Select
                value={sortBy}
                label="เรียงตาม"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="dueDate">วันครบกำหนด</MenuItem>
                <MenuItem value="priority">ความสำคัญ</MenuItem>
                <MenuItem value="requestDate">วันที่ขอ</MenuItem>
                <MenuItem value="recipientCount">จำนวนผู้รับ</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationImportant />
                  <span>เอกสารด่วน</span>
                  <Badge badgeContent={urgentDocuments.length} color="error" />
                </Box>
              }
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PendingActions />
                  <span>เอกสารทั่วไป</span>
                  <Badge badgeContent={regularDocuments.length} color="warning" />
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {/* Content */}
        {loading ? (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', fontFamily: 'Sarabun, sans-serif' }}>
              กำลังโหลดเอกสาร...
            </Typography>
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              {urgentDocuments.length > 0 ? (
                <PendingDocumentsList
                  documents={urgentDocuments}
                  onDocumentSelect={handleDocumentSelect}
                  onRefresh={refreshData}
                  loading={loading}
                />
              ) : (
                <Alert severity="info" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  ไม่มีเอกสารด่วนที่รอลงนาม
                </Alert>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {regularDocuments.length > 0 ? (
                <PendingDocumentsList
                  documents={regularDocuments}
                  onDocumentSelect={handleDocumentSelect}
                  onRefresh={refreshData}
                  loading={loading}
                />
              ) : (
                <Alert severity="info" sx={{ fontFamily: 'Sarabun, sans-serif' }}>
                  ไม่มีเอกสารทั่วไปที่รอลงนาม
                </Alert>
              )}
            </TabPanel>
          </>
        )}

        {/* Document Signing Dialog */}
        <Dialog
          open={signingDialogOpen}
          onClose={() => setSigningDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily: 'Sarabun, sans-serif' }}>
            ลงนามเอกสาร
          </DialogTitle>
          <DialogContent>
            {selectedDocument && (
              <DocumentSigningInterface
                document={selectedDocument}
                onSign={handleSignDocument}
                onReject={handleRejectDocument}
                onCancel={() => setSigningDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </SignerDashboardLayout>
  );
};

export default SignerPendingDocumentsPage;