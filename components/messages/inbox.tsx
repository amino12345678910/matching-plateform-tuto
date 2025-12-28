'use client';

import {IconArrowLeft, IconFile, IconLoader2, IconSend} from '@tabler/icons-react';
import {storeFilesToCloudinary} from '@/hooks/shared/store-files-to-cloudinary';
import type {Booking, CurrentUser, User} from '@/app/(shared)/dashboard/messages/page';
import {BookingActionCard} from './inbox/booking-actions';
import {AutomatedMessage} from './inbox/automated-message';
import {ListedFiles} from './inbox/listed-files';
import type {Message} from '@/types/messages';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {Label} from '../ui/label';
import {Input} from '../ui/input';
import {useState} from 'react';
import {cn} from '@/lib/utils';
import Image from 'next/image';
import {toast} from 'sonner';

const STATUS_LABEL: Record<Booking['status'], string> = {
  PENDING: 'Waiting for acceptance',
  CONFIRMED: 'In progress',
  DELIVERED: 'Review delivery',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Under dispute',
};

const CHAT_MODE: Record<Booking['status'], 'full' | 'read-only' | 'disabled'> = {
  PENDING: 'read-only',
  CONFIRMED: 'full',
  DELIVERED: 'full',
  COMPLETED: 'read-only',
  CANCELLED: 'disabled',
  DISPUTED: 'full',
};

export function Inbox({
  messages,
  booking,
  currentUser,
  onSend,
  user,
  isActiveConv,
  onBack,
}: {
  messages: Message[];
  booking: Booking;
  currentUser: CurrentUser;
  onSend: (text: string, cloudinaryFileUrls: string[]) => Promise<void>;
  user: User;
  isActiveConv: boolean;
  onBack: () => void;
}) {
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);

  const chatMode = CHAT_MODE[booking.status];
  const canUploadFiles = chatMode === 'full';

  function handleBookingAction(action: string) {
    console.log('BOOKING ACTION:', action);

    // ✅ In real app:
    // 1. update booking status
    // 2. insert SYSTEM message
  }

  const isChatDisabled = booking.status === 'COMPLETED' || booking.status === 'CANCELLED';

  function getDisplayUrl(url: string) {
    try {
      const u = new URL(url);
      return u.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  return (
    <section
      className={cn(
        'flex-1 flex flex-col min-w-0 h-full',
        isActiveConv ? 'flex' : 'hidden lg:flex'
      )}
    >
      <header className="border-b px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="lg:hidden cursor-pointer hover:opacity-70 transition-opacity duration-150"
          >
            <IconArrowLeft />
          </button>

          <Image
            width={36}
            height={36}
            src={user.avatar || '/avatar.jpg'}
            alt={user.name}
            className="h-9 w-9 rounded-full object-cover"
          />

          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">Order #{booking.id}</p>
          </div>
        </div>

        <Badge variant="outline">{STATUS_LABEL[booking.status]}</Badge>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => {
          if (m.contentType === 'AUTOMATED') {
            return <AutomatedMessage key={m.id} text={m.text} />;
          }

          return (
            <div
              key={m.id}
              className={cn(
                'max-w-[70%] rounded-lg px-3 py-2 text-sm space-y-2',
                m.senderId === currentUser.id
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              {/* Message text */}
              <p className="whitespace-pre-wrap">{m.text}</p>

              {/* Linked URLs */}
              {m.linkedUrls.length > 0 && (
                <div className="space-y-1">
                  {m.linkedUrls.map(url => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex items-center gap-2 rounded-md px-2 py-1 text-xs',
                        'border hover:bg-accent transition-colors',
                        m.senderId === currentUser.id
                          ? 'border-primary/20 text-primary-foreground/90'
                          : 'border-border text-foreground'
                      )}
                    >
                      <span className="text-muted-foreground">🔗</span>
                      <span className="truncate">{getDisplayUrl(url)}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <BookingActionCard
          status={booking.status}
          role={currentUser.role}
          onAction={handleBookingAction}
        />
      </div>

      <form
        onSubmit={async e => {
          e.preventDefault();
          if (!text.trim() && attachedFiles.length === 0) return;

          try {
            setLoading(true);

            let cloudinaryFileUrls: string[] = [];
            if (attachedFiles.length > 0) {
              const {cloudinaryFileUrls: urls, error} = await storeFilesToCloudinary(attachedFiles);

              if (error || !urls?.length) {
                toast.error('Failed to upload files');
                return;
              }
              cloudinaryFileUrls = urls;
            }

            await onSend(text.trim(), cloudinaryFileUrls);

            setText('');
            setAttachedFiles([]);
          } catch (error) {
            console.error('Send message error:', error);
            toast.error('Failed to send message');
          } finally {
            setLoading(false);
          }
        }}
        className="border-t p-3 flex gap-2 items-start"
      >
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
              setAttachedFiles(prev => [...prev, ...files]);
            }
            e.target.value = '';
          }}
        />

        {attachedFiles.length < 5 && (
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
        )}

        {attachedFiles.length > 0 && (
          <ListedFiles
            attachedFiles={attachedFiles}
            filterFile={i => {
              setAttachedFiles(prev => prev.filter((_, idx) => idx !== i));
            }}
          />
        )}

        <Input
          autoFocus
          disabled={chatMode !== 'full' || loading}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={
            chatMode === 'read-only' ? 'Chat is read-only for this order' : 'Type a message'
          }
        />

        <Button
          className="hover:opacity-70 cursor-pointer"
          type="submit"
          disabled={chatMode !== 'full' || loading}
        >
          {loading ? <IconLoader2 className="animate-spin" /> : <IconSend />}
        </Button>
      </form>
    </section>
  );
}
