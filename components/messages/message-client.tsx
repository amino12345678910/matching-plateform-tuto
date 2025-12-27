import type {Conversation} from '@/app/(shared)/dashboard/messages/page';
import {cn} from '@/lib/utils';
import Image from 'next/image';

function MessageClient({
  conv,
  activeConv,
  onViewClick,
}: {
  conv: Conversation;
  activeConv: Conversation | null;
  onViewClick: (conv: Conversation, isActiveConv: boolean) => void;
}) {
  const user = conv.otherUser;
  // console.log('avatarr', user.avatar);

  return (
    <button
      key={conv.id}
      onClick={() => onViewClick(conv, true)}
      className={cn(
        'w-full flex items-start gap-3 px-2 py-2 rounded-lg text-left transition',
        'hover:bg-muted',
        activeConv?.id === conv.id && 'bg-muted'
      )}
    >
      <Image
        alt={user.name}
        id="avatar-img"
        loading="eager"
        width={36}
        height={36}
        src={user.avatar}
        className="h-9 w-9 rounded-full object-cover shrink-0 pointer-events-none"
      />

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-tight truncate">{user.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {conv.lastMessage?.text ?? 'No messages yet'}
        </div>
      </div>
    </button>
  );
}

export default MessageClient;
