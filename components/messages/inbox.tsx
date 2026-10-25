'use client';

import {IconArrowLeft, IconCheck, IconChecks, IconLoader2, IconSend} from '@tabler/icons-react';
import {storeFilesToCloudinary} from '@/hooks/shared/store-files-to-cloudinary';
import type {Booking, CurrentUser, User} from '@/app/(shared)/dashboard/messages/page';
import {BookingActionCard} from './inbox/booking-actions';
import {AutomatedMessage} from './inbox/automated-message';
import {ListedFiles} from './inbox/fields/listed-files';
import type {Message} from '@/types/messages';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {Input} from '../ui/input';
import {useEffect, useState} from 'react';
import {cn} from '@/lib/utils';
import Image from 'next/image';
import {toast} from 'sonner';
import {SelectFile} from './inbox/fields/select-file';
import {markMessageAsRead} from '@/hooks/message';
import CheckCheck from './inbox/check-check';
import MessageLinks from './inbox/links';

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

type InboxProps = {
  isOtherUserActive: boolean;
  otherUserId: string;
  roomId: string;
  messages: Message[];
  booking: Booking;
  currentUser: CurrentUser;
  onSend: (text: string, cloudinaryFileUrls: string[]) => Promise<void>;
  user: User;
  isActiveConv: boolean;
  onBack: () => void;
};

export function Inbox({
  isOtherUserActive = false,
  otherUserId,
  roomId,
  messages,
  booking,
  currentUser,
  onSend,
  user,
  isActiveConv,
  onBack,
}: InboxProps) {
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const chatMode = CHAT_MODE[booking.status];
  const canUploadFiles = chatMode === 'full';

  useEffect(() => {
    setTimeout(async () => {
      await markMessageAsRead({roomId, otherUserId});
    }, 3000);
  }, [messages]);

  function handleBookingAction(action: string) {
    console.log('BOOKING ACTION:', action);

    // n real app:
    // 1. update booking status
    // 2. insert SYSTEM message
  }

  const isChatDisabled = booking.status === 'COMPLETED' || booking.status === 'CANCELLED';

  const handleFormSubmission = async (e: any) => {
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
  };

  console.log('chachu ka status', isOtherUserActive);
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
            <p className="text-xs">{isOtherUserActive ? 'Online' : 'Offline'}</p>

            <p className="text-xs text-muted-foreground">Order #{booking.id}</p>
          </div>
        </div>

        <Badge variant="outline">{STATUS_LABEL[booking.status]}</Badge>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => {
          if (m.contentType === 'AUTOMATED') return <AutomatedMessage key={m.id} text={m.text} />;
          else {
            const ifMyComment = m.senderId === currentUser.id;
            return (
              <div
                key={m.id}
                className={cn(
                  'max-w-[70%] rounded-lg px-3 py-2 text-sm space-y-2 relative',
                  ifMyComment ? 'ml-auto bg-primary/90 text-primary-foreground' : 'bg-muted '
                )}
              >
                <CheckCheck ifMyComment={ifMyComment} read={m.read} />
                <p className="whitespace-pre-wrap">{m.text}</p>
                <MessageLinks
                  linkedUrls={m.linkedUrls}
                  currentUserId={currentUser.id}
                  senderId={m.senderId}
                />
              </div>
            );
          }
        })}

        <BookingActionCard
          status={booking.status}
          role={currentUser.role === 'SELLER' ? 'SELLER' : 'USER'}
          onAction={handleBookingAction}
        />
      </div>

      <form onSubmit={handleFormSubmission} className="border-t p-3 flex gap-2 items-start">
        {attachedFiles.length < 5 && (
          <SelectFile
            loading={loading}
            isChatDisabled={isChatDisabled}
            canUploadFiles={canUploadFiles}
            attachedFiles={attachedFiles}
            updateAttachedFiles={setAttachedFiles}
          />
        )}

        {attachedFiles.length > 0 && (
          <ListedFiles attachedFiles={attachedFiles} filterFile={setAttachedFiles} />
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
