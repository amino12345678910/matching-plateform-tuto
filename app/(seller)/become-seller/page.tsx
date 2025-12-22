import BecomeSeller from '@/components/freelancer/become-seller';
import {getUserInfo} from '@/hooks/get-user-info';
import {prisma} from '@/lib/prisma';
import {redirect} from 'next/navigation';

async function page() {
  const {userId} = await getUserInfo();
  if (!userId) redirect('/auth/login');

  const isAlreadySeller = await prisma.seller.findUnique({
    where: {userId: userId, isVerified: true},
    select: {id: true},
  });

  if (isAlreadySeller) redirect('/dashboard/create-service');
  return (
    <main className="container min-h-svh max-w-screen mx-auto  flex flex-col w-full items-center justify-center">
      <BecomeSeller userId={userId} />
    </main>
  );
}

export default page;
