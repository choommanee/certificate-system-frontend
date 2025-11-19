// Polotno-Style Certificate Designer with Template Variable Support

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Alert,
  IconButton,
  Toolbar,
  Tooltip,
  TextField,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Tab,
  Tabs,
  Grid,
  Switch,
  FormControlLabel,
  ListItemIcon,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  GetApp as ExportIcon,
  Visibility as PreviewIcon,
  DataObject as DataIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Crop as ShapeIcon,
  QrCode as QrCodeIcon,
  Palette as ColorIcon,
  FormatSize as SizeIcon,
  Layers as LayersIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  GridOn as GridIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  AspectRatio as PaperSizeIcon,
  ScreenRotation as RotateIcon,
  Draw as SignatureIcon,
} from '@mui/icons-material';
import { Stage, Layer, Text, Rect, Group, Circle } from 'react-konva';
import Konva from 'konva';
import { 
  CertificateData, 
  TemplateVariableElement, 
  AVAILABLE_DATA_FIELDS,
  DataBinding
} from '../../types/certificate-template';
import DataBindingService from '../../services/dataBindingService';
import DataBindingPopup from './DataBindingPopup';
import FontPicker from './FontPicker';
import FontService from '../../services/fontService';
import ElementPropertiesPanel from './ElementPropertiesPanel';
import ImageElement, { ImageElementData } from './ImageElement';
import { TextElement } from './TextElement';
import ImageUploadDialog from './ImageUploadDialog';
import SignaturePickerDialog from './SignaturePickerDialog';
import TemplateService, { CertificateTemplate } from '../../services/templateService';
import type { Signature } from '../../services/api/types';

interface SimpleCertificateDesignerProps {
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
  onSave?: (document: any) => void;
  onExport?: (format: 'pdf' | 'png' | 'jpg', document: any) => void;
  isPreviewMode?: boolean;
  certificateData?: CertificateData;
}

