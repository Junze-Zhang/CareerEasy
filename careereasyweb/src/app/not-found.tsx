'use client';

import Link from 'next/link';
import { Navbar, Footer, AbstractLines } from '@/components';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
      <AbstractLines />
      <Navbar />
      
      <main className="pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8">
              The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            </p>
            <div className="space-x-4">
              <Link
                href="/"
                className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 inline-block"
              >
                Go Home
              </Link>
              <Link
                href="/home"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 inline-block"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}