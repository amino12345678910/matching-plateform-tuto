'use client';

import * as React from 'react';
import {
  IconBell,
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
import type {UserInfo} from '@/hooks/shared/get-user-info';

const data = {
  navMain: [
    {
      title: 'Espace Professeur',
      url: defaultRoute,
      icon: IconDashboard,
    },
    {
      title: 'Gérer mes Séances',
      url: `${defaultRoute}/manage`,
      icon: IconTools,
    },
    {
      title: 'Messages Élèves',
      url: '/dashboard/messages',
      icon: IconSend,
    },
    {
      title: 'Publier un Cours',
      url: `${defaultRoute}/create-service`,
      icon: IconServicemark,
    },
    {
      title: 'Notifications',
      url: '/notification',
      icon: IconBell,
    },
    {
      title: 'Profil Professeur',
      url: '/dashboard/profile',
      icon: IconUserCircle,
    },
  ],

  navSecondary: [
    {
      title: 'Accueil',
      url: '/',
      icon: IconHome,
    },
    {
      title: 'Explorer les Profs',
      url: '/explore',
      icon: IconListSearch,
    },
  ],
  documents: [
    {
      name: 'Ressources Pédagogiques',
      url: '#',
      icon: IconDatabase,
    },
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
              <Link href="/" className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-emerald-600 tracking-tight">
                  9arrini<span className="text-gray-900 font-medium">.tn</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded">
                  Professeur
                </span>
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
