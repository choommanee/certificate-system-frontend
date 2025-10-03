import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import BulkImport from '../components/bulk-operations/BulkImport';
import BulkGeneration from '../components/bulk-operations/BulkGeneration';

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
      id={`bulk-operations-tabpanel-${index}`}
      aria-labelledby={`bulk-operations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const BulkOperationsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          การดำเนินการแบบกลุ่ม
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          นำเข้าข้อมูลผู้รับและจัดการงานสร้างเกียรติบัตรจำนวนมาก
        </Typography>

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="bulk operations tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="นำเข้าข้อมูล" />
            <Tab label="งานสร้างเกียรติบัตร" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <BulkImport
              onImportComplete={(data) => {
                console.log('Import completed:', data);
                // Switch to generation jobs tab
                setTabValue(1);
              }}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <BulkGeneration
              onJobComplete={(jobId) => {
                console.log('Job completed:', jobId);
              }}
            />
          </TabPanel>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default BulkOperationsPage;