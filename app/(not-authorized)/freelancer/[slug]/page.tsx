'use server';

import {notFound} from 'next/navigation';
import {profilePhoto} from '@/components/profile-url';
import {prisma} from '@/lib/prisma';
import FreelancerProfileView from '@/components/freelancer/profileView';
import Navbar from '@/components/essentials/Navbar';
import {Footer} from '@/components/footer/footer-2';

async function FreelancerProfilePage({params}: {params: Promise<{slug: string}>}) {
  const freelancerId = (await params).slug;

  if (!freelancerId) {
    notFound();
  }

  try {
    // Only fetch what's actually needed
    const freelancerData = await prisma.user.findFirst({
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

    if (!freelancerData || !freelancerData.seller) {
      notFound();
    }

    const averageRating =
      freelancerData.reviews.length > 0
        ? freelancerData.reviews.reduce((sum, review) => sum + review.rating, 0) /
          freelancerData.reviews.length
        : 0;

    const pfp = await profilePhoto({
      imageUrl: freelancerData.image,
      imageSource: freelancerData.imageSource,
    });

    // Calculate total orders
    const totalOrders = freelancerData.seller.services.reduce(
      (sum, service) => sum + service._count.bookings,
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
  } catch (error) {
    console.error('Error fetching freelancer profile:', error);
    notFound();
  }
}

export default FreelancerProfilePage;
