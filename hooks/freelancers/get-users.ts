// 'use server';

// import {prisma} from '@/lib/prisma';
// import type {User} from '@/generated/prisma';
// import {getUserInfo} from '../get-user-info';

// // useless hook right now
// async function getUsers(): Promise<User[]> {
//   const {userId: sellerId} = await getUserInfo();
//   const users = await prisma.user.findMany({
//     where: {bookings: {every: {sellerId}}},
//   });

//   return users;
// }

// // useless hook right now
// export default getUsers;
