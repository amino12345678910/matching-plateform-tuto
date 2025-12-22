'use client';

import {Calendar, Home, Settings} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {IconBrandBooking, IconSend, IconUserCircle, IconUserSearch} from '@tabler/icons-react';
import {cn} from '@/lib/utils';
import {defaultRoute} from '@/app/(freelancer-client)/dashboard/client/config';

// Menu items.
const items = [
  {
    title: 'Dashboard',
    url: defaultRoute,
    icon: Home,
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
    title: 'Account',
    url: `${defaultRoute}/account`,
    icon: IconUserCircle,
  },
];

export function UserSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton variant="outline">Five Services</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
