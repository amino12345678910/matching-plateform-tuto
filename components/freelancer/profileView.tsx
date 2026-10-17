'use client';

import Image from 'next/image';
import Link from 'next/link';
import {Star, CheckCircle, Calendar, MessageSquare, ExternalLink} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {cloudinaryUrl} from '@/lib/cloudinary';
// import type {Review} from '@/types/review';
// import type {Service} from '@/types/service';

interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  images: string[];
  category: {name: string};
  tags: Array<{name: string; slug: string}>;
  packages: Array<{name: string; price: number; delivery: number; revisions: number}>;
  reviews?: Array<{rating: number}>;
  _count: {bookings: number};
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  client: {name: string; avatar?: string};
  service?: {title: string; slug: string};
  createdAt: Date;
}
interface ProfileData {
  client: {id: string; name: string; email: string; image: string | null};
  seller: {
    id: string;
    bio: string | null;
    profilePhoto: string;
    isVerified: boolean;
    joinedDate: Date;
    servicesCount: number;
    totalReviews: number;
    averageRating: number;
    totalOrders: number;
  };
  services: Array<Service & {_count: {bookings: number}}>;
  // services: Array<Service & {_count: {bookings: number}}>;
  reviews?: Review[];
}

export default function FreelancerProfileView({profileData}: {profileData: ProfileData}) {
  if (!profileData.seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Tutor Profile Not Found</CardTitle>
            <CardDescription>This user is not registered as a tutor.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const {client, seller, services, reviews = []} = profileData;
  const latestReviews = reviews.slice(0, 3);
  const displayedServices = services.slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="shrink-0">
          <Avatar className="h-40 w-40 border-4 border-background shadow-lg">
            <AvatarImage src={seller.profilePhoto} alt={client.name} />
            <AvatarFallback className="text-3xl">{client.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
            {seller.isVerified && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified Tutor
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-[var(--star-filled)] fill-[var(--star-filled)]" />
                <span className="ml-1 font-bold text-lg">{seller.averageRating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">({seller.totalReviews} student reviews)</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Teaching since {new Date(seller.joinedDate).getFullYear()}</span>
            </div>

            <div className="text-muted-foreground">{seller.totalOrders} lessons completed</div>
          </div>

          {seller.bio && (
            <p className="text-foreground text-lg leading-relaxed max-w-3xl mb-8">{seller.bio}</p>
          )}

          <div className="flex gap-3">
            <Button size="lg" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Message Tutor
            </Button>
          </div>
        </div>
      </div>

      {/* Services Section */}
      {displayedServices.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Tutoring Sessions & Courses</h2>
            {services.length > 6 && (
              <Link
                href={`/freelancer/${client.id}/services`}
                className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
              >
                View all {services.length} sessions
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedServices.map(service => {
              const serviceRating =
                service.reviews && service.reviews.length > 0
                  ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length
                  : 0;

              const basicPackage =
                service.packages.find(p => p.name.toLowerCase().includes('basic')) ||
                service.packages[0];

              return (
                <Card
                  key={service.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-200"
                >
                  {service.images.length > 0 && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={cloudinaryUrl(service.images[0], 'q_auto,f_auto,w_600')}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <CardContent className="p-5">
                    <div className="mb-3">
                      <Badge variant="outline" className="mb-2">
                        {service.category.name}
                      </Badge>
                      <h3 className="font-semibold text-lg line-clamp-1 mb-2">{service.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {service.description.replace(/<[^>]*>?/gm, '')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-[var(--star-filled)] fill-[var(--star-filled)]" />
                        <span className="font-semibold">{serviceRating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">
                          ({service.reviews?.length || 0})
                        </span>
                      </div>
                      {basicPackage && (
                        <span className="font-bold text-lg">From ${basicPackage.price}</span>
                      )}
                    </div>

                    <Button className="w-full" size="sm" asChild>
                      <Link href={`/service/${service.slug}`}>View Lesson Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Student Reviews ({reviews.length})
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-[var(--star-filled)] fill-[var(--star-filled)]" />
                  <span className="text-2xl font-bold">{seller.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">
                  Average rating from {seller.totalReviews} student reviews
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {latestReviews.map(review => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                        {review.client!.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold">{review.client!.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'text-[var(--star-filled)] fill-[var(--star-filled)]'
                              : 'text-[var(--star-empty)]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-foreground leading-relaxed">{review.comment}</p>
                  )}

                  {review.service && (
                    <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                      Session: {review.service.title}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {reviews.length > 3 && (
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link href={`/freelancer/${client.id}/reviews`}>
                  View all {reviews.length} reviews
                </Link>
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Skills Section */}
      {services.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Subjects & Teaching Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(services.flatMap(service => service.tags.map(tag => tag.name))))
              .slice(0, 15)
              .map(skill => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-sm py-2 px-4 hover:bg-primary/10 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
          </div>
        </section>
      )}

      {/* Work History */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{seller.totalOrders}</div>
              <div className="text-muted-foreground">Lessons Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{seller.servicesCount}</div>
              <div className="text-muted-foreground">Tutoring Sessions Offered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{seller.totalReviews}</div>
              <div className="text-muted-foreground">Student Reviews</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
