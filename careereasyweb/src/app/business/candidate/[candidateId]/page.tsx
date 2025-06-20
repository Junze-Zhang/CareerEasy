'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BusinessNavbar, BusinessFooter, BusinessAbstractLines } from '@/components/business';
import { employerAPI } from '@/services/api';
import { Candidate } from '@/types/api';
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
      
      <main className="pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            {/* Personal Information Card */}
            <BusinessPersonalInfoCard candidate={candidate} />
            
            {/* Highlights Card */}
            <BusinessHighlightsCard candidate={candidate} />
            
            {/* Resume Card */}
            <BusinessResumeCard candidate={candidate} candidateId={candidateId} />
          </div>
        </div>
      </main>
      
      <BusinessFooter />
    </div>
  );
}