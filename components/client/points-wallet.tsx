'use client';

import {useState} from 'react';
import {buyStudentPoints} from '@/hooks/points/points-actions';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Coins, PlusCircle, ArrowUpRight, ArrowDownLeft, Sparkles, CheckCircle2} from 'lucide-react';
import {toast} from 'sonner';
import moment from 'moment';

export type PointTx = {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: Date | string;
};

const POINT_PACKS = [
  {
    points: 25,
    dt: 25,
    title: 'Pack Séance Unique',
    subtitle: 'Idéal pour 1 séance de cours 1-on-1',
    popular: false,
  },
  {
    points: 70,
    dt: 70,
    title: 'Pack Révision (3 Séances)',
    subtitle: 'Pour bien préparer un devoir ou chapitre',
    popular: true,
  },
  {
    points: 130,
    dt: 130,
    title: 'Pack Bac & Examen',
    subtitle: 'Suivi complet + séries d’exercices corrigés',
    popular: false,
  },
  {
    points: 250,
    dt: 250,
    title: 'Pack Trimestre Excellence',
    subtitle: 'Accompagnement intensif multi-matières',
    popular: false,
  },
];

export function StudentPointsWallet({
  initialPoints,
  initialTransactions,
  compact = false,
}: {
  initialPoints: number;
  initialTransactions: PointTx[];
  compact?: boolean;
}) {
  const [points, setPoints] = useState(initialPoints);
  const [transactions, setTransactions] = useState<PointTx[]>(initialTransactions);
  const [customAmount, setCustomAmount] = useState('');
  const [loadingPack, setLoadingPack] = useState<number | null>(null);

  const handleBuyPack = async (amount: number, label: string) => {
    setLoadingPack(amount);
    try {
      const res = await buyStudentPoints(amount, label);
      if (res.success && typeof res.points === 'number') {
        setPoints(res.points);
        setTransactions(prev => [
          {
            id: Math.random().toString(),
            amount,
            type: 'TOPUP',
            description: label,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        toast.success(res.message || `+${amount} Points ajoutés !`);
      } else {
        toast.error(res.error || 'Erreur lors de la recharge');
      }
    } catch {
      toast.error('Erreur lors de la recharge');
    } finally {
      setLoadingPack(null);
    }
  };

  const handleCustomTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (!val || val <= 0) {
      toast.error('Veuillez entrer un nombre de points valide (ex: 50)');
      return;
    }
    await handleBuyPack(val, `Recharge personnalisée (+${val} Points = ${val} DT)`);
    setCustomAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Main Balance Banner */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white shadow-lg overflow-hidden relative">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              Portefeuille 9arrini Points • 1 Point = 1 Dinar (DT)
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-baseline gap-3">
              <span>{points} Points</span>
              <span className="text-lg sm:text-xl font-normal text-emerald-300">
                (= {points} DT)
              </span>
            </h2>
            <p className="text-sm text-emerald-100/80 max-w-xl">
              Utilisez vos Points 9arrini pour réserver instantanément vos séances de cours avec nos
              professeurs. 1 Point vaut exactement 1 Dinar Tunisien (1 DT).
            </p>
          </div>

          <form
            onSubmit={handleCustomTopup}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15 w-full md:w-auto"
          >
            <div className="relative">
              <Input
                type="number"
                min={5}
                max={5000}
                placeholder="Montant (ex: 50)"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                className="bg-white text-gray-900 border-0 pr-12 h-10 w-full sm:w-44 font-medium"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                Pts/DT
              </span>
            </div>
            <Button
              type="submit"
              disabled={loadingPack !== null}
              className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold h-10 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Recharger
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Instant Points Packs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Acheter / Obtenir des Packs de Points (1 Pt = 1 DT)
            </h3>
            <p className="text-xs text-muted-foreground">
              Activation immédiate sur votre compte élève (sans carte bancaire requise en mode
              académique)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POINT_PACKS.map(pack => (
            <Card
              key={pack.points}
              className={`relative flex flex-col justify-between transition-all hover:shadow-md ${
                pack.popular ? 'border-2 border-emerald-500 bg-emerald-50/30' : ''
              }`}
            >
              {pack.popular && (
                <Badge className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px]">
                  Le plus choisi
                </Badge>
              )}
              <CardHeader className="pb-2">
                <CardDescription className="font-semibold text-emerald-700">
                  {pack.title}
                </CardDescription>
                <CardTitle className="text-2xl font-black flex items-baseline gap-1.5">
                  +{pack.points} Pts
                  <span className="text-sm font-medium text-muted-foreground">
                    ({pack.dt} DT)
                  </span>
                </CardTitle>
                <p className="text-xs text-muted-foreground pt-1">{pack.subtitle}</p>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  onClick={() =>
                    handleBuyPack(
                      pack.points,
                      `${pack.title} (+${pack.points} Points = ${pack.dt} DT)`
                    )
                  }
                  disabled={loadingPack !== null}
                  variant={pack.popular ? 'default' : 'outline'}
                  className={`w-full cursor-pointer ${
                    pack.popular ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                  }`}
                >
                  {loadingPack === pack.points ? (
                    'Activation...'
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Obtenir {pack.points} Pts ({pack.dt} DT)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Historique des Points & Réservations de Cours
            </CardTitle>
            <CardDescription>
              Suivez toutes vos recharges de points et vos réservations de séances (1 Pt = 1 DT)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Aucune transaction pour le moment. Choisissez un pack ci-dessus pour recharger votre
                compte !
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
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Pts ({Math.abs(tx.amount)} DT)
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
