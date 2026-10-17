// app/explore/page.tsx
import ServiceCards from '@/components/service/card-client';
import {prisma} from '@/lib/prisma';
import NoServicesFound from '@/components/service/service-non-found';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import Navbar from '@/components/essentials/Navbar';
import {Footer} from '@/components/footer/footer-2';
import {Search, TrendingUp, ArrowRight} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {ScrollArea} from '@/components/ui/scroll-area';
import Link from 'next/link';
import {cloudinaryUrl} from '@/lib/cloudinary';
import Image from 'next/image';

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: Promise<{category?: string; q?: string}>;
}) {
  await getUserInfo();
  const resolvedParams = searchParams ? await searchParams : {};
  const categoryFilter = resolvedParams?.category;
  const searchQuery = resolvedParams?.q;

  // Fetch categories from database
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          services: {
            where: {
              status: 'ACTIVE',
            },
          },
        },
      },
    },
    orderBy: {
      services: {
        _count: 'desc',
      },
    },
    take: 12,
  });

  const services = await prisma.service.findMany({
    where: {
      status: 'ACTIVE',
      ...(categoryFilter ? {categorySlug: categoryFilter} : {}),
      ...(searchQuery
        ? {
            OR: [
              {title: {contains: searchQuery, mode: 'insensitive'}},
              {description: {contains: searchQuery, mode: 'insensitive'}},
            ],
          }
        : {}),
    },
    include: {
      packages: true,
      seller: {
        select: {
          profilePhoto: true,
          isVerified: true,
          verificationStatus: true,
          specialty: true,
          user: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      },
      tags: true,
      category: true,
      reviews: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          reviews: true,
          bookings: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 50,
  });

  // Calculate average rating for each service
  const formattedServices = services.map(service => {
    const totalRating = service.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = service.reviews.length > 0 ? totalRating / service.reviews.length : 0;

    return {
      ...service,
      averageRating,
      seller: {
        ...service.seller,
        verified: service.seller.isVerified,
        profilePhoto: service.seller.profilePhoto ?? undefined,
      },
    };
  });

  const trendingServices = [...formattedServices]
    .sort((a, b) => b._count.bookings - a._count.bookings)
    .slice(0, 6);

  const formatTrendingTitle = (title: string) => {
    const cleaned = (title || '').trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length < 5 || cleaned.toLowerCase().startsWith('i teach')) {
      const topic = cleaned.replace(/^i\s+teach\s+/i, '').trim() || 'Soutien Scolaire';
      const capTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
      return `Cours & Révision : ${capTopic} — Accompagnement 1-on-1`;
    }
    return cleaned;
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Clean Hero Section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Find the perfect tutor & lesson
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Browse 1-on-1 tutoring sessions, interactive courses, and mentorship from verified educators
            </p>

            {/* Simple Search */}
            <form action="/explore" method="GET" className="relative max-w-2xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={searchQuery || ''}
                placeholder="Search subjects, skills, or topics (e.g. Calculus, Python, Spanish)..."
                className="pl-12 py-6 text-lg rounded-full"
              />
              <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-6 rounded-full">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/explore" className="transition-opacity hover:opacity-80">
                <Badge variant={!categoryFilter ? 'default' : 'secondary'} className="px-4 py-2">
                  All Subjects
                </Badge>
              </Link>
              {categories.slice(0, 6).map(category => (
                <Link
                  key={category.id}
                  href={`/explore?category=${category.slug}`}
                  className="transition-opacity hover:opacity-80"
                >
                  <Badge
                    variant={categoryFilter === category.slug ? 'default' : 'secondary'}
                    className="px-4 py-2"
                  >
                    {category.name}
                  </Badge>
                </Link>
              ))}
              <Link href="/explore/categories" className="transition-opacity hover:opacity-80">
                <Badge variant="outline" className="px-4 py-2 gap-2">
                  More subjects
                  <ArrowRight className="h-3 w-3" />
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Clean and Focused */}
      <div className="container mx-auto px-4 py-8">
        {trendingServices.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending Tutoring Sessions
                </h2>
                <p className="text-muted-foreground">Most popular lessons booked by students this week</p>
              </div>
              <Button variant="ghost" className="gap-2" asChild>
                <Link href="/explore">
                  View all sessions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <ScrollArea className="w-full pb-4">
              <div className="flex gap-4">
                {trendingServices.map(service => {
                  const minPrice = Math.min(...service.packages.map(p => p.price)) || 0;
                  return (
                    <Link
                      key={service.id}
                      href={`/service/${service.slug}`}
                      className="min-w-[260px] block"
                    >
                      <div className="group border rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer h-full bg-card">
                        <div className="flex items-start gap-3">
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              alt={`Cover Image of ${service.title}`}
                              src={
                                service.images && service.images[0]
                                  ? cloudinaryUrl(service.images[0], 'q_30,f_auto,w_230,h_150')
                                  : 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80'
                              }
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm line-clamp-2 text-balance group-hover:text-emerald-700 mb-2">
                              {formatTrendingTitle(service.title)}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-700 text-xs">
                                {minPrice} Pts ({minPrice} DT)
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {service._count.bookings} élèves
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Services Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                All Tutoring Sessions ({formattedServices.length})
              </h2>
              <p className="text-muted-foreground">
                Browse personalized 1-on-1 lessons and study programs
              </p>
            </div>

            {/* Simple Sort Dropdown */}
            <div className="flex items-center gap-4">
              <select className="text-sm border rounded-md px-3 py-2 bg-background">
                <option>Sort by: Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Best Rating</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {formattedServices && formattedServices.length > 0 ? (
              <ServiceCards services={formattedServices} />
            ) : (
              <NoServicesFound />
            )}
          </div>
        </div>

        {formattedServices.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="px-8">
              Load More
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
