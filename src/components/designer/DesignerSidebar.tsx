// Designer Sidebar - Polotno-style tool panels

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  InputAdornment,
  Divider,
  Chip,
} from '@mui/material';
import {
  TextFields,
  Image,
  Crop,
  Draw,
  QrCode,
  BarChart,
  TableChart,
  Timeline,
  Star,
  Circle,
  Rectangle,
  Search,
  CloudUpload,
  Palette,
  FormatShapes,
  Category,
  Business,
  School,
  EmojiEvents,
  Description,
  DataObject,
  Person,
  Assignment,
  DateRange,
} from '@mui/icons-material';
import { ElementType } from '../../types/designer';

interface DesignerSidebarProps {
  onAddElement: (element: any) => void;
  onSelectTemplate?: (templateId: string) => void;
  onAddTemplateVariable?: (fieldPath: string) => void;
  availableDataFields?: Array<{
    fieldPath: string;
    label: string;
    description: string;
    category: string;
  }>;
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
}

interface ToolItem {
  id: ElementType;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'basic' | 'media' | 'interactive' | 'data';
}

interface TemplateCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  templates: Array<{
    id: string;
    name: string;
    thumbnail: string;
    description: string;
  }>;
}

const TOOL_ITEMS: ToolItem[] = [
  {
    id: 'text',
    name: 'ข้อความ',
    icon: <TextFields />,
    description: 'เพิ่มข้อความและหัวข้อ',
    category: 'basic',
  },
  {
    id: 'image',
    name: 'รูปภาพ',
    icon: <Image />,
    description: 'อัปโหลดและจัดการรูปภาพ',
    category: 'media',
  },
  {
    id: 'shape',
    name: 'รูปทรง',
    icon: <FormatShapes />,
    description: 'สี่เหลี่ยม วงกลม และรูปทรงอื่นๆ',
    category: 'basic',
  },
  {
    id: 'signature',
    name: 'ลายเซ็น',
    icon: <Draw />,
    description: 'ช่องสำหรับลายเซ็นผู้ใช้',
    category: 'interactive',
  },
  {
    id: 'qr-code',
    name: 'QR Code',
    icon: <QrCode />,
    description: 'สร้าง QR Code สำหรับลิงก์',
    category: 'interactive',
  },
  {
    id: 'barcode',
    name: 'บาร์โค้ด',
    icon: <Timeline />,
    description: 'สร้างบาร์โค้ดต่างๆ',
    category: 'interactive',
  },
  {
    id: 'line',
    name: 'เส้น',
    icon: <Timeline />,
    description: 'เส้นตรงและเส้นโค้ง',
    category: 'basic',
  },
  {
    id: 'arrow',
    name: 'ลูกศร',
    icon: <Timeline />,
    description: 'ลูกศรชี้ทิศทาง',
    category: 'basic',
  },
  {
    id: 'icon',
    name: 'ไอคอน',
    icon: <Star />,
    description: 'ไอคอนและสัญลักษณ์',
    category: 'basic',
  },
  {
    id: 'chart',
    name: 'กราฟ',
    icon: <BarChart />,
    description: 'กราฟและแผนภูมิ',
    category: 'data',
  },
  {
    id: 'table',
    name: 'ตาราง',
    icon: <TableChart />,
    description: 'ตารางข้อมูล',
    category: 'data',
  },
];

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'certificates',
    name: 'เกียรติบัตร',
    icon: <EmojiEvents />,
    templates: [
      {
        id: 'cert-academic',
        name: 'เกียรติบัตรวิชาการ',
        thumbnail: '/templates/cert-academic.png',
        description: 'เกียรติบัตรสำหรับงานวิชาการ',
      },
      {
        id: 'cert-achievement',
        name: 'เกียรติบัตรความสำเร็จ',
        thumbnail: '/templates/cert-achievement.png',
        description: 'เกียรติบัตรสำหรับความสำเร็จ',
      },
      {
        id: 'cert-participation',
        name: 'เกียรติบัตรเข้าร่วม',
        thumbnail: '/templates/cert-participation.png',
        description: 'เกียรติบัตรสำหรับการเข้าร่วมกิจกรรม',
      },
    ],
  },
  {
    id: 'business',
    name: 'ธุรกิจ',
    icon: <Business />,
    templates: [
      {
        id: 'business-letter',
        name: 'จดหมายธุรกิจ',
        thumbnail: '/templates/business-letter.png',
        description: 'เทมเพลตจดหมายธุรกิจ',
      },
      {
        id: 'invoice',
        name: 'ใบแจ้งหนี้',
        thumbnail: '/templates/invoice.png',
        description: 'ใบแจ้งหนี้และใบเสร็จ',
      },
    ],
  },
  {
    id: 'education',
    name: 'การศึกษา',
    icon: <School />,
    templates: [
      {
        id: 'transcript',
        name: 'ใบแสดงผลการเรียน',
        thumbnail: '/templates/transcript.png',
        description: 'ใบแสดงผลการเรียน',
      },
      {
        id: 'diploma',
        name: 'ประกาศนียบัตร',
        thumbnail: '/templates/diploma.png',
        description: 'ประกาศนียบัตรการศึกษา',
      },
    ],
  },
];

