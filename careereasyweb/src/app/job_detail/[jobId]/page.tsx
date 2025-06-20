'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar, Footer, AbstractLines } from '@/components';
import { candidateAPI } from '@/services/api';
import { Job } from '@/types/api';
import JobDetailCard from '@/components/cards/JobDetailCard';
import JobFitCard from '@/components/cards/JobFitCard';
import JobDescriptionCard from '@/components/cards/JobDescriptionCard';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await candidateAPI.getJobDetails(jobId);
        setJob(response.data);
      } catch (err) {
        setError('Failed to fetch job details. Please try again later.');
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
        <AbstractLines />
        <Navbar />
        
        <main className="pt-24 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading job details...</p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
        <AbstractLines />
        <Navbar />
        
        <main className="pt-24 pb-16 relative z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Job not found'}</p>
              <button
                onClick={handleBack}
                className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
      <AbstractLines />
      <Navbar />
      
      <main className="pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              BACK
            </button>
          </div>

          <div className="space-y-6">
            {/* Job Detail Card */}
            <JobDetailCard job={job} />
            
            {/* Job Fit Analysis Card */}
            <JobFitCard jobId={job.id} />
            
            {/* Job Description Card */}
            <JobDescriptionCard job={job} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}