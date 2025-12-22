'use client';
import {Input} from '@/components/ui/input';
import Image from 'next/image';
import React, {useCallback, useEffect, useState, useRef, useMemo} from 'react';
import {X, Image as ImageIcon, Video, Upload, AlertCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {Progress} from '@/components/ui/progress';

const ACCEPTED_MIME_TYPES = ['image/', 'video/'];
const MAX_FILE_LIMIT = 3;
const MAX_FILE_SIZE_MB = 10; // 10MB per file

type PreviewFile = {
  id: string; // Unique identifier for each file
  url: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  file?: File;
};

function MultipleImageUpload({
  htmlFor = 'image-upload',
  allowMultipleImages = true,
  registerFiles,
  preloadedImages = [],
}: {
  htmlFor?: string;
  allowMultipleImages?: boolean;
  registerFiles: (files: File[]) => void;
  preloadedImages?: File[];
}) {
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // Generate unique ID for files
  const generateFileId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      previewFiles.forEach(f => URL.revokeObjectURL(f.url));
    };
  }, [previewFiles]);

  // Initialize with preloaded images (only on initial mount)
  useEffect(() => {
    if (isInitialMount.current && preloadedImages.length > 0) {
      const initialPreviewFiles: PreviewFile[] = preloadedImages.map(file => ({
        id: generateFileId(),
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name,
        size: file.size,
        file,
      }));

      setPreviewFiles(initialPreviewFiles);
      isInitialMount.current = false;
    }
  }, [preloadedImages]);

  // Update parent component when files change, but prevent infinite loops
  useEffect(() => {
    if (previewFiles.length > 0) {
      const files = previewFiles.map(pf => pf.file).filter(Boolean) as File[];
      registerFiles(files);
    }
  }, [previewFiles.length]); // Only re-run when number of files changes

  const validateFile = (file: File): {valid: boolean; error?: string} => {
    // Check file type
    const isValidType = ACCEPTED_MIME_TYPES.some(type => file.type.startsWith(type));
    if (!isValidType) {
      return {valid: false, error: `File "${file.name}" is not an image or video.`};
    }

    // Check file size (10MB max)
    const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSize) {
      return {valid: false, error: `File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`};
    }

    // Check total files limit
    if (previewFiles.length >= MAX_FILE_LIMIT) {
      return {valid: false, error: `Maximum ${MAX_FILE_LIMIT} files allowed.`};
    }

    return {valid: true};
  };

  const simulateUploadProgress = useCallback((fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(prev => ({...prev, [fileId]: Math.min(progress, 100)}));
    }, 100);
  }, []);

  const handleFiles = useCallback(
    (files: File[]) => {
      setError(null);
      const validFiles: File[] = [];
      const newPreviewFiles: PreviewFile[] = [];
      const errors: string[] = [];

      files.forEach(file => {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
          const fileId = generateFileId();
          newPreviewFiles.push({
            id: fileId,
            url: URL.createObjectURL(file),
            type: file.type.startsWith('image/') ? 'image' : 'video',
            name: file.name,
            size: file.size,
            file,
          });
          simulateUploadProgress(fileId);
        } else if (validation.error) {
          errors.push(validation.error);
        }
      });

      if (errors.length > 0) {
        setError(errors.join(' '));
      }

      if (validFiles.length > 0) {
        setPreviewFiles(prev => {
          const combined = [...prev, ...newPreviewFiles];
          // Limit to MAX_FILE_LIMIT
          return combined.slice(0, MAX_FILE_LIMIT);
        });
      }
    },
    [previewFiles.length, simulateUploadProgress]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        handleFiles(files);
        e.target.value = ''; // Reset input
      }
    },
    [handleFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files) {
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setPreviewFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      // Revoke URL for removed file
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile) {
        URL.revokeObjectURL(removedFile.url);
      }
      return newFiles;
    });

    // Clear upload progress for removed file
    setUploadProgress(prev => {
      const newProgress = {...prev};
      delete newProgress[fileId];
      return newProgress;
    });
  }, []);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clearAllFiles = useCallback(() => {
    previewFiles.forEach(f => URL.revokeObjectURL(f.url));
    setPreviewFiles([]);
    setUploadProgress({});
  }, [previewFiles]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getFileTypeIcon = useCallback((type: 'image' | 'video') => {
    return type === 'image' ? <ImageIcon className="h-4 w-4" /> : <Video className="h-4 w-4" />;
  }, []);

  // Memoize the file previews to prevent unnecessary re-renders
  const filePreviews = useMemo(() => {
    return previewFiles.map(file => {
      const progress = uploadProgress[file.id] || 0;
      const isUploading = progress > 0 && progress < 100;
      const isComplete = progress === 100;

      return (
        <div key={file.id} className="relative group border rounded-lg overflow-hidden bg-card">
          {/* File Preview */}
          <div className="aspect-square relative bg-muted">
            {file.type === 'image' ? (
              <Image
                src={file.url}
                alt={file.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <Video className="h-12 w-12 text-muted-foreground" />
                <video
                  src={file.url}
                  className="absolute inset-0 w-full h-full object-cover opacity-0"
                />
              </div>
            )}

            {/* Upload Progress Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-3/4 space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-white text-center">{Math.round(progress)}%</p>
                </div>
              </div>
            )}

            {/* Remove Button */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                removeFile(file.id);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* File Info */}
          <div className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {getFileTypeIcon(file.type)}
                <span className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </span>
              </div>
              {isComplete && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Ready
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        </div>
      );
    });
  }, [previewFiles, uploadProgress, removeFile, getFileTypeIcon, formatFileSize]);

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <Input
        id={htmlFor}
        ref={fileInputRef}
        onChange={handleFileInput}
        multiple={allowMultipleImages}
        type="file"
        accept="image/*,video/*"
        className="sr-only"
      />

      {/* Upload Area */}
      {previewFiles.length < MAX_FILE_LIMIT && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowseClick}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5',
            error && 'border-destructive/50 bg-destructive/5'
          )}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-1">
              <p className="font-medium">
                {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground">
                Images and videos up to {MAX_FILE_SIZE_MB}MB each
              </p>
              <p className="text-xs text-muted-foreground">
                {MAX_FILE_LIMIT - previewFiles.length} of {MAX_FILE_LIMIT} files remaining
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              Browse Files
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File Previews */}
      {previewFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Selected Files</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                {previewFiles.length}/{MAX_FILE_LIMIT}
              </span>
            </div>
            <button
              type="button"
              onClick={clearAllFiles}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{filePreviews}</div>

          {/* File Limit Warning */}
          {previewFiles.length >= MAX_FILE_LIMIT && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                Maximum {MAX_FILE_LIMIT} files reached. Remove files to add more.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {previewFiles.length === 0 && (
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-medium">💡 Tips for best results:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Upload high-quality images and videos</li>
            <li>First file will be used as the thumbnail</li>
            <li>Maximum {MAX_FILE_SIZE_MB}MB per file</li>
            <li>Supported formats: JPEG, PNG, GIF, MP4, MOV</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default MultipleImageUpload;
