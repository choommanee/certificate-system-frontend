import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Download,
  Visibility,
  CheckCircle,
  Error,
  Warning,
  Schedule,
  Assessment,
  Email,
  GetApp,
  Refresh,
} from '@mui/icons-material';

interface BulkGenerationJob {
  id: string;
  template_id: string;
  template_name: string;
  total_certificates: number;
  completed_certificates: number;
  failed_certificates: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  progress_percentage: number;
  estimated_time_remaining?: string;
}

interface BulkGenerationProps {
  onJobComplete?: (jobId: string) => void;
}

const BulkGeneration: React.FC<BulkGenerationProps> = ({ onJobComplete }) => {
  const [jobs, setJobs] = useState<BulkGenerationJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<BulkGenerationJob | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockJobs: BulkGenerationJob[] = [
      {
        id: '1',
        template_id: 'template-1',
        template_name: 'Course Completion Certificate',
        total_certificates: 150,
        completed_certificates: 120,
        failed_certificates: 5,
        status: 'running',
        created_at: '2024-01-15T10:00:00Z',
        started_at: '2024-01-15T10:05:00Z',
        progress_percentage: 80,
        estimated_time_remaining: '5 minutes',
      },
      {
        id: '2',
        template_id: 'template-2',
        template_name: 'Workshop Attendance Certificate',
        total_certificates: 75,
        completed_certificates: 75,
        failed_certificates: 0,
        status: 'completed',
        created_at: '2024-01-14T14:30:00Z',
        started_at: '2024-01-14T14:35:00Z',
        completed_at: '2024-01-14T15:20:00Z',
        progress_percentage: 100,
      },
      {
        id: '3',
        template_id: 'template-3',
        template_name: 'Achievement Award',
        total_certificates: 200,
        completed_certificates: 0,
        failed_certificates: 0,
        status: 'pending',
        created_at: '2024-01-15T11:00:00Z',
        progress_percentage: 0,
      },
    ];
    setJobs(mockJobs);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'running': return <Schedule />;
      case 'failed': return <Error />;
      case 'paused': return <Pause />;
      default: return <Warning />;
    }
  };

  const handleJobAction = async (jobId: string, action: 'start' | 'pause' | 'stop' | 'retry') => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setJobs(prevJobs => 
        prevJobs.map(job => {
          if (job.id === jobId) {
            switch (action) {
              case 'start':
                return { ...job, status: 'running' as const, started_at: new Date().toISOString() };
              case 'pause':
                return { ...job, status: 'paused' as const };
              case 'stop':
                return { ...job, status: 'failed' as const, error_message: 'Job stopped by user' };
              case 'retry':
                return { ...job, status: 'pending' as const, failed_certificates: 0, error_message: undefined };
              default:
                return job;
            }
          }
          return job;
        })
      );
    } catch (error) {
      console.error('Failed to perform job action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadResults = (jobId: string) => {
    // Mock download functionality
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      // Create a mock CSV content
      const csvContent = `Certificate ID,Recipient Name,Recipient Email,Status,Generated At
cert-${jobId}-001,John Doe,john@example.com,Generated,2024-01-15T10:30:00Z
cert-${jobId}-002,Jane Smith,jane@example.com,Generated,2024-01-15T10:31:00Z
cert-${jobId}-003,Bob Johnson,bob@example.com,Generated,2024-01-15T10:32:00Z`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk_generation_results_${jobId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleSendEmails = async (jobId: string) => {
    setIsLoading(true);
    try {
      // Mock email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Emails sent successfully!');
    } catch (error) {
      alert('Failed to send emails');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return '-';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          งานสร้างเกียรติบัตรแบบกลุ่ม
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main">
                {jobs.filter(j => j.status === 'running').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Running Jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main">
                {jobs.filter(j => j.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main">
                {jobs.filter(j => j.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main">
                {jobs.reduce((sum, job) => sum + job.completed_certificates, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Certificates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Jobs Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Template</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Certificates</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(job.status)}
                      label={job.status.toUpperCase()}
                      color={getStatusColor(job.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {job.template_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {job.template_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 120 }}>
                      <LinearProgress
                        variant="determinate"
                        value={job.progress_percentage}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption">
                        {job.progress_percentage}%
                        {job.estimated_time_remaining && job.status === 'running' && (
                          <span> • {job.estimated_time_remaining} left</span>
                        )}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.completed_certificates} / {job.total_certificates}
                    </Typography>
                    {job.failed_certificates > 0 && (
                      <Typography variant="caption" color="error">
                        {job.failed_certificates} failed
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {calculateDuration(job.started_at, job.completed_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(job.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {job.status === 'pending' && (
                        <Tooltip title="Start Job">
                          <IconButton
                            size="small"
                            onClick={() => handleJobAction(job.id, 'start')}
                            disabled={isLoading}
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {job.status === 'running' && (
                        <>
                          <Tooltip title="Pause Job">
                            <IconButton
                              size="small"
                              onClick={() => handleJobAction(job.id, 'pause')}
                              disabled={isLoading}
                            >
                              <Pause />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Stop Job">
                            <IconButton
                              size="small"
                              onClick={() => handleJobAction(job.id, 'stop')}
                              disabled={isLoading}
                            >
                              <Stop />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
                      {job.status === 'paused' && (
                        <Tooltip title="Resume Job">
                          <IconButton
                            size="small"
                            onClick={() => handleJobAction(job.id, 'start')}
                            disabled={isLoading}
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {job.status === 'failed' && (
                        <Tooltip title="Retry Job">
                          <IconButton
                            size="small"
                            onClick={() => handleJobAction(job.id, 'retry')}
                            disabled={isLoading}
                          >
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {job.status === 'completed' && (
                        <>
                          <Tooltip title="Download Results">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadResults(job.id)}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send Emails">
                            <IconButton
                              size="small"
                              onClick={() => handleSendEmails(job.id)}
                              disabled={isLoading}
                            >
                              <Email />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedJob(job);
                            setShowDetails(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {jobs.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bulk generation jobs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start a bulk import to create generation jobs
          </Typography>
        </Paper>
      )}

      {/* Job Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Job Details: {selectedJob?.template_name}
        </DialogTitle>
        <DialogContent>
          {selectedJob && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Job ID
                  </Typography>
                  <Typography variant="body2">{selectedJob.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Template ID
                  </Typography>
                  <Typography variant="body2">{selectedJob.template_id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedJob.status)}
                    label={selectedJob.status.toUpperCase()}
                    color={getStatusColor(selectedJob.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedJob.progress_percentage}
                      sx={{ flexGrow: 1 }}
                    />
                    <Typography variant="body2">
                      {selectedJob.progress_percentage}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Certificate Statistics
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="primary.main">
                        {selectedJob.total_certificates}
                      </Typography>
                      <Typography variant="caption">Total</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="success.main">
                        {selectedJob.completed_certificates}
                      </Typography>
                      <Typography variant="caption">Completed</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" color="error.main">
                        {selectedJob.failed_certificates}
                      </Typography>
                      <Typography variant="caption">Failed</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Timeline
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created"
                    secondary={formatDate(selectedJob.created_at)}
                  />
                </ListItem>
                {selectedJob.started_at && (
                  <ListItem>
                    <ListItemIcon>
                      <PlayArrow />
                    </ListItemIcon>
                    <ListItemText
                      primary="Started"
                      secondary={formatDate(selectedJob.started_at)}
                    />
                  </ListItem>
                )}
                {selectedJob.completed_at && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle />
                    </ListItemIcon>
                    <ListItemText
                      primary="Completed"
                      secondary={formatDate(selectedJob.completed_at)}
                    />
                  </ListItem>
                )}
              </List>

              {selectedJob.error_message && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {selectedJob.error_message}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
          {selectedJob?.status === 'completed' && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleDownloadResults(selectedJob.id)}
            >
              Download Results
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkGeneration;