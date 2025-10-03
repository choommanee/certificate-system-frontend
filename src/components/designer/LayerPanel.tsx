// Layer Panel - Manage element layers and ordering

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  DragIndicator,
  MoreVert,
  Search,
  Clear,
  KeyboardArrowUp,
  KeyboardArrowDown,
  FileCopy,
  Delete,
  Edit,
  TextFields,
  Image,
  Category,
  Draw,
  QrCode,
  Timeline,
  TrendingUp,
  TableChart,
  Gesture,
} from '@mui/icons-material';
// Using native HTML5 drag and drop instead of react-beautiful-dnd
import { DesignerElement, ElementType } from '../../types/designer';

interface LayerPanelProps {
  elements: DesignerElement[];
  selectedElementIds: string[];
  onSelectElement: (elementId: string, multiSelect?: boolean) => void;
  onUpdateElement: (elementId: string, updates: Partial<DesignerElement>) => void;
  onReorderElements: (startIndex: number, endIndex: number) => void;
  onDeleteElements: (elementIds: string[]) => void;
  onDuplicateElements: (elementIds: string[]) => void;
}

const getElementIcon = (type: ElementType) => {
  switch (type) {
    case 'text':
      return <TextFields fontSize="small" />;
    case 'image':
      return <Image fontSize="small" />;
    case 'shape':
      return <Category fontSize="small" />;
    case 'signature':
      return <Gesture fontSize="small" />;
    case 'qr-code':
      return <QrCode fontSize="small" />;
    case 'barcode':
      return <Timeline fontSize="small" />;
    case 'line':
      return <Timeline fontSize="small" />;
    case 'arrow':
      return <TrendingUp fontSize="small" />;
    case 'chart':
      return <TrendingUp fontSize="small" />;
    case 'table':
      return <TableChart fontSize="small" />;
    default:
      return <Category fontSize="small" />;
  }
};

const getElementTypeLabel = (type: ElementType) => {
  switch (type) {
    case 'text':
      return 'ข้อความ';
    case 'image':
      return 'รูปภาพ';
    case 'shape':
      return 'รูปทรง';
    case 'signature':
      return 'ลายเซ็น';
    case 'qr-code':
      return 'QR Code';
    case 'barcode':
      return 'Barcode';
    case 'line':
      return 'เส้น';
    case 'arrow':
      return 'ลูกศร';
    case 'chart':
      return 'กราф';
    case 'table':
      return 'ตาราง';
    default:
      return type;
  }
};

