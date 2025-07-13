import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { 
  DownloadIcon, 
  ImageIcon, 
  SettingsIcon,
  FileIcon,
  ZapIcon
} from 'lucide-react';

const ExportPanel = ({ exportSettings, onExportSettingsChange, onExport }) => {
  const formatOptions = [
    { value: 'png', label: 'PNG', description: 'Best quality, supports transparency' },
    { value: 'jpg', label: 'JPG', description: 'Smaller file size, good for photos' }
  ];

  const resolutionOptions = [
    { value: '1080p', label: '1080p (1920×1080)', description: 'Standard HD' },
    { value: '2K', label: '2K (2048×2048)', description: 'High quality' },
    { value: '4K', label: '4K (4096×4096)', description: 'Ultra high quality' }
  ];

  const handleSettingChange = (key, value) => {
    onExportSettingsChange(prev => ({ ...prev, [key]: value }));
  };

  const getEstimatedFileSize = () => {
    const resolutions = {
      '1080p': { width: 1920, height: 1080 },
      '2K': { width: 2048, height: 2048 },
      '4K': { width: 4096, height: 4096 }
    };
    
    const res = resolutions[exportSettings.resolution];
    const pixels = res.width * res.height;
    
    if (exportSettings.format === 'png') {
      // PNG estimates: ~4 bytes per pixel (with compression)
      return Math.round((pixels * 4) / (1024 * 1024) * 1.2); // MB
    } else {
      // JPG estimates based on quality
      const baseSize = pixels * 3 / (1024 * 1024); // RGB base
      const qualityFactor = exportSettings.quality / 100;
      return Math.round(baseSize * qualityFactor * 0.1); // Compressed
    }
  };

  const getCurrentResolution = () => {
    const resolutions = {
      '1080p': { width: 1920, height: 1080 },
      '2K': { width: 2048, height: 2048 },
      '4K': { width: 4096, height: 4096 }
    };
    return resolutions[exportSettings.resolution];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Settings</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure your banner export options and download.
        </p>
      </div>

      {/* Export Format */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <ImageIcon className="h-4 w-4 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">File Format</h4>
        </div>
        
        <div className="space-y-3">
          <Select 
            value={exportSettings.format} 
            onValueChange={(value) => handleSettingChange('format', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {exportSettings.format === 'jpg' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-700">
                  Quality: {exportSettings.quality}%
                </Label>
                <Badge variant="outline" className="text-xs">
                  {exportSettings.quality >= 90 ? 'Excellent' : 
                   exportSettings.quality >= 70 ? 'Good' : 'Compressed'}
                </Badge>
              </div>
              <Slider
                value={[exportSettings.quality]}
                onValueChange={(value) => handleSettingChange('quality', value[0])}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Resolution Settings */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <SettingsIcon className="h-4 w-4 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">Resolution</h4>
        </div>
        
        <Select 
          value={exportSettings.resolution} 
          onValueChange={(value) => handleSettingChange('resolution', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {resolutionOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Output size:</span>
              <span className="font-mono">
                {getCurrentResolution().width} × {getCurrentResolution().height}px
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Estimated file size:</span>
              <span className="font-medium">~{getEstimatedFileSize()} MB</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Export Button */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <Button 
          onClick={onExport}
          className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
        >
          <DownloadIcon className="h-5 w-5 mr-3" />
          Export Banner
        </Button>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-blue-700">
            Your banner will be downloaded to your device
          </p>
        </div>
      </Card>

      {/* Export Options Summary */}
      <Card className="p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center space-x-2">
          <FileIcon className="h-4 w-4" />
          <span>Export Summary</span>
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Format:</span>
            <Badge variant="outline">{exportSettings.format.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Resolution:</span>
            <span className="font-medium">{exportSettings.resolution}</span>
          </div>
          {exportSettings.format === 'jpg' && (
            <div className="flex justify-between">
              <span className="text-gray-600">Quality:</span>
              <span className="font-medium">{exportSettings.quality}%</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Dimensions:</span>
            <span className="font-mono text-xs">
              {getCurrentResolution().width}×{getCurrentResolution().height}
            </span>
          </div>
        </div>
      </Card>

      {/* Export Tips */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <ZapIcon className="h-4 w-4 text-green-600" />
          <h4 className="text-sm font-medium text-green-900">Export Tips:</h4>
        </div>
        <ul className="text-xs text-green-800 space-y-1">
          <li>• PNG format preserves transparency and text quality</li>
          <li>• JPG format creates smaller files, perfect for web use</li>
          <li>• Higher resolutions take longer to process</li>
          <li>• 4K resolution is ideal for print materials</li>
        </ul>
      </Card>
    </div>
  );
};

export default ExportPanel;