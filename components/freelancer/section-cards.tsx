'use client';
import {IconMessage2, IconTrendingDown, IconTrendingUp} from '@tabler/icons-react';

import {Badge} from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import moment from 'moment';
import {cn} from '@/lib/utils';
import {BorderBeam} from '../ui/border-beam';
import type {PackageTier} from '@/generated/prisma';

export function SectionCards({
  totalRevenue,
  pendingClients,
  currentClientStory,
}: {
  totalRevenue: number;
  pendingClients: {name: string}[];
  currentClientStory: {
    service: {title: string};
    client: {id: string; name: string; clientConversations: {id: string}[]};
    totalPrice: number;
    acceptedAt: Date | null;
    delivery: number;
    servicePackageTier: PackageTier;
  } | null;
}) {
  if (!currentClientStory) {
    console.log('currentClientStory nahi hai');
    return;
  }
  const {acceptedAt, client, delivery, service, servicePackageTier, totalPrice} =
    currentClientStory;

  const fromto = acceptedAt!.getTime() + delivery * 24 * 60 * 60 * 1000;
  const inXdays = moment(fromto).fromNow();

  const today = new Date();
  const future2days = today.setDate(today.getDate() + 4);
  const lastDaysToDeliver = future2days >= fromto;
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card
        className={cn(
          '@container/card h-full flex flex-col relative',
          lastDaysToDeliver && 'bg-red-100/10'
        )}
      >
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-red-500/70 to-transparent"
        />
        {lastDaysToDeliver && (
          <BorderBeam
            duration={4}
            delay={3}
            size={400}
            borderWidth={2}
            className="from-transparent via-red-500 to-transparent"
          />
        )}
        <CardHeader className="space-y-1 pb-2">
          {/* Top row: Client + Status */}
          <div className="flex items-center justify-between">
            <CardDescription className="text-sm">Working with</CardDescription>

            <Badge variant="secondary" className="uppercase text-xs">
              Active
            </Badge>
          </div>

          {/* Client Name */}
          <CardTitle className="text-2xl font-semibold">
            {client.name ?? 'No active client'}
          </CardTitle>

          {/* Service + Tier */}
          <p className="text-sm text-muted-foreground">
            {service.title} · <span className="font-medium capitalize">{servicePackageTier}</span>
          </p>

          {/* Price */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-3xl font-bold tabular-nums">${totalPrice}</span>

            {/* Actions */}
            <div className="flex gap-2">
              <Badge asChild variant="outline" className="cursor-pointer">
                <Link href={`/dashboard/messages/${client.clientConversations[0]?.id}`}>
                  <IconMessage2 className="mr-1 h-4 w-4" />
                  Message
                </Link>
              </Badge>

              <Badge asChild variant="outline" className="cursor-pointer">
                <Link href={`/freelancer/bookings`}>View Booking</Link>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start pb-2 gap-1 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Active booking in progress
            <IconTrendingUp className="h-4 w-4" />
          </div>
          <div
            className={cn(
              'text-muted-foreground text-balance',
              lastDaysToDeliver && 'text-md  text-red-700'
            )}
          >
            {lastDaysToDeliver ? '⚠ Deadline tomorrow' : `Delivery date is ${inXdays}`}
            {/* {new Date(acceptedAt.getTime() + delivery * 24 * 60 * 60 * 1000).toLocaleDateString()} */}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card relative">
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-red-500/70 to-transparent"
        />
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalRevenue}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
          <div className="flex w-full gap-1">
            <div className="h-1 flex-1 rounded bg-primary/80" />
            <div className="h-1 flex-1 rounded bg-primary/40" />
            <div className="h-1 flex-1 rounded bg-primary/20" />
          </div>
          <span className="text-xs text-muted-foreground mt-1">70% from premium packages</span>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between w-full">
            <span className="text-muted-foreground">Last 30 days</span>
            <span className="font-medium">$1,240</span>
          </div>

          <div className="flex justify-between w-full">
            <span className="text-muted-foreground">Previous 30 days</span>
            <span className="text-muted-foreground">$1,550</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-red-500">
            <IconTrendingDown className="h-3 w-3" />
            Revenue dropped compared to last period
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card relative">
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-red-500/70 to-transparent"
        />
        <CardHeader>
          <CardDescription>Pending Clients</CardDescription>
          <CardTitle className="text-2xl w-full font-semibold tabular-nums @[250px]/card:text-3xl">
            {pendingClients.length === 0 ? (
              <span className="text-muted-foreground text-sm w-full">
                No pending requests — you’re fully booked 🎯
              </span>
            ) : (
              <CardTitle>...</CardTitle>
            )}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 text-sm">
          {pendingClients.slice(0, 3).map(c => (
            <div key={c.name} className="flex items-center justify-between w-full">
              <span className="truncate">{c.name}</span>
              <Badge variant="secondary" className="text-xs">
                Pending
              </Badge>
            </div>
          ))}

          {pendingClients.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{pendingClients.length - 3} more waiting
            </span>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
