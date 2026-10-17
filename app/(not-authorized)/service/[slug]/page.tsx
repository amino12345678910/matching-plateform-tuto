//////
///
//

import {Navbar} from '@/components/essentials/Navbar';
import {ServiceDetailPage} from '@/components/service/detailed-card';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {cloudinaryUrl} from '@/lib/cloudinary';
import {prisma} from '@/lib/prisma';
import type {Metadata} from 'next';
import {Footer} from '@/components/footer/footer-2';
import type {Service} from '@/types/service';
import {profilePhoto} from '@/components/profile-url';
import {FALLBACK_SERVICES} from '@/lib/fallback-data';

type generateMetaDataProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({params}: generateMetaDataProps): Promise<Metadata> {
  const resolvedParams = (await params).slug;

  let service: any = null;
  try {
    service = await prisma.service.findFirst({
      where: {slug: resolvedParams},
      include: {tags: true, freelancer: {select: {name: true}}},
    });
  } catch {
    service = FALLBACK_SERVICES.find(s => s.slug === resolvedParams);
  }

  if (!service) {
    service = FALLBACK_SERVICES.find(s => s.slug === resolvedParams);
  }

  if (!service) {
    return {
      title: 'Cours 9arrini',
      description: 'Séance de soutien scolaire 9arrini.',
    };
  }

  const tutorName = service.freelancer?.name || service.seller?.user?.name || 'Prof 9arrini';
  return {
    title: `${service.title} | ${tutorName}`,
    description: service.description?.slice(0, 160) ?? '',
  };
}

async function detailedPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;

  if (!slug || slug.length === 0) {
    throw new Error('Could not resolve this service please try again');
  }

  let fetchedService: any = null;
  try {
    fetchedService = await prisma.service.findFirst({
      where: {slug},
      include: {
        bookings: {
          select: {hasSeen: true, createdAt: true},
          take: 1,
        },
        reviews: {
          include: {client: {select: {id: true, name: true, image: true, imageSource: true}}},
        },
        category: true,
        packages: true,
        seller: {
          include: {
            user: {select: {id: true, name: true, email: true, image: true, imageSource: true}},
          },
        },
        faqs: true,
        tags: true,
      },
    });
  } catch {
    fetchedService = FALLBACK_SERVICES.find(s => s.slug === slug) || FALLBACK_SERVICES[0];
  }

  if (!fetchedService) {
    fetchedService = FALLBACK_SERVICES.find(s => s.slug === slug);
  }

  if (fetchedService) {
    const reviews = await Promise.all(
      (fetchedService.reviews || []).map(async (review: any) => ({
        ...review,
        client: {
          ...review.client,
          avatar: await profilePhoto({
            imageUrl: review.client.image,
            imageSource: review.client.imageSource,
            email: review.client.name,
          }),
        },
      }))
    );
    const formattedService: Service = {
      ...fetchedService,
      reviews: reviews,
      bookings: (fetchedService.bookings || []).map((booking: any) => ({
        ...booking,
        hasSeen: booking.hasSeen || null,
      })),
      seller: {
        ...fetchedService.seller,
        bio: fetchedService.seller.bio ?? undefined,
        profilePhoto: fetchedService.seller.profilePhoto ?? undefined,
      },
    };
    return (
      <>
        <Navbar />
        <ServiceDetailPage service={formattedService} />
        <Footer />
      </>
    );
  } else
    return (
      <div className="grid grid-cols 1 justify-center items-center min-h-[84vh] mx-auto">
        <Alert className="h-fit" variant="destructive">
          <AlertTitle>Service not found</AlertTitle>
          <AlertDescription>This link does not correlate with our service.</AlertDescription>
        </Alert>
      </div>
    );
}

export default detailedPage;
