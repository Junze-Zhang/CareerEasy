'use client';

import { useState, useEffect } from 'react';
import { candidateAPI } from '@/services/api';
import { Job, JobsResponse } from '@/types/api';
import JobCard from '@/components/cards/JobCard';

export default function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

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
    } catch (err) {
      setError('Failed to fetch jobs. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchJobs(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => fetchJobs(currentPage)}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No jobs available at the moment.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevious}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  hasPrevious
                    ? 'bg-brand-light-blue hover:bg-brand-light-blue-dark text-black hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>

              <span className="text-comfortable font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNext}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  hasNext
                    ? 'bg-brand-light-blue hover:bg-brand-light-blue-dark text-black hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}