// components/freelancer/FreelancerProfileView.tsx
'use client';

import React, {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  CheckCircle,
  MapPin,
  Globe,
  Calendar,
  MessageSquare,
  Briefcase,
  Award,
  ChevronRight,
  ExternalLink,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Heart,
  Share2,
  Mail,
  Phone,
  Video,
  FileText,
  Download,
  Filter,
  ThumbsUp,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Progress} from '@/components/ui/progress';
import {Textarea} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {cloudinaryUrl} from '@/lib/cloudinary';

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  category: {
    name: string;
    slug: string;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  packages: Array<{
    name: string;
    price: number;
    delivery: number;
    revisions: number;
    description: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    user: {
      name: string;
      image: string | null;
    };
  }>;
  _count: {
    bookings: number;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  service: {
    title: string;
    slug: string;
  };
  user: {
    name: string;
    image: string | null;
  };
}

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: string;
  };
  seller: {
    id: string;
    bio: string | null;
    profilePhoto: string;
    isVerified: boolean;
    joinedDate: string;
    servicesCount: number;
    totalReviews: number;
    averageRating: number;
    totalOrders: number;
  } | null;
  services: Service[];
  reviews: Review[];
}

interface FreelancerProfileViewProps {
  profileData: ProfileData;
}

export default function FreelancerProfileView({profileData}: FreelancerProfileViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedService, setSelectedService] = useState<string | null>(null);

  if (!profileData.seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>This user is not registered as a freelancer.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const {user, seller, services, reviews} = profileData;

  // Calculate statistics
  const totalRatings = reviews.length;
  const positiveReviews = reviews.filter(r => r.rating >= 4).length;
  const positiveRate = totalRatings > 0 ? (positiveReviews / totalRatings) * 100 : 0;

  // Get top services
  const topServices = services.sort((a, b) => b._count.bookings - a._count.bookings).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start gap-6">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={seller.profilePhoto} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    {seller.isVerified && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Seller
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-lg">{seller.averageRating}</span>
                      <span className="text-gray-500">({seller.totalReviews} reviews)</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span>{seller.totalOrders} orders completed</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(seller.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6 max-w-3xl">
                    {seller.bio || 'No biography available.'}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Contact Me
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Heart className="h-4 w-4" />
                      Save Profile
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <Card className="lg:w-80">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="font-bold">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Delivery Time</span>
                    <span className="font-bold">24h</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Order Completion</span>
                    <span className="font-bold">{seller.totalOrders}</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Positive Reviews</span>
                    <span className="font-bold">{positiveRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={positiveRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Top Services */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Popular Services</h2>
                <Link
                  href="#services"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topServices.map(service => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                        <Badge variant="outline">{service.category.name}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold">
                            {service.reviews.length > 0
                              ? (
                                  service.reviews.reduce((sum, r) => sum + r.rating, 0) /
                                  service.reviews.length
                                ).toFixed(1)
                              : '0.0'}
                          </span>
                          <span className="text-gray-500">({service.reviews.length})</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {service._count.bookings} orders
                        </div>
                      </div>

                      <div className="space-y-2">
                        {service.packages.slice(0, 2).map(pkg => (
                          <div key={pkg.name} className="flex items-center justify-between text-sm">
                            <span>{pkg.name}</span>
                            <span className="font-bold">${pkg.price}</span>
                          </div>
                        ))}
                      </div>

                      <Button className="w-full mt-4" asChild>
                        <Link href={`/service/${service.slug}`}>View Service</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
            {/* Recent Reviews */}
            {reviews.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Reviews</h2>

                <div className="space-y-4">
                  {reviews.slice(0, 3).map(review => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.user.image || ''} />
                            <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{review.user.name}</h4>
                                <Link
                                  href={`/service/${review.service.slug}`}
                                  className="text-sm text-primary hover:underline"
                                >
                                  {review.service.title}
                                </Link>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="text-gray-700 mb-2">{review.comment}</p>

                            <div className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Services ({services.length})</h2>

              <div className="flex items-center gap-4">
                <Select value={selectedService || ''} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Array.from(new Set(services.map(s => s.category.name))).map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort By
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services
                .filter(
                  service =>
                    !selectedService ||
                    selectedService === 'all' ||
                    service.category.name === selectedService
                )
                .map(service => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    {service.images.length > 0 && (
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <Image
                          src={cloudinaryUrl(service.images[0], 'q_40,f_auto,w_600')}
                          alt={service.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover h-full transition-transform duration-500 group-hover:scale-[102%]"
                        />
                        {/* <Image
                          src={cloudinaryUrl(service.images[0], 'q_30,f_auto')}
                          alt={service.title}
                          fill
                          className="object-cover"
                        /> */}
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                        <Badge variant="outline">{service.category.name}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3 mb-4">
                        {service.tags.slice(0, 3).map(tag => (
                          <Badge key={tag.slug} variant="secondary" className="mr-2">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-2">
                        {service.packages.map(pkg => (
                          <div
                            key={pkg.name}
                            className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <span className="font-medium">{pkg.name}</span>
                              <div className="text-xs text-gray-500">
                                Delivery: {pkg.delivery} day{pkg.delivery !== 1 ? 's' : ''} •{' '}
                                {pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <span className="font-bold text-lg">${pkg.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-bold">
                            {service.reviews.length > 0
                              ? (
                                  service.reviews.reduce((sum, r) => sum + r.rating, 0) /
                                  service.reviews.length
                                ).toFixed(1)
                              : '0.0'}
                          </span>
                          <span className="text-gray-500">({service.reviews.length})</span>
                        </div>

                        <Button size="sm" asChild>
                          <Link href={`/service/${service.slug}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-8">
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Coming Soon</h3>
                <p className="text-gray-600 mb-6">
                  {user.name} is currently working on their portfolio. Check back soon to see their
                  amazing work!
                </p>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Portfolio Samples
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-8">
            {/* Reviews Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3">
                    <div className="text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                        <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                        <span className="text-4xl font-bold">{seller.averageRating}</span>
                      </div>
                      <div className="text-gray-600 mb-4">{seller.totalReviews} total reviews</div>

                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const count = reviews.filter(r => r.rating === rating).length;
                          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

                          return (
                            <div key={rating} className="flex items-center gap-2">
                              <div className="w-16 text-sm">{rating} stars</div>
                              <Progress value={percentage} className="flex-1 h-2" />
                              <div className="w-10 text-sm text-right">{count}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-2/3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {positiveRate.toFixed(0)}%
                        </div>
                        <div className="text-sm text-blue-600">Positive Reviews</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">98%</div>
                        <div className="text-sm text-green-600">Response Rate</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-700">24h</div>
                        <div className="text-sm text-purple-600">Avg. Response Time</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-700">
                          {seller.totalOrders}
                        </div>
                        <div className="text-sm text-orange-600">Orders Completed</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Trust & Safety</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        All transactions are protected by our secure payment system. Your
                        satisfaction is guaranteed.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Reviews */}
            <div className="space-y-6">
              {reviews.map(review => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={review.user.image || ''} />
                        <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{review.user.name}</h4>
                            <Link
                              href={`/service/${review.service.slug}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {review.service.title}
                            </Link>
                          </div>

                          <div className="flex items-center gap-4 mt-2 lg:mt-0">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < review.rating
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{review.comment}</p>

                        <div className="flex gap-3">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Helpful
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle>About {user.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {seller.bio ? (
                        <p className="text-gray-700 whitespace-pre-line">{seller.bio}</p>
                      ) : (
                        <p className="text-gray-500 italic">No biography provided yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills & Expertise */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {services
                        .flatMap(service => service.tags.map(tag => tag.name))
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .slice(0, 20)
                        .map(skill => (
                          <Badge key={skill} variant="secondary" className="text-sm py-1.5 px-3">
                            {skill}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <span className="text-sm">{user.email}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <span className="text-sm">English, Spanish</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span className="text-sm">Online now</span>
                    </div>

                    <Separator />

                    <Button className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Send Message
                    </Button>

                    <Button variant="outline" className="w-full gap-2">
                      <Video className="h-4 w-4" />
                      Schedule a Call
                    </Button>
                  </CardContent>
                </Card>

                {/* Work History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Work History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Completed Projects</span>
                        <span className="font-bold">{seller.totalOrders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Services Offered</span>
                        <span className="font-bold">{seller.servicesCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Member Since</span>
                        <span className="font-bold">
                          {new Date(seller.joinedDate).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Badges & Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Badges & Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {seller.isVerified && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <div>
                          <div className="font-medium">Verified Seller</div>
                          <div className="text-sm text-blue-600">Identity confirmed</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Award className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-medium">Top Rated</div>
                        <div className="text-sm text-green-600">
                          Consistently delivers great work
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                      <div>
                        <div className="font-medium">Level 2 Seller</div>
                        <div className="text-sm text-purple-600">Advanced seller status</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
