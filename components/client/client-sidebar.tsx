'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
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
import {NavUser} from '../nav-user';
import type {UserInfo} from '@/hooks/shared/get-user-info';

const items = [
  {
    title: 'Espace Élève',
    url: defaultRoute,
    icon: IconDashboard,
  },
  {
    title: 'Solde Points (1 Pt = 1 DT)',
    url: `${defaultRoute}/points`,
    icon: IconCoin,
  },
  {
    title: 'Mes Cours Réservés',
    url: `${defaultRoute}/bookings`,
    icon: IconBrandBooking,
  },
  {
    title: 'Messages Professeurs',
    url: '/dashboard/messages',
    icon: IconSend,
  },
  {
    title: 'Notifications',
    url: '/notification',
    icon: IconBell,
  },
  {
    title: 'Profil Élève',
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
                  Élève
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
                tooltip="Explorer les Profs"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                asChild
              >
                <Link href="/explore">
                  <IconListSearch />
                  <span>Trouver un Professeur</span>
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
                  <span className="sr-only">Messagerie</span>
                </Link>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            {items.map(item => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="relative">
                    <item.icon />
                    {item.title == 'Messages Professeurs' && (
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
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
