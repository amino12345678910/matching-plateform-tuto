import {getUserInfo} from '@/hooks/shared/get-user-info';
import {redirect} from 'next/navigation';
import {getActiveOrders} from '@/hooks/client/get-active-orders';
import {ClientSectionCards} from '@/components/client/features/section-cards';
import {getStudentPointsData} from '@/hooks/points/points-actions';
import {StudentPointsWallet} from '@/components/client/points-wallet';

export type ClientActiveOrder = {
  id: string;
  service: {title: string};
  freelancer: {id: string; name: string; conversations: {id: string}[]};
  totalPrice: number;
  acceptedAt: Date | null;
  delivery: number;
  status: string | 'PENDING' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED';
};

export default async function Page() {
  const {userId: cId, role} = await getUserInfo();
  if (role !== 'USER' || !cId) return redirect('/auth/login');

  const [activeOrders, pointsData] = await Promise.all([
    getActiveOrders(),
    getStudentPointsData(),
  ]);

  return (
    <section className="space-y-8">
      <div className="px-4 lg:px-6">
        <StudentPointsWallet
          initialPoints={pointsData.points}
          initialTransactions={pointsData.transactions}
        />
      </div>
      <ClientSectionCards activeOrder={activeOrders} />
    </section>
  );
}
