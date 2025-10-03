// User Selection Dialog for Certificate Template

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Box,
  Typography,
  Chip,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import {
  Search,
  Close,
  Person,
  School,
  Email,
  Badge,
  FilterList
} from '@mui/icons-material';
import { CertificateData } from '../../types/certificate-template';

interface UserSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectUser: (userData: CertificateData) => void;
  multiple?: boolean;
}

// Sample user data for demonstration
const SAMPLE_USERS = [
  {
    id: 'user-001',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    fullName: 'นายสมชาย ใจดี',
    email: 'somchai.jaidee@university.ac.th',
    studentId: '65010001',
    department: 'วิทยาการคอมพิวเตอร์',
    faculty: 'คณะวิทยาศาสตร์',
    year: 2024,
    gpa: 3.75,
    profileImage: 'https://via.placeholder.com/150x200/0066cc/ffffff?text=SC',
    course: {
      id: 'course-001',
      name: 'การพัฒนาเว็บแอปพลิเคชันขั้นสูง',
      code: 'CS-401',
      instructor: 'อาจารย์ ดร.สมหญิง เก่งมาก',
      duration: '16 สัปดาห์',
      credits: 3,
      grade: 'A',
      score: 95
    }
  },
  {
    id: 'user-002',
    firstName: 'สมหญิง',
    lastName: 'เก่งดี',
    fullName: 'นางสาวสมหญิง เก่งดี',
    email: 'somying.kengdee@university.ac.th',
    studentId: '65010002',
    department: 'วิทยาการคอมพิวเตอร์',
    faculty: 'คณะวิทยาศาสตร์',
    year: 2024,
    gpa: 3.85,
    profileImage: 'https://via.placeholder.com/150x200/ff6b9d/ffffff?text=SY',
    course: {
      id: 'course-001',
      name: 'การพัฒนาเว็บแอปพลิเคชันขั้นสูง',
      code: 'CS-401',
      instructor: 'อาจารย์ ดร.สมหญิง เก่งมาก',
      duration: '16 สัปดาห์',
      credits: 3,
      grade: 'A',
      score: 98
    }
  },
  {
    id: 'user-003',
    firstName: 'สมศักดิ์',
    lastName: 'ดีมาก',
    fullName: 'นายสมศักดิ์ ดีมาก',
    email: 'somsak.deemak@university.ac.th',
    studentId: '65010003',
    department: 'วิศวกรรมซอฟต์แวร์',
    faculty: 'คณะวิศวกรรมศาสตร์',
    year: 2024,
    gpa: 3.65,
    profileImage: 'https://via.placeholder.com/150x200/4caf50/ffffff?text=SS',
    course: {
      id: 'course-002',
      name: 'การออกแบบระบบซอฟต์แวร์',
      code: 'SE-301',
      instructor: 'ผศ.ดร.วิศวกรรม ยอดเยี่ยม',
      duration: '16 สัปดาห์',
      credits: 3,
      grade: 'B+',
      score: 87
    }
  },
  {
    id: 'user-004',
    firstName: 'สมใจ',
    lastName: 'รักเรียน',
    fullName: 'นางสาวสมใจ รักเรียน',
    email: 'somjai.rakrian@university.ac.th',
    studentId: '65010004',
    department: 'ระบบสารสนเทศ',
    faculty: 'คณะเทคโนโลยีสารสนเทศ',
    year: 2024,
    gpa: 3.90,
    profileImage: 'https://via.placeholder.com/150x200/ff9800/ffffff?text=SJ',
    course: {
      id: 'course-003',
      name: 'การจัดการฐานข้อมูลขั้นสูง',
      code: 'IS-402',
      instructor: 'รศ.ดร.ฐานข้อมูล เชี่ยวชาญ',
      duration: '16 สัปดาห์',
      credits: 3,
      grade: 'A',
      score: 96
    }
  },
  {
    id: 'user-005',
    firstName: 'สมปอง',
    lastName: 'ขยันดี',
    fullName: 'นายสมปอง ขยันดี',
    email: 'sompong.khayndee@university.ac.th',
    studentId: '65010005',
    department: 'ปัญญาประดิษฐ์',
    faculty: 'คณะวิทยาศาสตร์',
    year: 2024,
    gpa: 3.70,
    profileImage: 'https://via.placeholder.com/150x200/9c27b0/ffffff?text=SP',
    course: {
      id: 'course-004',
      name: 'การเรียนรู้ของเครื่อง',
      code: 'AI-501',
      instructor: 'ศ.ดร.ปัญญาประดิษฐ์ ล้ำสมัย',
      duration: '16 สัปดาห์',
      credits: 3,
      grade: 'B+',
      score: 88
    }
  }
];

