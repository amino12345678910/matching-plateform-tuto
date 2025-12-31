'use client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {cn} from '@/lib/utils';
import {IconFile} from '@tabler/icons-react';
import type {Dispatch, SetStateAction} from 'react';
import {toast} from 'sonner';

export function SelectFile({
  canUploadFiles,
  attachedFiles,
  isChatDisabled,
  loading,
  updateAttachedFiles,
}: {
  canUploadFiles: boolean;
  isChatDisabled: boolean;
  loading: boolean;
  attachedFiles: File[];
  updateAttachedFiles: Dispatch<SetStateAction<File[]>>;
}) {
  return (
    <>
      <Input
        type="file"
        hidden
        multiple
        disabled={loading || isChatDisabled}
        id="file-picker"
        onChange={e => {
          const files = Array.from(e.target.files || []);
          if (!files.length) return;

          if (attachedFiles.length >= 5 || attachedFiles.length + files.length - 1 >= 5) {
            toast.info('Exceed file limit by 5');
            return;
          } else {
            updateAttachedFiles(prev => [...prev, ...files]);
            // setAttachedFiles(prev => [...prev, ...files]);
          }
          e.target.value = '';
        }}
      />

      <Button
        asChild
        size="sm"
        variant="outline"
        className={cn(
          'h-9 wcursor-pointer',
          'rounded-md border bg-background',
          'hover:bg-accent/40  hover:opacity-70',
          'relative mb-2',
          'transition-colors',
          !canUploadFiles && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Label htmlFor="file-picker">
          <IconFile />
        </Label>
      </Button>
    </>
  );
}