const SHAPE_TYPES = [
  { type: 'rectangle', name: 'สี่เหลี่ยม', icon: <Rectangle /> },
  { type: 'circle', name: 'วงกลม', icon: <Circle /> },
  { type: 'triangle', name: 'สามเหลี่ยม', icon: <FormatShapes /> },
  { type: 'polygon', name: 'หลายเหลี่ยม', icon: <FormatShapes /> },
  { type: 'star', name: 'ดาว', icon: <Star /> },
  { type: 'heart', name: 'หัวใจ', icon: <Star /> },
];

export const DesignerSidebar: React.FC<DesignerSidebarProps> = ({
  onAddElement,
  onSelectTemplate,
  onAddTemplateVariable,
  availableDataFields = [],
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddElement = (type: ElementType, options?: any) => {
    // Create element based on type
    const element = {
      id: `${type}_${Date.now()}`,
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 40 : 100,
      ...options,
    };
    onAddElement(element);
  };

  const handleAddTemplateVariable = (fieldPath: string) => {
    if (onAddTemplateVariable) {
      onAddTemplateVariable(fieldPath);
    }
  };

  const filteredTools = TOOL_ITEMS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTemplates = TEMPLATE_CATEGORIES.map(category => ({
    ...category,
    templates: category.templates.filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.templates.length > 0);

  return (
    <Paper
      sx={{
        width: 320,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderRight: '1px solid #e0e0e0',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
          Designer Tools
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: '1px solid #e0e0e0' }}
      >
        <Tab label="เครื่องมือ" />
        <Tab label="ข้อมูล" />
        <Tab label="เทมเพลต" />
      </Tabs>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Search */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="ค้นหา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Tab Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 0 && (
            <>
              {/* Category Filter */}
              <Box sx={{ px: 2, pb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label="ทั้งหมด"
                    size="small"
                    color={selectedCategory === 'all' ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory('all')}
                  />
                  <Chip
                    label="พื้นฐาน"
                    size="small"
                    color={selectedCategory === 'basic' ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory('basic')}
                  />
                  <Chip
                    label="สื่อ"
                    size="small"
                    color={selectedCategory === 'media' ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory('media')}
                  />
                  <Chip
                    label="โต้ตอบ"
                    size="small"
                    color={selectedCategory === 'interactive' ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory('interactive')}
                  />
                  <Chip
                    label="ข้อมูล"
                    size="small"
                    color={selectedCategory === 'data' ? 'primary' : 'default'}
                    onClick={() => setSelectedCategory('data')}
                  />
                </Box>
              </Box>

              {/* Tools List */}
              <List sx={{ px: 1 }}>
                {filteredTools.map((tool) => (
                  <ListItem key={tool.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => {
                        if (tool.id === 'shape') {
                          // Show shape options
                          return;
                        }
                        if (tool.id === 'signature' && currentUser) {
                          handleAddElement(tool.id, { userId: currentUser.id });
                        } else {
                          handleAddElement(tool.id);
                        }
                      }}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: '#1976d2' }}>
                        {tool.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={tool.name}
                        secondary={tool.description}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.75rem',
                          color: '#666',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              {/* Shape Options (when shape tool is expanded) */}
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  รูปทรง
                </Typography>
                <Grid container spacing={1}>
                  {SHAPE_TYPES.map((shape) => (
                    <Grid item xs={6} key={shape.type}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                        onClick={() => handleAddElement('shape', { shapeType: shape.type })}
                      >
                        <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                          <Box sx={{ color: '#1976d2', mb: 0.5 }}>
                            {shape.icon}
                          </Box>
                          <Typography variant="caption" display="block">
                            {shape.name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </>
          )}

          {activeTab === 1 && (
            <Box sx={{ px: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                🔗 Template Variables
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                เลือกฟิลด์ข้อมูลเพื่อเพิ่มลงในเทมเพลต
              </Typography>

              {availableDataFields.length > 0 ? (
                <>
                  {['user', 'course', 'certificate', 'institution'].map((category) => {
                    const categoryFields = availableDataFields.filter(field => field.category === category);
                    if (categoryFields.length === 0) return null;

                    const categoryIcons = {
                      user: <Person />,
                      course: <School />,
                      certificate: <Assignment />,
                      institution: <Business />
                    };

                    const categoryNames = {
                      user: 'ข้อมูลผู้รับ',
                      course: 'ข้อมูลหลักสูตร',
                      certificate: 'ข้อมูลเกียรติบัตร',
                      institution: 'ข้อมูลสถาบัน'
                    };

                    return (
                      <Box key={category} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ color: '#1976d2', mr: 1 }}>
                            {categoryIcons[category as keyof typeof categoryIcons]}
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {categoryNames[category as keyof typeof categoryNames]}
                          </Typography>
                        </Box>
                        
                        <List dense>
                          {categoryFields.map((field) => (
                            <ListItem key={field.fieldPath} disablePadding>
                              <ListItemButton
                                onClick={() => handleAddTemplateVariable(field.fieldPath)}
                                sx={{
                                  borderRadius: 1,
                                  mb: 0.5,
                                  '&:hover': {
                                    backgroundColor: '#e3f2fd',
                                  },
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <DataObject sx={{ fontSize: 20, color: '#1976d2' }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={field.label}
                                  secondary={field.description}
                                  primaryTypographyProps={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                  }}
                                  secondaryTypographyProps={{
                                    fontSize: '0.75rem',
                                    color: '#666',
                                  }}
                                />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                        
                        {category !== 'institution' && <Divider sx={{ my: 2 }} />}
                      </Box>
                    );
                  })}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <DataObject sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    ไม่มีฟิลด์ข้อมูลที่ใช้ได้
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ px: 2 }}>
              {filteredTemplates.map((category) => (
                <Box key={category.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: '#1976d2', mr: 1 }}>
                      {category.icon}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {category.templates.map((template) => (
                      <Grid item xs={12} key={template.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { 
                              boxShadow: 2,
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                          onClick={() => onSelectTemplate?.(template.id)}
                        >
                          <CardMedia
                            component="img"
                            height="120"
                            image={template.thumbnail}
                            alt={template.name}
                            sx={{ 
                              backgroundColor: '#f5f5f5',
                              objectFit: 'cover',
                            }}
                          />
                          <CardContent sx={{ p: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {template.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {template.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {category !== filteredTemplates[filteredTemplates.length - 1] && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};