const UserSelectionDialog: React.FC<UserSelectionDialogProps> = ({
  open,
  onClose,
  onSelectUser,
  multiple = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState(SAMPLE_USERS);

  // Filter users based on search term
  useEffect(() => {
    const filtered = SAMPLE_USERS.filter(user =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentId.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm]);

  const handleUserSelect = (userId: string) => {
    if (multiple) {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    } else {
      setSelectedUsers([userId]);
    }
  };

  const handleConfirm = () => {
    if (selectedUsers.length === 0) return;

    const selectedUser = SAMPLE_USERS.find(user => user.id === selectedUsers[0]);
    if (!selectedUser) return;

    // Create certificate data from selected user
    const certificateData: CertificateData = {
      user: {
        id: selectedUser.id,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        fullName: selectedUser.fullName,
        email: selectedUser.email,
        studentId: selectedUser.studentId,
        department: selectedUser.department,
        faculty: selectedUser.faculty,
        year: selectedUser.year,
        gpa: selectedUser.gpa,
        profileImage: selectedUser.profileImage
      },
      course: {
        id: selectedUser.course.id,
        name: selectedUser.course.name,
        code: selectedUser.course.code,
        instructor: selectedUser.course.instructor,
        duration: selectedUser.course.duration,
        credits: selectedUser.course.credits
      },
      certificate: {
        id: `cert-${selectedUser.id}-${Date.now()}`,
        title: 'เกียรติบัตรแสดงการสำเร็จการศึกษา',
        type: 'completion',
        issueDate: new Date().toISOString().split('T')[0],
        grade: selectedUser.course.grade,
        score: selectedUser.course.score,
        rank: 1,
        totalParticipants: 45,
        verificationCode: `CERT-2024-${selectedUser.studentId}-VERIFY`
      },
      institution: {
        name: 'มหาวิทยาลัยเทคโนโลยีแห่งอนาคต',
        nameEn: 'Future Technology University',
        logo: 'https://via.placeholder.com/100x100/0066cc/ffffff?text=LOGO',
        address: '123 ถนนเทคโนโลยี เขตนวัตกรรม กรุงเทพฯ 10400',
        website: 'https://university.ac.th',
        phone: '02-123-4567',
        email: 'info@university.ac.th'
      },
      signatories: [
        {
          id: 'sign-001',
          name: 'ศาสตราจารย์ ดร.วิชาการ ใหญ่มาก',
          title: 'อธิการบดี',
          department: 'สำนักงานอธิการบดี',
          signature: 'https://via.placeholder.com/200x80/000000/ffffff?text=Signature1',
          signedAt: new Date().toISOString()
        },
        {
          id: 'sign-002',
          name: 'รองศาสตราจารย์ ดร.คณบดี เก่งดี',
          title: `คณบดี${selectedUser.faculty}`,
          department: selectedUser.faculty,
          signature: 'https://via.placeholder.com/200x80/000000/ffffff?text=Signature2',
          signedAt: new Date().toISOString()
        }
      ]
    };

    onSelectUser(certificateData);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" />
            <Typography variant="h6">
              เลือกผู้รับเกียรติบัตร
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Search */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="ค้นหาด้วยชื่อ, รหัสนักศึกษา, อีเมล, ภาควิชา, หรือหลักสูตร..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Results Summary */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            พบ {filteredUsers.length} รายการ
          </Typography>
          {selectedUsers.length > 0 && (
            <Chip 
              label={`เลือกแล้ว ${selectedUsers.length} คน`}
              color="primary"
              size="small"
            />
          )}
        </Box>

        {/* User List */}
        <TableContainer component={Paper} variant="outlined">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  {multiple && (
                    <Checkbox
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                      checked={selectedUsers.length === filteredUsers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(user => user.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>ผู้รับ</TableCell>
                <TableCell>ข้อมูลการศึกษา</TableCell>
                <TableCell>หลักสูตร</TableCell>
                <TableCell>ผลการเรียน</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      ไม่พบข้อมูลที่ค้นหา
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id}
                    hover
                    selected={selectedUsers.includes(user.id)}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          src={user.profileImage}
                          sx={{ width: 40, height: 40 }}
                        >
                          {user.firstName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <Badge fontSize="small" sx={{ mr: 0.5 }} />
                          {user.studentId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <School fontSize="small" sx={{ mr: 0.5 }} />
                          {user.department}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.faculty}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.course.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.course.code} • {user.course.credits} หน่วยกิต
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.course.instructor}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Chip 
                          label={`เกรด ${user.course.grade}`}
                          color={user.course.grade === 'A' ? 'success' : user.course.grade.startsWith('B') ? 'warning' : 'default'}
                          size="small"
                          sx={{ mb: 0.5 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          คะแนน {user.course.score}/100
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          GPA {user.gpa}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedUsers.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              คุณได้เลือก <strong>{selectedUsers.length}</strong> คน สำหรับการสร้างเกียรติบัตร
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>
          ยกเลิก
        </Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm}
          disabled={selectedUsers.length === 0}
        >
          เลือก ({selectedUsers.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserSelectionDialog;
