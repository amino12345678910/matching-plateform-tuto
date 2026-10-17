'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {MessageSquare, Bell, User, ChevronDown, Compass, Briefcase, BarChart3} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AuthModal from '../auth/auth-dialog';
import {getUserInfo} from '@/hooks/shared/get-user-info';
import {authClient} from '../../lib/auth-client';
import {profilePhoto} from '../profile-url';
import {getNotifications} from '@/hooks/notification/get-notifications';
import {getStudentPointsData} from '@/hooks/points/points-actions';
import {Skeleton} from '../loading-primitives';
import {Coins} from 'lucide-react';
export const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState('');
  const [points, setPoints] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const getAuthAndNotifications = async () => {
      const {userId, role, image, imageSource, email} = await getUserInfo();
      if (userId && role && imageSource) {
        setIsAuth(true);
        setInitialLoading(false);
        setRole(role);
        const pfp = await profilePhoto({imageUrl: image, imageSource, email});
        setProfileImage(pfp);

        const [{success, notifications: localNotification}, ptsData] = await Promise.all([
          getNotifications({userId}),
          getStudentPointsData(),
        ]);
        setPoints(ptsData.points ?? 0);
        if (success && localNotification) {
          setNotifications(prev => [...prev, ...localNotification]);
        }
      }
      setInitialLoading(false);
    };

    getAuthAndNotifications();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {label: 'Explore Tutors', href: '/explore', icon: Compass, isPublic: true},
    {label: 'Messages', href: '/dashboard/messages', icon: MessageSquare, isPublic: false},
    {
      label: 'My Lessons',
      href: role === 'SELLER' ? '/dashboard/freelancer/bookings' : '/dashboard/client/bookings',
      icon: Briefcase,
      isPublic: false,
    },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    setIsAuth(false);
    setRole('');
    window.location.href = '/';
  };

  return (
    <>
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <nav
        className={`sticky top-0 z-[99] w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-background/90 backdrop-blur-sm border-b shadow-sm'
            : 'bg-background border-b'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-emerald-600">
                  9arrini<span className="text-gray-900 font-medium">.tn</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  قَرّيني
                </span>
              </Link>

              <div className="hidden lg:flex items-center gap-6 ml-8">
                {(isAuth ? navItems : navItems.filter(item => item.isPublic == true)).map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium  hover:text-foreground/90 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {initialLoading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-22 rounded-md hidden md:block" />
                </div>
              ) : isAuth ? (
                <>
                  <Link
                    href={role === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client/points'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors"
                    title="1 Point = 1 Dinar (DT)"
                  >
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    <span>{points} Pts</span>
                    <span className="text-emerald-600/80 font-medium hidden sm:inline">
                      ({points} DT)
                    </span>
                  </Link>

                  <Button variant="ghost" size="icon" className="relative" asChild>
                    <Link href="/notification">
                      <Bell className="h-5 w-5" />
                      {notifications.length > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                          {notifications.length}
                        </Badge>
                      )}
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="border-none py-1 bg-background gap-2 hover:opacity-95"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={profileImage}
                            alt="Profile Photo"
                            className="object-cover"
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden md:inline hover:opacity-90 ">Profile</span>
                        <ChevronDown className="h-4 w-4 hover:opacity-90 " />
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 py-2 px-1.5 ">
                      {role === 'USER' && (
                        <DropdownMenuItem onClick={() => router.push('/dashboard/client/points')}>
                          <Coins className="h-4 w-4 mr-2 text-amber-500" />
                          Points Account ({points} Pts = {points} DT)
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            role === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client'
                          )
                        }
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={handleLogout}
                      >
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                    className="hidden lg:inline-flex font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                  >
                    Walli Prof (Tutor) 🎓
                  </Button>

                  <Button
                    onClick={() => setIsOpen(true)}
                    size="sm"
                    className="hidden lg:inline-flex bg-emerald-600 hover:bg-emerald-700 font-semibold"
                  >
                    Dkhol / Register
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="lg:hidden">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsOpen(true)}>Sign In</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsOpen(true)}>
                        Become a Tutor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsOpen(true)}>Join Now</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>

        {isAuth && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
            <div className="flex items-center justify-around h-16">
              {navItems.slice(0, 3).map(item => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(item.href)}
                    className="flex flex-col items-center justify-center h-full"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs mt-1">{item.label}</span>
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(role === 'SELLER' ? '/dashboard/freelancer' : '/dashboard/client')
                }
                className="flex flex-col items-center justify-center h-full"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs mt-1">Dashboard</span>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
