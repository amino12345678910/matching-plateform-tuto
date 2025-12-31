import {Bell} from 'lucide-react';
import {redirect} from 'next/navigation';

import Navbar from '@/components/essentials/Navbar';
import {Footer} from '@/components/footer/footer-2';
import {EmptyState} from '@/components/notification/empty-state';
import NotificationList from '@/components/notification/notification-list';

import {getNotifications} from '@/hooks/notification';
import {getUserInfo} from '@/hooks/shared/get-user-info';

export default async function NotificationsPage() {
  const {userId} = await getUserInfo();
  if (!userId) redirect('/auth/login');

  const notifications = await getNotifications(userId);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto p-6 space-y-4">
          <header className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Notifications</h1>
          </header>

          {notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <NotificationList notifications={notifications} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
