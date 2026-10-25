'use client';

import {IconMessage2, IconTrendingUp, IconClock, IconCheck, IconVideo} from '@tabler/icons-react';
import moment from 'moment';
import Link from 'next/link';
import {getServiceMeetInfo} from '@/lib/google-meet';

import {Badge} from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {cn} from '@/lib/utils';
import {BorderBeam} from '@/components/ui/border-beam';
import type {ClientActiveOrder} from '@/app/(freelancer-client)/dashboard/client/page';

export function ClientSectionCards({activeOrder}: {activeOrder: ClientActiveOrder}) {
  if (!activeOrder) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        <Card className="@container/card h-full flex flex-col relative">
          <BorderBeam
            duration={8}
            size={400}
            className="from-transparent via-primary/70 to-transparent"
          />
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm">Séance d’apprentissage actuelle</CardDescription>
              <Badge variant="outline" className="uppercase text-xs">
                Prêt à apprendre
              </Badge>
            </div>
            <CardTitle className="text-2xl font-semibold">Aucune séance active réservée</CardTitle>
            <p className="text-sm text-muted-foreground">
              Parcourez les professeurs vérifiés et réservez votre première séance individuelle.
            </p>
          </CardHeader>
          <CardFooter className="pt-2">
            <Badge asChild variant="default" className="cursor-pointer px-3 py-1">
              <Link href="/explore">Trouver un Professeur</Link>
            </Badge>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const {service, freelancer, totalPrice, acceptedAt, delivery, status} = activeOrder;
  const meetInfo = getServiceMeetInfo({
    title: service.title,
    seller: {user: {name: freelancer.name}},
  });

  const deliveryAt = acceptedAt && new Date(acceptedAt).getTime() + delivery * 24 * 60 * 60 * 1000;

  const inXdays = deliveryAt ? moment(deliveryAt).fromNow() : null;

  const today = new Date();
  const dangerWindow = today.setDate(today.getDate() + 2);
  const lastDaysToDeliver = deliveryAt && dangerWindow >= deliveryAt;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl *:data-[slot=card]:shadow-xs  lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {/* ================= ACTIVE LESSON ================= */}
      <Card
        className={cn(
          '@container/card h-full flex flex-col relative',
          lastDaysToDeliver && 'bg-red-100/10'
        )}
      >
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-primary/70 to-transparent"
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
          <div className="flex items-center justify-between">
            <CardDescription className="text-sm">Cours avec votre Professeur</CardDescription>

            <Badge variant="secondary" className="uppercase text-xs">
              {status}
            </Badge>
          </div>

          <CardTitle className="text-2xl font-semibold">{freelancer.name}</CardTitle>

          <p className="text-sm text-muted-foreground">{service.title}</p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-2xl font-bold tabular-nums text-emerald-700">
              {totalPrice} Pts ({totalPrice} DT)
            </span>

            <div className="flex flex-wrap gap-2">
              <Badge asChild className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                <a href={meetInfo.meetUrl} target="_blank" rel="noopener noreferrer">
                  <IconVideo className="mr-1 h-4 w-4" />
                  Google Meet
                </a>
              </Badge>

              <Badge asChild variant="outline" className="cursor-pointer">
                <Link href={`/dashboard/messages`}>
                  <IconMessage2 className="mr-1 h-4 w-4" />
                  Message
                </Link>
              </Badge>

              <Badge asChild variant="outline" className="cursor-pointer">
                <Link href="/dashboard/client/bookings">Voir la séance</Link>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardFooter className="flex-col items-start pb-2 gap-1 text-sm">
          <div className="flex items-center gap-2 font-medium">
            Séance en cours
            <IconTrendingUp className="h-4 w-4" />
          </div>

          <div
            className={cn(
              'text-muted-foreground text-balance',
              lastDaysToDeliver && 'text-md text-red-700'
            )}
          >
            {acceptedAt
              ? lastDaysToDeliver
                ? '⚠ Prochaine séance très bientôt'
                : `Prévue ${inXdays}`
              : 'Séance confirmée'}
          </div>
        </CardFooter>
      </Card>

      {/* ================= LESSON COUNTDOWN ================= */}
      <Card className="@container/card relative">
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-primary/70 to-transparent"
        />

        <CardHeader>
          <CardDescription>Calendrier du Cours</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {deliveryAt ? moment(deliveryAt).format('DD MMM') : '--'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconClock />
              {deliveryAt ? inXdays : 'En attente'}
            </Badge>
          </CardAction>

          <div className="flex w-full gap-1">
            <div className="h-1 flex-1 rounded bg-primary/80" />
            <div className="h-1 flex-1 rounded bg-primary/40" />
            <div className="h-1 flex-1 rounded bg-primary/20" />
          </div>

          <span className="text-xs text-muted-foreground mt-1">
            Mis à jour automatiquement selon le statut de votre séance
          </span>
        </CardHeader>

        <CardFooter className="text-sm text-muted-foreground">
          Envoyez un message à votre professeur à tout moment pour vos questions
        </CardFooter>
      </Card>

      {/* ================= LESSON STATUS TIMELINE ================= */}
      <Card className="@container/card relative">
        <BorderBeam
          duration={8}
          size={400}
          className="from-transparent via-primary/70 to-transparent"
        />

        <CardHeader>
          <CardDescription>Suivi de la Séance</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">Progression</CardTitle>
        </CardHeader>

        <CardFooter className="flex flex-col gap-2 text-sm">
          {['Séance réservée', 'Confirmée par le prof', 'Cours en cours', 'Terminée'].map(
            (label, i) => (
              <div key={label} className="flex items-center justify-between w-full">
                <span className="truncate">{label}</span>
                <Badge
                  variant={
                    i < (status === 'DELIVERED' ? 4 : status === 'ACTIVE' ? 3 : 2)
                      ? 'secondary'
                      : 'outline'
                  }
                  className="text-xs"
                >
                  {i < (status === 'DELIVERED' ? 4 : status === 'ACTIVE' ? 3 : 2) ? (
                    <IconCheck className="h-3 w-3" />
                  ) : (
                    'En attente'
                  )}
                </Badge>
              </div>
            )
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
