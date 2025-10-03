// Hybrid Designer Test Page - Testing the combined Enhanced Designer

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Button,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { ArrowBack, Save, Download } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import HybridEnhancedDesigner from '../components/designer/HybridEnhancedDesigner';
import { DesignerDocument } from '../types/designer';
import { AVAILABLE_DATA_FIELDS } from '../types/certificate-template';

const HybridDesignerTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Mock current user
  const currentUser = {
    id: 'test-user-1',
    name: 'ผู้ทดสอบระบบ',
    role: 'staff',
  };

  const handleSave = (document: DesignerDocument) => {
    console.log('Saving document:', document);
    
    // Simulate save API call
    setTimeout(() => {
      setNotification({
        message: `บันทึกเอกสาร "${document.name}" สำเร็จ`,
        type: 'success',
      });
    }, 500);
  };

  const handleExport = (format: 'pdf' | 'png' | 'jpg', document: DesignerDocument) => {
    console.log('Exporting document:', { format, document });
    
    // Simulate export API call
    setTimeout(() => {
      setNotification({
        message: `ส่งออกเอกสารเป็น ${format.toUpperCase()} สำเร็จ`,
        type: 'success',
      });
    }, 1000);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top App Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🎨 Hybrid Enhanced Designer - ทดสอบระบบ
          </Typography>

          <Button
            variant="outlined"
            startIcon={<Save />}
            sx={{ mr: 1 }}
            onClick={() => {
              setNotification({
                message: 'ฟีเจอร์บันทึกพร้อมใช้งาน',
                type: 'info',
              });
            }}
          >
            บันทึก
          </Button>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => {
              setNotification({
                message: 'ฟีเจอร์ส่งออกพร้อมใช้งาน',
                type: 'info',
              });
            }}
          >
            ส่งออก
          </Button>
        </Toolbar>
      </AppBar>

      {/* Info Alert */}
      <Alert severity="info" sx={{ m: 2 }}>
        <Typography variant="body2">
          <strong>การทดสอบ Hybrid Enhanced Designer:</strong>
          <br />
          • ใช้แท็บ "เครื่องมือ" เพื่อเพิ่มองค์ประกอบพื้นฐาน (ข้อความ, รูปภาพ, รูปทรง)
          <br />
          • ใช้แท็บ "ข้อมูล" เพื่อเพิ่ม Template Variables สำหรับการผูกข้อมูล
          <br />
          • คลิกปุ่ม "เลือกผู้รับเกียรติบัตร" เพื่อเลือกข้อมูลผู้ใช้และดูตัวอย่าง
          <br />
          • ใช้ Properties Panel และ Layer Panel เพื่อจัดการองค์ประกอบ
        </Typography>
      </Alert>

      {/* Main Designer */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <HybridEnhancedDesigner
          currentUser={currentUser}
          onSave={handleSave}
          onExport={handleExport}
        />
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity={notification?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HybridDesignerTestPage;
