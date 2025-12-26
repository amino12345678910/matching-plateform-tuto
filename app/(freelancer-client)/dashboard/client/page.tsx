import {getUserInfo} from '@/hooks/shared/get-user-info';
import {redirect} from 'next/navigation';
import {getActiveOrders} from '@/hooks/client/get-active-orders';
import {ClientSectionCards} from '@/components/client/features/section-cards';

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

  //active orderes, delivery countdown, chat shortcut, order status timeline
  const activeOrders: ClientActiveOrder = await getActiveOrders();
  return (
    <section className="grid">
      <ClientSectionCards activeOrder={activeOrders} />
    </section>
  );
}
