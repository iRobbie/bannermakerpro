import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Canvas, FabricImage, Textbox, Rect } from 'fabric';

const CanvasPreview = forwardRef(({ 
  images, 
  gridSize, 
  backgroundColor, 
  textOverlays, 
  canvasSize,
  zoomLevel,
  fabricCanvasRef
}, ref) => {
  const canvasElementRef = useRef(null);
  const canvasInstanceRef = useRef(null);

  useImperativeHandle(ref, () => ({
    exportCanvas: () => {
      if (canvasInstanceRef.current) {
        return canvasInstanceRef.current.toDataURL();
      }
      return null;
    }
  }));

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (canvasElementRef.current && !canvasInstanceRef.current) {
      try {
        const canvas = new Canvas(canvasElementRef.current, {
          width: canvasSize.width,
          height: canvasSize.height,
          backgroundColor: backgroundColor === 'transparent' ? null : backgroundColor,
          preserveObjectStacking: true,
          selection: true
        });

        canvasInstanceRef.current = canvas;
        if (fabricCanvasRef) {
          fabricCanvasRef.current = canvas;
        }

        // Add some interaction capabilities
        canvas.on('object:moving', function(e) {
          const obj = e.target;
          if (obj && obj.setCoords) {
            obj.setCoords();
          }
        });

        return () => {
          if (canvas) {
            canvas.dispose();
          }
          canvasInstanceRef.current = null;
          if (fabricCanvasRef) {
            fabricCanvasRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error initializing canvas:', error);
      }
    }
  }, [canvasSize, fabricCanvasRef]);

  // Update canvas size
  useEffect(() => {
    if (canvasInstanceRef.current) {
      try {
        canvasInstanceRef.current.setDimensions({
          width: canvasSize.width,
          height: canvasSize.height
        });
        canvasInstanceRef.current.renderAll();
      } catch (error) {
        console.error('Error setting canvas dimensions:', error);
      }
    }
  }, [canvasSize]);

  // Update background color - ensure it stays in the back
  useEffect(() => {
    if (canvasInstanceRef.current) {
      try {
        // Remove existing background rectangle
        const objects = canvasInstanceRef.current.getObjects();
        objects.forEach(obj => {
          if (obj.isBackgroundRect) {
            canvasInstanceRef.current.remove(obj);
          }
        });

        // Set canvas background
        if (backgroundColor === 'transparent') {
          canvasInstanceRef.current.backgroundColor = null;
        } else {
          // Create a background rectangle to ensure proper layering
          const bgRect = new Rect({
            left: 0,
            top: 0,
            width: canvasSize.width,
            height: canvasSize.height,
            fill: backgroundColor,
            selectable: false,
            evented: false,
            isBackgroundRect: true
          });
          
          canvasInstanceRef.current.add(bgRect);
          canvasInstanceRef.current.sendObjectToBack(bgRect);
        }
        
        canvasInstanceRef.current.renderAll();
      } catch (error) {
        console.error('Error setting background color:', error);
      }
    }
  }, [backgroundColor, canvasSize]);

  // Update images and grid layout WITHOUT grid lines
  useEffect(() => {
    if (!canvasInstanceRef.current) return;

    const canvas = canvasInstanceRef.current;
    
    try {
      // Clear existing images only (keep background and text)
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        if (obj.type === 'image') {
          canvas.remove(obj);
        }
      });

      // Calculate grid layout
      const cellWidth = canvasSize.width / gridSize.cols;
      const cellHeight = canvasSize.height / gridSize.rows;
      const totalCells = gridSize.rows * gridSize.cols;

      // NO GRID LINES - Removed all grid line generation code

      // Add images to grid
      images.slice(0, totalCells).forEach((image, index) => {
        const row = Math.floor(index / gridSize.cols);
        const col = index % gridSize.cols;
        
        const x = col * cellWidth;
        const y = row * cellHeight;

        FabricImage.fromURL(image.src, {}, {
          crossOrigin: 'anonymous'
        }).then((fabricImage) => {
          // Calculate scaling to fit cell while maintaining aspect ratio
          const imgAspect = fabricImage.width / fabricImage.height;
          const cellAspect = cellWidth / cellHeight;
          
          let scale;
          if (imgAspect > cellAspect) {
            // Image is wider than cell
            scale = cellWidth / fabricImage.width;
          } else {
            // Image is taller than cell
            scale = cellHeight / fabricImage.height;
          }

          fabricImage.set({
            left: x + cellWidth / 2,
            top: y + cellHeight / 2,
            scaleX: scale,
            scaleY: scale,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: true,
            hasBorders: true,
            cornerStyle: 'circle',
            cornerColor: '#3b82f6',
            borderColor: '#3b82f6',
            transparentCorners: false
          });

          canvas.add(fabricImage);
          
          // Ensure background stays in back
          const bgRect = canvas.getObjects().find(obj => obj.isBackgroundRect);
          if (bgRect) {
            canvas.sendObjectToBack(bgRect);
          }
          
          canvas.renderAll();
        }).catch((error) => {
          console.error('Error loading image:', image.src, error);
        });
      });

      canvas.renderAll();
    } catch (error) {
      console.error('Error updating images and grid:', error);
    }

  }, [images, gridSize, canvasSize]);

  // Update text overlays
  useEffect(() => {
    if (!canvasInstanceRef.current) return;

    const canvas = canvasInstanceRef.current;
    
    try {
      // Remove existing text objects
      const objects = canvas.getObjects();
      objects.forEach(obj => {
        if (obj.type === 'text' || obj.type === 'textbox') {
          canvas.remove(obj);
        }
      });

      // Add text overlays
      textOverlays.forEach((overlay) => {
        const textObj = new Textbox(overlay.text, {
          left: overlay.position?.x || 50,
          top: overlay.position?.y || 50,
          fontFamily: overlay.style?.fontFamily || 'Arial',
          fontSize: overlay.style?.fontSize || 24,
          fill: overlay.style?.color || '#000000',
          fontWeight: overlay.style?.fontWeight || 'normal',
          fontStyle: overlay.style?.fontStyle || 'normal',
          textAlign: overlay.style?.textAlign || 'left',
          backgroundColor: overlay.style?.backgroundColor === 'transparent' ? '' : (overlay.style?.backgroundColor || ''),
          width: 200,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerStyle: 'circle',
          cornerColor: '#10b981',
          borderColor: '#10b981',
          transparentCorners: false
        });

        canvas.add(textObj);
        
        // Ensure background stays in back
        const bgRect = canvas.getObjects().find(obj => obj.isBackgroundRect);
        if (bgRect) {
          canvas.sendToBack(bgRect);
        }
      });

      canvas.renderAll();
    } catch (error) {
      console.error('Error updating text overlays:', error);
    }
  }, [textOverlays]);

  // Update zoom level
  useEffect(() => {
    if (canvasInstanceRef.current) {
      try {
        canvasInstanceRef.current.setZoom(zoomLevel);
        canvasInstanceRef.current.renderAll();
      } catch (error) {
        console.error('Error setting zoom:', error);
      }
    }
  }, [zoomLevel]);

  return (
    <div className="relative">
      <div 
        className="rounded-lg overflow-hidden bg-white"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left'
        }}
      >
        <canvas
          ref={canvasElementRef}
          width={canvasSize.width}
          height={canvasSize.height}
        />
      </div>
      
      {/* Canvas Info Overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
        {gridSize.rows}×{gridSize.cols} | {images.length} images
      </div>
      
      {images.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Upload images to get started</p>
            <p className="text-xs mt-1">Your banner preview will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
});

CanvasPreview.displayName = 'CanvasPreview';

export default CanvasPreview;