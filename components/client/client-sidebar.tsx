'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  IconBrandBooking,
  IconDashboard,
  IconListSearch,
  IconMail,
  IconSend,
  IconUserCircle,
} from '@tabler/icons-react';
import {cn} from '@/lib/utils';
import {defaultRoute} from '@/app/(freelancer-client)/dashboard/client/config';
import Link from 'next/link';
import {Button} from '../ui/button';
import type {User} from 'better-auth';
import {NavUser} from '../nav-user';
import type {UserInfo} from '@/hooks/get-user-info';

// Menu items.
const items = [
  {
    title: 'Dashboard',
    url: defaultRoute,
    icon: IconDashboard,
  },
  {
    title: 'My Bookings',
    url: `${defaultRoute}/bookings`,
    icon: IconBrandBooking,
  },
  {
    title: 'Messages',
    url: '/dashboard/messages',
    icon: IconSend,
  },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: IconUserCircle,
  },
];

interface ClientSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserInfo;
}

export function ClientSidebar({user, ...props}: ClientSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/" className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  FiveS
                  <span className="text-primary">.</span>
                </h1>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Explore Services"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                asChild
              >
                <Link href="/dashboard/freelancer/create-service">
                  <IconListSearch />
                  <span>Explore Services</span>
                </Link>
              </SidebarMenuButton>
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
                asChild
              >
                <Link href="/dashboard/messages">
                  <IconMail />
                  <span className="sr-only">Inbox</span>
                </Link>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
          {/* <SidebarGroupLabel className="mt-1">Application</SidebarGroupLabel> */}
          {/* <SidebarGroupContent> */}
          <SidebarMenu>
            {items.map(item => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="relative">
                    <item.icon />
                    {item.title == 'Messages' && (
                      <span
                        className={cn(
                          'bg-red-600 w-1 h-1',
                          'animate-pulse  rounded-full',
                          'absolute top-4.5 left-5.5'
                        )}
                      />
                    )}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          {/* </SidebarGroupContent> */}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
