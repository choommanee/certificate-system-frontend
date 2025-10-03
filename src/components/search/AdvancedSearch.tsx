import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Autocomplete,
  Slider,
  FormControlLabel,
  Switch,
  Pagination,
  CircularProgress,
  Alert,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  Save,
  ExpandMore,
  ExpandLess,
  Assignment,
  Person,
  DateRange,
  Category,
  Star,
  Visibility,
  Download,
  Edit,
  Delete,
  BookmarkBorder,
  TrendingUp,
  AccessTime,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface SearchFilters {
  query: string;
  category: string;
  status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  createdBy: string;
  templateId: string;
  tags: string[];
  minRating: number;
  includeArchived: boolean;
}

interface SearchResult {
  id: string;
  type: 'certificate' | 'template' | 'user';
  title: string;
  subtitle: string;
  description: string;
  status: string;
  createdAt: string;
  createdBy: string;
  tags: string[];
  rating?: number;
  thumbnail?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
}

const AdvancedSearch: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    status: '',
    dateFrom: null,
    dateTo: null,
    createdBy: '',
    templateId: '',
    tags: [],
    minRating: 0,
    includeArchived: false,
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Mock data
  const categories = ['การศึกษา', 'วิชาชีพ', 'ความสำเร็จ', 'การฝึกอบรม', 'สัมมนา'];
  const statuses = ['ร่าง', 'ใช้งาน', 'เก็บถาวร', 'รอดำเนินการ', 'อนุมัติ', 'ปฏิเสธ'];
  const users = ['สมชาย ใจดี', 'สมหญิง รักงาน', 'บุญชู ขยัน', 'มาลี สวยงาม'];
  const availableTags = ['ด่วน', 'แนะนำ', 'ยอดนิยม', 'ใหม่', 'อัปเดต', 'พรีเมียม'];

  useEffect(() => {
    // Load saved searches
    const mockSavedSearches: SavedSearch[] = [
      {
        id: '1',
        name: 'เกียรติบัตรที่ใช้งาน',
        filters: { ...filters, status: 'ใช้งาน', query: 'เกียรติบัตร' },
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        name: 'เทมเพลตล่าสุด',
        filters: { ...filters, dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        createdAt: '2024-01-14T15:30:00Z',
      },
      {
        id: '3',
        name: 'เกียรติบัตรยอดนิยม',
        filters: { ...filters, tags: ['ยอดนิยม'], minRating: 4 },
        createdAt: '2024-01-13T09:15:00Z',
      },
    ];
    setSavedSearches(mockSavedSearches);
  }, []);

  const handleSearch = async (page = 1) => {
    setIsSearching(true);
    setCurrentPage(page);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'certificate',
          title: 'เกียรติบัตรสำเร็จหลักสูตร - การพัฒนา React',
          subtitle: 'สมชาย ใจดี • ออกให้ 15 ม.ค. 2567',
          description: 'เกียรติบัตรสำหรับการสำเร็จหลักสูตรการพัฒนา React ขั้นสูง ด้วยเกรด A',
          status: 'ใช้งาน',
          createdAt: '2024-01-15T10:00:00Z',
          createdBy: 'สมหญิง รักงาน',
          tags: ['แนะนำ', 'ยอดนิยม'],
          rating: 4.8,
        },
        {
          id: '2',
          type: 'template',
          title: 'เทมเพลตรางวัลความสำเร็จระดับมืออาชีพ',
          subtitle: 'เทมเพลต • สร้างเมื่อ 10 ม.ค. 2567',
          description: 'เทมเพลตสมัยใหม่สำหรับรางวัลความสำเร็จและการยกย่องระดับมืออาชีพ',
          status: 'ใช้งาน',
          createdAt: '2024-01-10T14:30:00Z',
          createdBy: 'บุญชู ขยัน',
          tags: ['พรีเมียม', 'ใหม่'],
          rating: 4.5,
        },
        {
          id: '3',
          type: 'user',
          title: 'มาลี สวยงาม',
          subtitle: 'เจ้าหน้าที่ • เข้าร่วมเมื่อ ธ.ค. 2566',
          description: 'นักออกแบบเกียรติบัตรและผู้สร้างเทมเพลต เชี่ยวชาญด้านเกียรติบัตรการศึกษา',
          status: 'ใช้งาน',
          createdAt: '2023-12-01T09:00:00Z',
          createdBy: 'ระบบ',
          tags: ['เจ้าหน้าที่'],
        },
        {
          id: '4',
          type: 'certificate',
          title: 'เกียรติบัตรการเข้าร่วมสัมมนา - เทคโนโลยี AI',
          subtitle: 'บุญชู ขยัน • ออกให้ 12 ม.ค. 2567',
          description: 'เกียรติบัตรสำหรับการเข้าร่วมสัมมนาเทคโนโลยี AI และการประยุกต์ใช้',
          status: 'ใช้งาน',
          createdAt: '2024-01-12T16:00:00Z',
          createdBy: 'มาลี สวยงาม',
          tags: ['ด่วน', 'อัปเดต'],
          rating: 4.2,
        },
        {
          id: '5',
          type: 'template',
          title: 'เทมเพลตเกียรติบัตรการฝึกอบรม',
          subtitle: 'เทมเพลต • สร้างเมื่อ 8 ม.ค. 2567',
          description: 'เทมเพลตสำหรับเกียรติบัตรการฝึกอบรมทั่วไป เหมาะสำหรับองค์กรและสถาบัน',
          status: 'ใช้งาน',
          createdAt: '2024-01-08T11:20:00Z',
          createdBy: 'สมชาย ใจดี',
          tags: ['ยอดนิยม'],
          rating: 4.6,
        },
      ];

      // Filter results based on search criteria
      let filteredResults = mockResults;
      
      if (filters.query) {
        filteredResults = filteredResults.filter(result =>
          result.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          result.description.toLowerCase().includes(filters.query.toLowerCase())
        );
      }

      if (filters.status) {
        filteredResults = filteredResults.filter(result => result.status === filters.status);
      }

      if (filters.tags.length > 0) {
        filteredResults = filteredResults.filter(result =>
          filters.tags.some(tag => result.tags.includes(tag))
        );
      }

      setResults(filteredResults);
      setTotalResults(filteredResults.length);
      setTotalPages(Math.ceil(filteredResults.length / 10));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      category: '',
      status: '',
      dateFrom: null,
      dateTo: null,
      createdBy: '',
      templateId: '',
      tags: [],
      minRating: 0,
      includeArchived: false,
    });
    setResults([]);
  };

  const handleSaveSearch = () => {
    const name = prompt('ใส่ชื่อสำหรับการค้นหานี้:');
    if (name) {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name,
        filters: { ...filters },
        createdAt: new Date().toISOString(),
      };
      setSavedSearches(prev => [...prev, newSearch]);
    }
  };

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    handleSearch();
  };

  const handleDeleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'certificate': return <Assignment />;
      case 'template': return <Category />;
      case 'user': return <Person />;
      default: return <Assignment />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ใช้งาน': return 'success';
      case 'ร่าง': return 'warning';
      case 'เก็บถาวร': return 'default';
      case 'รอดำเนินการ': return 'info';
      case 'อนุมัติ': return 'success';
      case 'ปฏิเสธ': return 'error';
      default: return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white'
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              🔍 ค้นหาขั้นสูง
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              ค้นหาเกียรติบัตร เทมเพลต และผู้ใช้งานในระบบ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={savedSearches.length} color="secondary">
              <BookmarkBorder sx={{ fontSize: 32 }} />
            </Badge>
          </Box>
        </Box>

        {/* Search Form */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="ค้นหา"
                placeholder="ค้นหาเกียรติบัตร เทมเพลต ผู้ใช้งาน..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={isSearching ? <CircularProgress size={16} color="inherit" /> : <Search />}
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  sx={{ 
                    flexGrow: 1,
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600
                  }}
                >
                  {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={showAdvancedFilters ? <ExpandLess /> : <ExpandMore />}
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 600
                  }}
                >
                  ตัวกรอง
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          <Collapse in={showAdvancedFilters}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <FilterList sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
              ตัวกรองขั้นสูง
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>หมวดหมู่</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="หมวดหมู่"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">ทุกหมวดหมู่</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>สถานะ</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="สถานะ"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">ทุกสถานะ</MenuItem>
                    {statuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="วันที่เริ่มต้น"
                  value={filters.dateFrom}
                  onChange={(date) => handleFilterChange('dateFrom', date)}
                  renderInput={(params) => <TextField {...params} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="วันที่สิ้นสุด"
                  value={filters.dateTo}
                  onChange={(date) => handleFilterChange('dateTo', date)}
                  renderInput={(params) => <TextField {...params} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  multiple
                  options={availableTags}
                  value={filters.tags}
                  onChange={(_, value) => handleFilterChange('tags', value)}
                  renderInput={(params) => (
                    <TextField {...params} label="แท็ก" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        color="primary"
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
                  คะแนนขั้นต่ำ: {filters.minRating} ⭐
                </Typography>
                <Slider
                  value={filters.minRating}
                  onChange={(_, value) => handleFilterChange('minRating', value)}
                  min={0}
                  max={5}
                  step={0.5}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ color: 'primary.main' }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.includeArchived}
                      onChange={(e) => handleFilterChange('includeArchived', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="รวมรายการที่เก็บถาวร"
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                startIcon={<Clear />}
                onClick={handleClearFilters}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                ล้างตัวกรอง
              </Button>
              <Button
                startIcon={<Save />}
                onClick={handleSaveSearch}
                variant="contained"
                sx={{ borderRadius: 2 }}
              >
                บันทึกการค้นหา
              </Button>
            </Box>
          </Collapse>
        </Paper>

        <Grid container spacing={4}>
          {/* Saved Searches */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                <BookmarkBorder sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                การค้นหาที่บันทึกไว้
              </Typography>
              <List>
                {savedSearches.map((search) => (
                  <ListItem 
                    key={search.id} 
                    divider
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'grey.50',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Star sx={{ color: 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {search.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {new Date(search.createdAt).toLocaleDateString('th-TH')}
                        </Typography>
                      }
                      onClick={() => handleLoadSavedSearch(search)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSavedSearch(search.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {savedSearches.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BookmarkBorder sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    ยังไม่มีการค้นหาที่บันทึกไว้
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Search Results */}
          <Grid item xs={12} md={9}>
            {totalResults > 0 && (
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ผลการค้นหา
                  </Typography>
                  <Chip 
                    label={`${totalResults} รายการ`} 
                    color="primary" 
                    variant="outlined"
                    icon={<TrendingUp />}
                  />
                </Box>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => handleSearch(page)}
                  color="primary"
                />
              </Box>
            )}

            {results.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {results.map((result) => (
                  <Card 
                    key={result.id} 
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                        <Box 
                          sx={{ 
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {getResultIcon(result.type)}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            {result.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ fontSize: 16 }} />
                            {result.subtitle}
                          </Typography>
                          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                            {result.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={result.status}
                              size="small"
                              color={getStatusColor(result.status) as any}
                              variant="filled"
                            />
                            {result.rating && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, bgcolor: 'warning.light', borderRadius: 1 }}>
                                <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {result.rating}
                                </Typography>
                              </Box>
                            )}
                            {result.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ))}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            sx={{ 
                              bgcolor: 'primary.light',
                              color: 'primary.main',
                              '&:hover': { bgcolor: 'primary.main', color: 'white' }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton 
                            size="small"
                            sx={{ 
                              bgcolor: 'success.light',
                              color: 'success.main',
                              '&:hover': { bgcolor: 'success.main', color: 'white' }
                            }}
                          >
                            <Download />
                          </IconButton>
                          <IconButton 
                            size="small"
                            sx={{ 
                              bgcolor: 'warning.light',
                              color: 'warning.main',
                              '&:hover': { bgcolor: 'warning.main', color: 'white' }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : !isSearching && filters.query ? (
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: 3,
                  p: 3,
                  fontSize: '1rem'
                }}
              >
                ไม่พบผลการค้นหาที่ตรงกับเงื่อนไข ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา
              </Alert>
            ) : (
              <Paper sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <Search sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                  เริ่มต้นการค้นหา
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  ใส่คำค้นหาหรือใช้ตัวกรองเพื่อค้นหาเกียรติบัตร เทมเพลต และผู้ใช้งาน
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AdvancedSearch;