'use client';
import {IconMessage2, IconTrendingUp} from '@tabler/icons-react';

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
  const acceptedAt = currentClientStory?.acceptedAt;
  const delivery = currentClientStory?.delivery ?? 0;
  const fromto = acceptedAt
    ? new Date(acceptedAt).getTime() + delivery * 24 * 60 * 60 * 1000
    : Date.now() + delivery * 24 * 60 * 60 * 1000;
  const inXdays = moment(fromto).fromNow();

  const today = new Date();
  const future2days = today.setDate(today.getDate() + 4);
  const lastDaysToDeliver = Boolean(currentClientStory && future2days >= fromto);

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
        {currentClientStory ? (
          <>
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm">Élève en cours</CardDescription>
                <Badge variant="secondary" className="uppercase text-xs">
                  Séance Active
                </Badge>
              </div>

              <CardTitle className="text-2xl font-semibold">
                {currentClientStory.client.name ?? 'Élève inscrit'}
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                {currentClientStory.service.title} ·{' '}
                <span className="font-medium capitalize">
                  {currentClientStory.servicePackageTier}
                </span>
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-2xl font-bold tabular-nums text-emerald-700">
                  {currentClientStory.totalPrice} DT ({currentClientStory.totalPrice} Pts)
                </span>

                <div className="flex gap-2">
                  <Badge asChild variant="outline" className="cursor-pointer">
                    <Link href={`/dashboard/messages`}>
                      <IconMessage2 className="mr-1 h-4 w-4" />
                      Message
                    </Link>
                  </Badge>

                  <Badge asChild variant="outline" className="cursor-pointer">
                    <Link href="/dashboard/freelancer/manage">Voir la séance</Link>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start pb-2 gap-1 text-sm">
              <div className="flex items-center gap-2 font-medium">
                Séance de cours en progression
                <IconTrendingUp className="h-4 w-4" />
              </div>
              <div
                className={cn(
                  'text-muted-foreground text-balance',
                  lastDaysToDeliver && 'text-md text-red-700'
                )}
              >
                {lastDaysToDeliver ? '⚠ Prochaine séance demain' : `Prochaine étape ${inXdays}`}
              </div>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1 pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm">Séance de Cours Actuelle</CardDescription>
                <Badge variant="outline" className="uppercase text-xs">
                  Prêt
                </Badge>
              </div>
              <CardTitle className="text-2xl font-semibold">Aucune séance active pour le moment</CardTitle>
              <p className="text-sm text-muted-foreground">
                Publiez un cours pour que les élèves puissent vous découvrir et réserver des séances individuelles.
              </p>
            </CardHeader>
            <CardFooter className="pt-2">
              <Badge asChild variant="default" className="cursor-pointer px-3 py-1">
                <Link href="/dashboard/freelancer/create-service">+ Créer une Séance de Cours</Link>
              </Badge>
            </CardFooter>
          </>
        )}
      </Card>

      <Card className="@container/card relative">
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-red-500/70 to-transparent"
        />
        <CardHeader>
          <CardDescription>Revenus Totaux des Cours</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-700">
            {totalRevenue} DT ({totalRevenue} Pts)
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Actif
            </Badge>
          </CardAction>
          <div className="flex w-full gap-1">
            <div className="h-1 flex-1 rounded bg-primary/80" />
            <div className="h-1 flex-1 rounded bg-primary/40" />
            <div className="h-1 flex-1 rounded bg-primary/20" />
          </div>
          <span className="text-xs text-muted-foreground mt-1">
            1 Point = 1 Dinar Tunisien (DT)
          </span>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between w-full">
            <span className="text-muted-foreground">Séances complétées</span>
            <span className="font-medium">{totalRevenue} DT</span>
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
          <CardDescription>Demandes d’Élèves en Attente</CardDescription>
          <CardTitle className="text-2xl w-full font-semibold tabular-nums @[250px]/card:text-3xl">
            {pendingClients.length === 0 ? (
              <span className="text-muted-foreground text-sm w-full">
                Aucune demande en attente pour le moment 🎯
              </span>
            ) : (
              <span>{pendingClients.length} Élève(s)</span>
            )}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Actif
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 text-sm">
          {pendingClients.slice(0, 3).map(c => (
            <div key={c.name} className="flex items-center justify-between w-full">
              <span className="truncate">{c.name}</span>
              <Badge variant="secondary" className="text-xs">
                En attente
              </Badge>
            </div>
          ))}

          {pendingClients.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{pendingClients.length - 3} autres en attente
            </span>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
