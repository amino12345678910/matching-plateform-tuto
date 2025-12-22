'use client';

import {useState, useMemo, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {Separator} from '../ui/separator';
import {Avatar, AvatarFallback, AvatarImage} from '../ui/avatar';
import {Tabs, TabsList, TabsTrigger} from '../ui/tabs';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '../ui/accordion';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {ChevronRight, Star, Clock, RefreshCw, Shield, Zap, CheckCircle} from 'lucide-react';
import type {Service, ServicePackage} from '@/types/service';
import {allowClientOnly} from './validate/allow-user-only';
import {toast} from 'sonner';
import {ServiceCarousel} from '../autoplay-carousel';
import {bookService} from '@/hooks/book/book-service';
import {profilePhoto} from '../profile-url';
import Link from 'next/link';
import moment from 'moment';

export function ServiceDetailPage({service}: {service: Service}) {
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage['name']>('BASIC');
  const [isBooking, setIsBooking] = useState(false);
  const [avatar, setAvatar] = useState<string>('');

  const reviewCount = service.reviews.length;
  const avgRating = useMemo(
    () =>
      reviewCount === 0
        ? 0
        : (service.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1),
    [service.reviews, reviewCount]
  );

  const seller = service.seller;

  const sellerName = seller.user.name || 'Unknown';

  useEffect(() => {
    const init = async () => {
      const img = await profilePhoto({
        imageUrl: service.seller.user.image,
        imageSource: 'CLOUDINARY',
        email: service.seller.user.email || '',
      });
      setAvatar(img);
    };
    init();
  }, []);

  const avgResponseTime = useMemo(() => {
    const {hasSeen, createdAt} = service.bookings[0] || {};
    if (!hasSeen || !createdAt) return 'No responses yet';
    const now = moment();
    const created = moment(createdAt);
    const diffHours = now.diff(created, 'hours');
    return diffHours < 1 ? 'Less than an hour' : `${diffHours} hours`;
  }, []);

  const sortedPackages = useMemo(
    () =>
      [...service.packages].sort((a, b) => {
        const order = {BASIC: 1, STANDARD: 2, PREMIUM: 3};
        return order[a.name] - order[b.name];
      }),
    [service.packages]
  );

  const currentPackage = useMemo(
    () => sortedPackages.find(pkg => pkg.name === selectedPackage) || sortedPackages[0],
    [sortedPackages, selectedPackage]
  );

  // Booking handler
  const handleBooking = async () => {
    setIsBooking(true);
    try {
      const {disable, role, clientId, name: clientName} = await allowClientOnly();

      if (!role) {
        toast.info('Please log in to book this service');
        return;
      }

      if (disable) {
        toast.info(`${role} cannot book this service`);
        return;
      }

      if (clientId && clientName && currentPackage) {
        const {success, error, message} = await bookService({
          serviceName: service.title,
          packageName: currentPackage.name,
          packagePrice: currentPackage.price,
          revisions: currentPackage.revisions,
          delivery: currentPackage.delivery,
          role,
          sellerId: service.sellerId,
          serviceId: service.id,
          clientId,
          clientName,
          freelancerId: service.freelancerId,
        });

        if (success) {
          toast.success(message || 'Booking successful!');
        } else if (error) {
          toast.error(error);
        }
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to process booking');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Title & Meta */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs font-normal px-2 py-1">
                  {service.category?.name || 'Uncategorized'}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{avgRating}</span>
                  <span className="text-muted-foreground/60">•</span>
                  <span>{reviewCount} reviews</span>
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                {service.title}
              </h1>
            </div>

            {/* Media Gallery */}
            <div className="mb-10">
              <ServiceCarousel service={service} />
            </div>

            {/* Detailed Content Sections */}
            <div className="space-y-10">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">What's Included</h2>
                  <Badge variant="secondary" className="text-xs font-normal">
                    All Packages
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Source Files',
                    'Commercial License',
                    'Fully Responsive',
                    'Lifetime Updates',
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ///description */}
              <section>
                <h2 className="text-xl font-semibold mb-6">About This Service</h2>
                <div
                  className="prose max-w-none prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg"
                  dangerouslySetInnerHTML={{__html: service.description}}
                />
              </section>

              {/* Seller Profile */}
              <section className="py-6 pe-6 rounded-xl ">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-background">
                    <AvatarImage src={avatar} alt={sellerName} className="object-cover" />
                    <AvatarFallback className="text-base font-medium">
                      {sellerName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base truncate">{sellerName}</h3>
                      <Badge variant="outline" className="text-xs">
                        Top Rated
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{avgRating}</span>
                        <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Avg. {avgResponseTime} response time</span>
                      </div>
                    </div>
                  </div>

                  {/* user bio */}

                  <div>
                    <p>{}</p>
                  </div>
                  <Button variant="outline" size="sm" className="sm:self-start shrink-0" asChild>
                    <Link href={`/freelancer/${service.freelancerId}`}>
                      View Profile
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>

                {service.seller.bio && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.seller.bio}
                    </p>
                  </div>
                )}
              </section>

              {/* FAQ*/}
              <section>
                <h2 className="text-xl font-semibold mb-6">FAQ</h2>
                {service.faqs && service.faqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                    {service.faqs.map((faq, index) => (
                      <AccordionItem value={`item-${index + 1}`} key={index}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent key={index} className="flex flex-col gap-4 text-balance">
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-8 text-muted-foreground rounded-lg border">
                    No FAQs available
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Package Selector Card */}
              <Card className="border shadow-lg shadow-primary/5 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4 px-6 pt-6">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Select Package</span>
                    <Badge variant="outline" className="text-xs font-normal">
                      Most Popular
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-6 pb-6 space-y-6">
                  {/* Package Tabs */}
                  <div className="space-y-4">
                    <Tabs
                      value={selectedPackage}
                      onValueChange={setSelectedPackage as any}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-3 w-full rounded-lg mb-3 h-auto border">
                        {sortedPackages.map(pkg => (
                          <TabsTrigger
                            key={pkg.id}
                            value={pkg.name}
                            className="rounded-md py-2   data-[state=active]:bg-primary data-[state=active]:shadow-md data-[state=active]:border-secondary/50"
                          >
                            <div className="text-center">
                              <div className="font-medium text-sm">{pkg.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                ${pkg.price}
                              </div>
                            </div>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>

                    {/* Selected Package Details */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">${currentPackage.price}</span>
                          <span className="text-sm text-muted-foreground">one-time payment</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {currentPackage.description}
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Delivery Time</span>
                          </div>
                          <span className="font-medium">{currentPackage.delivery} days</span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Revisions</span>
                          </div>
                          <span className="font-medium">{currentPackage.revisions}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="w-full h-12 text-base font-semibold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
                    >
                      {isBooking ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue with {currentPackage.name}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>Secure payment</span>
                      </div>
                      <div className="h-3 w-px bg-border" />
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span>24/7 support</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Signals */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">Money-Back Guarantee</p>
                    <p className="text-xs text-muted-foreground truncate">
                      30-day satisfaction guarantee
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg border bg-card">
                    <p className="text-sm font-medium">100%</p>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                  </div>
                  <div className="text-center p-3 rounded-lg border bg-card">
                    <p className="text-sm font-medium">{reviewCount}+</p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ServiceDetailPage;
