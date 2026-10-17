import {getStudentPointsData} from '@/hooks/points/points-actions';
import {StudentPointsWallet} from '@/components/client/points-wallet';
import {redirect} from 'next/navigation';

export default async function StudentPointsPage() {
  const {points, transactions, userId} = await getStudentPointsData();
  if (!userId) return redirect('/auth/login');

  return (
    <div className="px-4 lg:px-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Mon Portefeuille Points (1 Point = 1 DT)
        </h1>
        <p className="text-sm text-muted-foreground">
          Rechargez vos points 9arrini pour assister à vos séances de cours particuliers.
        </p>
      </div>
      <StudentPointsWallet initialPoints={points} initialTransactions={transactions} />
    </div>
  );
}