export const LayerPanel: React.FC<LayerPanelProps> = ({
  elements,
  selectedElementIds,
  onSelectElement,
  onUpdateElement,
  onReorderElements,
  onDeleteElements,
  onDuplicateElements,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    elementId: string;
    anchorEl: HTMLElement;
  } | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Filter elements based on search term
  const filteredElements = elements.filter(element =>
    element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getElementTypeLabel(element.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort elements by z-index (top to bottom in layer panel)
  const sortedElements = [...filteredElements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  const [draggedElement, setDraggedElement] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setDraggedElement(elementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetElementId: string) => {
    e.preventDefault();
    if (!draggedElement || draggedElement === targetElementId) return;

    const draggedIndex = sortedElements.findIndex(el => el.id === draggedElement);
    const targetIndex = sortedElements.findIndex(el => el.id === targetElementId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      onReorderElements(draggedIndex, targetIndex);
    }
    
    setDraggedElement(null);
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
  };

  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    const multiSelect = event.ctrlKey || event.metaKey;
    onSelectElement(elementId, multiSelect);
  };

  const handleContextMenu = (elementId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      elementId,
      anchorEl: event.currentTarget as HTMLElement,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleToggleVisibility = (elementId: string, visible: boolean) => {
    onUpdateElement(elementId, { visible: !visible });
  };

  const handleToggleLock = (elementId: string, locked: boolean) => {
    onUpdateElement(elementId, { locked: !locked });
  };

  const handleStartEdit = (elementId: string, currentName: string) => {
    setEditingElementId(elementId);
    setEditingName(currentName);
    handleCloseContextMenu();
  };

  const handleFinishEdit = () => {
    if (editingElementId && editingName.trim()) {
      onUpdateElement(editingElementId, { name: editingName.trim() });
    }
    setEditingElementId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingElementId(null);
    setEditingName('');
  };

  const handleMoveUp = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const currentZIndex = element.zIndex || 0;
      onUpdateElement(elementId, { zIndex: currentZIndex + 1 });
    }
    handleCloseContextMenu();
  };

  const handleMoveDown = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const currentZIndex = element.zIndex || 0;
      onUpdateElement(elementId, { zIndex: Math.max(0, currentZIndex - 1) });
    }
    handleCloseContextMenu();
  };

  const handleDuplicate = (elementId: string) => {
    onDuplicateElements([elementId]);
    handleCloseContextMenu();
  };

  const handleDelete = (elementId: string) => {
    onDeleteElements([elementId]);
    handleCloseContextMenu();
  };

  return (
    <Paper
      sx={{
        width: 280,
        height: '100vh',
        borderRadius: 0,
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          เลเยอร์
        </Typography>
        
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="ค้นหาเลเยอร์..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                >
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Layer List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {sortedElements.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: '#666' }}>
            <Typography variant="body2">
              {searchTerm ? 'ไม่พบเลเยอร์ที่ค้นหา' : 'ยังไม่มีเลเยอร์'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {sortedElements.map((element, index) => (
              <ListItem
                key={element.id}
                draggable
                onDragStart={(e) => handleDragStart(e, element.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, element.id)}
                onDragEnd={handleDragEnd}
                sx={{
                  backgroundColor: selectedElementIds.includes(element.id)
                    ? 'primary.light'
                    : draggedElement === element.id
                    ? '#f5f5f5'
                    : 'transparent',
                  color: selectedElementIds.includes(element.id)
                    ? 'primary.contrastText'
                    : 'inherit',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  opacity: draggedElement === element.id ? 0.5 : 1,
                  '&:hover': {
                    backgroundColor: selectedElementIds.includes(element.id)
                      ? 'primary.main'
                      : '#f8f8f8',
                  },
                }}
                onClick={(e) => handleElementClick(element.id, e)}
                onContextMenu={(e) => handleContextMenu(element.id, e)}
              >
                {/* Drag Handle */}
                <ListItemIcon sx={{ minWidth: 32, cursor: 'grab' }}>
                  <DragIndicator fontSize="small" />
                </ListItemIcon>

                {/* Element Icon */}
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {getElementIcon(element.type)}
                </ListItemIcon>

                {/* Element Name */}
                <ListItemText
                  primary={
                    editingElementId === element.id ? (
                      <TextField
                        size="small"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleFinishEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleFinishEdit();
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        autoFocus
                        sx={{ 
                          '& .MuiInputBase-input': { 
                            py: 0.5,
                            fontSize: '0.875rem',
                          }
                        }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: selectedElementIds.includes(element.id) ? 600 : 400,
                            opacity: element.visible === false ? 0.5 : 1,
                          }}
                        >
                          {element.name || 'Unnamed Element'}
                        </Typography>
                        <Chip
                          label={getElementTypeLabel(element.type)}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: '0.6875rem',
                            opacity: 0.7,
                          }}
                        />
                      </Box>
                    )
                  }
                />

                {/* Actions */}
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={element.visible === false ? 'แสดง' : 'ซ่อน'}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(element.id, element.visible !== false);
                        }}
                      >
                        {element.visible === false ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={element.locked ? 'ปลดล็อค' : 'ล็อค'}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLock(element.id, element.locked === true);
                        }}
                      >
                        {element.locked ? (
                          <Lock fontSize="small" />
                        ) : (
                          <LockOpen fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Footer Info */}
      {elements.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="text.secondary">
            ทั้งหมด {elements.length} เลเยอร์
            {selectedElementIds.length > 0 && (
              <> • เลือก {selectedElementIds.length} รายการ</>
            )}
          </Typography>
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={contextMenu?.anchorEl}
        open={Boolean(contextMenu)}
        onClose={handleCloseContextMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem
          onClick={() => contextMenu && handleStartEdit(contextMenu.elementId, 
            elements.find(el => el.id === contextMenu.elementId)?.name || ''
          )}
        >
          <Edit sx={{ mr: 1 }} fontSize="small" />
          เปลี่ยนชื่อ
        </MenuItem>
        
        <Divider />
        
        <MenuItem
          onClick={() => contextMenu && handleMoveUp(contextMenu.elementId)}
        >
          <KeyboardArrowUp sx={{ mr: 1 }} fontSize="small" />
          ย้ายขึ้น
        </MenuItem>
        
        <MenuItem
          onClick={() => contextMenu && handleMoveDown(contextMenu.elementId)}
        >
          <KeyboardArrowDown sx={{ mr: 1 }} fontSize="small" />
          ย้ายลง
        </MenuItem>
        
        <Divider />
        
        <MenuItem
          onClick={() => contextMenu && handleDuplicate(contextMenu.elementId)}
        >
          <FileCopy sx={{ mr: 1 }} fontSize="small" />
          คัดลอก
        </MenuItem>
        
        <MenuItem
          onClick={() => contextMenu && handleDelete(contextMenu.elementId)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" />
          ลบ
        </MenuItem>
      </Menu>
    </Paper>
  );
};
