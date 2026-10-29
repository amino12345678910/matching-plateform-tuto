'use client';

import Link from 'next/link';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ShieldCheck,
  Star,
  Lock,
  Compass,
} from 'lucide-react';
import moment from 'moment';
import {LEGAL_OPERATOR} from '@/lib/constants';

export type PointTx = {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: Date | string;
};

export function StudentPointsWallet({
  initialPoints,
  initialTransactions,
  compact = false,
}: {
  initialPoints: number;
  initialTransactions: PointTx[];
  compact?: boolean;
}) {
  const points = initialPoints || 0;
  const transactions = initialTransactions || [];

  return (
    <div className="space-y-6">
      {/* Main Balance & 1-Week Free Launch Trial Banner */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white shadow-lg overflow-hidden relative">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                Portefeuille 9arrini • Solde Réel
              </div>
              <Badge className="bg-amber-400 text-zinc-950 font-extrabold text-xs px-2.5 py-0.5">
                <Sparkles className="h-3 w-3 mr-1" />
                SEMAINE DE LANCEMENT GRATUITE ACTIVE
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-baseline gap-3">
              <span>{points} DT</span>
              <span className="text-base sm:text-lg font-normal text-emerald-300">
                (Aucun paiement requis cette semaine)
              </span>
            </h2>
            <p className="text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Profitez de <strong>1 semaine d&apos;essai 100 % gratuit</strong> sur toute la
              plateforme ! Vous pouvez réserver vos séances de cours directement à{' '}
              <strong>0 DT</strong> sans recharger votre compte. Le paiement en ligne via{' '}
              <strong>Flouci &amp; D17</strong> sera ouvert à la fin de la semaine de lancement.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
            <Link href="/explore">
              <Button className="w-full bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold h-11 px-5 cursor-pointer">
                <Compass className="h-4 w-4 mr-2" />
                Réserver un cours (0 DT)
              </Button>
            </Link>
            <Link
              href="/legal#tarifs"
              className="text-center text-xs text-emerald-200 hover:text-white underline underline-offset-4"
            >
              Voir les conditions &amp; garantie élève
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* How Payments & Escrow Work After the Free Trial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200/80 bg-emerald-50/30 dark:bg-emerald-950/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase">
              <Sparkles className="h-4 w-4" />
              1. Semaine Gratuite (En cours)
            </div>
            <CardTitle className="text-base font-bold">0 DT — Aucun paiement requis</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            Réservez vos séances gratuitement pendant 7 jours pour tester la plateforme et nos
            professeurs vérifiés, sans carte bancaire ni recharge.
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase">
              <Star className="h-4 w-4 fill-amber-400" />
              2. Évaluation après Séance
            </div>
            <CardTitle className="text-base font-bold">
              Vous notez le prof après le cours
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            Après chaque séance Google Meet, vous confirmez et notez le professeur (1 à 5 étoiles).
            Le paiement du professeur n&apos;est débloqué qu&apos;après votre validation.
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase">
              <ShieldCheck className="h-4 w-4" />
              3. Paiement Flouci / D17 (Bientôt)
            </div>
            <CardTitle className="text-base font-bold">
              Transparence 85 % Prof / 15 % 9arrini
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground leading-relaxed">
            Après la semaine gratuite, les paiements se feront via <strong>Flouci</strong> ou{' '}
            <strong>D17 ({LEGAL_OPERATOR.d17})</strong> avec garantie séquestre (85 % reversés au
            professeur, 15 % commission plateforme).
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-600" />
              Historique des Transactions &amp; Séances
            </CardTitle>
            <CardDescription>
              Tous les comptes démarrent à 0 DT (aucune donnée fictive). Vos futures opérations
              apparaîtront ici.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Aucune transaction payante pour le moment — vous bénéficiez actuellement de la
                semaine de lancement 100 % gratuite (0 DT).
              </p>
            ) : (
              <div className="divide-y">
                {transactions.map(tx => (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-4 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          tx.amount > 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {moment(tx.createdAt).format('DD MMM YYYY, HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`font-bold whitespace-nowrap ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-gray-900'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} DT
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
