import type {Metadata} from 'next';
import {UserSidebar} from '@/components/client/sidebar';
import {SidebarInset, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';
import {redirect} from 'next/navigation';
import {AppSidebar} from '@/components/app-sidebar';
import {SiteHeader} from '@/components/site-header';
import {auth} from '@/lib/auth';
import {headers} from 'next/headers';

export const metadata: Metadata = {
  title: 'Five Services',
  description: 'Five Services - All your services at one place',
};

export default async function SharedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  if (!user) return redirect('/auth/login');
  const {role, email, id} = user;

  if (!role || !email || !id) return redirect('/auth/login');

  if (role === 'SELLER')
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
              <main className="flex-1 px-8 py-8 border-t-1">{children}</main>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  else
    return (
      <div className="flex min-h-svh">
        <SidebarProvider>
          <UserSidebar />
          <SidebarInset>
            <SidebarTrigger className="my-3 ms-3 " />
            <main className="flex-1 px-8 py-8 border-t-1">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
}
