'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BusinessNavbar, BusinessFooter, BusinessAbstractLines } from '@/components/business';
import * as api from '@/services/api';
import { Candidate } from '@/types/api';

const { employerAPI } = api;
import BusinessPersonalInfoCard from '@/components/business/cards/BusinessPersonalInfoCard';
import BusinessHighlightsCard from '@/components/business/cards/BusinessHighlightsCard';
import BusinessResumeCard from '@/components/business/cards/BusinessResumeCard';

export default function BusinessCandidatePage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('employerAPI:', employerAPI);
        console.log('getCandidateInfo method:', employerAPI.getCandidateInfo);
        
        if (!employerAPI.getCandidateInfo) {
          throw new Error('getCandidateInfo method not found in employerAPI');
        }
        
        const response = await employerAPI.getCandidateInfo(candidateId);
        setCandidate(response.data);
      } catch (err) {
        setError('Failed to fetch candidate details. Please try again later.');
        console.error('Error fetching candidate details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidateDetails();
    } else {
      setError('Invalid candidate ID');
      setLoading(false);
    }
  }, [candidateId]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
        <BusinessAbstractLines />
        <BusinessNavbar />
        
        <main className="pt-24 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading candidate details...</p>
            </div>
          </div>
        </main>
        
        <BusinessFooter />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
        <BusinessAbstractLines />
        <BusinessNavbar />
        
        <main className="pt-24 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Candidate not found'}</p>
              <button
                onClick={handleBack}
                className="bg-brand-brown hover:bg-brand-brown-dark text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
        
        <BusinessFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
      <BusinessAbstractLines />
      <BusinessNavbar />
      
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
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <BusinessPersonalInfoCard candidate={candidate} />
            </motion.div>
            
            {/* Highlights Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <BusinessHighlightsCard candidate={candidate} />
            </motion.div>
            
            {/* Resume Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <BusinessResumeCard candidate={candidate} candidateId={candidateId} />
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
      
      <BusinessFooter />
    </div>
  );
}