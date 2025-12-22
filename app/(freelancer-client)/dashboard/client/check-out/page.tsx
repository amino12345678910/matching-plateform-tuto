import Checkout from '@/components/client/check-out';
import {cookies} from 'next/headers';

async function CheckoutPage() {
  const cookie = (await cookies()).get('X-booked-service')?.value;
  if (!cookie) return console.error('No Cookie found');

  const bookedServiceX = await JSON.parse(cookie);

  console.log(bookedServiceX);
  return (
    <section>
      <Checkout />
    </section>
  );
}

export default CheckoutPage;
