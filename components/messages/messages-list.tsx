import type {Conversation} from '@/app/(shared)/dashboard/messages/page';
import MessageClient from './message-client';

export default function MessagesList({
  enriched,
  activeConv,
  onView,
}: {
  enriched: Conversation[];
  activeConv: Conversation | null;
  onView: (conv: Conversation, isActiveConv: boolean) => void;
}) {
  return (
    <div className="space-y-1 border-t">
      {enriched
        .sort((a, b) => {
          const aTime = a.lastMessage?.createdAt
            ? new Date(a.lastMessage.createdAt).getTime()
            : a.createdAt.getTime();
          const bTime = b.lastMessage?.createdAt
            ? new Date(b.lastMessage.createdAt).getTime()
            : b.createdAt.getTime();
          return bTime - aTime;
        })
        .map(conv => (
          <MessageClient activeConv={activeConv} conv={conv} onViewClick={onView} key={conv.id} />
        ))}
    </div>
  );
}
