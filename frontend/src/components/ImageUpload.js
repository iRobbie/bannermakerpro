import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageIcon, UploadIcon, XIcon, LoaderIcon, AlertCircleIcon } from 'lucide-react';
import { useImageUpload } from '../hooks/useApi';

const ImageUpload = ({ onImageUpload, images, onRemoveImage }) => {
  const { isUploading, uploadProgress, uploadError, uploadImages, clearError } = useImageUpload();
  const [pendingFiles, setPendingFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    // Create preview objects for immediate UI feedback
    const newImages = acceptedFiles.map(file => ({
      src: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      file: file,
      isUploading: true
    }));
    
    // Add to pending files for upload
    setPendingFiles(newImages);
    
    try {
      clearError();
      
      // Upload to backend
      const uploadResult = await uploadImages(newImages);
      
      // Transform backend response to match frontend format
      const uploadedImages = uploadResult.images.map(img => ({
        id: img.id,
        src: `${process.env.REACT_APP_BACKEND_URL}${img.url}`,
        name: img.name,
        size: img.size,
        file: null,
        isUploading: false,
        uploadedAt: img.created_at
      }));
      
      // Call the parent callback with uploaded images
      onImageUpload(uploadedImages);
      
      // Clear pending files
      setPendingFiles([]);
      
    } catch (error) {
      console.error('Upload failed:', error);
      // Remove pending files on error
      setPendingFiles([]);
      
      // You might want to show a toast notification here
      // For now, the error is displayed in the component
    }
  }, [onImageUpload, uploadImages, clearError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
    disabled: isUploading
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allImages = [...images, ...pendingFiles];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add images to create your banner. Supports PNG, JPG, WEBP, GIF, BMP up to 50MB each.
        </p>
      </div>

      {/* Upload Error Display */}
      {uploadError && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center space-x-2">
            <AlertCircleIcon className="h-5 w-5 text-red-500" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Upload Failed</h4>
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <LoaderIcon className="h-5 w-5 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Uploading images...</p>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-blue-700 font-medium">{uploadProgress}%</span>
          </div>
        </Card>
      )}

      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={`p-8 border-2 border-dashed cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <UploadIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop images here' : 'Upload Images'}
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop images here, or click to browse
          </p>
          <Button variant="outline" size="sm">
            Choose Files
          </Button>
        </div>
      </Card>

      {/* Uploaded Images List */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-gray-900">
              Uploaded Images
            </h4>
            <Badge variant="secondary">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {images.map((image, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveImage(index)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Tips:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• For best results, use high-resolution images</li>
          <li>• Images will be automatically resized to fit grid cells</li>
          <li>• You can upload up to 50 images per project</li>
          <li>• Transparent PNG images work great for overlays</li>
        </ul>
      </Card>
    </div>
  );
};

export default ImageUpload;