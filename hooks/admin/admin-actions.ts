'use server';

import {prisma} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';
import type {BookingStatus, ServiceStatus} from '@/generated/prisma';
import {readCloudStore, writeCloudStore} from '@/lib/cloud-store';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {
  getAllRealServices,
  deleteCustomServiceCookie,
  getSellersRegistryCookie,
  saveSellerRegistryCookie,
  saveClientNotificationCookie,
} from '@/hooks/book/bookings-store';

async function requireAdminSession() {
  const user = await getUserInfo();
  if (!user?.userId) {
    throw new Error('Accès refusé : veuillez vous connecter.');
  }
  const configuredAdmins = (
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    'amin.aa.aeid@gmail.com'
  )
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (
    configuredAdmins.length > 0 &&
    user.role !== 'ADMIN' &&
    !configuredAdmins.includes((user.email || '').toLowerCase())
  ) {
    throw new Error('Accès refusé : droits administrateur requis.');
  }
  return user;
}

export async function getAdminDashboardData() {
  await requireAdminSession();
  try {
    const [tutors, students, bookings, services, transactions] = await Promise.all([
      prisma.seller.findMany({
        orderBy: {createdAt: 'desc'},
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              points: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              services: true,
              bookings: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        where: {role: 'USER'},
        orderBy: {createdAt: 'desc'},
        include: {
          _count: {
            select: {
              clientBookings: true,
            },
          },
          clientBookings: {
            select: {
              totalPrice: true,
              status: true,
            },
          },
        },
      }),
      prisma.booking.findMany({
        orderBy: {createdAt: 'desc'},
        include: {
          client: {
            select: {id: true, name: true, email: true, points: true},
          },
          freelancer: {
            select: {id: true, name: true, email: true},
          },
          seller: {
            include: {
              user: {select: {id: true, name: true, email: true}},
            },
          },
          service: {
            select: {id: true, title: true, slug: true},
          },
        },
      }),
      prisma.service.findMany({
        orderBy: {createdAt: 'desc'},
        include: {
          seller: {
            include: {
              user: {select: {name: true, email: true}},
            },
          },
          category: {select: {name: true, slug: true}},
          packages: {select: {name: true, price: true, delivery: true}},
          _count: {select: {bookings: true, reviews: true}},
        },
      }),
      prisma.pointTransaction.findMany({
        orderBy: {createdAt: 'desc'},
        take: 50,
        include: {
          user: {select: {name: true, email: true, role: true}},
        },
      }),
    ]);

    const totalRevenuePoints = bookings
      .filter(b => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const verifiedTutorsCount = tutors.filter(t => t.isVerified).length;
    const pendingTutorsCount = tutors.filter(
      t => !t.isVerified && t.verificationStatus === 'PENDING'
    ).length;
    const totalPointsInCirculation = students.reduce((sum, s) => sum + (s.points || 0), 0);
    const activeServicesCount = services.filter(s => s.status === 'ACTIVE').length;

    return {
      success: true,
      stats: {
        totalRevenuePoints,
        totalBookings: bookings.length,
        totalTutors: tutors.length,
        verifiedTutors: verifiedTutorsCount,
        verifiedTutorsCount,
        pendingTutors: pendingTutorsCount,
        pendingTutorsCount,
        totalStudents: students.length,
        totalPointsInCirculation,
        totalServices: services.length,
        activeServices: activeServicesCount,
      },
      sellers: tutors.map(t => ({
        ...t,
        verified: t.isVerified,
      })),
      tutors,
      students: students.map(s => ({
        ...s,
        _count: {
          bookings: s._count.clientBookings,
          clientBookings: s._count.clientBookings,
        },
        totalSpent: s.clientBookings
          .filter(b => b.status !== 'CANCELLED')
          .reduce((acc, b) => acc + (b.totalPrice || 0), 0),
      })),
      bookings: bookings.map(b => ({
        ...b,
        price: b.totalPrice || 0,
        seller: {
          ...b.seller,
          verified: b.seller?.isVerified ?? false,
          user: b.seller?.user || b.freelancer,
        },
      })),
      services: services.map(srv => ({
        ...srv,
        seller: {
          ...srv.seller,
          verified: srv.seller.isVerified,
        },
      })),
      recentTransactions: transactions,
      transactions,
    };
  } catch {
    // Cloud fallback using readCloudStore() + getAllRealServices()
    const cloudServices = await getAllRealServices();
    const store = readCloudStore();

    const sellers = store.sellers.map(s => {
      const u = store.users.find(usr => usr.id === s.userId) || {
        id: s.userId,
        name: 'Professeur 9arrini',
        email: `${s.userId}@9arrini.tn`,
        points: 0,
        image: null,
        createdAt: s.createdAt,
      };
      const srvCount = cloudServices.filter(
        srv => srv.sellerId === s.id || srv.freelancerId === s.userId
      ).length;
      const bkCount = store.bookings.filter(b => b.freelancerId === s.userId).length;
      return {
        ...s,
        verified: s.isVerified,
        user: u,
        _count: {
          services: srvCount,
          bookings: bkCount,
        },
      };
    });

    const students = store.users
      .filter(u => u.role === 'USER')
      .map(u => {
        const userBookings = store.bookings.filter(b => b.clientId === u.id);
        return {
          ...u,
          _count: {
            bookings: userBookings.length,
            clientBookings: userBookings.length,
          },
          totalSpent: userBookings
            .filter(b => b.status !== 'CANCELLED')
            .reduce((acc, b) => acc + (b.totalPrice || 0), 0),
        };
      });

    const bookings = store.bookings.map(b => ({
      ...b,
      price: b.totalPrice,
      client: {
        id: b.clientId,
        name: b.clientName,
        email: b.clientEmail,
      },
      seller: {
        verified: true,
        user: {
          id: b.freelancerId,
          name: b.freelancerName,
        },
      },
      service: {
        id: b.serviceId,
        title: b.serviceTitle,
        slug: b.serviceSlug,
      },
    }));

    const recentTransactions = store.transactions.map(t => {
      const u = store.users.find(usr => usr.id === t.userId);
      return {
        ...t,
        user: {
          name: u?.name || 'Utilisateur 9arrini',
          email: u?.email || '',
          role: u?.role || 'USER',
        },
      };
    });

    const totalRevenuePoints = bookings
      .filter(b => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + (b.price || 0), 0);
    const verifiedTutorsCount = sellers.filter(s => s.isVerified).length;
    const pendingTutorsCount = sellers.filter(
      s => !s.isVerified && s.verificationStatus === 'PENDING'
    ).length;
    const totalPointsInCirculation = students.reduce((sum, s) => sum + (s.points || 0), 0);

    return {
      success: true,
      stats: {
        totalRevenuePoints,
        totalBookings: bookings.length,
        totalTutors: sellers.length,
        verifiedTutors: verifiedTutorsCount,
        verifiedTutorsCount,
        pendingTutors: pendingTutorsCount,
        pendingTutorsCount,
        totalStudents: students.length,
        totalPointsInCirculation,
        totalServices: cloudServices.length,
        activeServices: cloudServices.filter(s => s.status === 'ACTIVE').length,
      },
      sellers,
      tutors: sellers,
      students,
      bookings,
      services: cloudServices,
      recentTransactions,
      transactions: recentTransactions,
    };
  }
}

export async function adminVerifyTutor(sellerId: string, verify: boolean) {
  try {
    await requireAdminSession();
  } catch (err: any) {
    return {success: false, error: err?.message || 'Accès refusé.'};
  }
  try {
    const seller = await prisma.seller.update({
      where: {id: sellerId},
      data: {
        isVerified: verify,
        verificationStatus: verify ? 'VERIFIED' : 'REJECTED',
      },
    });

    await prisma.notification.create({
      data: {
        userId: seller.userId,
        type: 'AUTOMATED',
        title: verify
          ? '🎉 Mabrouk ! Votre compte Prof a été VÉRIFIÉ par l’administration 9arrini (Badge Vérifié actif).'
          : '⚠️ Votre statut de vérification Prof a été mis à jour par l’administration.',
        link: '/dashboard/freelancer',
      },
    });
  } catch {
    // Cloud fallback
  }

  const store = readCloudStore();
  const cookieSellers = await getSellersRegistryCookie();
  let targetSeller =
    store.sellers.find(s => s.id === sellerId || s.userId === sellerId) ||
    cookieSellers.find(s => s.id === sellerId || s.userId === sellerId);

  if (targetSeller) {
    targetSeller.isVerified = verify;
    targetSeller.verificationStatus = verify ? 'VERIFIED' : 'REJECTED';
    const idx = store.sellers.findIndex(
      s => s.id === targetSeller!.id || s.userId === targetSeller!.userId
    );
    if (idx >= 0) {
      store.sellers[idx] = targetSeller;
    } else {
      store.sellers.unshift(targetSeller);
    }
    writeCloudStore(store);
    await saveSellerRegistryCookie(targetSeller);
    await saveClientNotificationCookie({
      id: `notif_verify_${Date.now()}`,
      userId: targetSeller.userId,
      title: verify
        ? '🎉 Mabrouk ! Votre candidature Professeur a été VÉRIFIÉE et approuvée par 9arrini. Vous avez maintenant accès complet pour publier vos cours !'
        : '⚠️ Votre statut de candidature Professeur a été mis à jour par l’administration.',
      type: 'AUTOMATED',
      link: '/dashboard/freelancer',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  revalidatePath('/admin');
  revalidatePath('/admin/dashboard');
  revalidatePath('/explore');
  revalidatePath('/');
  revalidatePath('/dashboard/freelancer');
  revalidatePath('/dashboard/freelancer/create-service');

  return {
    success: true,
    message: verify ? 'Professeur vérifié avec succès !' : 'Statut de vérification révoqué.',
    error: undefined as string | undefined,
  };
}

export async function adminAdjustStudentPoints(
  userId: string,
  amount: number,
  reason?: string
) {
  try {
    await requireAdminSession();
  } catch (err: any) {
    return {success: false, error: err?.message || 'Accès refusé.'};
  }
  const cleanAmount = Math.floor(Number(amount));
  if (!cleanAmount || cleanAmount === 0) {
    return {success: false, error: 'Veuillez indiquer un nombre de points non nul.'};
  }

  let newBalance: number | null = null;

  try {
    const updatedUser = await prisma.user.update({
      where: {id: userId},
      data: {
        points: {increment: cleanAmount},
        pointTransactions: {
          create: {
            amount: cleanAmount,
            type: 'ADMIN_GRANT',
            description:
              reason ||
              (cleanAmount > 0
                ? `Crédit Admin 9arrini (+${cleanAmount} Pts / ${cleanAmount} DT)`
                : `Ajustement Admin 9arrini (${cleanAmount} Pts / ${cleanAmount} DT)`),
          },
        },
      },
    });
    newBalance = updatedUser.points;
  } catch {
    // Cloud fallback
  }

  const store = readCloudStore();
  const cloudUser = store.users.find(u => u.id === userId);
  if (cloudUser) {
    cloudUser.points =
      newBalance !== null ? newBalance : Math.max(0, (cloudUser.points || 0) + cleanAmount);
    newBalance = cloudUser.points;
    store.transactions.unshift({
      id: `tx_admin_${Date.now()}`,
      userId,
      amount: cleanAmount,
      type: 'ADMIN_GRANT',
      description:
        reason ||
        (cleanAmount > 0
          ? `Crédit Admin 9arrini (+${cleanAmount} Pts / ${cleanAmount} DT)`
          : `Ajustement Admin 9arrini (${cleanAmount} Pts / ${cleanAmount} DT)`),
      createdAt: new Date().toISOString(),
    });
    writeCloudStore(store);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/dashboard');
  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/client/points');

  return {
    success: true,
    newBalance: newBalance ?? cleanAmount,
    message: `Solde mis à jour : ${newBalance ?? cleanAmount} Points (${newBalance ?? cleanAmount} DT)`,
  };
}

export async function adminUpdateBookingStatus(bookingId: string, status: BookingStatus) {
  try {
    await requireAdminSession();
  } catch (err: any) {
    return {success: false, error: err?.message || 'Accès refusé.'};
  }
  try {
    await prisma.booking.update({
      where: {id: bookingId},
      data: {
        status,
        acceptedAt: status === 'CONFIRMED' ? new Date() : undefined,
      },
    });
  } catch {
    // Cloud fallback
  }

  const store = readCloudStore();
  const b = store.bookings.find(item => item.id === bookingId);
  if (b) {
    b.status = status as any;
    writeCloudStore(store);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/dashboard');
  revalidatePath('/dashboard/client');
  revalidatePath('/dashboard/freelancer');

  return {
    success: true,
    message: `Statut de la réservation mis à jour : ${status}`,
    error: undefined as string | undefined,
  };
}

export async function adminUpdateServiceStatus(serviceId: string, status: ServiceStatus) {
  try {
    await requireAdminSession();
  } catch (err: any) {
    return {success: false, error: err?.message || 'Accès refusé.'};
  }
  try {
    await prisma.service.update({
      where: {id: serviceId},
      data: {status},
    });
  } catch {
    // Cloud fallback
  }

  const store = readCloudStore();
  const s = store.customServices.find((item: any) => item.id === serviceId);
  if (s) {
    s.status = status;
    writeCloudStore(store);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/dashboard');
  revalidatePath('/explore');
  revalidatePath('/');

  return {
    success: true,
    message: `Statut du cours mis à jour : ${status}`,
    error: undefined as string | undefined,
  };
}

export async function adminDeleteService(serviceId: string) {
  try {
    await requireAdminSession();
  } catch (err: any) {
    return {success: false, error: err?.message || 'Accès refusé.'};
  }
  try {
    await prisma.service.delete({
      where: {id: serviceId},
    });
  } catch {
    // Cloud fallback
  }

  const store = readCloudStore();
  store.customServices = store.customServices.filter((item: any) => item.id !== serviceId);
  writeCloudStore(store);
  await deleteCustomServiceCookie(serviceId);

  revalidatePath('/admin');
  revalidatePath('/admin/dashboard');
  revalidatePath('/explore');
  revalidatePath('/');

  return {
    success: true,
    message: 'Cours supprimé avec succès.',
    error: undefined as string | undefined,
  };
}
