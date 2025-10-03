import React, { useState, useCallback } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error,
  Warning,
  Download,
  Visibility,
  Delete,
  FileUpload,
  TableChart,
  Assessment,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface BulkImportData {
  id: string;
  recipient_name: string;
  recipient_email: string;
  template_variables?: Record<string, any>;
  status: 'pending' | 'valid' | 'invalid';
  errors?: string[];
}

interface BulkImportProps {
  templateId?: string;
  onImportComplete?: (data: BulkImportData[]) => void;
}

const BulkImport: React.FC<BulkImportProps> = ({ templateId, onImportComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<BulkImportData[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: number;
    invalid: number;
    total: number;
  }>({ valid: 0, invalid: 0, total: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = ['Upload File', 'Validate Data', 'Review & Import'];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      // Mock file processing - in real app, this would parse CSV/Excel
      const mockData: BulkImportData[] = [
        {
          id: '1',
          recipient_name: 'John Doe',
          recipient_email: 'john@example.com',
          template_variables: { course: 'React Development', grade: 'A' },
          status: 'valid',
        },
        {
          id: '2',
          recipient_name: 'Jane Smith',
          recipient_email: 'invalid-email',
          template_variables: { course: 'Vue.js Basics', grade: 'B+' },
          status: 'invalid',
          errors: ['Invalid email format'],
        },
        {
          id: '3',
          recipient_name: 'Bob Johnson',
          recipient_email: 'bob@example.com',
          template_variables: { course: 'Angular Advanced', grade: 'A-' },
          status: 'valid',
        },
      ];

      setImportData(mockData);
      
      const valid = mockData.filter(item => item.status === 'valid').length;
      const invalid = mockData.filter(item => item.status === 'invalid').length;
      
      setValidationResults({
        valid,
        invalid,
        total: mockData.length,
      });

      setActiveStep(1);
    } catch (err) {
      setError('Failed to process file. Please check the format and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      handleImport();
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    try {
      // Mock import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const validData = importData.filter(item => item.status === 'valid');
      onImportComplete?.(validData);
      
      // Reset form
      setActiveStep(0);
      setUploadedFile(null);
      setImportData([]);
      setValidationResults({ valid: 0, invalid: 0, total: 0 });
    } catch (err) {
      setError('Failed to import data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    // Mock CSV template download
    const csvContent = 'recipient_name,recipient_email,course,grade\nJohn Doe,john@example.com,React Development,A\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'success';
      case 'invalid': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle />;
      case 'invalid': return <Error />;
      default: return <Warning />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        นำเข้าเกียรติบัตรแบบกลุ่ม
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Step 1: File Upload */}
      {activeStep === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                bgcolor: isDragActive ? 'primary.50' : 'background.paper',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Supported formats: CSV, Excel (.xlsx, .xls)
              </Typography>
              {uploadedFile && (
                <Chip
                  icon={<FileUpload />}
                  label={uploadedFile.name}
                  color="primary"
                  sx={{ mt: 2 }}
                />
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TableChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Template Format
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Download our template to ensure your data is formatted correctly.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={downloadTemplate}
                  fullWidth
                >
                  Download Template
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Step 2: Validation Results */}
      {activeStep === 1 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="success.main">
                    {validationResults.valid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valid Records
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="error.main">
                    {validationResults.invalid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Invalid Records
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary.main">
                    {validationResults.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Data Preview</Typography>
              <Button
                startIcon={<Visibility />}
                onClick={() => setShowPreview(true)}
              >
                View All Data
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Variables</TableCell>
                    <TableCell>Errors</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importData.slice(0, 5).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(row.status)}
                          label={row.status}
                          color={getStatusColor(row.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{row.recipient_name}</TableCell>
                      <TableCell>{row.recipient_email}</TableCell>
                      <TableCell>
                        {row.template_variables && Object.keys(row.template_variables).length > 0 ? (
                          <Chip label={`${Object.keys(row.template_variables).length} vars`} size="small" />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {row.errors && row.errors.length > 0 ? (
                          <Typography variant="caption" color="error">
                            {row.errors.join(', ')}
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

            {importData.length > 5 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Showing 5 of {importData.length} records
              </Typography>
            )}
          </Paper>
        </Box>
      )}

      {/* Step 3: Review & Import */}
      {activeStep === 2 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Ready to import {validationResults.valid} valid records. 
              {validationResults.invalid > 0 && ` ${validationResults.invalid} invalid records will be skipped.`}
            </Typography>
          </Alert>

          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Assessment sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Import Summary
            </Typography>
            <Typography variant="body1" paragraph>
              {validationResults.valid} certificates will be created from the imported data.
            </Typography>
            
            {isProcessing && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Processing import...
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0 || isProcessing}
          onClick={() => setActiveStep(activeStep - 1)}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={
            (activeStep === 0 && !uploadedFile) ||
            (activeStep === 1 && validationResults.valid === 0) ||
            isProcessing
          }
        >
          {activeStep === 2 ? 'Import Data' : 'Next'}
        </Button>
      </Box>

      {/* Data Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>All Import Data</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Variables</TableCell>
                  <TableCell>Errors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(row.status)}
                        label={row.status}
                        color={getStatusColor(row.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{row.recipient_name}</TableCell>
                    <TableCell>{row.recipient_email}</TableCell>
                    <TableCell>
                      {row.template_variables && (
                        <Box>
                          {Object.entries(row.template_variables).map(([key, value]) => (
                            <Chip
                              key={key}
                              label={`${key}: ${value}`}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.errors && row.errors.length > 0 ? (
                        <Typography variant="caption" color="error">
                          {row.errors.join(', ')}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkImport;