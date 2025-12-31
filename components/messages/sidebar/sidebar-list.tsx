import type {Conversation} from '@/app/(shared)/dashboard/messages/page';
import {SidebarUsers} from './sidebar-users';

export default function SidebarList({
  enriched,
  activeConv,
  onView,
}: {
  enriched: Conversation[];
  activeConv: Conversation | null;
  onView: (conv: Conversation, isActiveConv: boolean) => void;
}) {
  // console.log('active conversation', activeConv);
  return (
    <div className="space-y-1 border-t relative">
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
          <SidebarUsers activeConv={activeConv} conv={conv} onViewClick={onView} key={conv.id} />
        ))}
    </div>
  );
}
