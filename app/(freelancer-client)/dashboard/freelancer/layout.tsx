import {AppSidebar} from '@/components/app-sidebar';
import {SiteHeader} from '@/components/site-header';
import {SidebarInset, SidebarProvider} from '@/components/ui/sidebar';
import {prisma as dbContext} from '@/lib/prisma';
import {redirect} from 'next/navigation';
import {auth} from '@/lib/auth';
import {headers} from 'next/headers';

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return redirect('/auth/login');
  if (!session?.user.role || session.user.role == null) return redirect('/auth/login');

  if (session.user.role == 'USER') {
    return redirect('/explore');
  }
  // console.log('sessionsss: ', session.user);
  const {id: userId} = session?.user;
  const hasSellerProfile = await dbContext.seller.findFirst({
    where: {userId: userId},
  });

  if (!hasSellerProfile) return redirect('/become-seller');
  // toast.info('You must become seller first to view analytics');

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar user={{...session.user, image: session.user.image ?? null}} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
