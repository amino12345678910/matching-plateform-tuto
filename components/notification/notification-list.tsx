'use client';

import {useRouter} from 'next/navigation';
import {useTransition} from 'react';

import {Card} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {cn, formatDate} from '@/lib/utils';

import type {Notification} from '@/types/notification';
import {markNotificationRead} from '@/hooks/notification';

function NotificationList({notifications}: {notifications: Notification[]}) {
  const router = useRouter();
  const [_, startTransition] = useTransition();

  const handleClick = (n: Notification) => {
    startTransition(async () => {
      if (!n.read) {
        await markNotificationRead(n.userId, n.id);
      }

      if (n.link) {
        router.push(n.link);
      }
    });
  };

  return (
    <div className="space-y-2">
      {notifications.map(n => (
        <Card
          key={n.id}
          role="button"
          tabIndex={0}
          onClick={() => handleClick(n)}
          onKeyDown={e => e.key === 'Enter' && handleClick(n)}
          className={cn(
            'cursor-pointer p-4 transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary',
            !n.read && 'border-primary bg-muted'
          )}
        >
          <div className="flex items-start justify-between gap-3 relative">
            <div className="space-y-1">
              <p className="font-medium leading-snug">{n.title}</p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{n.type}</Badge>
                <span>{formatDate(new Date(n.createdAt))}</span>
              </div>
            </div>

            {!n.read && (
              <span className="h-2 w-2 absolute right-0 -top-1.5 animate-pulse rounded-full bg-primary mt-2" />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default NotificationList;
