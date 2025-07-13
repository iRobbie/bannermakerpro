import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import ImageUpload from './ImageUpload';
import GridSelector from './GridSelector';
import ColorPicker from './ColorPicker';
import TextOverlay from './TextOverlay';
import ExportPanel from './ExportPanel';
import CanvasPreview from './CanvasPreview';
import { useProjects, useExport } from '../hooks/useApi';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ImageIcon, 
  GridIcon, 
  PaletteIcon, 
  TypeIcon, 
  DownloadIcon,
  ZoomInIcon,
  ZoomOutIcon,
  RotateCcwIcon,
  TrashIcon,
  SaveIcon,
  AlertCircleIcon,
  LoaderIcon
} from 'lucide-react';

const BannerMaker = () => {
  const [images, setImages] = useState(mockData.sampleImages);
  const [gridSize, setGridSize] = useState({ rows: 2, cols: 2 });
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textOverlays, setTextOverlays] = useState([]);
  const [selectedTool, setSelectedTool] = useState('upload');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });
  const [exportSettings, setExportSettings] = useState({
    format: 'png',
    quality: 90,
    resolution: '2K'
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  const sidebarTools = [
    { id: 'upload', name: 'Upload', icon: ImageIcon, description: 'Add images' },
    { id: 'grid', name: 'Layout', icon: GridIcon, description: 'Grid settings' },
    { id: 'color', name: 'Colors', icon: PaletteIcon, description: 'Background color' },
    { id: 'text', name: 'Text', icon: TypeIcon, description: 'Add text overlay' },
    { id: 'export', name: 'Export', icon: DownloadIcon, description: 'Download banner' }
  ];

  const resolutionOptions = {
    '1080p': { width: 1920, height: 1080 },
    '2K': { width: 2048, height: 2048 },
    '4K': { width: 4096, height: 4096 }
  };

  useEffect(() => {
    const resolution = resolutionOptions[exportSettings.resolution];
    const aspectRatio = resolution.width / resolution.height;
    const maxCanvasWidth = 600;
    
    if (aspectRatio >= 1) {
      setCanvasSize({
        width: maxCanvasWidth,
        height: maxCanvasWidth / aspectRatio
      });
    } else {
      setCanvasSize({
        width: maxCanvasWidth * aspectRatio,
        height: maxCanvasWidth
      });
    }
  }, [exportSettings.resolution]);

  const handleImageUpload = (newImages) => {
    setImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGridChange = (rows, cols) => {
    setGridSize({ rows, cols });
  };

  const handleAddTextOverlay = (text, style) => {
    const newOverlay = {
      id: Date.now(),
      text,
      style,
      position: { x: 50, y: 50 }
    };
    setTextOverlays(prev => [...prev, newOverlay]);
  };

  const handleRemoveTextOverlay = (id) => {
    setTextOverlays(prev => prev.filter(overlay => overlay.id !== id));
  };

  const handleExport = async () => {
    try {
      // Mock export functionality
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const resolution = resolutionOptions[exportSettings.resolution];
      const dataURL = canvas.toDataURL({
        format: exportSettings.format === 'jpg' ? 'jpeg' : 'png',
        quality: exportSettings.quality / 100,
        multiplier: resolution.width / canvasSize.width
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `banner_${Date.now()}.${exportSettings.format}`;
      link.href = dataURL;
      link.click();

      // Show success message
      alert(`Banner exported successfully as ${exportSettings.format.toUpperCase()}!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const renderToolPanel = () => {
    switch (selectedTool) {
      case 'upload':
        return (
          <ImageUpload 
            onImageUpload={handleImageUpload}
            images={images}
            onRemoveImage={handleRemoveImage}
          />
        );
      case 'grid':
        return (
          <GridSelector 
            gridSize={gridSize}
            onGridChange={handleGridChange}
          />
        );
      case 'color':
        return (
          <ColorPicker 
            backgroundColor={backgroundColor}
            onColorChange={setBackgroundColor}
          />
        );
      case 'text':
        return (
          <TextOverlay 
            textOverlays={textOverlays}
            onAddTextOverlay={handleAddTextOverlay}
            onRemoveTextOverlay={handleRemoveTextOverlay}
          />
        );
      case 'export':
        return (
          <ExportPanel 
            exportSettings={exportSettings}
            onExportSettingsChange={setExportSettings}
            onExport={handleExport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Banner Maker</h1>
            <Badge variant="secondary">MVP v1.0</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOutIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
            >
              <ZoomInIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
            >
              <RotateCcwIcon className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export Banner
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Tools */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Tool Navigation */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-5 gap-2">
              {sidebarTools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTool(tool.id)}
                    className="flex flex-col h-auto py-3 px-2"
                    title={tool.description}
                  >
                    <IconComponent className="h-4 w-4 mb-1" />
                    <span className="text-xs">{tool.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Tool Panel */}
          <div className="flex-1 overflow-y-auto p-4">
            {renderToolPanel()}
          </div>
        </div>

        {/* Center - Canvas Area */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {/* Canvas Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Grid: {gridSize.rows}×{gridSize.cols}
                </span>
                <span className="text-sm text-gray-600">
                  Images: {images.length}
                </span>
                <span className="text-sm text-gray-600">
                  Resolution: {exportSettings.resolution}
                </span>
              </div>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="p-4 bg-white shadow-lg">
              <CanvasPreview
                ref={canvasRef}
                fabricCanvasRef={fabricCanvasRef}
                images={images}
                gridSize={gridSize}
                backgroundColor={backgroundColor}
                textOverlays={textOverlays}
                canvasSize={canvasSize}
                zoomLevel={zoomLevel}
              />
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 bg-white border-l border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Canvas Size
              </label>
              <div className="text-sm text-gray-600">
                {Math.round(canvasSize.width)} × {Math.round(canvasSize.height)}px
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Background Color
              </label>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor }}
                />
                <span className="text-sm text-gray-600">{backgroundColor}</span>
              </div>
            </div>

            {images.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Uploaded Images
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {images.map((image, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={image.src} 
                          alt={image.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-xs text-gray-600 truncate max-w-24">
                          {image.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                        className="h-6 w-6 p-0"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {textOverlays.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Text Overlays
                </label>
                <div className="space-y-2">
                  {textOverlays.map((overlay) => (
                    <div key={overlay.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-xs text-gray-600 truncate">
                        {overlay.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTextOverlay(overlay.id)}
                        className="h-6 w-6 p-0"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerMaker;