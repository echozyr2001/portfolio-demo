'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface MediaUploadResult {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    optimizedSize?: number;
    compressionRatio?: number;
    width?: number;
    height?: number;
    url: string;
    alt?: string;
    blurhash?: string;
    createdAt: string;
  };
  error?: string;
  code?: string;
}

interface MediaUploaderProps {
  onUploadComplete?: (result: MediaUploadResult) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function MediaUploader({
  onUploadComplete,
  onUploadProgress,
  onUploadError,
  accept = 'image/*',
  maxSize = 5,
  className = '',
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const error = `File too large. Maximum size is ${maxSize}MB.`;
      onUploadError?.(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          setUploadProgress(progress);
          onUploadProgress?.(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        try {
          const result: MediaUploadResult = JSON.parse(xhr.responseText);
          onUploadComplete?.(result);
          
          if (!result.success) {
            onUploadError?.(result.error || 'Upload failed');
          }
        } catch (error) {
          onUploadError?.('Failed to parse server response');
        }
        
        setIsUploading(false);
        setUploadProgress(null);
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        onUploadError?.('Network error during upload');
        setIsUploading(false);
        setUploadProgress(null);
      });

      // Start upload
      xhr.open('POST', '/api/admin/media/upload');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`media-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:border-gray-400'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="text-lg font-medium">Uploading...</div>
            {uploadProgress && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {uploadProgress.percentage}% ({Math.round(uploadProgress.loaded / 1024)}KB / {Math.round(uploadProgress.total / 1024)}KB)
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📁</div>
            <div>
              <div className="text-lg font-medium">Drop files here or click to upload</div>
              <div className="text-sm text-gray-500 mt-1">
                Supports: Images (PNG, JPG, WebP, GIF, SVG)
              </div>
              <div className="text-sm text-gray-500">
                Maximum file size: {maxSize}MB
              </div>
            </div>
            <Button type="button" variant="outline">
              Choose Files
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Example usage component
export function MediaUploaderExample() {
  const [uploadResults, setUploadResults] = useState<MediaUploadResult[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadComplete = (result: MediaUploadResult) => {
    if (result.success) {
      setUploadResults(prev => [...prev, result]);
      setUploadError(null);
    }
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  const handleUploadProgress = (progress: UploadProgress) => {
    console.log('Upload progress:', progress);
  };

  return (
    <div className="space-y-6">
      <MediaUploader
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        onUploadProgress={handleUploadProgress}
        className="max-w-2xl mx-auto"
      />

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <strong>Upload Error:</strong> {uploadError}
        </div>
      )}

      {uploadResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Files</h3>
          <div className="grid gap-4">
            {uploadResults.map((result, index) => (
              result.data && (
                <div key={index} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-start space-x-4">
                    <img
                      src={result.data.url}
                      alt={result.data.alt || result.data.originalName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{result.data.originalName}</div>
                      <div className="text-sm text-gray-600">
                        {result.data.width}×{result.data.height} • {Math.round(result.data.size / 1024)}KB
                        {result.data.optimizedSize && (
                          <span> → {Math.round(result.data.optimizedSize / 1024)}KB</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">ID: {result.data.id}</div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}