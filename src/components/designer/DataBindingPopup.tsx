// Data Binding Popup Component - Crystal Report Style
import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Create as SignatureIcon,
  Extension as CustomIcon
} from '@mui/icons-material';
import { DataBinding, AVAILABLE_DATA_FIELDS } from '../../types/certificate-template';

interface DataBindingPopupProps {
  open: boolean;
  onClose: () => void;
  onSelectField: (field: DataBinding) => void;
  position?: { x: number; y: number };
}

interface FieldGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  fields: DataBinding[];
}

const DataBindingPopup: React.FC<DataBindingPopupProps> = ({
  open,
  onClose,
  onSelectField,
  position = { x: 100, y: 100 }
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dragPosition, setDragPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  // Group fields by category
  const fieldGroups: FieldGroup[] = [
    {
      key: 'user',
      label: 'ข้อมูลผู้รับเกียรติบัตร',
      icon: <PersonIcon />,
      fields: AVAILABLE_DATA_FIELDS.filter(field => field.fieldPath.startsWith('user.'))
    },
    {
      key: 'course',
      label: 'ข้อมูลหลักสูตร/รายวิชา',
      icon: <SchoolIcon />,
      fields: AVAILABLE_DATA_FIELDS.filter(field => field.fieldPath.startsWith('course.'))
    },
    {
      key: 'certificate',
      label: 'ข้อมูลเกียรติบัตร',
      icon: <AssignmentIcon />,
      fields: AVAILABLE_DATA_FIELDS.filter(field => field.fieldPath.startsWith('certificate.'))
    },
    {
      key: 'institution',
      label: 'ข้อมูลสถาบัน',
      icon: <BusinessIcon />,
      fields: AVAILABLE_DATA_FIELDS.filter(field => field.fieldPath.startsWith('institution.'))
    },
    {
      key: 'signatories',
      label: 'ข้อมูลผู้อนุมัติ/ลงนาม',
      icon: <SignatureIcon />,
      fields: AVAILABLE_DATA_FIELDS.filter(field => field.fieldPath.startsWith('signatories.'))
    },
    {
      key: 'custom',
      label: 'ข้อมูลเพิ่มเติม',
      icon: <CustomIcon />,
      fields: AVAILABLE_DATA_FIELDS.filter(field => field.fieldPath.startsWith('customFields.'))
    }
  ];

  // Filter fields based on search term
  const filteredGroups = fieldGroups.map(group => ({
    ...group,
    fields: group.fields.filter(field =>
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.fieldPath.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.fields.length > 0);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = dialogRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setDragPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'primary';
      case 'date': return 'secondary';
      case 'number': return 'success';
      case 'image': return 'warning';
      case 'qr-code': return 'info';
      default: return 'default';
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'date': return '📅';
      case 'number': return '🔢';
      case 'image': return '🖼️';
      case 'qr-code': return '📱';
      default: return '📄';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        ref: dialogRef,
        sx: {
          position: 'fixed',
          left: dragPosition.x,
          top: dragPosition.y,
          margin: 0,
          maxHeight: '80vh',
          width: '450px',
          cursor: isDragging ? 'grabbing' : 'default'
        }
      }}
      BackdropProps={{
        style: { backgroundColor: 'transparent' }
      }}
      disableEnforceFocus
      hideBackdrop={false}
    >
      {/* Draggable Header */}
      <DialogTitle
        onMouseDown={handleMouseDown}
        sx={{
          cursor: 'grab',
          backgroundColor: '#1976d2',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          '&:active': {
            cursor: 'grabbing'
          }
        }}
        className="drag-handle"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DragIcon />
          <Typography variant="h6">
            🔗 เลือกฟิลด์ข้อมูล
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'white', p: 0.5 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Search Bar */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="ค้นหาฟิลด์ข้อมูล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Field Groups */}
        <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
          {filteredGroups.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                ไม่พบฟิลด์ข้อมูลที่ตรงกับการค้นหา
              </Typography>
            </Box>
          ) : (
            filteredGroups.map((group) => (
              <Accordion key={group.key} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {group.icon}
                    <Typography variant="subtitle1" fontWeight="medium">
                      {group.label}
                    </Typography>
                    <Chip
                      label={group.fields.length}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List dense>
                    {group.fields.map((field) => (
                      <ListItem key={field.fieldPath} disablePadding>
                        <ListItemButton
                          onClick={() => onSelectField(field)}
                          sx={{
                            py: 1,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Typography fontSize="1.2em">
                              {getFieldTypeIcon(field.type)}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="medium">
                                  {field.label}
                                </Typography>
                                <Chip
                                  label={field.type}
                                  size="small"
                                  color={getFieldTypeColor(field.type) as any}
                                  variant="outlined"
                                />
                                {field.required && (
                                  <Chip
                                    label="จำเป็น"
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {field.fieldPath}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          คลิกที่ฟิลด์เพื่อเพิ่มลงใน Canvas
        </Typography>
        <Button onClick={onClose} variant="outlined">
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataBindingPopup;
