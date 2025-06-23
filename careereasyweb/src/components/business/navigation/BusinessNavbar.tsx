'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  external?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/business/home' },
  // { name: 'Candidates', href: '/business/candidates' },
  { name: 'CareerEasy', href: '/' },
  { name: 'About Developer', href: 'https://junzezhang.com', external: true },
];

interface BusinessNavbarProps {
  hideGetStarted?: boolean;
  hideLogIn?: boolean;
  getStartedText?: string;
}

export default function BusinessNavbar({ hideGetStarted = true, hideLogIn = true, getStartedText = "Get Started" }: BusinessNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleGetStarted = () => {
    // TODO: Implement business signup
    router.push('/business/signup');
  };

  const handleLogin = () => {
    // TODO: Implement business login
    router.push('/business/login');
  };

  return (
    <>
      {/* Floating Navigation Bar */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <nav className="bg-brand-light-brown-50 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]" aria-label="Global">
          <div className="flex items-center justify-between h-14 px-5">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  src="/careereasy-business-logo.svg" 
                  alt="CareerEasy Business" 
                  className="h-10"
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
                    className="text-comfortable hover:text-brand-brown font-medium text-sm transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-0.5 relative group"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-brown transition-all duration-300 group-hover:w-full"></span>
                  </a>
                ))}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-3">
                {!hideLogIn && (
                  <button 
                    onClick={handleLogin}
                    className="text-comfortable hover:text-brand-brown font-medium text-sm transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-0.5 relative group"
                  >
                    Log in
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-brown transition-all duration-300 group-hover:w-full"></span>
                  </button>
                )}
                {!hideGetStarted && (
                  <button 
                    onClick={handleGetStarted}
                    className="bg-brand-brown hover:bg-brand-brown-dark text-white font-semibold text-sm py-2 px-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    {getStartedText}
                  </button>
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
          <div className="bg-brand-light-brown-50 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 animate-slideDown">
            <div className="space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="block px-4 py-2.5 text-sm font-medium text-comfortable hover:text-brand-brown hover:bg-white/30 rounded-xl transition-all duration-300 hover:scale-105 hover:translate-x-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex flex-col space-y-2">
                  {!hideLogIn && (
                    <button 
                      onClick={handleLogin}
                      className="text-comfortable hover:text-brand-brown font-medium text-sm py-2 transition-all duration-300 hover:scale-105 hover:translate-x-2"
                    >
                      Log in
                    </button>
                  )}
                  {!hideGetStarted && (
                    <button 
                      onClick={handleGetStarted}
                      className="bg-brand-brown hover:bg-brand-brown-dark text-white font-semibold text-sm py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                    >
                      {getStartedText}
                    </button>
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