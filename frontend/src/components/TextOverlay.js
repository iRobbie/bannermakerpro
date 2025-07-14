import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  TypeIcon, 
  PlusIcon, 
  XIcon, 
  BoldIcon, 
  ItalicIcon, 
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon
} from 'lucide-react';

const TextOverlay = ({ textOverlays, onAddTextOverlay, onRemoveTextOverlay }) => {
  const [newText, setNewText] = useState('');
  const [textStyle, setTextStyle] = useState({
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 0
  });

  const fontOptions = [
    'Arial',
    'ArchivoBlack-Regular',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Trebuchet MS',
    'Impact',
    'Comic Sans MS',
    'Courier New',
    'Lucida Console'
  ];

  const fontSizeOptions = [
    { label: 'Small (16px)', value: 16 },
    { label: 'Medium (24px)', value: 24 },
    { label: 'Large (32px)', value: 32 },
    { label: 'Extra Large (48px)', value: 48 },
    { label: 'Huge (64px)', value: 64 }
  ];

  const textColorPresets = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'
  ];

  const handleStyleChange = (property, value) => {
    setTextStyle(prev => ({ ...prev, [property]: value }));
  };

  const handleAddText = () => {
    if (newText.trim()) {
      onAddTextOverlay(newText, textStyle);
      setNewText('');
    }
  };

  const toggleBold = () => {
    handleStyleChange('fontWeight', textStyle.fontWeight === 'bold' ? 'normal' : 'bold');
  };

  const toggleItalic = () => {
    handleStyleChange('fontStyle', textStyle.fontStyle === 'italic' ? 'normal' : 'italic');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Text Overlay</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add text to your banner with custom styling.
        </p>
      </div>

      {/* Add New Text */}
      <Card className="p-4">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Add Text</span>
        </h4>

        <div className="space-y-4">
          {/* Text Input */}
          <div>
            <Label htmlFor="newText" className="text-sm font-medium text-gray-700">
              Text Content
            </Label>
            <Textarea
              id="newText"
              placeholder="Enter your text here..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Font Family */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Font Family</Label>
            <Select 
              value={textStyle.fontFamily} 
              onValueChange={(value) => handleStyleChange('fontFamily', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map(font => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Font Size</Label>
            <Select 
              value={textStyle.fontSize.toString()} 
              onValueChange={(value) => handleStyleChange('fontSize', parseInt(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Style Buttons */}
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-2">Text Style</Label>
            <div className="flex space-x-2">
              <Button
                variant={textStyle.fontWeight === 'bold' ? 'default' : 'outline'}
                size="sm"
                onClick={toggleBold}
              >
                <BoldIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={textStyle.fontStyle === 'italic' ? 'default' : 'outline'}
                size="sm"
                onClick={toggleItalic}
              >
                <ItalicIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-2">Text Alignment</Label>
            <div className="flex space-x-2">
              <Button
                variant={textStyle.textAlign === 'left' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStyleChange('textAlign', 'left')}
              >
                <AlignLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={textStyle.textAlign === 'center' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStyleChange('textAlign', 'center')}
              >
                <AlignCenterIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={textStyle.textAlign === 'right' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStyleChange('textAlign', 'right')}
              >
                <AlignRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Text Color */}
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-2">Text Color</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Input
                type="color"
                value={textStyle.color}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="w-12 h-8 p-1 border-2"
              />
              <Input
                type="text"
                value={textStyle.color}
                onChange={(e) => handleStyleChange('color', e.target.value)}
                className="flex-1 font-mono text-sm"
                placeholder="#000000"
              />
            </div>
            <div className="flex space-x-1">
              {textColorPresets.map(color => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handleStyleChange('color', color)}
                />
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-2">Background Color</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Input
                type="color"
                value={textStyle.backgroundColor === 'transparent' ? '#ffffff' : textStyle.backgroundColor}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-12 h-8 p-1 border-2"
                disabled={textStyle.backgroundColor === 'transparent'}
              />
              <Input
                type="text"
                value={textStyle.backgroundColor}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="flex-1 font-mono text-sm"
                placeholder="transparent or #ffffff"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStyleChange('backgroundColor', 'transparent')}
                className="px-2"
              >
                Clear
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              Use transparent for no background or choose a color
            </div>
          </div>

          {/* Add Button */}
          <Button 
            onClick={handleAddText} 
            className="w-full"
            disabled={!newText.trim()}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Text to Banner
          </Button>
        </div>
      </Card>

      {/* Text Preview */}
      {newText && (
        <Card className="p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div 
            className="p-4 border border-gray-200 rounded-lg bg-white"
            style={{
              fontFamily: textStyle.fontFamily,
              fontSize: textStyle.fontSize,
              color: textStyle.color,
              fontWeight: textStyle.fontWeight,
              fontStyle: textStyle.fontStyle,
              textAlign: textStyle.textAlign,
              backgroundColor: textStyle.backgroundColor === 'transparent' ? 'transparent' : textStyle.backgroundColor,
              padding: textStyle.padding,
              borderRadius: textStyle.borderRadius
            }}
          >
            {newText}
          </div>
        </Card>
      )}

      {/* Existing Text Overlays */}
      {textOverlays.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
              <TypeIcon className="h-4 w-4" />
              <span>Text Overlays</span>
            </h4>
            <Badge variant="secondary">
              {textOverlays.length} {textOverlays.length === 1 ? 'text' : 'texts'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {textOverlays.map((overlay) => (
              <Card key={overlay.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p 
                      className="text-sm mb-1"
                      style={{
                        fontFamily: overlay.style.fontFamily,
                        fontWeight: overlay.style.fontWeight,
                        fontStyle: overlay.style.fontStyle,
                        color: overlay.style.color
                      }}
                    >
                      {overlay.text}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{overlay.style.fontFamily}</span>
                      <span>•</span>
                      <span>{overlay.style.fontSize}px</span>
                      <span>•</span>
                      <span>{overlay.style.color}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTextOverlay(overlay.id)}
                    className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Text Tips */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">Text Tips:</h4>
        <ul className="text-xs text-yellow-800 space-y-1">
          <li>• Keep text short and readable</li>
          <li>• Use contrasting colors for better visibility</li>
          <li>• Larger fonts work better for banners</li>
          <li>• Test different positions on your banner</li>
        </ul>
      </Card>
    </div>
  );
};

export default TextOverlay;