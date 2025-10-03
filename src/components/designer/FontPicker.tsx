// Font Picker Component for Certificate Designer
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  TextFields as FontIcon
} from '@mui/icons-material';
import FontService, { GoogleFont, POPULAR_GOOGLE_FONTS } from '../../services/fontService';

interface FontPickerProps {
  selectedFont?: string;
  onFontSelect: (fontFamily: string) => void;
  maxHeight?: number;
}

const FontPicker: React.FC<FontPickerProps> = ({
  selectedFont = 'Sarabun',
  onFontSelect,
  maxHeight = 400
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set());
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Group fonts by category
  const fontsByCategory = FontService.getFontsByCategory();

  // Filter fonts based on search
  const filteredFonts = searchTerm
    ? FontService.searchFonts(searchTerm)
    : POPULAR_GOOGLE_FONTS;

  // Group filtered fonts by category
  const filteredByCategory = filteredFonts.reduce((acc, font) => {
    if (!acc[font.category]) {
      acc[font.category] = [];
    }
    acc[font.category].push(font);
    return acc;
  }, {} as Record<string, GoogleFont[]>);

  // Load font when selected
  const handleFontSelect = async (font: GoogleFont) => {
    setError(null);
    
    if (FontService.isFontLoaded(font.family)) {
      onFontSelect(font.family);
      return;
    }

    setLoadingFonts(prev => new Set(prev).add(font.family));

    try {
      await FontService.loadGoogleFont(font.family, ['400', '500', '600', '700']);
      setLoadedFonts(prev => new Set(prev).add(font.family));
      onFontSelect(font.family);
    } catch (error) {
      console.error('Failed to load font:', error);
      setError(`ไม่สามารถโหลดฟอนต์ ${font.family} ได้`);
    } finally {
      setLoadingFonts(prev => {
        const newSet = new Set(prev);
        newSet.delete(font.family);
        return newSet;
      });
    }
  };

  // Preload popular fonts on mount
  useEffect(() => {
    FontService.preloadPopularFonts().catch(console.error);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sans-serif': return '🔤';
      case 'serif': return '📰';
      case 'handwriting': return '✍️';
      case 'display': return '🎨';
      case 'monospace': return '💻';
      default: return '📝';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'sans-serif': return 'Sans Serif';
      case 'serif': return 'Serif';
      case 'handwriting': return 'Handwriting';
      case 'display': return 'Display';
      case 'monospace': return 'Monospace';
      default: return category;
    }
  };

  return (
    <Box>
      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="ค้นหาฟอนต์..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          )
        }}
        sx={{ mb: 2 }}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Font Categories */}
      <Box sx={{ maxHeight, overflow: 'auto' }}>
        {Object.entries(filteredByCategory).map(([category, fonts]) => (
          <Accordion key={category} defaultExpanded={category === 'sans-serif'}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontSize="1.2em">
                  {getCategoryIcon(category)}
                </Typography>
                <Typography variant="subtitle2" fontWeight="medium">
                  {getCategoryLabel(category)}
                </Typography>
                <Chip
                  label={fonts.length}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense>
                {fonts.map((font) => {
                  const isLoading = loadingFonts.has(font.family);
                  const isLoaded = FontService.isFontLoaded(font.family) || loadedFonts.has(font.family);
                  const isSelected = selectedFont === font.family;

                  return (
                    <ListItem key={font.family} disablePadding>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => handleFontSelect(font)}
                        disabled={isLoading}
                        sx={{
                          py: 1,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.dark'
                            }
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                sx={{
                                  fontFamily: isLoaded ? font.family : 'inherit',
                                  color: isSelected ? 'inherit' : 'text.primary'
                                }}
                              >
                                {font.family}
                              </Typography>
                              {isLoading && (
                                <CircularProgress size={16} />
                              )}
                              {isLoaded && !isLoading && (
                                <Chip
                                  label="โหลดแล้ว"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                              {font.subsets.includes('thai') && (
                                <Chip
                                  label="ไทย"
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: isLoaded ? font.family : 'inherit',
                                color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                              }}
                            >
                              The quick brown fox jumps over the lazy dog
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Font Info */}
      <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 ฟอนต์จะถูกโหลดอัตโนมัติเมื่อคุณเลือก • รองรับฟอนต์ไทยและอังกฤษ
        </Typography>
      </Box>
    </Box>
  );
};

export default FontPicker;
