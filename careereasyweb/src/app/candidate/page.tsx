'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar, Footer, AbstractLines } from '@/components';
import { candidateAPI } from '@/services/api';
import { Candidate } from '@/types/api';

export default function CandidatePage() {
  const router = useRouter();
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Candidate | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get candidate ID from cookies
  useEffect(() => {
    const getCandidateIdFromCookies = () => {
      if (typeof document !== 'undefined') {
        const candidateIdCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('candidate_id='))
          ?.split('=')[1];
        
        if (candidateIdCookie) {
          setCandidateId(candidateIdCookie);
        } else {
          setError('No candidate ID found in cookies. Please log in.');
          setLoading(false);
        }
      }
    };

    getCandidateIdFromCookies();
  }, []);

  const checkIsOwnProfile = useMemo(() => {
    if (typeof document !== 'undefined') {
      const loggedInCandidateId = document.cookie
        .split('; ')
        .find(row => row.startsWith('candidate_id='))
        ?.split('=')[1];
      return candidateId === loggedInCandidateId;
    }
    return false;
  }, [candidateId]);

  const fetchProfile = async () => {
    if (!candidateId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await candidateAPI.candidateInfo(candidateId);
      const profileData = response.data;
      setProfile(profileData);
      setIsOwnProfile(checkIsOwnProfile);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 404) {
        setError('Candidate not found');
      } else {
        setError('Failed to load profile');
      }
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [candidateId, checkIsOwnProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
        <AbstractLines />
        <Navbar />
        <motion.main 
          className="pt-24 pb-16 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading candidate profile...</p>
          </div>
        </motion.main>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
        <AbstractLines />
        <Navbar />
        <motion.main 
          className="pt-24 pb-16 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Profile Not Found</h1>
              <p className="text-gray-600 mb-6">{error || 'Candidate profile not found'}</p>
              <button
                onClick={() => router.back()}
                className="bg-brand-navy hover:bg-brand-navy-dark text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Go Back
              </button>
            </div>
          </div>
        </motion.main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
      <AbstractLines />
      <Navbar />
      
      <motion.main 
        className="pt-24 pb-16 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            className="space-y-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Personal Information Card */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl border border-gray-100 relative"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Back Button - Top Left */}
              <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-all group z-10"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              <div className="p-8">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {profile.profile_pic && profile.profile_pic.trim() !== '' ? (
                      <div className="w-32 h-32 relative">
                        <Image
                          src={profile.profile_pic}
                          alt={`${profile.name || 'Candidate'} profile`}
                          fill
                          className="object-cover rounded-full border-4 border-white shadow-lg"
                          sizes="128px"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-gray-600 text-3xl font-medium">
                          {(profile.name || profile.first_name || 'N').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous'}
                      </h1>
                      <p className="text-xl text-gray-600 mb-4">{profile.title || 'No title specified'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700">{profile.email || 'No email provided'}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-700">{profile.phone || 'No phone provided'}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-700">{profile.location || 'No location provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Debug Info */}
            <motion.div
              className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-yellow-800 mb-4">Debug Info (Cookie-based routing)</h2>
              <div className="space-y-2 text-sm">
                <p className="text-yellow-700">Candidate ID from cookies: <code className="bg-yellow-100 px-2 py-1 rounded">{candidateId}</code></p>
                <p className="text-yellow-700">Is Own Profile: <code className="bg-yellow-100 px-2 py-1 rounded">{isOwnProfile ? 'Yes' : 'No'}</code></p>
                <p className="text-yellow-700">Page loaded successfully without dynamic routing!</p>
              </div>
            </motion.div>

            {/* Highlights */}
            {profile.ai_highlights && profile.ai_highlights.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Generated Highlights</h2>
                <div className="space-y-3">
                  {profile.ai_highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <p className="text-gray-700">{highlight}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  );
}