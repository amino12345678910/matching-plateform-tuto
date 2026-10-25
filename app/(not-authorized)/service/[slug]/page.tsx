import {Navbar} from '@/components/essentials/Navbar';
import {ServiceDetailPage} from '@/components/service/detailed-card';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {prisma} from '@/lib/prisma';
import type {Metadata} from 'next';
import {Footer} from '@/components/footer/footer-2';
import type {Service} from '@/types/service';
import {profilePhoto} from '@/components/profile-url';
import {readCloudStore} from '@/lib/cloud-store';
import {getAllRealServices, getReviewsCookie} from '@/hooks/book/bookings-store';
import {checkUserHasBookedService} from '@/hooks/points/points-actions';

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
    const allReal = await getAllRealServices();
    service = allReal.find(s => s.slug === resolvedParams);
  }

  if (!service) {
    const allReal = await getAllRealServices();
    service = allReal.find(s => s.slug === resolvedParams);
  }

  if (!service) {
    return {
      title: 'Cours 9arrini',
      description: 'Séance de soutien scolaire 9arrini.',
    };
  }

  const tutorName = service.freelancer?.name || service.seller?.user?.name || 'Professeur 9arrini';
  return {
    title: `${service.title} | ${tutorName}`,
    description: service.description?.replace(/<[^>]*>/g, '').slice(0, 160) ?? '',
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
    const allReal = await getAllRealServices();
    fetchedService = allReal.find(s => s.slug === slug);
  }

  if (!fetchedService) {
    const allReal = await getAllRealServices();
    fetchedService = allReal.find(s => s.slug === slug);
  }

  if (fetchedService) {
    const store = readCloudStore();
    const cookieReviews = await getReviewsCookie(fetchedService.id);
    const rawCloudReviews = [
      ...cookieReviews,
      ...(store.reviews || []).filter(
        (r: any) => r.serviceId === fetchedService.id || r.serviceSlug === slug
      ),
    ];

    const cloudReviews = rawCloudReviews.map((r: any) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      clientId: r.clientId,
      serviceId: r.serviceId,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt || r.createdAt),
      client: {
        id: r.clientId,
        name: r.clientName || 'Élève 9arrini',
        avatar: r.clientAvatar || undefined,
        imageSource: 'GOOGLE' as const,
      },
    }));

    const combinedRaw = [...(fetchedService.reviews || []), ...cloudReviews];
    const uniqueRaw = Array.from(new Map(combinedRaw.map((r: any) => [r.id, r])).values());

    const reviews = await Promise.all(
      uniqueRaw.map(async (review: any) => ({
        ...review,
        client: {
          ...review.client,
          avatar:
            review.client?.avatar ||
            (await profilePhoto({
              imageUrl: review.client?.image,
              imageSource: review.client?.imageSource,
              email: review.client?.name,
            })),
        },
      }))
    );

    const initialHasBooked = await checkUserHasBookedService(
      fetchedService.id,
      fetchedService.slug || slug
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
        <ServiceDetailPage service={formattedService} initialHasBooked={initialHasBooked} />
        <Footer />
      </>
    );
  } else
    return (
      <div className="grid grid-cols 1 justify-center items-center min-h-[84vh] mx-auto">
        <Alert className="h-fit" variant="destructive">
          <AlertTitle>Cours introuvable</AlertTitle>
          <AlertDescription>Ce lien ne correspond à aucun cours actif sur 9arrini.</AlertDescription>
        </Alert>
      </div>
    );
}

export default detailedPage;
