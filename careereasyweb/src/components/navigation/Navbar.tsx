'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import config from '@/config';
import { candidateAPI } from '@/services/api';

interface NavigationItem {
  name: string;
  href: string;
  external?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Jobs', href: '/home' },
  { name: 'About Developer', href: 'https://junzezhang.com', external: true },
  { name: 'CareerEasy for Business', href: '/business' },
];

interface NavbarProps {
  hideGetStarted?: boolean;
  hideLogIn?: boolean;
  getStartedText?: string;
}

export default function Navbar({ hideGetStarted = false, hideLogIn = false, getStartedText = "Get Started" }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profilePicFetched, setProfilePicFetched] = useState(false);
  const router = useRouter();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof document !== 'undefined') {
        const candidateIdCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('candidate_id='))
          ?.split('=')[1];
        
        const candidateAccountIdCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('candidate_account_id='))
          ?.split('=')[1];
        
        const isLoggedIn = candidateIdCookie && candidateAccountIdCookie;
        setIsAuthenticated(!!isLoggedIn);
        setCandidateId(candidateIdCookie || null);
        
        // Fetch profile picture if authenticated and not already fetched
        if (isLoggedIn && candidateIdCookie && !profilePicFetched) {
          fetchProfilePicture(candidateIdCookie);
        } else if (!isLoggedIn) {
          setProfilePic(null);
          setProfilePicFetched(false);
        }
      }
    };

    checkAuth();
    // Check auth status periodically in case cookies change
    const interval = setInterval(checkAuth, 5000);
    return () => clearInterval(interval);
  }, [profilePicFetched]);

  const fetchProfilePicture = async (candidateId: string) => {
    try {
      const response = await candidateAPI.candidateInfo(candidateId);
      setProfilePic(response.data.profile_pic || null);
      setProfilePicFetched(true);
    } catch (error) {
      console.error('Failed to fetch profile picture:', error);
      setProfilePic(null);
      setProfilePicFetched(true); // Mark as fetched even on error to prevent retries
    }
  };

  const handleGetStarted = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    try {
      // Call logout API (adjust URL to match your Django backend)
      await fetch(`${config.API_BASE_URL}/candidate/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state and redirect
      setIsAuthenticated(false);
      setCandidateId(null);
      router.push('/');
    }
  };

  const handleProfile = () => {
    if (candidateId) {
      router.push(`/candidate_info/${candidateId}`);
    }
  };

  return (
    <>
      {/* Floating Navigation Bar */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <nav className="bg-brand-light-gray-50 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]" aria-label="Global">
          <div className="flex items-center justify-between h-14 px-5">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  src="/careereasy-logo.svg" 
                  alt="CareerEasy" 
                  className="h-8"
                />
              </div>
            </div>

            {/* Desktop Navigation - Fixed Center Position */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="text-comfortable hover:text-brand-navy font-medium text-sm transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-0.5 relative group"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-navy transition-all duration-300 group-hover:w-full"></span>
                  </a>
                ))}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-3">
                {isAuthenticated ? (
                  /* Authenticated state - show profile picture and logout */
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleProfile}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-300 hover:scale-110 flex items-center justify-center overflow-hidden"
                    >
                      {profilePic ? (
                        <Image
                          src={profilePic}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-gray-600 text-sm font-medium">
                          👤
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="text-comfortable hover:text-brand-navy font-medium text-sm transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-0.5 relative group"
                    >
                      Log out
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-navy transition-all duration-300 group-hover:w-full"></span>
                    </button>
                  </div>
                ) : (
                  /* Unauthenticated state - show login/signup */
                  <>
                    {!hideLogIn && (
                      <button 
                        onClick={handleLogin}
                        className="text-comfortable hover:text-brand-navy font-medium text-sm transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-0.5 relative group"
                      >
                        Log in
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-navy transition-all duration-300 group-hover:w-full"></span>
                      </button>
                    )}
                    {!hideGetStarted && (
                      <button 
                        onClick={handleGetStarted}
                        className="bg-brand-light-blue hover-bg-brand-light-blue-dark text-comfortable font-semibold text-sm py-2 px-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                      >
                        {getStartedText}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-300 hover:scale-110 hover:rotate-180"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-5 w-5" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed top-22 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-4 md:hidden z-40 animate-fadeIn">
          <div className="bg-brand-light-gray-50 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 animate-slideDown">
            <div className="space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="block px-4 py-2.5 text-sm font-medium text-comfortable hover:text-brand-navy hover:bg-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:translate-x-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex flex-col space-y-2">
                  {isAuthenticated ? (
                    /* Mobile authenticated state */
                    <>
                      <button 
                        onClick={handleProfile}
                        className="text-comfortable hover:text-brand-navy font-medium text-sm py-2 transition-all duration-300 hover:scale-105 hover:translate-x-2"
                      >
                        Profile
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="text-comfortable hover:text-brand-navy font-medium text-sm py-2 transition-all duration-300 hover:scale-105 hover:translate-x-2"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    /* Mobile unauthenticated state */
                    <>
                      {!hideLogIn && (
                        <button 
                          onClick={handleLogin}
                          className="text-comfortable hover:text-brand-navy font-medium text-sm py-2 transition-all duration-300 hover:scale-105 hover:translate-x-2"
                        >
                          Log in
                        </button>
                      )}
                      {!hideGetStarted && (
                        <button 
                          onClick={handleGetStarted}
                          className="bg-brand-light-blue hover-bg-brand-light-blue-dark text-comfortable font-semibold text-sm py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                        >
                          {getStartedText}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 