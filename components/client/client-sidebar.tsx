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
  IconBell,
  IconBrandBooking,
  IconCoin,
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
import type {UserInfo} from '@/hooks/shared/get-user-info';

// Menu items.
const items = [
  {
    title: 'Student Dashboard',
    url: defaultRoute,
    icon: IconDashboard,
  },
  {
    title: 'Points Account (1 Pt = 1 DT)',
    url: `${defaultRoute}/points`,
    icon: IconCoin,
  },
  {
    title: 'My Lessons',
    url: `${defaultRoute}/bookings`,
    icon: IconBrandBooking,
  },
  {
    title: 'Tutor Messages',
    url: '/dashboard/messages',
    icon: IconSend,
  },
  {
    title: 'Notifications',
    url: '/notification',
    icon: IconBell,
  },
  {
    title: 'Student Profile',
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
              <Link href="/" className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-emerald-600 tracking-tight">
                  9arrini<span className="text-gray-900 font-medium">.tn</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded">
                  Student
                </span>
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
                tooltip="Explore Tutors"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                asChild
              >
                <Link href="/explore">
                  <IconListSearch />
                  <span>Find a Tutor</span>
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
