import type {Metadata} from 'next';
import {ClientSidebar} from '@/components/client/client-sidebar';
import {SidebarInset, SidebarProvider} from '@/components/ui/sidebar';
import {SiteHeader} from '@/components/site-header';
import {getUserInfo} from '@/hooks/get-user-info';

export const metadata: Metadata = {
  title: 'Dashboard - Five Services',
  description: 'Five Services - All your services at one place',
};

export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserInfo();
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <ClientSidebar user={{...user}} variant="inset" />
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