const SimpleCertificateDesigner: React.FC<SimpleCertificateDesignerProps> = ({
  currentUser,
  onSave,
  onExport,
  isPreviewMode = false,
  certificateData,
}) => {
  const stageRef = useRef<any>(null);
  const [elements, setElements] = useState<TemplateVariableElement[]>([]);
  const [imageElements, setImageElements] = useState<ImageElementData[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showDataBindingPopup, setShowDataBindingPopup] = useState(false);
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false);
  const [showSignaturePickerDialog, setShowSignaturePickerDialog] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showSavedTemplatesModal, setShowSavedTemplatesModal] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFormData, setSaveFormData] = useState({ name: '', description: '' });
  const [popupPosition, setPopupPosition] = useState({ x: 100, y: 100 });
  const [activeTab, setActiveTab] = useState(0);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [layerSearchTerm, setLayerSearchTerm] = useState('');
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize] = useState(20); // Grid size in pixels
  const [snapToGrid] = useState(true); // Enable snap to grid
  const [contextMenu, setContextMenu] = useState<{
    elementId: string;
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  // Paper size and orientation
  const [paperSize, setPaperSize] = useState<string>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  
  // Canvas background
  const [canvasBackground, setCanvasBackground] = useState<string>('#ffffff');
  
  // Saved templates state
  const [savedTemplates, setSavedTemplates] = useState<CertificateTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  // Dialog states for better UX
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });
  
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    severity?: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, title: '', message: '' });

  // Paper size presets (in pixels at 96 DPI)
  const paperSizes = {
    'A4': { width: 794, height: 1123 },
    'A3': { width: 1123, height: 1587 },
    'A5': { width: 559, height: 794 },
    'Letter': { width: 816, height: 1056 },
    'Legal': { width: 816, height: 1344 },
    'Custom': { width: 800, height: 600 }
  };

  // Calculate canvas dimensions based on paper size and orientation
  const getCanvasDimensions = () => {
    const size = paperSizes[paperSize as keyof typeof paperSizes];
    if (orientation === 'portrait') {
      return { width: size.width, height: size.height };
    } else {
      return { width: size.height, height: size.width };
    }
  };

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();

  // Load saved templates from API and localStorage on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoadingTemplates(true);
      setTemplateError(null);
      
      try {
        // Try to load from API first
        const apiTemplates = await TemplateService.getUserTemplates();
        setSavedTemplates(apiTemplates || []);
        
        // Sync with localStorage if needed
        await TemplateService.syncWithLocalStorage();
        
        // Reload templates after sync
        const updatedTemplates = await TemplateService.getUserTemplates();
        setSavedTemplates(updatedTemplates || []);
        
      } catch (error) {
        console.error('Error loading templates from API:', error);
        setTemplateError('Failed to load templates from server');
        
        // Fallback to localStorage
        const savedTemplatesData = localStorage.getItem('savedCertificateTemplates');
        if (savedTemplatesData) {
          try {
            const localTemplates = JSON.parse(savedTemplatesData);
            setSavedTemplates(localTemplates);
          } catch (localError) {
            console.error('Error loading saved templates from localStorage:', localError);
            setSavedTemplates([]);
          }
        }
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    
    loadTemplates();
  }, []);

  // Load popular fonts on mount
  useEffect(() => {
    FontService.preloadPopularFonts();
  }, []);

  // Add template variable to canvas
  const addTemplateVariable = (fieldPath: string) => {
    const dataBinding = AVAILABLE_DATA_FIELDS.find(field => field.fieldPath === fieldPath);
    if (!dataBinding) return;

    const newElement = DataBindingService.createTemplateVariable(
      dataBinding,
      Math.random() * (canvasWidth - 200) + 50,
      Math.random() * (canvasHeight - 100) + 50,
      250,
      40
    );

    setElements(prev => [...prev, newElement]);
  };

  // Handle field selection from popup
  const handleFieldSelect = (field: DataBinding) => {
    const newElement = DataBindingService.createTemplateVariable(
      field,
      Math.random() * (canvasWidth - 200) + 50,
      Math.random() * (canvasHeight - 100) + 50,
      250,
      40
    );

    setElements(prev => [...prev, newElement]);
    setShowDataBindingPopup(false);
  };

  // Open data binding popup
  const openDataBindingPopup = () => {
    setPopupPosition({ x: window.innerWidth / 2 - 225, y: window.innerHeight / 2 - 300 });
    setShowDataBindingPopup(true);
  };

  // Add basic text element
  const addBasicTextElement = () => {
    const basicTextField: DataBinding = {
      fieldPath: 'static.text',
      label: 'Static Text',
      type: 'text',
      defaultValue: 'Click to edit text'
    };

    const newElement = DataBindingService.createTemplateVariable(
      basicTextField,
      Math.random() * (canvasWidth - 200) + 50,
      Math.random() * (canvasHeight - 100) + 50,
      200,
      40
    );

    // Override placeholder for static text
    newElement.properties.placeholder = 'Click to edit text';
    
    setElements(prev => [...prev, newElement]);
  };

  // Add QR Code element
  const addQRCodeElement = () => {
    const qrField: DataBinding = {
      fieldPath: 'verification_url',
      label: 'QR Code',
      type: 'qr-code'
    };
    const newElement = DataBindingService.createTemplateVariable(qrField, 100, 100, 80, 80);
    newElement.properties.placeholder = 'QR Code';
    setElements(prev => [...prev, newElement]);
  };

  // Add Rectangle element
  const addRectangleElement = () => {
    const rectField: DataBinding = {
      fieldPath: 'rectangle.text',
      label: 'Rectangle',
      type: 'text'
    };
    const newElement = DataBindingService.createTemplateVariable(rectField, 100, 100, 150, 100);
    newElement.properties.placeholder = 'Rectangle';
    setElements(prev => [...prev, newElement]);
  };

  // Add Line element
  const addLineElement = () => {
    const lineField: DataBinding = {
      fieldPath: 'line',
      label: 'Line',
      type: 'text'
    };
    const newElement = DataBindingService.createTemplateVariable(lineField, 100, 100, 200, 2);
    newElement.properties.placeholder = '';
    setElements(prev => [...prev, newElement]);
  };

  // Add Circle element
  const addCircleElement = () => {
    const circleField: DataBinding = {
      fieldPath: 'circle.text',
      label: 'Circle',
      type: 'text'
    };
    const newElement = DataBindingService.createTemplateVariable(circleField, 100, 100, 100, 100);
    newElement.properties.placeholder = 'Circle';
    setElements(prev => [...prev, newElement]);
  };

  // Add Container element
  const addContainerElement = () => {
    const containerField: DataBinding = {
      fieldPath: 'container.text',
      label: 'Container',
      type: 'text'
    };
    const newElement = DataBindingService.createTemplateVariable(containerField, 100, 100, 250, 150);
    newElement.properties.placeholder = 'Container\nDrag elements here';
    setElements(prev => [...prev, newElement]);
  };

  // Add image element
  const addImageElement = (imageUrl: string) => {
    const newImageElement: ImageElementData = {
      id: `image-${Date.now()}`,
      type: 'image',
      x: Math.random() * (canvasWidth - 200) + 50,
      y: Math.random() * (canvasHeight - 150) + 50,
      width: 200,
      height: 150,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: imageElements.length + elements.length,
      src: imageUrl,
      name: 'Image'
    };

    setImageElements(prev => [...prev, newImageElement]);
  };

  // Handle signature selection from SignaturePickerDialog
  const handleSignatureSelect = (signature: Signature) => {
    const signerName = signature.signer
      ? `${signature.signer.first_name_th} ${signature.signer.last_name_th}`
      : 'Signature';

    const newSignatureElement: ImageElementData = {
      id: `signature-${Date.now()}`,
      type: 'image',
      x: canvasWidth / 2 - 100,
      y: canvasHeight - 200,
      width: 200,
      height: 100,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: imageElements.length + elements.length,
      src: signature.signatureImageUrl,
      name: `Signature: ${signerName}`,
      metadata: {
        signatureId: signature.id,
        signerId: signature.signerId,
        position: signature.position,
        department: signature.department
      }
    };

    setImageElements(prev => [...prev, newSignatureElement]);
    setShowSignaturePickerDialog(false);
  };

  // Handle image layer changes
  const handleImageLayerChange = (id: string, action: 'front' | 'back' | 'forward' | 'backward') => {
    setImageElements(prev => {
      const elements = [...prev];
      const elementIndex = elements.findIndex(el => el.id === id);
      if (elementIndex === -1) return prev;

      const element = elements[elementIndex];
      let newZIndex = element.zIndex;

      switch (action) {
        case 'front':
          newZIndex = Math.max(...elements.map(el => el.zIndex)) + 1;
          break;
        case 'back':
          newZIndex = Math.min(...elements.map(el => el.zIndex)) - 1;
          break;
        case 'forward':
          newZIndex = element.zIndex + 1;
          break;
        case 'backward':
          newZIndex = element.zIndex - 1;
          break;
      }
      
      return prev.map(el => el.id === id ? { ...el, zIndex: newZIndex } : el);
    });
  };

  // Helper functions for dialogs
  const showConfirmDialog = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm,
      onCancel
    });
  };

  const showAlertDialog = (title: string, message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertDialog({
      open: true,
      title,
      message,
      severity
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, title: '', message: '', onConfirm: () => {} });
  };

  const closeAlertDialog = () => {
    setAlertDialog({ open: false, title: '', message: '' });
  };

  // Handle text element layer changes
  const handleElementLayerChange = (id: string, action: 'front' | 'back' | 'forward' | 'backward') => {
    setElements(prev => {
      const element = prev.find(el => el.id === id);
      if (!element) return prev;
      
      const allElements = [...prev, ...imageElements];
      const maxZ = Math.max(...allElements.map(el => el.zIndex), 0);
      const minZ = Math.min(...allElements.map(el => el.zIndex), 0);
      
      let newZIndex = element.zIndex;
      
      switch (action) {
        case 'front':
          newZIndex = maxZ + 1;
          break;
        case 'back':
          newZIndex = minZ - 1;
          break;
        case 'forward':
          newZIndex = element.zIndex + 1;
          break;
        case 'backward':
          newZIndex = element.zIndex - 1;
          break;
      }
      
      return prev.map(el => el.id === id ? { ...el, zIndex: newZIndex } : el);
    });
  };

  // Update image element
  const updateImageElement = (id: string, updates: Partial<ImageElementData>) => {
    setImageElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  // Delete image element
  const deleteImageElement = (id: string) => {
    setImageElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  // Handle context menu
  const handleContextMenu = (elementId: string, x: number, y: number) => {
    setContextMenu({ elementId, mouseX: x, mouseY: y });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleContextMenuAction = (action: 'front' | 'back' | 'forward' | 'backward' | 'delete') => {
    if (!contextMenu) return;
    
    const { elementId } = contextMenu;
    
    if (action === 'delete') {
      // Check if it's an image element
      const isImageElement = imageElements.some(el => el.id === elementId);
      if (isImageElement) {
        deleteImageElement(elementId);
      } else {
        // Handle text element deletion
        setElements(prev => prev.filter(el => el.id !== elementId));
        if (selectedElementId === elementId) {
          setSelectedElementId(null);
        }
      }
    } else {
      // Handle layer actions
      const isImageElement = imageElements.some(el => el.id === elementId);
      if (isImageElement) {
        handleImageLayerChange(elementId, action);
      } else {
        handleElementLayerChange(elementId, action);
      }
    }
    
    handleCloseContextMenu();
  };

  // Add text at specific position (Canva-style)
  const addTextAtPosition = (x: number, y: number) => {
    const newElement: TemplateVariableElement = {
      id: crypto.randomUUID(),
      type: 'template-variable',
      x: x - 50, // Center the text
      y: y - 10,
      width: 100,
      height: 20,
      zIndex: elements.length + imageElements.length + 1,
      visible: true,
      rotation: 0,
      opacity: 1,
      locked: false,
      properties: {
        fontSize: 16,
        fontFamily: 'Sarabun, Arial, sans-serif',
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        textDecoration: 'none',
        verticalAlign: 'top',
        lineHeight: 1.2,
        letterSpacing: 0,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        placeholder: 'Click to edit',
        dataBinding: {
          type: 'text',
          label: 'Click to edit',
          fieldPath: ''
        }
      }
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    
    // Start editing immediately
    setTimeout(() => {
      setEditingTextId(newElement.id);
      setEditingText('Click to edit');
    }, 100);
  };

  // Parse gradient colors for Konva
  const parseGradientColors = (gradient: string): (number | string)[] => {
    // Simple gradient parser - extract colors from linear-gradient
    // This is a basic implementation for common gradients
    if (gradient.includes('#667eea') && gradient.includes('#764ba2')) {
      return [0, '#667eea', 1, '#764ba2'];
    }
    if (gradient.includes('#f093fb') && gradient.includes('#f5576c')) {
      return [0, '#f093fb', 1, '#f5576c'];
    }
    if (gradient.includes('#4facfe') && gradient.includes('#00f2fe')) {
      return [0, '#4facfe', 1, '#00f2fe'];
    }
    if (gradient.includes('#43e97b') && gradient.includes('#38f9d7')) {
      return [0, '#43e97b', 1, '#38f9d7'];
    }
    if (gradient.includes('#fa709a') && gradient.includes('#fee140')) {
      return [0, '#fa709a', 1, '#fee140'];
    }
    if (gradient.includes('#a8edea') && gradient.includes('#fed6e3')) {
      return [0, '#a8edea', 1, '#fed6e3'];
    }
    // Default gradient
    return [0, '#ffffff', 1, '#f0f0f0'];
  };

  // Load template function
  const loadTemplate = (templateName: string) => {
    // Clear existing elements
    setElements([]);
    setImageElements([]);
    setSelectedElementId(null);
    
    // Template configurations
    const templates = {
      'modern-corporate': {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        elements: [
          {
            id: 'title-1',
            type: 'template-variable' as const,
            x: 100,
            y: 80,
            width: 600,
            height: 60,
            zIndex: 1,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 36,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 2,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'CERTIFICATE OF ACHIEVEMENT',
              dataBinding: {
                type: 'text',
                label: 'Certificate Title',
                fieldPath: ''
              }
            }
          },
          {
            id: 'subtitle-1',
            type: 'template-variable' as const,
            x: 150,
            y: 160,
            width: 500,
            height: 30,
            zIndex: 2,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 18,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#f0f0f0',
              fontWeight: 'normal',
              fontStyle: 'italic',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 1,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'This is to certify that',
              dataBinding: {
                type: 'text',
                label: 'Subtitle',
                fieldPath: ''
              }
            }
          },
          {
            id: 'name-1',
            type: 'template-variable' as const,
            x: 200,
            y: 220,
            width: 400,
            height: 50,
            zIndex: 3,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 28,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'underline',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 1,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: '[Recipient Name]',
              dataBinding: {
                type: 'text',
                label: 'Recipient Name',
                fieldPath: 'recipient.name'
              }
            }
          },
          {
            id: 'description-1',
            type: 'template-variable' as const,
            x: 100,
            y: 300,
            width: 600,
            height: 80,
            zIndex: 4,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 16,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#f0f0f0',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.4,
              letterSpacing: 0,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'has successfully completed the course\n"Advanced Web Development"\nwith outstanding performance',
              dataBinding: {
                type: 'text',
                label: 'Course Description',
                fieldPath: 'course.description'
              }
            }
          },
          {
            id: 'date-1',
            type: 'template-variable' as const,
            x: 500,
            y: 420,
            width: 200,
            height: 30,
            zIndex: 5,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 14,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'right',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 0,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'Date: [Issue Date]',
              dataBinding: {
                type: 'date',
                label: 'Issue Date',
                fieldPath: 'certificate.issueDate'
              }
            }
          }
        ]
      },
      'creative-burst': {
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        elements: [
          {
            id: 'title-2',
            type: 'template-variable' as const,
            x: 100,
            y: 60,
            width: 600,
            height: 80,
            zIndex: 1,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 42,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.1,
              letterSpacing: 3,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'ACHIEVEMENT\nAWARD',
              dataBinding: {
                type: 'text',
                label: 'Award Title',
                fieldPath: ''
              }
            }
          },
          {
            id: 'name-2',
            type: 'template-variable' as const,
            x: 150,
            y: 200,
            width: 500,
            height: 60,
            zIndex: 2,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 32,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 2,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: '[Winner Name]',
              dataBinding: {
                type: 'text',
                label: 'Winner Name',
                fieldPath: 'recipient.name'
              }
            }
          },
          {
            id: 'achievement-2',
            type: 'template-variable' as const,
            x: 100,
            y: 280,
            width: 600,
            height: 60,
            zIndex: 3,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 18,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffe0e6',
              fontWeight: 'normal',
              fontStyle: 'italic',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.3,
              letterSpacing: 0,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'For outstanding performance in\n"Innovation and Leadership"',
              dataBinding: {
                type: 'text',
                label: 'Achievement Description',
                fieldPath: 'achievement.description'
              }
            }
          }
        ]
      },
      'nature-fresh': {
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        elements: [
          {
            id: 'title-3',
            type: 'template-variable' as const,
            x: 100,
            y: 100,
            width: 600,
            height: 50,
            zIndex: 1,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 30,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 2,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'CERTIFICATE OF COMPLETION',
              dataBinding: {
                type: 'text',
                label: 'Certificate Type',
                fieldPath: ''
              }
            }
          },
          {
            id: 'name-3',
            type: 'template-variable' as const,
            x: 200,
            y: 200,
            width: 400,
            height: 40,
            zIndex: 2,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 24,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'underline',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 1,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: '[Student Name]',
              dataBinding: {
                type: 'text',
                label: 'Student Name',
                fieldPath: 'student.name'
              }
            }
          },
          {
            id: 'course-3',
            type: 'template-variable' as const,
            x: 150,
            y: 280,
            width: 500,
            height: 40,
            zIndex: 3,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 18,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#e0fff0',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 0,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'has successfully completed\n"Digital Marketing Fundamentals"',
              dataBinding: {
                type: 'text',
                label: 'Course Name',
                fieldPath: 'course.name'
              }
            }
          }
        ]
      },
      'golden-premium': {
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        elements: [
          {
            id: 'title-4',
            type: 'template-variable' as const,
            x: 100,
            y: 80,
            width: 600,
            height: 70,
            zIndex: 1,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 38,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.1,
              letterSpacing: 3,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'EXCELLENCE\nAWARD',
              dataBinding: {
                type: 'text',
                label: 'Award Title',
                fieldPath: ''
              }
            }
          },
          {
            id: 'subtitle-4',
            type: 'template-variable' as const,
            x: 150,
            y: 170,
            width: 500,
            height: 30,
            zIndex: 2,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 16,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#fff8dc',
              fontWeight: 'normal',
              fontStyle: 'italic',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 1,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'Presented to',
              dataBinding: {
                type: 'text',
                label: 'Presentation Text',
                fieldPath: ''
              }
            }
          },
          {
            id: 'name-4',
            type: 'template-variable' as const,
            x: 150,
            y: 220,
            width: 500,
            height: 50,
            zIndex: 3,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 28,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 2,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: '[Recipient Name]',
              dataBinding: {
                type: 'text',
                label: 'Recipient Name',
                fieldPath: 'recipient.name'
              }
            }
          },
          {
            id: 'reason-4',
            type: 'template-variable' as const,
            x: 100,
            y: 300,
            width: 600,
            height: 60,
            zIndex: 4,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 16,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#fff8dc',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.3,
              letterSpacing: 0,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'For demonstrating exceptional skills and\ndedication in academic excellence',
              dataBinding: {
                type: 'text',
                label: 'Excellence Reason',
                fieldPath: 'excellence.reason'
              }
            }
          }
        ]
      },
      'ocean-depth': {
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        elements: [
          {
            id: 'institution',
            type: 'template-variable',
            x: 150,
            y: 40,
            width: 500,
            height: 40,
            zIndex: 1,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 20,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 3,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'MARINE RESEARCH INSTITUTE',
              dataBinding: { type: 'text', label: 'Institution Name', fieldPath: 'institution' }
            }
          },
          {
            id: 'certificate-title',
            type: 'template-variable',
            x: 100,
            y: 100,
            width: 600,
            height: 80,
            zIndex: 2,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 42,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.1,
              letterSpacing: 2,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'CERTIFICATE OF\nRESEARCH EXCELLENCE',
              dataBinding: { type: 'text', label: 'Certificate Title', fieldPath: 'title' }
            }
          },
          {
            id: 'recipient-name',
            type: 'template-variable',
            x: 150,
            y: 220,
            width: 500,
            height: 50,
            zIndex: 3,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 32,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'italic',
              textAlign: 'center',
              textDecoration: 'underline',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 1,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'Dr. Marina Oceanus',
              dataBinding: { type: 'text', label: 'Recipient Name', fieldPath: 'recipient_name' }
            }
          },
          {
            id: 'research-details',
            type: 'template-variable',
            x: 100,
            y: 300,
            width: 600,
            height: 80,
            zIndex: 4,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 18,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.4,
              letterSpacing: 0.5,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'for groundbreaking research in Marine Biology\nand exceptional contribution to Ocean Conservation\nPublished in Nature Marine Science Journal',
              dataBinding: { type: 'text', label: 'Research Details', fieldPath: 'research_details' }
            }
          },
          {
            id: 'date-signature',
            type: 'template-variable',
            x: 100,
            y: 410,
            width: 600,
            height: 40,
            zIndex: 5,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 16,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.3,
              letterSpacing: 0,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'November 30, 2024 • Prof. Coral Reef, Director',
              dataBinding: { type: 'text', label: 'Date and Signature', fieldPath: 'date_signature' }
            }
          }
        ]
      },
      'sunset-glow': {
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
        elements: [
          {
            id: 'award-badge',
            type: 'template-variable',
            x: 350,
            y: 30,
            width: 100,
            height: 40,
            zIndex: 1,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 16,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'middle',
              lineHeight: 1.2,
              letterSpacing: 2,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: '🏆 LEADERSHIP 🏆',
              dataBinding: { type: 'text', label: 'Award Badge', fieldPath: 'badge' }
            }
          },
          {
            id: 'main-title',
            type: 'template-variable',
            x: 100,
            y: 90,
            width: 600,
            height: 100,
            zIndex: 2,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 46,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.0,
              letterSpacing: 3,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'INNOVATION\n& LEADERSHIP\nAWARD',
              dataBinding: { type: 'text', label: 'Award Title', fieldPath: 'title' }
            }
          },
          {
            id: 'recipient-name',
            type: 'template-variable',
            x: 150,
            y: 220,
            width: 500,
            height: 50,
            zIndex: 3,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 34,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'bold',
              fontStyle: 'italic',
              textAlign: 'center',
              textDecoration: 'underline',
              verticalAlign: 'top',
              lineHeight: 1.2,
              letterSpacing: 2,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'ALEX INNOVATOR',
              dataBinding: { type: 'text', label: 'Recipient Name', fieldPath: 'recipient_name' }
            }
          },
          {
            id: 'achievement-text',
            type: 'template-variable',
            x: 100,
            y: 300,
            width: 600,
            height: 80,
            zIndex: 4,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 19,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.4,
              letterSpacing: 0.8,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'for visionary leadership in Technology Innovation\nand transforming the future of Digital Solutions\nImpacting over 1 million users worldwide',
              dataBinding: { type: 'text', label: 'Achievement Description', fieldPath: 'achievement' }
            }
          },
          {
            id: 'footer-info',
            type: 'template-variable',
            x: 100,
            y: 410,
            width: 600,
            height: 40,
            zIndex: 5,
            visible: true,
            rotation: 0,
            opacity: 1,
            locked: false,
            properties: {
              fontSize: 16,
              fontFamily: 'Sarabun, Arial, sans-serif',
              color: '#ffffff',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'center',
              textDecoration: 'none',
              verticalAlign: 'top',
              lineHeight: 1.3,
              letterSpacing: 0,
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              placeholder: 'December 2024 • Innovation Summit 2024\nCEO Sarah Tech, Tech Leaders Association',
              dataBinding: { type: 'text', label: 'Footer Information', fieldPath: 'footer_info' }
            }
          }
        ]
      }
    };
    
    // Apply selected template
    const template = templates[templateName as keyof typeof templates];
    if (template) {
      setCanvasBackground(template.background);
      setElements(template.elements as TemplateVariableElement[]);
    }
  };

  // Handle text editing
  const handleTextDoubleClick = (elementId: string) => {
    if (isPreviewMode) return;
    const element = elements.find(el => el.id === elementId);
    if (element && element.properties) {
      setEditingTextId(elementId);
      setEditingText(element.properties.placeholder || '');
      // Focus the input after state update
      setTimeout(() => {
        const input = document.getElementById(`text-input-${elementId}`);
        if (input) {
          input.focus();
          (input as HTMLInputElement).select();
        }
      }, 0);
    }
  };

  const handleTextEditComplete = () => {
    if (editingTextId && editingText.trim()) {
      setElements(prev => prev.map(el => 
        el.id === editingTextId 
          ? { ...el, properties: { ...el.properties, placeholder: editingText } }
          : el
      ));
    }
    setEditingTextId(null);
    setEditingText('');
  };

  const handleTextEditCancel = () => {
    setEditingTextId(null);
    setEditingText('');
  };

  // Handle text element resize
  const handleTextElementResize = (elementId: string, newWidth: number, newHeight: number, newX?: number, newY?: number) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { 
            ...el, 
            width: Math.max(50, newWidth), 
            height: Math.max(20, newHeight),
            ...(newX !== undefined && { x: newX }),
            ...(newY !== undefined && { y: newY })
          }
        : el
    ));
  };

  // Remove selected element
  const removeSelectedElement = () => {
    if (selectedElementId) {
      // Check if it's a text element
      const isTextElement = elements.some(el => el.id === selectedElementId);
      if (isTextElement) {
        setElements(prev => prev.filter(el => el.id !== selectedElementId));
      } else {
        // Check if it's an image element
        setImageElements(prev => prev.filter(el => el.id !== selectedElementId));
      }
      setSelectedElementId(null);
    }
  };

  // Handle element selection
  const handleElementSelect = (elementId: string) => {
    setSelectedElementId(elementId);
  };

  // Removed duplicate function declarations - using existing functions defined earlier in the file

  // Handle element drag
  const handleElementDrag = (elementId: string, newPos: { x: number; y: number }) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, x: newPos.x, y: newPos.y } : el
    ));
  };

  // Save template to database via API
  const handleSave = () => {
    // Open save dialog
    setSaveFormData({
      name: `Certificate Template ${new Date().toLocaleDateString()}`,
      description: ''
    });
    setShowSaveDialog(true);
  };

  const handleConfirmSave = async () => {
    console.log('=== HANDLE CONFIRM SAVE ===');

    if (!saveFormData.name.trim()) {
      setTemplateError('Template name is required');
      return;
    }

    setIsSavingTemplate(true);
    setTemplateError(null);
    setShowSaveDialog(false);

    try {
      // Declare pageElements variable
      let pageElements: any[];
      
      // Use current state arrays directly since canvas sync is not working properly
      // State arrays contain the correct element data from template loading
      console.log('=== SAVE DEBUG (USING STATE ARRAYS) ===');
      console.log('Current elements state:', elements);
      console.log('Current imageElements state:', imageElements);
      
      // Combine text and image elements from current state
      const allElements = [...elements, ...imageElements];
      
      console.log('Text elements:', elements.length);
      console.log('Image elements:', imageElements.length);
      console.log('Total elements:', allElements.length);
      console.log('Elements data:', allElements);
      
      // Use state elements for template data
      pageElements = allElements as any;
      
      // Prepare template data for API
      // Clean elements to remove invalid UUIDs and prepare for backend
      const cleanedElements = pageElements.map((element: any, index: number) => {
        // Type assertion to handle mixed element types
        const anyElement = element as any;
        
        // Extract style properties from element (both direct properties and properties object)
        const extractedStyle: any = {};
        const props = anyElement.properties || {};
        
        // Extract from direct properties (Konva objects)
        if (anyElement.fontSize) extractedStyle.font_size = anyElement.fontSize;
        if (anyElement.fontFamily) extractedStyle.font_family = anyElement.fontFamily;
        if (anyElement.fontStyle) extractedStyle.font_style = anyElement.fontStyle;
        if (anyElement.fontWeight) extractedStyle.font_weight = anyElement.fontWeight;
        if (anyElement.fill) extractedStyle.color = anyElement.fill;
        if (anyElement.backgroundColor) extractedStyle.background_color = anyElement.backgroundColor;
        if (anyElement.stroke) extractedStyle.border_color = anyElement.stroke;
        if (anyElement.strokeWidth) extractedStyle.border_width = anyElement.strokeWidth;
        if (anyElement.opacity !== undefined) extractedStyle.opacity = anyElement.opacity;
        if (anyElement.align) extractedStyle.text_align = anyElement.align;
        if (anyElement.verticalAlign) extractedStyle.vertical_align = anyElement.verticalAlign;
        if (anyElement.rotation !== undefined) extractedStyle.rotation = anyElement.rotation;
        
        // Extract from properties object (template elements)
        if (props.fontSize) extractedStyle.font_size = props.fontSize;
        if (props.fontFamily) extractedStyle.font_family = props.fontFamily;
        if (props.fontStyle) extractedStyle.font_style = props.fontStyle;
        if (props.fontWeight) extractedStyle.font_weight = props.fontWeight;
        if (props.color) extractedStyle.color = props.color;
        if (props.backgroundColor) extractedStyle.background_color = props.backgroundColor;
        if (props.textAlign) extractedStyle.text_align = props.textAlign;
        if (props.verticalAlign) extractedStyle.vertical_align = props.verticalAlign;
        if (props.letterSpacing) extractedStyle.letter_spacing = props.letterSpacing;
        if (props.lineHeight) extractedStyle.line_height = props.lineHeight;
        
        // Merge with existing style
        const finalStyle = { ...extractedStyle, ...(anyElement.style || {}) };
        
        // Transform content based on element type to match backend ElementContent structure
        let transformedContent = {};
        const elementType = anyElement.elementType || anyElement.type || 'text';
        
        if (elementType === 'text') {
          // Extract text value - handle both string and object content
          const textValue = typeof anyElement.content === 'string'
            ? anyElement.content
            : (anyElement.content?.text || anyElement.text || anyElement.displayText || '');

          transformedContent = {
            text: textValue
          };
          // Only add placeholder if it has a value
          const placeholderValue = anyElement.placeholder || anyElement.content?.placeholder || props.placeholder;
          if (placeholderValue && placeholderValue !== null) {
            (transformedContent as any).placeholder = placeholderValue;
          }
        } else if (elementType === 'image') {
          // Extract image URL - handle both string and object content
          const imageUrl = typeof anyElement.content === 'string'
            ? anyElement.content
            : (anyElement.content?.image_url || anyElement.src || anyElement.imageData || '');

          transformedContent = {
            image_url: imageUrl
          };
          const altText = anyElement.alt || anyElement.content?.image_alt;
          if (altText) {
            (transformedContent as any).image_alt = altText;
          }
        } else if (elementType === 'shape') {
          transformedContent = {
            shape_type: anyElement.shapeType || anyElement.content?.shape_type || 'rectangle'
          };
        } else if (elementType === 'qr-code' || elementType === 'qr_code') {
          // Extract QR code data - handle both string and object content
          const qrData = typeof anyElement.content === 'string'
            ? anyElement.content
            : (anyElement.content?.qr_code_data || anyElement.data || '');

          transformedContent = {
            qr_code_data: qrData
          };
        } else if (elementType === 'template-variable') {
          // Handle template variables - extract from properties and content
          const props = anyElement.properties || {};
          const dataBinding = props.dataBinding || {};

          // Get text value - could be in displayText, content.text, or text
          const textValue = anyElement.displayText
            || (typeof anyElement.content === 'object' ? anyElement.content?.text : anyElement.content)
            || anyElement.text
            || '';

          // Get placeholder - could be in multiple places
          const placeholderValue = props.placeholder
            || anyElement.placeholder
            || (typeof anyElement.content === 'object' ? anyElement.content?.placeholder : '')
            || '';

          // Get variable path
          const variablePath = dataBinding.fieldPath
            || anyElement.fieldPath
            || anyElement.variable
            || (typeof anyElement.content === 'object' ? anyElement.content?.variable : '')
            || '';

          transformedContent = {
            variable: variablePath,
            text: textValue,
            placeholder: placeholderValue
          };
        } else {
          // Default fallback for other types
          const textValue = typeof anyElement.content === 'string'
            ? anyElement.content
            : (anyElement.displayText || anyElement.text || '');

          transformedContent = {
            text: textValue
          };
        }

        return {
          id: anyElement.id || crypto.randomUUID(), // Ensure each element has a unique ID
          type: elementType, // Use consistent elementType
          // Always use direct x, y properties (updated by Konva), not the position object
          position: { x: anyElement.x || 0, y: anyElement.y || 0 },
          // Always use direct width, height properties (updated by Konva), not the size object
          size: { width: anyElement.width || 100, height: anyElement.height || 50 },
          style: finalStyle,
          content: transformedContent,
          z_index: anyElement.zIndex || index,
          is_locked: anyElement.isLocked || anyElement.locked || false
        };
      });

      const templateData = {
        name: saveFormData.name,
        description: saveFormData.description || `Certificate template created on ${new Date().toLocaleDateString()}`,
        category: 'certificate',
        design: {
          canvas: {
            width: canvasWidth,
            height: canvasHeight,
            background_color: canvasBackground
          },
          elements: cleanedElements,
          variables: []
        },
        is_default: false
      };

      // Save to database via API
      const savedTemplate = await TemplateService.saveTemplate(templateData);
      
      // Update local state
      setSavedTemplates(prev => [...prev, savedTemplate]);
      
      // Also save to localStorage as backup
      const existingTemplates = JSON.parse(localStorage.getItem('savedCertificateTemplates') || '[]');
      existingTemplates.push(savedTemplate);
      localStorage.setItem('savedCertificateTemplates', JSON.stringify(existingTemplates));
      
      showAlertDialog('Success', `Template "${saveFormData.name}" saved successfully to database!`, 'success');

      // Also call onSave prop if provided
      if (onSave) {
        const document = {
          id: savedTemplate.id,
          name: savedTemplate.name,
          pages: [{
            id: 'page-1',
            name: 'หน้า 1',
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: canvasBackground,
            elements: elements,
            margins: { top: 20, right: 20, bottom: 20, left: 20 }
          }],
          metadata: {
            createdAt: savedTemplate.createdAt,
            updatedAt: savedTemplate.updatedAt,
            createdBy: currentUser?.id || 'unknown',
            version: '1.0.0',
            tags: ['certificate', 'template']
          }
        };
        onSave(document);
      }
      
    } catch (error) {
      console.error('Error saving template:', error);
      setTemplateError(`Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to localStorage only
      const localTemplate = {
        id: `cert-template-${Date.now()}`,
        name: saveFormData.name,
        description: saveFormData.description,
        elements: elements,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        backgroundColor: canvasBackground,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingTemplates = JSON.parse(localStorage.getItem('savedCertificateTemplates') || '[]');
      existingTemplates.push(localTemplate);
      localStorage.setItem('savedCertificateTemplates', JSON.stringify(existingTemplates));
      setSavedTemplates(prev => [...prev, localTemplate as CertificateTemplate]);

      showAlertDialog('Warning', `Template "${saveFormData.name}" saved locally (server unavailable)`, 'warning');
    } finally {
      setIsSavingTemplate(false);
    }
  };



  // Load saved template function
  const loadSavedTemplate = async (template: CertificateTemplate) => {
    try {
      setIsLoadingTemplates(true);
      setTemplateError(null);
      
      // If template has an API ID, fetch latest version from API
      let templateToLoad = template;
      if (template.id && !template.id.startsWith('cert-template-')) {
        try {
          templateToLoad = await TemplateService.getTemplate(template.id);
        } catch (error) {
          console.warn('Failed to fetch latest template from API, using cached version:', error);
        }
      }
      
      // Clear existing elements
      setElements([]);
      setImageElements([]);
      setSelectedElementId(null);
      
      // Load template data and convert API format to frontend format
      const allElements = (templateToLoad.design?.elements || []).map((element: any) => {
        // Convert API element format to frontend element format
        // IMPORTANT: Don't spread ...element to avoid keeping position/size objects
        const elementType = element.elementType || element.type || 'text';
        const frontendElement = {
          id: element.id === '00000000-0000-0000-0000-000000000000' ? crypto.randomUUID() : element.id,
          type: elementType,
          elementType: elementType,
          // Convert position/size from API format to direct properties (Konva format)
          x: element.position?.x || 0,
          y: element.position?.y || 0,
          width: element.size?.width || 100,
          height: element.size?.height || 50,
          zIndex: element.z_index || 0,
          visible: true,
          locked: element.is_locked || false,
          opacity: element.style?.opacity || 1,
          rotation: element.style?.rotation || 0,
          // Convert style properties for Konva rendering
          fontSize: element.style?.font_size || 16,
          fontFamily: element.style?.font_family || 'Arial',
          fontStyle: element.style?.font_style || 'normal',
          fontWeight: element.style?.font_weight || 'normal',
          fill: element.style?.color || '#000000',
          align: element.style?.text_align || 'left',
          verticalAlign: element.style?.vertical_align || 'top',
          // Add properties object for template variables
          properties: {
            fontSize: element.style?.font_size || 16,
            fontFamily: element.style?.font_family || 'Arial',
            fontStyle: element.style?.font_style || 'normal',
            fontWeight: element.style?.font_weight || 'normal',
            color: element.style?.color || '#000000',
            textAlign: element.style?.text_align || 'left',
            verticalAlign: element.style?.vertical_align || 'top',
            textDecoration: element.style?.text_decoration || 'none',
            lineHeight: element.style?.line_height || 1.2,
            letterSpacing: element.style?.letter_spacing || 0,
            padding: element.style?.padding || 0,
            placeholder: element.content?.placeholder || '',
            dataBinding: {
              type: 'text' as const,
              label: element.content?.placeholder || 'Text Field',
              fieldPath: element.content?.variable || ''
            }
          },
          // Add display text for rendering
          displayText: element.content?.placeholder || element.content?.text || '',
          content: element.content?.text || '',
          placeholder: element.content?.placeholder || '',
          // For image elements, preserve image data (handle different API formats)
          src: element.content?.image_url || element.content?.src || element.src || '',
          imageData: element.content?.image_url || element.content?.imageData || element.imageData || ''
        };
        return frontendElement;
      });
      
      // Separate text and image elements based on elementType
      const textElements = allElements.filter(el => 
        el.elementType === 'text' || el.elementType === 'template-variable' || 
        (el.elementType !== 'image' && !el.elementType)
      );
      const imageElements = allElements.filter(el => 
        el.elementType === 'image'
      );
      
      console.log('Loading template elements:', {
        total: allElements.length,
        text: textElements.length,
        images: imageElements.length
      });
      
      setElements(textElements);
      setImageElements(imageElements);
      setCanvasBackground(templateToLoad.design?.canvas?.background_color || templateToLoad.canvas_background_color || '#ffffff');
      
      // Update canvas dimensions if available
      if (templateToLoad.design?.canvas?.width && templateToLoad.design?.canvas?.height) {
        // Note: Canvas dimensions are controlled by canvasWidth and canvasHeight state
        // These would need to be updated through the existing state setters
        console.log('Template dimensions:', templateToLoad.design.canvas.width, 'x', templateToLoad.design.canvas.height);
      } else if (templateToLoad.canvas_width && templateToLoad.canvas_height) {
        console.log('Template dimensions (fallback):', templateToLoad.canvas_width, 'x', templateToLoad.canvas_height);
      }
      
      showAlertDialog('Success', `Template "${templateToLoad.name}" loaded successfully!`, 'success');
      
    } catch (error) {
      console.error('Error loading template:', error);
      setTemplateError(`Failed to load template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Delete saved template
  const deleteSavedTemplate = async (templateId: string) => {
    const template = savedTemplates.find(t => t.id === templateId);
    const templateName = template?.name || 'this template';
    
    showConfirmDialog(
      'Delete Template',
      `Are you sure you want to delete "${templateName}"? This action cannot be undone.`,
      async () => {
        await performDeleteTemplate(templateId);
      }
    );
  };
  
  // Perform actual template deletion
  const performDeleteTemplate = async (templateId: string) => {
    
    try {
      setIsLoadingTemplates(true);
      setTemplateError(null);
      
      // Try to delete from API first
      if (!templateId.startsWith('cert-template-')) {
        await TemplateService.deleteTemplate(templateId);
      }
      
      // Update local state
      setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
      
      // Also remove from localStorage
      const existingTemplates = JSON.parse(localStorage.getItem('savedCertificateTemplates') || '[]');
      const updatedTemplates = existingTemplates.filter((t: any) => t.id !== templateId);
      localStorage.setItem('savedCertificateTemplates', JSON.stringify(updatedTemplates));
      
      showAlertDialog('Success', 'Template deleted successfully!', 'success');
      
    } catch (error) {
      console.error('Error deleting template:', error);
      setTemplateError(`Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // If API deletion failed, still remove from local state and localStorage
      setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
      const existingTemplates = JSON.parse(localStorage.getItem('savedCertificateTemplates') || '[]');
      const updatedTemplates = existingTemplates.filter((t: any) => t.id !== templateId);
      localStorage.setItem('savedCertificateTemplates', JSON.stringify(updatedTemplates));
      
      showAlertDialog('Warning', 'Template removed locally (server may be unavailable)', 'warning');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Export document with clean, presentation-quality output
  const handleExport = async (format: 'pdf' | 'png' | 'jpg') => {
    try {
      // Get the Konva stage reference
      const stage = stageRef.current;
      if (!stage) {
        console.error('Stage reference not found');
        return;
      }

      // Store original state for restoration
      const originalSelectedElementId = selectedElementId;
      const originalEditingTextId = editingTextId;

      // STEP 1: Hide all UI elements for clean export
      setSelectedElementId(null); // Hide selection borders
      setEditingTextId(null);     // Hide text editing UI
      
      // Wait for UI to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `certificate-${timestamp}`;

      // STEP 2: Create clean export layer with background
      const exportLayer = new Konva.Layer();
      
      // Add background rectangle with gradient/color
      const backgroundRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: canvasWidth, y: canvasHeight },
        fillLinearGradientColorStops: canvasBackground.includes('gradient') 
          ? [0, '#667eea', 1, '#764ba2'] // Extract gradient colors
          : [0, canvasBackground, 1, canvasBackground] // Solid color
      });
      exportLayer.add(backgroundRect);

      // STEP 3: Clone all content elements (without UI elements)
      const mainLayer = stage.findOne('Layer');
      if (mainLayer) {
        mainLayer.children.forEach((node: any) => {
          // Skip UI elements (handles, selection borders, etc.)
          if (node.name && (node.name().includes('handle') || 
                           node.name().includes('selection') ||
                           node.name().includes('transformer'))) {
            return; // Skip UI elements
          }
          
          // Clone content elements only
          if (node.className === 'Text' || node.className === 'Image' || 
              node.className === 'Rect' || node.className === 'Circle') {
            const clonedNode = node.clone();
            // Remove any selection/editing attributes
            clonedNode.stroke(null);
            clonedNode.strokeWidth(0);
            exportLayer.add(clonedNode);
          }
        });
      }

      // STEP 4: Create temporary stage for clean export
      const exportStage = new Konva.Stage({
        container: document.createElement('div'),
        width: canvasWidth,
        height: canvasHeight
      });
      exportStage.add(exportLayer);

      if (format === 'png' || format === 'jpg') {
        // Export as PNG/JPG using clean stage
        const dataURL = exportStage.toDataURL({
          mimeType: format === 'png' ? 'image/png' : 'image/jpeg',
          quality: 1.0,
          pixelRatio: 2 // High resolution export
        });

        // Create download link
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`${format.toUpperCase()} exported successfully`);
      } else if (format === 'pdf') {
        // Export as PDF using jsPDF
        const jsPDF = (await import('jspdf')).default;
        
        // Export clean stage as high-resolution image
        const dataURL = exportStage.toDataURL({
          mimeType: 'image/png',
          quality: 1.0,
          pixelRatio: 3 // Very high resolution for PDF
        });

        // Create PDF with canvas dimensions
        const pdf = new jsPDF({
          orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvasWidth, canvasHeight]
        });

        // Add image to PDF
        pdf.addImage(dataURL, 'PNG', 0, 0, canvasWidth, canvasHeight);
        
        // Download PDF
        pdf.save(`${filename}.pdf`);
        
        console.log('PDF exported successfully');
      }

      // STEP 5: Cleanup temporary stage
      exportStage.destroy();

      // STEP 6: Restore original UI state
      setSelectedElementId(originalSelectedElementId);
      setEditingTextId(originalEditingTextId);

      // Also call onExport prop if provided (for compatibility)
      if (onExport) {
        const document = {
          elements: [...elements, ...imageElements], // Include all elements
          format: format,
          width: canvasWidth,
          height: canvasHeight
        };
        onExport(format, document);
      }

    } catch (error) {
      console.error('Export failed:', error);
      // Show error to user
      if (typeof showAlertDialog === 'function') {
        showAlertDialog('Error', `Failed to export ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
    }
  };

  // Render template variable element
  const renderTemplateVariable = (element: TemplateVariableElement) => {
    // Get display text with null checks
    let displayText = element.properties?.placeholder || 
                     element.properties?.dataBinding?.label || 
                     element.properties?.dataBinding?.fieldPath || 
                     'Text';
    if (isPreviewMode && certificateData) {
      displayText = DataBindingService.resolveTemplateVariable(element, certificateData);
    }

    const isSelected = selectedElementId === element.id;
    const isEditing = editingTextId === element.id;
    
    // Resize handles for text elements
    const resizeHandleSize = 8;
    const elementWidth = element.width || 100;
    const elementHeight = element.height || 50;
    
    const resizeHandles = isSelected && !isPreviewMode ? [
      // Corner handles
      { x: -resizeHandleSize/2, y: -resizeHandleSize/2, cursor: 'nw-resize', position: 'nw' },
      { x: elementWidth - resizeHandleSize/2, y: -resizeHandleSize/2, cursor: 'ne-resize', position: 'ne' },
      { x: elementWidth - resizeHandleSize/2, y: elementHeight - resizeHandleSize/2, cursor: 'se-resize', position: 'se' },
      { x: -resizeHandleSize/2, y: elementHeight - resizeHandleSize/2, cursor: 'sw-resize', position: 'sw' },
      // Edge handles
      { x: elementWidth / 2 - resizeHandleSize/2, y: -resizeHandleSize/2, cursor: 'n-resize', position: 'n' },
      { x: elementWidth - resizeHandleSize/2, y: elementHeight / 2 - resizeHandleSize/2, cursor: 'e-resize', position: 'e' },
      { x: elementWidth / 2 - resizeHandleSize/2, y: elementHeight - resizeHandleSize/2, cursor: 's-resize', position: 's' },
      { x: -resizeHandleSize/2, y: elementHeight / 2 - resizeHandleSize/2, cursor: 'w-resize', position: 'w' }
    ] : [];

    return (
      <Group
        key={element.id || `template-var-${Date.now()}-${Math.random()}`}
        id={element.id} // Add ID to Group for canvas reference
        x={element.x || 0}
        y={element.y || 0}
        draggable={!isPreviewMode && !isEditing}
        onClick={() => !isPreviewMode && handleElementSelect(element.id)}
        onDblClick={() => {
          if (!isPreviewMode) {
            handleTextDoubleClick(element.id);
          }
        }}
        onContextMenu={(e) => {
          if (!isPreviewMode) {
            e.evt.preventDefault();
            e.evt.stopPropagation();
            
            // Ensure the element is selected first
            handleElementSelect(element.id);
            
            // Get mouse position for context menu
            const stage = e.target.getStage();
            if (!stage) return;
            
            const pointerPosition = stage.getPointerPosition();
            if (!pointerPosition) return;
            
            const stageBox = stage.container().getBoundingClientRect();
            
            // Calculate position relative to viewport
            const menuX = stageBox.left + pointerPosition.x;
            const menuY = stageBox.top + pointerPosition.y;
            
            // Pass context menu event to parent
            handleContextMenu(element.id, menuX, menuY);
          }
        }}
        onDragEnd={(e) => {
          if (!isPreviewMode && !isEditing) {
            handleElementDrag(element.id, { x: e.target.x(), y: e.target.y() });
          }
        }}
      >
        {/* Background */}
        <Rect
          width={element.width || 100}
          height={element.height || 50}
          fill={element.properties?.backgroundColor || 'transparent'}
          stroke={isSelected ? '#1976d2' : (isPreviewMode ? 'transparent' : '#ddd')}
          strokeWidth={isSelected ? 2 : 1}
          strokeDashArray={isPreviewMode ? [] : [5, 5]}
        />
        
        {/* Text */}
        <Text
          text={displayText}
          fontSize={element.properties?.fontSize || 16}
          fontFamily={element.properties?.fontFamily || 'Arial'}
          fill={element.properties?.color || '#000000'}
          align={element.properties?.textAlign || 'left'}
          verticalAlign={element.properties?.verticalAlign || 'top'}
          width={element.width}
          height={element.height}
          padding={element.properties?.padding?.left || 0}
          fontWeight={element.properties?.fontWeight || 'normal'}
          fontStyle={element.properties?.fontStyle || 'normal'}
          textDecoration={element.properties?.textDecoration || 'none'}
          // Shadow properties
          shadowColor={element.properties?.shadow?.color}
          shadowBlur={element.properties?.shadow?.blur}
          shadowOffsetX={element.properties?.shadow?.offsetX}
          shadowOffsetY={element.properties?.shadow?.offsetY}
          shadowOpacity={element.properties?.shadow ? 1 : 0}
        />
        
        {/* Resize Handles */}
        {resizeHandles.map((handle, index) => (
          <Circle
            key={index}
            x={handle.x + resizeHandleSize/2}
            y={handle.y + resizeHandleSize/2}
            radius={resizeHandleSize/2}
            fill="#0066cc"
            stroke="white"
            strokeWidth={1}
            draggable
            onMouseEnter={(e: any) => {
              const stage = e.target.getStage();
              if (stage) {
                stage.container().style.cursor = handle.cursor;
              }
            }}
            onMouseLeave={(e: any) => {
              const stage = e.target.getStage();
              if (stage) {
                stage.container().style.cursor = 'default';
              }
            }}
            onDragStart={(e: any) => {
              e.cancelBubble = true;
              const stage = e.target.getStage();
              if (stage) {
                stage.container().style.cursor = handle.cursor;
              }
              
              // Store initial state for resize calculation
              e.target.setAttr('startX', element.x);
              e.target.setAttr('startY', element.y);
              e.target.setAttr('startWidth', element.width);
              e.target.setAttr('startHeight', element.height);
              e.target.setAttr('startMouseX', stage.getPointerPosition()?.x || 0);
              e.target.setAttr('startMouseY', stage.getPointerPosition()?.y || 0);
            }}
            onDragMove={(e: any) => {
              const stage = e.target.getStage();
              const currentPointer = stage.getPointerPosition();
              
              if (!currentPointer) return;
              
              // Get stored initial values
              const startX = e.target.getAttr('startX');
              const startY = e.target.getAttr('startY');
              const startWidth = e.target.getAttr('startWidth');
              const startHeight = e.target.getAttr('startHeight');
              const startMouseX = e.target.getAttr('startMouseX');
              const startMouseY = e.target.getAttr('startMouseY');
              
              // Calculate mouse movement delta
              const deltaX = currentPointer.x - startMouseX;
              const deltaY = currentPointer.y - startMouseY;
              
              let newWidth = startWidth;
              let newHeight = startHeight;
              let newX = startX;
              let newY = startY;
              
              // Calculate new dimensions and position based on handle position
              // Fix anchor point calculation to prevent element jumping
              switch (handle.position) {
                case 'nw': // Northwest - resize from bottom-right anchor
                  {
                    const tempWidth = startWidth - deltaX;
                    const tempHeight = startHeight - deltaY;
                    newWidth = Math.max(50, tempWidth);
                    newHeight = Math.max(20, tempHeight);

                    // Calculate position to keep bottom-right corner fixed
                    // When width increases (newWidth > startWidth), x should decrease
                    const widthDiff = startWidth - newWidth;
                    const heightDiff = startHeight - newHeight;
                    newX = startX - widthDiff;
                    newY = startY - heightDiff;
                  }
                  break;
                case 'ne': // Northeast - resize from bottom-left anchor
                  {
                    const tempHeight = startHeight - deltaY;
                    newWidth = Math.max(50, startWidth + deltaX);
                    newHeight = Math.max(20, tempHeight);

                    // Calculate Y position to keep bottom-left corner fixed
                    const heightDiff = startHeight - newHeight;
                    newY = startY - heightDiff;
                  }
                  break;
                case 'se': // Southeast - resize from top-left anchor (no position change needed)
                  newWidth = Math.max(50, startWidth + deltaX);
                  newHeight = Math.max(20, startHeight + deltaY);
                  break;
                case 'sw': // Southwest - resize from top-right anchor
                  {
                    const tempWidth = startWidth - deltaX;
                    newWidth = Math.max(50, tempWidth);
                    newHeight = Math.max(20, startHeight + deltaY);

                    // Calculate X position to keep top-right corner fixed
                    const widthDiff = startWidth - newWidth;
                    newX = startX - widthDiff;
                  }
                  break;
                case 'n': // North - resize height from bottom anchor
                  {
                    const tempHeight = startHeight - deltaY;
                    newHeight = Math.max(20, tempHeight);

                    // Calculate Y position to keep bottom edge fixed
                    const heightDiff = startHeight - newHeight;
                    newY = startY - heightDiff;
                  }
                  break;
                case 'e': // East - resize width from left anchor (no position change needed)
                  newWidth = Math.max(50, startWidth + deltaX);
                  break;
                case 's': // South - resize height from top anchor (no position change needed)
                  newHeight = Math.max(20, startHeight + deltaY);
                  break;
                case 'w': // West - resize width from right anchor
                  {
                    const tempWidth = startWidth - deltaX;
                    newWidth = Math.max(50, tempWidth);

                    // Calculate X position to keep right edge fixed
                    const widthDiff = startWidth - newWidth;
                    newX = startX - widthDiff;
                  }
                  break;
              }
              
              // Update element dimensions and position
              handleTextElementResize(element.id, newWidth, newHeight, newX, newY);
              
              // Keep handle at correct position relative to element
              const currentElement = elements.find(el => el.id === element.id);
              if (currentElement) {
                let handleX = 0, handleY = 0;
                
                // Calculate handle position based on handle type
                switch (handle.position) {
                  case 'nw': // Northwest
                    handleX = currentElement.x;
                    handleY = currentElement.y;
                    break;
                  case 'ne': // Northeast
                    handleX = currentElement.x + currentElement.width;
                    handleY = currentElement.y;
                    break;
                  case 'se': // Southeast
                    handleX = currentElement.x + currentElement.width;
                    handleY = currentElement.y + currentElement.height;
                    break;
                  case 'sw': // Southwest
                    handleX = currentElement.x;
                    handleY = currentElement.y + currentElement.height;
                    break;
                  case 'n': // North
                    handleX = currentElement.x + currentElement.width / 2;
                    handleY = currentElement.y;
                    break;
                  case 'e': // East
                    handleX = currentElement.x + currentElement.width;
                    handleY = currentElement.y + currentElement.height / 2;
                    break;
                  case 's': // South
                    handleX = currentElement.x + currentElement.width / 2;
                    handleY = currentElement.y + currentElement.height;
                    break;
                  case 'w': // West
                    handleX = currentElement.x;
                    handleY = currentElement.y + currentElement.height / 2;
                    break;
                }
                
                e.target.position({
                  x: handleX - resizeHandleSize/2,
                  y: handleY - resizeHandleSize/2
                });
              }
            }}
            onDragEnd={(e: any) => {
              const stage = e.target.getStage();
              if (stage) {
                stage.container().style.cursor = 'default';
              }
              
              // Clear stored attributes
              e.target.setAttr('startX', null);
              e.target.setAttr('startY', null);
              e.target.setAttr('startWidth', null);
              e.target.setAttr('startHeight', null);
              e.target.setAttr('startMouseX', null);
              e.target.setAttr('startMouseY', null);
            }}
          />
        ))}
        
        {/* Data binding indicator (design mode only) */}
        {!isPreviewMode && (
          <>
            <Rect
              x={(element.width || 100) - 20}
              y={0}
              width={20}
              height={20}
              fill="#2196f3"
              cornerRadius={3}
            />
            <Text
              x={(element.width || 100) - 18}
              y={2}
              width={16}
              height={16}
              text="🔗"
              fontSize={12}
              fill="white"
              align="center"
              verticalAlign="middle"
            />
          </>
        )}
      </Group>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Left Sidebar - Tools */}
      {!isPreviewMode && (
        <Box sx={{
          width: 280,
          borderRight: 1,
          borderColor: 'divider',
          backgroundColor: 'white',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <Typography variant="h6" gutterBottom>
              🎨 Elements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag elements to canvas
            </Typography>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 76, backgroundColor: 'white', zIndex: 1 }}
          >
            <Tab label="Templates" />
            <Tab label="Elements" />
            <Tab label="Data" />
            <Tab label="Layers" />
          </Tabs>

          <Box sx={{ p: 2 }}>
            {activeTab === 0 && (
              <Box>
                {/* Templates & Backgrounds */}
                <Typography variant="h6" gutterBottom>
                  Background Templates
                </Typography>
                
                {/* Background Colors */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Solid Colors
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 3 }}>
                  {[
                    { color: '#ffffff', name: 'White' },
                    { color: '#f8f9fa', name: 'Light Gray' },
                    { color: '#e9ecef', name: 'Gray' },
                    { color: '#dee2e6', name: 'Medium Gray' },
                    { color: '#1976d2', name: 'Blue' },
                    { color: '#2e7d32', name: 'Green' },
                    { color: '#d32f2f', name: 'Red' },
                    { color: '#f57c00', name: 'Orange' },
                    { color: '#7b1fa2', name: 'Purple' },
                    { color: '#388e3c', name: 'Dark Green' },
                    { color: '#303f9f', name: 'Indigo' },
                    { color: '#c2185b', name: 'Pink' }
                  ].map((bg, index) => (
                    <Card
                      key={index}
                      sx={{
                        height: 40,
                        backgroundColor: bg.color,
                        border: bg.color === '#ffffff' ? '1px solid #e0e0e0' : 'none',
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.05)' },
                        transition: 'transform 0.2s'
                      }}
                      onClick={() => {
                        setCanvasBackground(bg.color);
                      }}
                      title={bg.name}
                    />
                  ))}
                </Box>

                {/* Gradient Backgrounds */}
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Gradients
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 3 }}>
                  {[
                    { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Purple Blue' },
                    { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Pink Red' },
                    { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Blue Cyan' },
                    { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Green Cyan' },
                    { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Pink Yellow' },
                    { gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', name: 'Mint Pink' }
                  ].map((bg, index) => (
                    <Card
                      key={index}
                      sx={{
                        height: 60,
                        background: bg.gradient,
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.02)' },
                        transition: 'transform 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => {
                        setCanvasBackground(bg.gradient);
                      }}
                      title={bg.name}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        {bg.name}
                      </Typography>
                    </Card>
                  ))}
                </Box>

                {/* Certificate Templates Button */}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<DataIcon />}
                  onClick={() => setShowTemplatesModal(true)}
                  sx={{ mb: 2 }}
                >
                  Certificate Templates (6)
                </Button>

                {/* Saved Templates Button */}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SaveIcon />}
                  onClick={() => setShowSavedTemplatesModal(true)}
                  sx={{ mb: 2 }}
                >
                  💾 My Saved Templates {isLoadingTemplates ? '(Loading...)' : `(${savedTemplates?.length || 0})`}
                </Button>
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box>
                {/* Element Tools */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Card
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => addBasicTextElement()}
                  >
                    <TextIcon sx={{ fontSize: 24, color: 'primary.main', mb: 0.5 }} />
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                      Text
                    </Typography>
                  </Card>
                  <Card
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={openDataBindingPopup}
                  >
                    <DataIcon sx={{ fontSize: 24, color: 'success.main', mb: 0.5 }} />
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                      Data Field
                    </Typography>
                  </Card>
                  <Card
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => setShowImageUploadDialog(true)}
                  >
                    <ImageIcon sx={{ fontSize: 24, color: 'warning.main', mb: 0.5 }} />
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                      Image
                    </Typography>
                  </Card>
                  <Card
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => setShowSignaturePickerDialog(true)}
                  >
                    <SignatureIcon sx={{ fontSize: 24, color: 'secondary.main', mb: 0.5 }} />
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                      Signature
                    </Typography>
                  </Card>
                  <Card
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => addQRCodeElement()}
                  >
                    <Typography sx={{ fontSize: 24, mb: 0.5 }}>📱</Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                      QR Code
                    </Typography>
                  </Card>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Layout Elements */}
                <Typography variant="subtitle2" gutterBottom>
                  Layout Elements
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                  <Card
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => addRectangleElement()}
                  >
                    <ShapeIcon sx={{ fontSize: 24, color: 'info.main', mb: 0.5 }} />
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                      Rectangle
                    </Typography>
                  </Card>
                  <Card
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => addLineElement()}
                  >
                    <Typography sx={{ fontSize: 24, mb: 0.5 }}>📏</Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                      Line
                    </Typography>
                  </Card>
                  <Card
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => addCircleElement()}
                  >
                    <Typography sx={{ fontSize: 24, mb: 0.5 }}>⭕</Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                      Circle
                    </Typography>
                  </Card>
                  <Card
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    onClick={() => addContainerElement()}
                  >
                    <Typography sx={{ fontSize: 24, mb: 0.5 }}>📦</Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                      Container
                    </Typography>
                  </Card>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Quick Actions */}
                <Typography variant="subtitle2" gutterBottom>
                  Quick Actions
                </Typography>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={removeSelectedElement}
                  disabled={!selectedElementId}
                  variant="outlined"
                  fullWidth
                  size="small"
                  color="error"
                >
                  Delete Selected Element
                </Button>

                {/* Template Error Display */}
                {templateError && (
                  <Alert severity="error" sx={{ mt: 2 }} onClose={() => setTemplateError(null)}>
                    {templateError}
                  </Alert>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Available Data Fields
                </Typography>
                <List dense>
                  {AVAILABLE_DATA_FIELDS.slice(0, 8).map((field) => (
                    <ListItem key={field.fieldPath} disablePadding>
                      <ListItemButton
                        onClick={() => handleFieldSelect(field)}
                        sx={{ borderRadius: 1, mb: 0.5 }}
                      >
                        <ListItemText
                          primary={field.label}
                          secondary={field.fieldPath}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        <Chip
                          label={field.type}
                          size="small"
                          variant="outlined"
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={openDataBindingPopup}
                  sx={{ mt: 1 }}
                >
                  View All Fields
                </Button>
              </Box>
            )}

            {/* Layers Tab */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LayersIcon fontSize="small" />
                  Layers ({(elements.length + imageElements.length)})
                </Typography>
                
                {/* Search field for layers */}
                <TextField
                  size="small"
                  placeholder="Search objects..."
                  value={layerSearchTerm}
                  onChange={(e) => setLayerSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: layerSearchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setLayerSearchTerm('')}
                          edge="end"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2, width: '100%' }}
                />
                <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {/* Combine, filter, and sort all elements by zIndex */}
                  {[...elements.map(el => ({ ...el, elementType: 'text' })), 
                    ...imageElements.map(el => ({ ...el, elementType: 'image' }))]
                    .filter((element) => {
                      if (!layerSearchTerm) return true;
                      const searchLower = layerSearchTerm.toLowerCase();
                      const elementName = element.elementType === 'text' 
                        ? (element as any).properties?.dataBinding?.label || 'Text Element'
                        : element.name || 'Image Element';
                      return elementName.toLowerCase().includes(searchLower) || 
                             element.elementType.toLowerCase().includes(searchLower) ||
                             element.id.toLowerCase().includes(searchLower);
                    })
                    .sort((a, b) => b.zIndex - a.zIndex) // Higher zIndex first (top layer)
                    .map((element) => (
                    <ListItem
                      key={element.id}
                      disablePadding
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (element.elementType === 'text') {
                                setElements(prev => prev.map(el => 
                                  el.id === element.id ? { ...el, visible: !el.visible } : el
                                ));
                              } else {
                                setImageElements(prev => prev.map(el => 
                                  el.id === element.id ? { ...el, visible: !el.visible } : el
                                ));
                              }
                            }}
                          >
                            {element.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemButton
                        selected={selectedElementId === element.id}
                        onClick={() => handleElementSelect(element.id)}
                        sx={{ py: 0.5, pr: 6 }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {element.elementType === 'text' ? (
                            <TextIcon fontSize="small" color={selectedElementId === element.id ? 'primary' : 'inherit'} />
                          ) : (
                            <ImageIcon fontSize="small" color={selectedElementId === element.id ? 'primary' : 'inherit'} />
                          )}
                        </ListItemIcon>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: selectedElementId === element.id ? 600 : 400 }}>
                            {element.elementType === 'text' 
                              ? (element as any).properties?.dataBinding?.label || 'Text Element'
                              : element.name || 'Image Element'
                            }
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.75rem' }}>
                            <Chip 
                              label={element.elementType} 
                              size="small" 
                              variant="outlined"
                              sx={{ height: 16, fontSize: '0.65rem' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              z: {element.zIndex}
                            </Typography>
                          </Box>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Data Binding Popup */}
      <DataBindingPopup
        open={showDataBindingPopup}
        onClose={() => setShowDataBindingPopup(false)}
        onSelectField={handleFieldSelect}
        position={popupPosition}
      />

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        open={showImageUploadDialog}
        onClose={() => setShowImageUploadDialog(false)}
        onImageSelect={(imageUrl) => {
          addImageElement(imageUrl);
          setShowImageUploadDialog(false);
        }}
      />

      {/* Signature Picker Dialog */}
      <SignaturePickerDialog
        open={showSignaturePickerDialog}
        onClose={() => setShowSignaturePickerDialog(false)}
        onSelect={handleSignatureSelect}
        currentUserId={currentUser?.id}
      />

      {/* Certificate Templates Modal */}
      <Dialog
        open={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Certificate Templates</Typography>
            <IconButton onClick={() => setShowTemplatesModal(false)} size="small">
              <ClearIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {[
              {
                key: 'modern-corporate',
                name: '🏢 Modern Corporate',
                preview: 'Sleek blue gradient with professional layout, perfect for business achievements and corporate training',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              },
              {
                key: 'creative-burst',
                name: '🎨 Creative Burst',
                preview: 'Vibrant pink-orange gradient with bold typography, ideal for creative achievements and design awards',
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              },
              {
                key: 'nature-fresh',
                name: '🌿 Nature Fresh',
                preview: 'Refreshing green-cyan gradient with clean design, perfect for environmental and wellness programs',
                gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
              },
              {
                key: 'golden-premium',
                name: '👑 Golden Premium',
                preview: 'Luxurious gold-pink gradient with premium styling, designed for top-tier excellence and VIP recognition',
                gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
              },
              {
                key: 'ocean-depth',
                name: '🌊 Ocean Depth',
                preview: 'Deep blue-teal gradient with elegant waves, suitable for maritime, research, and academic excellence',
                gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
              },
              {
                key: 'sunset-glow',
                name: '🌅 Sunset Glow',
                preview: 'Warm orange-red gradient with modern typography, perfect for leadership and innovation awards',
                gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)'
              }
            ].map((template, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    },
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%'
                  }}
                  onClick={() => {
                    loadTemplate(template.key);
                    setShowTemplatesModal(false);
                  }}
                >
                  {/* Gradient Preview Bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: template.gradient
                    }}
                  />

                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 0.5, fontWeight: 'bold' }}>
                    {template.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: 'block', mb: 1 }}>
                    {template.preview}
                  </Typography>

                  {/* Preview Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Chip
                      label="Click to Apply"
                      size="small"
                      sx={{
                        background: template.gradient,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplatesModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Certificate Template</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Template Name"
              value={saveFormData.name}
              onChange={(e) => setSaveFormData({ ...saveFormData, name: e.target.value })}
              sx={{ mb: 2 }}
              required
              error={!saveFormData.name.trim()}
              helperText={!saveFormData.name.trim() ? 'Template name is required' : ''}
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={saveFormData.description}
              onChange={(e) => setSaveFormData({ ...saveFormData, description: e.target.value })}
              multiline
              rows={3}
              placeholder="Add a description for this template..."
            />

            {templateError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {templateError}
              </Alert>
            )}

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Template Info:
              </Typography>
              <Typography variant="body2">
                • Elements: {elements.length + imageElements.length}
              </Typography>
              <Typography variant="body2">
                • Canvas Size: {canvasWidth} × {canvasHeight}px
              </Typography>
              <Typography variant="body2">
                • Paper: {paperSize} ({orientation})
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmSave}
            variant="contained"
            disabled={isSavingTemplate || !saveFormData.name.trim()}
            startIcon={isSavingTemplate ? undefined : <SaveIcon />}
          >
            {isSavingTemplate ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Saved Templates Modal */}
      <Dialog
        open={showSavedTemplatesModal}
        onClose={() => setShowSavedTemplatesModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              💾 My Saved Templates {isLoadingTemplates ? '(Loading...)' : `(${savedTemplates?.length || 0})`}
            </Typography>
            <IconButton onClick={() => setShowSavedTemplatesModal(false)} size="small">
              <ClearIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* Loading State */}
          {isLoadingTemplates && (!savedTemplates || savedTemplates.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Loading your templates...
              </Typography>
            </Box>
          )}

          {/* Empty State */}
          {!isLoadingTemplates && (!savedTemplates || savedTemplates.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No saved templates yet. Create and save your first template!
              </Typography>
            </Box>
          )}

          {/* Templates Grid */}
          {savedTemplates && savedTemplates.length > 0 && (
            <Grid container spacing={2}>
              {savedTemplates.map((template) => (
                <Grid item xs={12} sm={6} key={template.id}>
                  <Card
                    sx={{
                      p: 2,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        boxShadow: 2
                      },
                      transition: 'all 0.2s ease-in-out',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {template.name}
                      </Typography>
                      <Chip
                        label={`${template.design?.elements?.length || 0} elements`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flex: 1 }}>
                      {template.description || 'No description'}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(template.created_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.design?.canvas?.width || 800}×{template.design?.canvas?.height || 600}px
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => {
                          loadSavedTemplate(template);
                          setShowSavedTemplatesModal(false);
                        }}
                      >
                        Load
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSavedTemplate(template.id);
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSavedTemplatesModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Center - Canvas Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Canvas Toolbar */}
        {!isPreviewMode && (
          <Paper sx={{ borderRadius: 0, borderBottom: 1, borderColor: 'divider', backgroundColor: 'white' }}>
            <Toolbar sx={{ gap: 1, minHeight: '48px !important' }}>
              
              
              <FormControlLabel
                control={
                  <Switch
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    size="small"
                  />
                }
                label="Grid"
                sx={{ mr: 2 }}
              />
              
              {/* Paper Size Selector */}
              <FormControl size="small" sx={{ mr: 2, minWidth: 80 }}>
                <InputLabel>Paper</InputLabel>
                <Select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  label="Paper"
                  startAdornment={<PaperSizeIcon sx={{ mr: 1, fontSize: 16 }} />}
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="A3">A3</MenuItem>
                  <MenuItem value="A5">A5</MenuItem>
                  <MenuItem value="Letter">Letter</MenuItem>
                  <MenuItem value="Legal">Legal</MenuItem>
                  <MenuItem value="Custom">Custom</MenuItem>
                </Select>
              </FormControl>
              
              {/* Orientation Toggle */}
              <ButtonGroup size="small" sx={{ mr: 2 }}>
                <Button
                  variant={orientation === 'portrait' ? 'contained' : 'outlined'}
                  onClick={() => setOrientation('portrait')}
                  startIcon={<RotateIcon sx={{ transform: 'rotate(90deg)' }} />}
                >
                  Portrait
                </Button>
                <Button
                  variant={orientation === 'landscape' ? 'contained' : 'outlined'}
                  onClick={() => setOrientation('landscape')}
                  startIcon={<RotateIcon />}
                >
                  Landscape
                </Button>
              </ButtonGroup>
              
              {/* Canvas Size Display */}
              <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
                {canvasWidth} × {canvasHeight}px
              </Typography>
              
              <Typography variant="body2" sx={{ mr: 1 }}>Zoom:</Typography>
              <Box sx={{ width: 100, mr: 2 }}>
                <Slider
                  value={canvasZoom}
                  onChange={(e, value) => setCanvasZoom(value as number)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  size="small"
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                />
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={isSavingTemplate ? undefined : <SaveIcon />}
                onClick={handleSave}
                disabled={isSavingTemplate}
                size="small"
                sx={{ mr: 1 }}
              >
                {isSavingTemplate ? 'Saving...' : 'Save'}
              </Button>

              <ButtonGroup size="small">
                <Button onClick={() => handleExport('pdf')} startIcon={<ExportIcon />}>
                  PDF
                </Button>
                <Button onClick={() => handleExport('png')} startIcon={<ExportIcon />}>
                  PNG
                </Button>
              </ButtonGroup>
            </Toolbar>
          </Paper>
        )}

        {/* Canvas */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5', 
          overflow: 'auto',
          p: 2
        }}>
          <Paper 
            elevation={3} 
            sx={{ 
              background: canvasBackground,
              transform: `scale(${canvasZoom})`,
              transformOrigin: 'center',
              overflow: 'hidden'
            }}
          >
            <Stage
              ref={stageRef}
              width={canvasWidth}
              height={canvasHeight}
              onMouseDown={(e) => {
                // Deselect when clicking on empty area
                if (e.target === e.target.getStage()) {
                  setSelectedElementId(null);
                }
              }}
              onClick={(e) => {
                // Add text on double click on empty canvas
                if (e.target === e.target.getStage() && e.evt.detail === 2) {
                  const stage = e.target.getStage();
                  const pointerPosition = stage.getPointerPosition();
                  if (pointerPosition) {
                    addTextAtPosition(pointerPosition.x, pointerPosition.y);
                  }
                }
              }}
            >
              <Layer>
                {/* Background - Transparent since Paper handles the background */}
                <Rect
                  x={0}
                  y={0}
                  width={canvasWidth}
                  height={canvasHeight}
                  fill="transparent"
                />

                {/* Grid (design mode only) */}
                {!isPreviewMode && showGrid && (
                  <>
                    {Array.from({ length: Math.floor(canvasWidth / gridSize) }, (_, i) => (
                      <Rect
                        key={`grid-v-${i}`}
                        x={i * gridSize}
                        y={0}
                        width={1}
                        height={canvasHeight}
                        fill="#e0e0e0"
                      />
                    ))}
                    {Array.from({ length: Math.floor(canvasHeight / gridSize) }, (_, i) => (
                      <Rect
                        key={`grid-h-${i}`}
                        x={0}
                        y={i * gridSize}
                        width={canvasWidth}
                        height={1}
                        fill="#e0e0e0"
                      />
                    ))}
                  </>
                )}

                {/* All Elements - Sorted by z-index */}
                {[
                  ...elements.map(el => ({ ...el, elementType: 'text' as const })),
                  ...imageElements.map(el => ({ ...el, elementType: 'image' as const }))
                ]
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((element) => {
                  if (element.elementType === 'text') {
                    return (
                      <TextElement
                        key={element.id}
                        element={element as TemplateVariableElement}
                        isSelected={selectedElementId === element.id}
                        isPreviewMode={isPreviewMode}
                        onSelect={handleElementSelect}
                        onUpdate={(id, updates) => {
                          setElements(prev => prev.map(el =>
                            el.id === id ? { ...el, ...updates } : el
                          ));
                        }}
                        onDelete={(id) => {
                          setElements(prev => prev.filter(el => el.id !== id));
                          if (selectedElementId === id) {
                            setSelectedElementId(null);
                          }
                        }}
                        onDoubleClick={handleTextDoubleClick}
                        onContextMenu={handleContextMenu}
                        gridSize={gridSize}
                        snapToGrid={snapToGrid}
                      />
                    );
                  } else {
                    return (
                      <ImageElement
                        key={element.id}
                        element={element as ImageElementData}
                        isSelected={selectedElementId === element.id}
                        isPreviewMode={isPreviewMode}
                        onSelect={handleElementSelect}
                        onUpdate={updateImageElement}
                        onDelete={deleteImageElement}
                        onLayerChange={handleImageLayerChange}
                        onContextMenu={handleContextMenu}
                        canvasWidth={canvasWidth}
                        canvasHeight={canvasHeight}
                      />
                    );
                  }
                })}
              </Layer>
            </Stage>
          </Paper>
        </Box>
      </Box>

      {/* Right Properties Panel */}
      {!isPreviewMode && (
        <Box sx={{
          width: 320,
          borderLeft: 1,
          borderColor: 'divider',
          backgroundColor: 'white',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <Typography variant="h6" gutterBottom>
              ⚙️ Properties
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedElementId ? 'Edit selected element' : 'Select an element to edit'}
            </Typography>
          </Box>

          <Box sx={{ p: 2 }}>
            {selectedElementId ? (() => {
              // Find element in either text elements or image elements
              const textElement = elements.find(el => el.id === selectedElementId);
              const imageElement = imageElements.find(el => el.id === selectedElementId);
              const selectedElement = textElement || imageElement;
              
              if (!selectedElement) return null;
              
              return (
                <ElementPropertiesPanel 
                  element={selectedElement}
                  onUpdate={(updatedElement) => {
                    if (textElement) {
                      // Update text element
                      setElements(prev => prev.map(el => 
                        el.id === selectedElementId ? updatedElement as TemplateVariableElement : el
                      ));
                    } else if (imageElement) {
                      // Update image element
                      setImageElements(prev => prev.map(el => 
                        el.id === selectedElementId ? updatedElement as ImageElementData : el
                      ));
                    }
                  }}
                />
              );
            })() : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LayersIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Select an element on the canvas to view and edit its properties
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          {createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9998,
                backgroundColor: 'transparent'
              }}
              onClick={() => {
                handleCloseContextMenu();
              }}
            />,
            document.body
          )}
          {createPortal(
            <div
              style={{
                position: 'fixed',
                top: Math.max(0, contextMenu.mouseY),
                left: Math.max(0, contextMenu.mouseX),
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 9999,
                minWidth: '160px',
                padding: '4px 0',
                fontFamily: 'Roboto, Arial, sans-serif',
                fontSize: '14px'
              }}
              onContextMenu={(e) => e.preventDefault()}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => handleContextMenuAction('front')}
              >
                นำมาหน้าสุด
              </div>
              <div
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => handleContextMenuAction('forward')}
              >
                นำมาข้างหน้า
              </div>
              <div
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => handleContextMenuAction('backward')}
              >
                ส่งไปข้างหลัง
              </div>
              <div
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => handleContextMenuAction('back')}
              >
                ส่งไปหลังสุด
              </div>
              <div style={{ height: '1px', backgroundColor: '#eee', margin: '4px 0' }} />
              <div
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#d32f2f'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffebee'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => handleContextMenuAction('delete')}
              >
                ลบองค์ประกอบ
              </div>
            </div>,
            document.body
          )}
        </>
      )}

      {/* Inline Text Editing */}
      {editingTextId && (
        <>
          {(() => {
            const element = elements.find(el => el.id === editingTextId);
            if (!element) return null;
            
            const stageBox = stageRef.current?.getStage()?.container().getBoundingClientRect();
            if (!stageBox) return null;
            
            const scale = 1; // Default scale since zoom is not defined
            
            const inputStyle = {
              position: 'absolute' as const,
              left: stageBox.left + element.x * scale,
              top: stageBox.top + element.y * scale,
              width: element.width * scale,
              height: element.height * scale,
              fontSize: (element.properties?.fontSize || 16) * scale,
              fontFamily: element.properties?.fontFamily || 'Sarabun, Arial, sans-serif',
              color: element.properties?.color || '#000000',
              fontWeight: element.properties?.fontWeight || 'normal',
              textAlign: element.properties?.textAlign || 'left',
              border: '2px solid #1976d2',
              borderRadius: '4px',
              padding: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              zIndex: 10000,
              outline: 'none',
              resize: 'none' as const,
              overflow: 'hidden'
            };
            
            return createPortal(
              <textarea
                id={`text-input-${editingTextId}`}
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={handleTextEditComplete}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTextEditComplete();
                  } else if (e.key === 'Escape') {
                    handleTextEditCancel();
                  }
                }}
                style={inputStyle}
                autoFocus
              />,
              document.body
            );
          })()}
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: '#d32f2f'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={closeConfirmDialog}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              confirmDialog.onConfirm();
              closeConfirmDialog();
            }}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog
        open={alertDialog.open}
        onClose={closeAlertDialog}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: alertDialog.severity === 'success' ? '#2e7d32' : 
                 alertDialog.severity === 'error' ? '#d32f2f' :
                 alertDialog.severity === 'warning' ? '#ed6c02' : '#1976d2'
        }}>
          <span style={{ fontSize: '1.5rem' }}>
            {alertDialog.severity === 'success' ? '✅' : 
             alertDialog.severity === 'error' ? '❌' :
             alertDialog.severity === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          {alertDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {alertDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={closeAlertDialog}
            variant="contained"
            color={alertDialog.severity === 'success' ? 'success' : 
                   alertDialog.severity === 'error' ? 'error' :
                   alertDialog.severity === 'warning' ? 'warning' : 'primary'}
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimpleCertificateDesigner;
