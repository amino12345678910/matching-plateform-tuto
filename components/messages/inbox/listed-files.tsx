'use client';

import {formatFileSize} from '@/lib/utils';
import {IconFile, IconX, IconPaperclip} from '@tabler/icons-react';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Button} from '@/components/ui/button';

export function ListedFiles({
  attachedFiles,
  filterFile,
}: {
  attachedFiles: File[];
  filterFile: (i: number) => void;
}) {
  if (attachedFiles.length === 0) return null;

  const previewFiles = attachedFiles.slice(0, 2);
  const extraCount = attachedFiles.length - previewFiles.length;

  return (
    <div className="mb-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            className="
              flex items-center gap-2
              rounded-md border bg-background
              px-3 py-2
              text-xs text-muted-foreground
              hover:bg-accent/40
              transition-colors
            "
          >
            <IconPaperclip className="h-4 w-4" />
            <span>
              {attachedFiles.length} file{attachedFiles.length > 1 ? 's' : ''} attached
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" sideOffset={8} className="p-2">
          <div className="space-y-1">
            {attachedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="
                  flex items-center justify-between
                  rounded-md px-2 py-1.5
                  text-xs

                  hover:bg-accent/30
                "
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-muted">
                    <IconFile className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium max-w-[180px]">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => filterFile(index)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <IconX className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
