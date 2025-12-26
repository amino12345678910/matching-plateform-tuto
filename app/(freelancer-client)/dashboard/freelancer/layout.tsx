import {FreelancerSidebar} from '@/components/app-sidebar';
import {SiteHeader} from '@/components/site-header';
import {SidebarInset, SidebarProvider} from '@/components/ui/sidebar';
import {prisma as dbContext} from '@/lib/prisma';
import {redirect} from 'next/navigation';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Five Services',
  description: 'Five Services - All your services at one place',
};

export default async function FreelancerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserInfo();

  if (!user.role || !user.userId) return redirect('/auth/login');
  const {role, userId} = user;

  if (role === 'USER' || role !== 'SELLER') return redirect('/explore');

  const hasSellerProfile = await dbContext.seller.findFirst({
    where: {userId: userId},
  });

  if (!hasSellerProfile) return redirect('/become-seller');

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <FreelancerSidebar user={{...user}} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <main className="flex flex-col gap-4 py-4 p-2 px-3 md:gap-6 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
