'use server';

import {prisma} from '@/lib/prisma';
import {revalidatePath} from 'next/cache';
import type {BookingStatus, ServiceStatus} from '@/generated/prisma';

export async function getAdminDashboardData() {
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
  } catch (err) {
    console.error('Admin dashboard DB fallback:', err);
    return {
      success: true,
      stats: {
        totalRevenuePoints: 0,
        totalBookings: 0,
        totalTutors: 0,
        verifiedTutors: 0,
        verifiedTutorsCount: 0,
        pendingTutors: 0,
        pendingTutorsCount: 0,
        totalStudents: 0,
        totalPointsInCirculation: 0,
        totalServices: 0,
        activeServices: 0,
      },
      sellers: [],
      tutors: [],
      students: [],
      bookings: [],
      services: [],
      recentTransactions: [],
      transactions: [],
    };
  }
}

export async function adminVerifyTutor(sellerId: string, verify: boolean) {
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

    revalidatePath('/admin');
    revalidatePath('/admin/dashboard');
    revalidatePath('/explore');
    revalidatePath('/');
    revalidatePath('/dashboard/freelancer');

    return {
      success: true,
      message: verify ? 'Professeur vérifié avec succès !' : 'Statut de vérification révoqué.',
    };
  } catch (error) {
    console.error('Error verifying tutor:', error);
    return {success: false, error: 'Failed to update tutor verification status'};
  }
}

export async function adminAdjustStudentPoints(
  userId: string,
  amount: number,
  reason?: string
) {
  const cleanAmount = Math.floor(Number(amount));
  if (!cleanAmount || cleanAmount === 0) {
    return {success: false, error: 'Please specify a non-zero points amount.'};
  }

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
        notifications: {
          create: {
            type: 'AUTOMATED',
            title:
              cleanAmount > 0
                ? `🎁 L'administration 9arrini a crédité votre compte de +${cleanAmount} Points (${cleanAmount} DT).`
                : `Mise à jour de votre solde Points (${cleanAmount} Pts).`,
            link: '/dashboard/client/points',
          },
        },
      },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/dashboard');
    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/client/points');

    return {
      success: true,
      newBalance: updatedUser.points,
      message: `Solde mis à jour : ${updatedUser.points} Points (${updatedUser.points} DT)`,
    };
  } catch (error) {
    console.error('Error adjusting student points:', error);
    return {success: false, error: 'Failed to adjust student points'};
  }
}

export async function adminUpdateBookingStatus(bookingId: string, status: BookingStatus) {
  try {
    await prisma.booking.update({
      where: {id: bookingId},
      data: {
        status,
        acceptedAt: status === 'CONFIRMED' ? new Date() : undefined,
      },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/dashboard');
    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/freelancer');

    return {success: true, message: `Statut de la réservation mis à jour : ${status}`};
  } catch (error) {
    console.error('Error updating booking status:', error);
    return {success: false, error: 'Failed to update booking status'};
  }
}

export async function adminUpdateServiceStatus(serviceId: string, status: ServiceStatus) {
  try {
    await prisma.service.update({
      where: {id: serviceId},
      data: {status},
    });

    revalidatePath('/admin');
    revalidatePath('/admin/dashboard');
    revalidatePath('/explore');
    revalidatePath('/');

    return {success: true, message: `Statut du cours mis à jour : ${status}`};
  } catch (error) {
    console.error('Error updating service status:', error);
    return {success: false, error: 'Failed to update course status'};
  }
}

export async function adminDeleteService(serviceId: string) {
  try {
    await prisma.service.delete({
      where: {id: serviceId},
    });

    revalidatePath('/admin');
    revalidatePath('/admin/dashboard');
    revalidatePath('/explore');
    revalidatePath('/');

    return {success: true, message: 'Cours supprimé avec succès.'};
  } catch (error) {
    console.error('Error deleting service:', error);
    return {success: false, error: 'Impossible de supprimer ce cours.'};
  }
}
