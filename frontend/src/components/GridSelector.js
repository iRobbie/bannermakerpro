import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GridIcon } from 'lucide-react';

const GridSelector = ({ gridSize, onGridChange }) => {
  const presetGrids = [
    { rows: 1, cols: 1, name: 'Single' },
    { rows: 1, cols: 2, name: '1×2' },
    { rows: 2, cols: 1, name: '2×1' },
    { rows: 2, cols: 2, name: '2×2' },
    { rows: 2, cols: 3, name: '2×3' },
    { rows: 3, cols: 2, name: '3×2' },
    { rows: 3, cols: 3, name: '3×3' },
    { rows: 3, cols: 4, name: '3×4' },
    { rows: 4, cols: 3, name: '4×3' },
    { rows: 4, cols: 4, name: '4×4' },
    { rows: 5, cols: 5, name: '5×5' },
    { rows: 6, cols: 6, name: '6×6' }
  ];

  const handleCustomGridChange = (type, value) => {
    const numValue = Math.max(1, Math.min(6, parseInt(value) || 1));
    if (type === 'rows') {
      onGridChange(numValue, gridSize.cols);
    } else {
      onGridChange(gridSize.rows, numValue);
    }
  };

  const renderGridPreview = (rows, cols, isSelected = false) => {
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push(
          <div
            key={`${r}-${c}`}
            className={`border border-gray-300 ${
              isSelected ? 'bg-blue-100 border-blue-400' : 'bg-white'
            }`}
            style={{
              gridRow: r + 1,
              gridColumn: c + 1,
            }}
          />
        );
      }
    }

    return (
      <div
        className="w-full h-16 border-2 border-gray-200 rounded p-1"
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '2px'
        }}
      >
        {cells}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Grid Layout</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose how to arrange your images in the banner.
        </p>
      </div>

      {/* Current Selection */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <GridIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Current Grid</h4>
            <p className="text-xs text-blue-700">
              {gridSize.rows} rows × {gridSize.cols} columns = {gridSize.rows * gridSize.cols} cells
            </p>
          </div>
        </div>
        {renderGridPreview(gridSize.rows, gridSize.cols, true)}
      </Card>

      {/* Preset Grids */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Preset Layouts</h4>
        <div className="grid grid-cols-2 gap-3">
          {presetGrids.map((preset) => (
            <Card
              key={`${preset.rows}-${preset.cols}`}
              className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                gridSize.rows === preset.rows && gridSize.cols === preset.cols
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onGridChange(preset.rows, preset.cols)}
            >
              <div className="text-center mb-2">
                <Badge variant="outline" className="text-xs">
                  {preset.name}
                </Badge>
              </div>
              {renderGridPreview(preset.rows, preset.cols, 
                gridSize.rows === preset.rows && gridSize.cols === preset.cols)}
              <p className="text-xs text-gray-600 text-center mt-2">
                {preset.rows * preset.cols} images
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Grid */}
      <Card className="p-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Custom Grid</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rows" className="text-sm font-medium text-gray-700">
              Rows
            </Label>
            <Input
              id="rows"
              type="number"
              min="1"
              max="6"
              value={gridSize.rows}
              onChange={(e) => handleCustomGridChange('rows', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cols" className="text-sm font-medium text-gray-700">
              Columns
            </Label>
            <Input
              id="cols"
              type="number"
              min="1"
              max="6"
              value={gridSize.cols}
              onChange={(e) => handleCustomGridChange('cols', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-4">
          {renderGridPreview(gridSize.rows, gridSize.cols)}
        </div>
      </Card>

      {/* Grid Tips */}
      <Card className="p-4 bg-green-50 border-green-200">
        <h4 className="text-sm font-medium text-green-900 mb-2">Layout Tips:</h4>
        <ul className="text-xs text-green-800 space-y-1">
          <li>• Larger grids work best with many small images</li>
          <li>• Single row/column layouts great for panoramic shots</li>
          <li>• Square grids (2×2, 3×3) create balanced compositions</li>
          <li>• Images are automatically fitted to grid cells</li>
        </ul>
      </Card>
    </div>
  );
};

export default GridSelector;