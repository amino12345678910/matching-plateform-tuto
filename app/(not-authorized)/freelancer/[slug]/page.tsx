'use server';

import {notFound} from 'next/navigation';
import {profilePhoto} from '@/components/profile-url';
import {prisma} from '@/lib/prisma';
import {readCloudStore} from '@/lib/cloud-store';
import {getAllRealServices} from '@/hooks/book/bookings-store';
import FreelancerProfileView from '@/components/freelancer/profileView';
import Navbar from '@/components/essentials/Navbar';
import {Footer} from '@/components/footer/footer-2';

async function FreelancerProfilePage({params}: {params: Promise<{slug: string}>}) {
  const freelancerId = (await params).slug;

  if (!freelancerId) {
    notFound();
  }

  let freelancerData: any = null;

  try {
    freelancerData = await prisma.user.findFirst({
      where: {id: freelancerId, role: 'SELLER'},
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        imageSource: true,
        createdAt: true,
        seller: {
          select: {
            id: true,
            bio: true,
            isVerified: true,
            createdAt: true,
            services: {
              where: {status: 'ACTIVE'},
              select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                images: true,
                category: {select: {name: true}},
                tags: {select: {name: true, slug: true}},
                packages: {select: {name: true, price: true, delivery: true, revisions: true}},
                _count: {select: {bookings: {where: {status: 'COMPLETED'}}}},
              },
              orderBy: {createdAt: 'desc'},
            },
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            service: {select: {title: true, slug: true}},
            client: {select: {name: true}},
          },
          orderBy: {createdAt: 'desc'},
        },
        _count: {select: {services: {where: {status: 'ACTIVE'}}, reviews: true}},
      },
    });
  } catch {
    // Cloud fallback
  }

  if (!freelancerData || !freelancerData.seller) {
    const store = readCloudStore();
    const allServices = await getAllRealServices();
    const tutorServices = allServices.filter(
      s => s.freelancerId === freelancerId || s.seller?.userId === freelancerId
    );
    const cloudUser = store.users.find(u => u.id === freelancerId);
    const cloudSeller = store.sellers.find(s => s.userId === freelancerId);
    const fallbackFirst = tutorServices[0];

    if (cloudUser || fallbackFirst) {
      const reviews = tutorServices.flatMap((s: any) =>
        (s.reviews || []).map((r: any) => ({
          ...r,
          service: {title: s.title, slug: s.slug},
        }))
      );
      freelancerData = {
        id: freelancerId,
        name: cloudUser?.name || fallbackFirst?.seller?.user?.name || 'Professeur 9arrini',
        email: cloudUser?.email || fallbackFirst?.seller?.user?.email || '',
        image: cloudUser?.image || fallbackFirst?.seller?.user?.image || null,
        imageSource: cloudUser?.imageSource || 'NULL',
        createdAt: new Date(cloudUser?.createdAt || Date.now()),
        seller: {
          id: cloudSeller?.id || fallbackFirst?.seller?.id || `seller_${freelancerId}`,
          bio: cloudSeller?.bio || fallbackFirst?.seller?.bio || '',
          isVerified: Boolean(cloudSeller?.isVerified ?? fallbackFirst?.seller?.isVerified ?? false),
          createdAt: new Date(cloudSeller?.createdAt || Date.now()),
          services: tutorServices.map((s: any) => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            description: s.description,
            images: s.images,
            category: {name: s.category?.name || 'Cours'},
            tags: s.tags || [],
            packages: s.packages || [],
            _count: {bookings: s._count?.bookings || 0},
          })),
        },
        reviews,
        _count: {
          services: tutorServices.length,
          reviews: reviews.length,
        },
      };
    }
  }

  if (!freelancerData || !freelancerData.seller) {
    notFound();
  }

  const averageRating =
    freelancerData.reviews.length > 0
      ? freelancerData.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
        freelancerData.reviews.length
      : 0;

  const pfp = await profilePhoto({
    imageUrl: freelancerData.image,
    imageSource: freelancerData.imageSource,
    email: freelancerData.email,
  });

  const totalOrders = freelancerData.seller.services.reduce(
    (sum: number, service: any) => sum + (service._count?.bookings || 0),
    0
  );

  const profileData = {
    client: {
      id: freelancerData.id,
      name: freelancerData.name,
      email: freelancerData.email,
      image: pfp,
    },
    seller: {
      id: freelancerData.seller.id,
      bio: freelancerData.seller.bio,
      profilePhoto: pfp,
      isVerified: freelancerData.seller.isVerified,
      joinedDate: freelancerData.seller.createdAt,
      servicesCount: freelancerData._count.services,
      totalReviews: freelancerData._count.reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalOrders,
    },
    services: freelancerData.seller.services,
    reviews: freelancerData.reviews,
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FreelancerProfileView profileData={profileData} />
      </div>
      <Footer />
    </div>
  );
}

export default FreelancerProfilePage;
