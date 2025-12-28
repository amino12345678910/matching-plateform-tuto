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
export const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileImage, setProfileImage] = useState('');

  // Check auth status
  useEffect(() => {
    const getAuth = async () => {
      const {userId, role, image, imageSource, email} = await getUserInfo();
      if (userId && role && imageSource) {
        setIsAuth(true);
        setRole(role);
        const pfp = await profilePhoto({imageUrl: image, imageSource, email});
        setProfileImage(pfp);
      }
    };
    getAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {label: 'Explore', href: '/explore', icon: Compass, isPublic: true},
    {label: 'About', href: '/about', icon: Compass, isPublic: true},
    {label: 'Messages', href: '/dashboard/messages', icon: MessageSquare, isPublic: false},
    {label: 'Orders', href: '/dashboard/orders', icon: Briefcase, isPublic: false},
  ];

  return (
    <>
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <nav
        className={`sticky top-0 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-background/90 backdrop-blur-sm border-b shadow-sm'
            : 'bg-background border-b'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  FiveS<span className="text-primary">.</span>
                </h1>
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

            {/* Right Section - Actions */}
            <div className="flex items-center gap-3">
              {/* Auth Buttons */}
              {isAuth ? (
                <>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                      3
                    </Badge>
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
                        onClick={() => authClient.deleteUser()}
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
                    className="hidden lg:inline-flex"
                  >
                    Become a Seller
                  </Button>

                  <Button
                    onClick={() => setIsOpen(true)}
                    size="sm"
                    className="hidden lg:inline-flex"
                  >
                    Join
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
                        Become a Seller
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

      {isAuth && <div className="lg:hidden h-16"></div>}
    </>
  );
};

export default Navbar;
