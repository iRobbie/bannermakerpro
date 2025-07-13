// Mock data for banner maker app
export const mockData = {
  sampleImages: [
    {
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center",
      name: "mountain-landscape.jpg",
      size: 245760,
      file: null
    },
    {
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center",
      name: "forest-path.jpg",
      size: 198432,
      file: null
    },
    {
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center",
      name: "ocean-view.jpg",
      size: 312587,
      file: null
    },
    {
      src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop&crop=center",
      name: "sunset-sky.jpg",
      size: 287654,
      file: null
    }
  ],

  presetTemplates: [
    {
      id: 'social-media',
      name: 'Social Media Post',
      description: 'Perfect for Instagram, Facebook, Twitter',
      gridSize: { rows: 2, cols: 2 },
      backgroundColor: '#ffffff',
      textOverlays: [
        {
          id: 1,
          text: 'Follow Us!',
          style: {
            fontSize: 32,
            fontFamily: 'Arial',
            color: '#3b82f6',
            fontWeight: 'bold',
            textAlign: 'center'
          },
          position: { x: 100, y: 50 }
        }
      ]
    },
    {
      id: 'business-card',
      name: 'Business Banner',
      description: 'Professional business presentations',
      gridSize: { rows: 1, cols: 3 },
      backgroundColor: '#f8fafc',
      textOverlays: [
        {
          id: 2,
          text: 'Your Business Name',
          style: {
            fontSize: 28,
            fontFamily: 'Georgia',
            color: '#1e293b',
            fontWeight: 'bold',
            textAlign: 'left'
          },
          position: { x: 50, y: 30 }
        }
      ]
    },
    {
      id: 'event-banner',
      name: 'Event Banner',
      description: 'Great for events and announcements',
      gridSize: { rows: 3, cols: 3 },
      backgroundColor: '#fef3c7',
      textOverlays: [
        {
          id: 3,
          text: 'Special Event',
          style: {
            fontSize: 36,
            fontFamily: 'Impact',
            color: '#92400e',
            fontWeight: 'bold',
            textAlign: 'center'
          },
          position: { x: 150, y: 100 }
        }
      ]
    }
  ],

  exportFormats: [
    {
      format: 'png',
      label: 'PNG',
      description: 'Best quality, supports transparency',
      recommended: true
    },
    {
      format: 'jpg',
      label: 'JPG',
      description: 'Smaller file size, good for photos',
      recommended: false
    },
    {
      format: 'webp',
      label: 'WebP',
      description: 'Modern format, excellent compression',
      recommended: false,
      comingSoon: true
    },
    {
      format: 'svg',
      label: 'SVG',
      description: 'Vector format, scalable',
      recommended: false,
      comingSoon: true
    }
  ],

  colorPalettes: [
    {
      name: 'Ocean Blue',
      colors: ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e']
    },
    {
      name: 'Sunset Orange',
      colors: ['#fb923c', '#f97316', '#ea580c', '#dc2626', '#b91c1c']
    },
    {
      name: 'Forest Green',
      colors: ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534']
    },
    {
      name: 'Purple Dreams',
      colors: ['#a855f7', '#9333ea', '#7c3aed', '#6d28d9', '#5b21b6']
    },
    {
      name: 'Warm Neutrals',
      colors: ['#f5f5f4', '#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c']
    }
  ],

  fontSuggestions: [
    {
      family: 'Arial',
      category: 'Sans-serif',
      description: 'Clean and readable',
      recommended: true
    },
    {
      family: 'Georgia',
      category: 'Serif',
      description: 'Elegant and professional',
      recommended: true
    },
    {
      family: 'Impact',
      category: 'Display',
      description: 'Bold and attention-grabbing',
      recommended: false
    },
    {
      family: 'Trebuchet MS',
      category: 'Sans-serif',
      description: 'Modern and friendly',
      recommended: false
    },
    {
      family: 'Times New Roman',
      category: 'Serif',
      description: 'Traditional and formal',
      recommended: false
    }
  ],

  tips: {
    upload: [
      'Use high-resolution images for best results',
      'Images will be automatically resized to fit grid cells',
      'Transparent PNG images work great for overlays',
      'You can upload up to 50 images per project'
    ],
    grid: [
      'Larger grids work best with many small images',
      'Single row/column layouts great for panoramic shots',
      'Square grids (2×2, 3×3) create balanced compositions',
      'Images are automatically fitted to grid cells'
    ],
    color: [
      'Light backgrounds work well with colorful images',
      'Dark backgrounds create dramatic contrast',
      'Use colors that complement your image palette',
      'Consider your brand colors for consistency'
    ],
    text: [
      'Keep text short and readable',
      'Use contrasting colors for better visibility',
      'Larger fonts work better for banners',
      'Test different positions on your banner'
    ],
    export: [
      'PNG format preserves transparency and text quality',
      'JPG format creates smaller files, perfect for web use',
      'Higher resolutions take longer to process',
      '4K resolution is ideal for print materials'
    ]
  }
};

// Helper functions for mock data
export const getMockImagesByCategory = (category) => {
  const categories = {
    nature: mockData.sampleImages.slice(0, 2),
    landscapes: mockData.sampleImages.slice(1, 3),
    all: mockData.sampleImages
  };
  
  return categories[category] || categories.all;
};

export const getRandomMockImages = (count = 4) => {
  const shuffled = [...mockData.sampleImages].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateMockBannerData = () => {
  return {
    id: `banner_${Date.now()}`,
    name: `Banner ${new Date().toLocaleDateString()}`,
    images: getRandomMockImages(4),
    gridSize: { rows: 2, cols: 2 },
    backgroundColor: '#ffffff',
    textOverlays: [],
    exportSettings: {
      format: 'png',
      quality: 90,
      resolution: '2K'
    },
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
};