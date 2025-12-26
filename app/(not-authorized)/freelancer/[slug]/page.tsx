// app/freelancer/[slug]/page.tsx
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
    // Fetch freelancer data with related information
    const freelancerData = await prisma.user.findFirst({
      where: {
        id: freelancerId,
        role: 'SELLER',
      },
      include: {
        seller: {
          include: {
            services: {
              where: {status: 'ACTIVE'},
              include: {
                category: true,
                tags: true,
                packages: true,
                reviews: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                        imageSource: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    bookings: {
                      where: {status: 'COMPLETED'},
                    },
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
        reviews: {
          include: {
            service: {
              select: {
                title: true,
                slug: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                imageSource: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            services: {
              where: {status: 'ACTIVE'},
            },
            reviews: true,
          },
        },
      },
    });

    if (!freelancerData) {
      notFound();
    }

    // Calculate average rating
    const averageRating =
      freelancerData.reviews.length > 0
        ? freelancerData.reviews.reduce((sum, review) => sum + review.rating, 0) /
          freelancerData.reviews.length
        : 0;

    const pfp = await profilePhoto({
      imageUrl: freelancerData.image,
      imageSource: freelancerData.imageSource,
    });

    // Prepare data for the client component
    const profileData = {
      user: {
        id: freelancerData.id,
        name: freelancerData.name,
        email: freelancerData.email,
        image: pfp,
        createdAt: freelancerData.createdAt,
      },
      seller: freelancerData.seller
        ? {
            id: freelancerData.seller.id,
            bio: freelancerData.seller.bio,
            profilePhoto: pfp,
            isVerified: freelancerData.seller.isVerified,
            joinedDate: freelancerData.seller.createdAt,
            servicesCount: freelancerData._count.services,
            totalReviews: freelancerData._count.reviews,
            averageRating: Math.round(averageRating * 10) / 10,
            totalOrders: freelancerData.seller.services.reduce(
              (sum, service) => sum + service._count.bookings,
              0
            ),
          }
        : null,
      services: freelancerData.seller?.services || [],
      reviews: freelancerData.reviews || [],
    };

    return (
      <div className="container md:max-w-7xl mx-auto py-12 pt-8 px-6">
        <Navbar />
        <FreelancerProfileView profileData={profileData} />
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error fetching freelancer profile:', error);
    notFound();
  }
}

export default FreelancerProfilePage;
