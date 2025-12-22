'use client';

import * as React from 'react';
import {
  IconDashboard,
  IconDatabase,
  IconHome,
  IconListSearch,
  IconSend,
  IconServicemark,
  IconTools,
  IconUserCircle,
} from '@tabler/icons-react';

import {NavMain} from '@/components/nav-main';
import {NavSecondary} from '@/components/nav-secondary';
import {NavUser} from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {defaultRoute} from '@/app/(freelancer-client)/dashboard/freelancer/config';
import {NavDocuments} from './nav-documents';
import Link from 'next/link';
import type {UserInfo} from '@/hooks/get-user-info';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: defaultRoute,
      icon: IconDashboard,
    },
    {
      title: 'Manage',
      url: `${defaultRoute}/manage`,
      icon: IconTools,
    },
    {
      title: 'Messages',
      url: '/dashboard/messages',
      icon: IconSend,
    },
    {
      title: 'Add Service',
      url: `${defaultRoute}/create-service`,
      icon: IconServicemark,
    },
    {
      title: 'Profile',
      url: '/dashboard/profile',
      icon: IconUserCircle,
    },
  ],

  navSecondary: [
    {
      title: 'Home',
      url: '/',
      icon: IconHome,
    },
    {
      title: 'Explore',
      url: '/explore',
      icon: IconListSearch,
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '#',
      icon: IconDatabase,
    },
    // {
    //   name: "Reports",
    //   url: "#",
    //   icon: IconReport,
    // },
    // {
    //   name: "Word Assistant",
    //   url: "#",
    //   icon: IconFileWord,
    // },
  ],
};

interface FreelancerSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserInfo;
}

export function FreelancerSidebar({user, ...props}: FreelancerSidebarProps) {
  if (!user) {
    throw new Error('AppSidebar requires a user but received undefined.');
  }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
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
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
