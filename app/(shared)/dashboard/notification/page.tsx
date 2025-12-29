'use client';

import {useEffect, useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {Bell, CheckCheck} from 'lucide-react';

import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {cn} from '@/lib/utils';

import type {Notification} from '@/types/notification';
import {getNotifications, markNotificationRead} from '@/hooks/notification';
import {NotificationsSkeleton} from '@/components/notification/notification-loading';
import {EmptyState} from '@/components/notification/empty-state';

export default function NotificationsPage({userId}: {userId: string}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications(userId)
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, [userId]);

  const markRead = (id?: string) => {
    startTransition(async () => {
      await markNotificationRead(userId, id);

      setNotifications(prev => prev.map(n => (!id || n.id === id ? {...n, read: true} : n)));
    });
  };

  const handleClick = (n: Notification) => {
    if (!n.read) markRead(n.id);
    if (n.link) router.push(n.link);
  };

  if (loading) return <NotificationsSkeleton />;

  return (
    <div className="container mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </h1>

        <Button
          size="sm"
          variant="ghost"
          disabled={isPending || notifications.every(n => n.read)}
          onClick={() => markRead()}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <Card
              key={n.id}
              onClick={() => handleClick(n)}
              className={cn(
                'cursor-pointer p-4 transition hover:bg-muted',
                !n.read && 'border-primary bg-muted/60'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium">{n.title}</p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{n.type}</Badge>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-2" />}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
