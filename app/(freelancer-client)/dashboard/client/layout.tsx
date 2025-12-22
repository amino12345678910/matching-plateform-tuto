import type {Metadata} from 'next';
import {UserSidebar} from '@/components/client/sidebar';
import {SidebarInset, SidebarProvider, SidebarTrigger} from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'Five Services',
  description: 'Five Services - All your services at one place',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
