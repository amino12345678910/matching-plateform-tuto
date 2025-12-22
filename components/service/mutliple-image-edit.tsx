'use client';
import {Input} from '@/components/ui/input';
// import Image from 'next/image';
import React, {useEffect, useState} from 'react';

const MAX_FILE_LIMIT = 3;
const ACCEPTED_MIME_TYPES = ['image/', 'video/'];

type PreviewFile = {
  url: string;
  type: 'image' | 'video';
};

function MultipleImageUpload({
  htmlFor = 'image-upload',
  allowMultipleImages = true,
  registerFiles,
  preloadedImages,
}: {
  htmlFor: string;
  allowMultipleImages?: boolean;
  registerFiles: (files: File[]) => void;
  preloadedImages?: File[];
}) {
  const [previewImageURLs, setPreviewImageURLs] = useState<string[]>([]);
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  // const [filesToProceed, setfilesToProceed] = useState<File[]>([]);

  // const cleanupURLs = useCallback((urlsToRevoke: string[]) => {
  //   urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
  // }, []);

  useEffect(() => {
    return () => {
      previewFiles.forEach(f => URL.revokeObjectURL(f.url));
    };
  }, []);

  useEffect(() => {
    if (!preloadedImages || preloadedImages.length === 0) return;

    const preloadPreviewFiles: PreviewFile[] = preloadedImages.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
    }));

    setPreviewFiles(prev => [...preloadPreviewFiles, ...prev]);
    // setfilesToProceed(prev => [...preloadedImages, ...prev]);
    registerFiles(preloadedImages);

    return () => {
      preloadPreviewFiles.forEach(f => URL.revokeObjectURL(f.url));
    };
  }, [preloadedImages]);

  // useEffect(() => {
  //   const urlsToCleanup = previewFiles.map(f => f.url);

  //   registerFiles(filesToProceed);
  //   // console.log('Fofofoof ', filesToProceed);
  //   return () => {
  //     cleanupURLs(urlsToCleanup);
  //   };
  // }, [previewImageURLs, cleanupURLs, registerFiles, filesToProceed, preloadedImages]);

  const onAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      let filesArray = Array.from(e.target.files);

      const validFiles = filesArray.filter(file =>
        ACCEPTED_MIME_TYPES.some(type => file.type.startsWith(type))
      );

      const newPreviewFiles: PreviewFile[] = filesArray
        .filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'))
        .map(file => {
          const fileType: 'image' | 'video' = file.type.startsWith('image/') ? 'image' : 'video';
          return {
            url: URL.createObjectURL(file),
            type: fileType,
          };
        });

      setPreviewFiles(prev => [...prev, ...newPreviewFiles]);

      if (validFiles.length !== filesArray.length) {
        setError('Only image (JPEG, PNG, etc.) and video files are allowed.');
      }

      // console.log('If condition', 'file', filesToProceed);
      // setfilesToProceed(validFiles);
      const totalFilesAfterAddition = previewImageURLs.length + validFiles.length;

      if (totalFilesAfterAddition > MAX_FILE_LIMIT) {
        const filesToProcess = validFiles.slice(0, MAX_FILE_LIMIT - previewImageURLs.length);

        if (filesToProcess.length < validFiles.length) {
          setError(
            `You can only upload a maximum of ${MAX_FILE_LIMIT} files total. Only the first ${filesToProcess.length} valid files were added.`
          );
        }

        const newImageURLs: string[] = filesToProcess.map(file => URL.createObjectURL(file));
        setPreviewImageURLs(prev => [...prev, ...newImageURLs]);
      } else {
        setPreviewImageURLs(prev => [...prev, ...newImageURLs]);
        // setfilesToProceed(validFiles);
        const newImageURLs: string[] = validFiles.map(file => URL.createObjectURL(file));
        // console.log('Else condition', 'File', filesToProceed);
      }
      registerFiles(validFiles);
      // console.log('Fileee from component', validFiles);

      e.target.value = '';
    }
  };

  return (
    <>
      <Input
        id={String(htmlFor) || 'image-upload'}
        onChange={onAdd}
        multiple={allowMultipleImages || true}
        type="file"
        className="sr-only"
      />
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </>
  );
}
export default MultipleImageUpload;
