import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe, Menu, X, UserCircle, LogOut, Home, Map, Briefcase, Phone } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router=useRouter();
  const pathname = usePathname();
  const { user, logoutMutation } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Globe className="text-primary text-2xl" />
          <Link href="/">
            <span className="text-2xl font-bold text-secondary cursor-pointer">TravelEase</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/">
            <span className={`font-medium transition cursor-pointer ${pathname === '/' ? 'text-primary' : 'hover:text-primary'}`}>Home</span>
          </Link>
          <Link href="/explore">
            <span className={`font-medium transition cursor-pointer ${pathname === '/explore' ? 'text-primary' : 'hover:text-primary'}`}>Explore</span>
          </Link>
          {user && (
            <Link href="/dashboard">
              <span className={`font-medium transition cursor-pointer ${pathname === '/dashboard' ? 'text-primary' : 'hover:text-primary'}`}>My Trips</span>
            </Link>
          )}
          <Link href="/transportation">
            <span className={`font-medium transition cursor-pointer ${pathname === '/transportation' ? 'text-primary' : 'hover:text-primary'}`}>Transportation</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-white">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>My Trips</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/trip-planner">
                    <DropdownMenuItem className="cursor-pointer">
                      <Map className="mr-2 h-4 w-4" />
                      <span>Plan a Trip</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hidden md:block text-primary font-medium hover:text-primary-dark">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="hidden md:block bg-primary text-white font-medium hover:bg-opacity-90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          
          <button 
            className="md:hidden text-secondary text-xl"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4 px-6 absolute w-full z-50">
          <div className="flex flex-col space-y-4">
            <Link href="/">
              <span 
                className={`font-medium py-2 cursor-pointer flex items-center ${pathname === '/' ? 'text-primary' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="inline-block mr-2 h-5 w-5" />
                Home
              </span>
            </Link>
            <Link href="/explore">
              <span 
                className={`font-medium py-2 cursor-pointer flex items-center ${pathname === '/explore' ? 'text-primary' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Map className="inline-block mr-2 h-5 w-5" />
                Explore
              </span>
            </Link>
            {user && (
              <Link href="/dashboard">
                <span 
                  className={`font-medium py-2 cursor-pointer flex items-center ${pathname === '/dashboard' ? 'text-primary' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Briefcase className="inline-block mr-2 h-5 w-5" />
                  My Trips
                </span>
              </Link>
            )}
            <Link href="/transportation">
              <span 
                className={`font-medium py-2 cursor-pointer flex items-center ${pathname === '/transportation' ? 'text-primary' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone className="inline-block mr-2 h-5 w-5" />
                Transportation
              </span>
            </Link>
            
            {user ? (
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="mt-4"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            ) : (
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    className="w-full bg-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
