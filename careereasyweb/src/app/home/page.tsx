'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer, AbstractLines } from '@/components';
import { candidateAPI } from '@/services/api';
import { Job, JobsResponse } from '@/types/api';
import JobCard from '@/components/cards/JobCard';

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1024); // Default to desktop

  const fetchJobs = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await candidateAPI.getPostedJobs(page, 20);
      const jobsData: JobsResponse = response.data;
      
      setJobs(jobsData.items);
      setCurrentPage(jobsData.current_page);
      setHasNext(jobsData.has_next);
      setHasPrevious(jobsData.has_previous);
      setTotalPages(jobsData.total_pages);
      setTotalCount(jobsData.total_count);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
    
    // Handle window resize for responsive pagination
    const handleResize = () => setWindowWidth(window.innerWidth);
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchJobs(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
      <Navbar />
      
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <AbstractLines />
      </div>
      
      <motion.section 
        className="pt-24 pb-16 lg:pt-32 lg:pb-20 min-h-screen relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container-max section-padding relative z-10">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="hero-title text-comfortable mb-4">
              Explore Available Opportunities
            </h1>
            <p className="hero-subtitle text-comfortable">
              Discover your next career move with our curated job listings from top companies
            </p>
          </motion.div>

          {/* Job Cards */}
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchJobs(currentPage)}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No jobs available at the moment.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                    >
                      <JobCard job={job} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div 
                    className="flex flex-col sm:flex-row items-center justify-between mt-8 mb-4 gap-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    {/* Results text - Left side */}
                    <div className="order-2 sm:order-1">
                      <span className="text-sm text-gray-600 font-medium">
                        Showing {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, totalCount)} of {totalCount} results
                      </span>
                    </div>

                    {/* Pagination Controls - Right side */}
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                      {/* Previous Button */}
                      <motion.button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPrevious}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          hasPrevious
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        whileHover={hasPrevious ? { scale: 1.05 } : {}}
                        whileTap={hasPrevious ? { scale: 0.95 } : {}}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Previous</span>
                      </motion.button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {(() => {
                          const pages = [];
                          // Responsive page count: 3 on mobile, 5 on tablet, 7 on desktop
                          const showPages = windowWidth < 640 ? 3 : windowWidth < 1024 ? 5 : 7;
                          let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                          const endPage = Math.min(totalPages, startPage + showPages - 1);
                          
                          // Adjust start if we're near the end
                          if (endPage - startPage < showPages - 1) {
                            startPage = Math.max(1, endPage - showPages + 1);
                          }

                          // First page
                          if (startPage > 1) {
                            pages.push(
                              <motion.button
                                key={1}
                                onClick={() => handlePageChange(1)}
                                className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-gray-100"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                1
                              </motion.button>
                            );
                            if (startPage > 2) {
                              pages.push(<span key="dots1" className="text-gray-400 px-1 text-sm">...</span>);
                            }
                          }

                          // Page numbers in range
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <motion.button
                                key={i}
                                onClick={() => handlePageChange(i)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  i === currentPage
                                    ? 'bg-brand-navy text-white shadow-md'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {i}
                              </motion.button>
                            );
                          }

                          // Last page
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(<span key="dots2" className="text-gray-400 px-1 text-sm">...</span>);
                            }
                            pages.push(
                              <motion.button
                                key={totalPages}
                                onClick={() => handlePageChange(totalPages)}
                                className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-gray-100"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {totalPages}
                              </motion.button>
                            );
                          }

                          return pages;
                        })()}
                      </div>

                      {/* Next Button */}
                      <motion.button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNext}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          hasNext
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        whileHover={hasNext ? { scale: 1.05 } : {}}
                        whileTap={hasNext ? { scale: 0.95 } : {}}
                      >
                        <span className="hidden sm:inline">Next</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </motion.section>
      
      <Footer />
    </div>
  );
}