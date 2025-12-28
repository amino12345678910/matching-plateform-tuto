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

export default async function ExplorePage() {
  const {userId} = await getUserInfo();

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

      bookings: {
        every: {
          NOT: {clientId: userId},
          revisedCount: {gte: 1},
        },
      },
    },
    include: {
      packages: true,
      seller: {
        select: {
          profilePhoto: true,
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
        profilePhoto: service.seller.profilePhoto ?? undefined,
      },
    };
  });

  const trendingServices = [...formattedServices]
    .sort((a, b) => b._count.bookings - a._count.bookings)
    .slice(0, 6);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Clean Hero Section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Find the perfect service
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Browse thousands of professional services from talented freelancers
            </p>

            {/* Simple Search */}
            <div className="relative max-w-2xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search services..." className="pl-12 py-6 text-lg rounded-full" />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 rounded-full">
                Search
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.slice(0, 6).map(category => (
                <Link
                  key={category.id}
                  href={`/explore?category=${category.slug}`}
                  className="transition-opacity hover:opacity-80"
                >
                  <Badge variant="secondary" className="px-4 py-2">
                    {category.name}
                  </Badge>
                </Link>
              ))}
              <Link href="/explore/categories" className="transition-opacity hover:opacity-80">
                <Badge variant="outline" className="px-4 py-2 gap-2">
                  More categories
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
                  Trending Services
                </h2>
                <p className="text-muted-foreground">Most popular services this week</p>
              </div>
              <Button variant="ghost" className="gap-2">
                View all trending
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="w-full pb-4">
              <div className="flex gap-4">
                {trendingServices.map(service => (
                  <Link
                    key={service.id}
                    href={`/service/${service.slug}`}
                    className="min-w-[240px] block"
                  >
                    <div className="group border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer h-full">
                      <div className="flex items-start gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            alt={`Cover Image of ${service.title}`}
                            src={cloudinaryUrl(service.images[0], 'q_30,f_auto,w_230,h_150')}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2 text-balance group-hover:text-primary mb-2">
                            {service.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="font-bold">
                              ${Math.min(...service.packages.map(p => p.price)) || 0}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {service._count.bookings} orders
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Services Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">All Services ({formattedServices.length})</h2>
              <p className="text-muted-foreground">
                Browse our collection of professional services
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
