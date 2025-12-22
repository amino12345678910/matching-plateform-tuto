'use client';

import {useMemo, useState} from 'react';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {cn} from '@/lib/utils';
import {createAvatar} from '@dicebear/core';
import {adventurerNeutral} from '@dicebear/collection';
import {cloudinaryUrl} from '@/lib/cloudinary';
import {IconArrowLeft, IconFile, IconLoader, IconLoader2, IconSend} from '@tabler/icons-react';
import type {Message} from '@/types/messages';
import {Badge} from '../ui/badge';
import {Label} from '../ui/label';
import {storeFilesToCloudinary} from '@/hooks/shared/store-files-to-cloudinary';
import {MessageContent} from './message-content';

export type User = {
  id: string;
  name: string;
  image?: string;
};
export function Inbox({
  messages,
  currentUserId,
  onSend,
  user,
  isActiveConv,
  onBack,
}: {
  messages: Message[];
  currentUserId: string;
  onSend: (text: string, cloudinaryFileUrls: string[]) => Promise<void>;
  user: User;
  isActiveConv: boolean;
  onBack: () => void;
}) {
  const [text, setText] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const avatar = useMemo(() => {
    return createAvatar(adventurerNeutral, {
      seed: user.name,
    }).toDataUri();
  }, []);

  const userImage = user.image ? cloudinaryUrl(user.image, 'q_50,f_auto') : null;

  return (
    <section
      className={cn('flex-1 flex flex-col min-w-0', isActiveConv ? 'flex' : 'hidden lg:flex')}
    >
      <header className="border-b px-4 py-3 items-center font-medium relative flex flex-row gap-2">
        <button
          onClick={onBack}
          className="lg:hidden text-muted-foreground font-semibold cursor-pointer"
        >
          <IconArrowLeft />
        </button>
        <img
          width={36}
          height={36}
          onError={e => {
            e.currentTarget.src = user.image ?? avatar;
          }}
          src={userImage || avatar || '/avatar.jpg'}
          alt={user.name}
          className="h-9 w-9 rounded-full object-cover e"
        />

        {user.name}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* {messages.map(m => {
          const mtype = m.contentType;
          return (
            <div
              key={m.id}
              className={cn(
                'max-w-[70%] px-3 py-2 rounded-lg text-sm flex gap-1 items-center ',
                m.senderId === currentUserId
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              {mtype === 'FILE' && <IconFile size={'16'} className="text-center" />}
              {m.text}
            </div>
          );
        })} */}
        {messages.map(m => (
          <div
            key={m.id}
            className={cn(
              'max-w-[70%] px-3 py-2 rounded-lg text-sm flex items-center gap-2',
              m.senderId === currentUserId
                ? 'ml-auto bg-primary text-primary-foreground'
                : 'bg-muted'
            )}
          >
            <MessageContent message={m} />
          </div>
        ))}
      </div>

      <form
        onSubmit={async e => {
          e.preventDefault();
          if (!text.trim() && attachedFiles.length === 0) return;

          try {
            console.log('Files to send:', attachedFiles);
            setLoading(true);
            const {cloudinaryFileUrls, error} = await storeFilesToCloudinary(attachedFiles);

            if (error) return console.error(error);
            if (cloudinaryFileUrls.length > 0) {
              await onSend(text, cloudinaryFileUrls);
              console.log('cloudinaryFileUrls', cloudinaryFileUrls);
            }
          } catch (error) {
            console.error('Error in try catch', error);
          } finally {
            setText('');
            setAttachedFiles([]);
            setLoading(false);
          }
        }}
        className="p-3 border-t flex gap-2"
      >
        <div className="relative h-8 my-auto items-center flex justify-center">
          <Input
            type="file"
            hidden
            multiple
            disabled={loading}
            id="file-picker"
            onChange={e => {
              const files = Array.from(e.target.files || []);
              if (!files.length) return;

              setPendingFiles(files);
              setShowConfirm(true);
              e.target.value = '';
            }}
          />

          {showConfirm && pendingFiles.length > 0 && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-background rounded-lg shadow-lg w-[90%] max-w-sm p-4 space-y-4">
                <h3 className="font-semibold text-lg">Send files?</h3>

                <div className="space-y-2">
                  {pendingFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border bg-muted px-3 py-1.5 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <IconFile className="h-4 w-4 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </div>

                      <button
                        onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setPendingFiles([]);
                      setShowConfirm(false);
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={() => {
                      setAttachedFiles(prev => [...prev, ...pendingFiles]);
                      setPendingFiles([]);
                      setShowConfirm(false);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Label className="h-full w-full" htmlFor="file-picker">
            <Badge className="h-full w-full">
              <IconFile />
            </Badge>
          </Label>
        </div>

        {attachedFiles.length > 0 && (
          <div className="flex flex-col absolute bottom-29 gap-y-1">
            {attachedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between h-8! rounded-md border bg-muted/30 backdrop-blur-xs px-3 py-1.5 text-sm"
              >
                <div className="flex items-center truncate max-w-sm pe-2 gap-2 min-w-0">
                  <IconFile className="h-4 w-4 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>

                <button
                  onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
          disabled={loading}
          className="h-8 my-auto"
          placeholder="Type a message"
        />

        <Button
          type="submit"
          disabled={!text.trim() && attachedFiles.length === 0}
          className="h-8 my-auto"
        >
          {loading ? <IconLoader2 className="animate-spin" /> : <IconSend />}
        </Button>
      </form>
    </section>
  );
}
