'use client';

import { useState, useEffect } from 'react';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
            {/* Job Detail Card with Back Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <JobDetailCard job={job} showBackButton={true} onBack={handleBack} />
            </motion.div>
            
            {/* Job Fit Analysis Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <JobFitCard jobId={job.id} />
            </motion.div>
            
            {/* Job Description Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <JobDescriptionCard job={job} />
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  );
}