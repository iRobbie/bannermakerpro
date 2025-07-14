import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { PaletteIcon, PipetteIcon } from 'lucide-react';

const ColorPicker = ({ backgroundColor, onColorChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState('bottom');

  const presetColors = [
    '#ffffff', // White
    '#f8fafc', // Slate 50
    '#f1f5f9', // Slate 100
    '#e2e8f0', // Slate 200
    '#000000', // Black
    '#1e293b', // Slate 800
    '#0f172a', // Slate 900
    '#ef4444', // Red 500
    '#f97316', // Orange 500
    '#eab308', // Yellow 500
    '#22c55e', // Green 500
    '#06b6d4', // Cyan 500
    '#3b82f6', // Blue 500
    '#8b5cf6', // Violet 500
    '#ec4899', // Pink 500
    '#6366f1', // Indigo 500
    '#84cc16', // Lime 500
    '#f59e0b', // Amber 500
  ];

  const gradientPresets = [
    { 
      name: 'Ocean Blue', 
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      value: '#667eea'
    },
    { 
      name: 'Sunset', 
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      value: '#f093fb'
    },
    { 
      name: 'Forest', 
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      value: '#4facfe'
    },
    { 
      name: 'Purple Dream', 
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      value: '#a8edea'
    },
    { 
      name: 'Golden Hour', 
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      value: '#ffecd2'
    },
    { 
      name: 'Mint Fresh', 
      gradient: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)',
      value: '#a8e6cf'
    }
  ];

  const handleColorChange = (color) => {
    onColorChange(color.hex);
  };

  const handlePresetClick = (color) => {
    onColorChange(color);
  };

  const togglePicker = () => {
    setShowPicker(!showPicker);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Background Color</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose a background color for your banner.
        </p>
      </div>

      {/* Current Color Display */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div 
            className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-inner"
            style={{ backgroundColor }}
          />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">Current Color</h4>
            <p className="text-sm text-gray-600 font-mono">{backgroundColor}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={togglePicker}
              className="mt-2"
            >
              <PipetteIcon className="h-4 w-4 mr-2" />
              {showPicker ? 'Close Picker' : 'Custom Color'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Color Picker */}
      {showPicker && (
        <Card className="p-4">
          <div className="relative">
            <SketchPicker
              color={backgroundColor}
              onChange={handleColorChange}
              disableAlpha={false}
              width="260px"
            />
          </div>
        </Card>
      )}

      {/* Preset Solid Colors */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <PaletteIcon className="h-4 w-4 text-gray-600" />
          <h4 className="text-md font-medium text-gray-900">Preset Colors</h4>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {presetColors.map((color, index) => (
            <button
              key={index}
              className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-md ${
                backgroundColor === color 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handlePresetClick(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Gradient Presets */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Gradient Backgrounds</h4>
        <div className="grid grid-cols-2 gap-3">
          {gradientPresets.map((preset, index) => (
            <Card
              key={index}
              className="p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
              onClick={() => handlePresetClick(preset.value)}
            >
              <div 
                className="w-full h-12 rounded-lg mb-2"
                style={{ background: preset.gradient }}
              />
              <p className="text-xs text-center text-gray-600 font-medium">
                {preset.name}
              </p>
            </Card>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Note: Gradients will use the base color. Full gradient support coming soon!
        </p>
      </div>

      {/* Color Harmony Suggestions */}
      <Card className="p-4 bg-purple-50 border-purple-200">
        <h4 className="text-sm font-medium text-purple-900 mb-2">Color Tips:</h4>
        <ul className="text-xs text-purple-800 space-y-1">
          <li>• Light backgrounds work well with colorful images</li>
          <li>• Dark backgrounds create dramatic contrast</li>
          <li>• Use colors that complement your image palette</li>
          <li>• Consider your brand colors for consistency</li>
        </ul>
      </Card>

      {/* Recent Colors */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Quick Access</h4>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick('#ffffff')}
            className="flex items-center space-x-2"
          >
            <div className="w-4 h-4 bg-white border border-gray-300 rounded" />
            <span>White</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick('#000000')}
            className="flex items-center space-x-2"
          >
            <div className="w-4 h-4 bg-black rounded" />
            <span>Black</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick('transparent')}
            className="flex items-center space-x-2"
          >
            <div className="w-4 h-4 bg-gray-200 rounded opacity-50" />
            <span>Remove Background</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;