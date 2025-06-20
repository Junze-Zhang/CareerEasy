'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BusinessNavbar, BusinessFooter, BusinessAbstractLines } from '@/components/business';
import { employerAPI } from '@/services/api';
import { Candidate, CandidatesResponse, RankQuery } from '@/types/api';
import BusinessCandidateCard from '@/components/business/cards/BusinessCandidateCard';

interface QueryResponse {
  query_id: string;
  minimal_years_of_experience?: number;
  maximal_years_of_experience?: number;
  preferred_title_keywords?: string[];
  high_priority_keywords?: string[];
  low_priority_keywords?: string[];
}

export default function BusinessHomePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1024);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<RankQuery | null>(null);
  
  const PAGE_SIZE = 10;

  const fetchCandidates = async (page: number = 1, useRanking: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      setWarning(null);
      
      let response;
      if (useRanking && searchParams) {
        response = await employerAPI.getRankedCandidates(searchParams, page, PAGE_SIZE);
      } else {
        response = await employerAPI.getCandidates(page, PAGE_SIZE);
      }
      
      const candidatesData: CandidatesResponse = response.data;
      
      setCandidates(candidatesData.items);
      setCurrentPage(candidatesData.current_page);
      setHasNext(candidatesData.has_next);
      setHasPrevious(candidatesData.has_previous);
      setTotalPages(candidatesData.total_pages);
      setTotalCount(candidatesData.total_count);
    } catch (err) {
      setError('Failed to fetch candidates. Please try again later.');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1);
    
    // Handle window resize for responsive pagination
    const handleResize = () => setWindowWidth(window.innerWidth);
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchCandidates(newPage, !!searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setError(null);
      setWarning(null);
      
      // Call natural language query API
      const queryResponse = await employerAPI.naturalLanguageQuery(searchQuery);
      const queryData: QueryResponse = queryResponse.data;
      
      // Prepare rank query parameters
      const rankParams: RankQuery = {
        minimal_years_of_experience: queryData.minimal_years_of_experience,
        maximal_years_of_experience: queryData.maximal_years_of_experience,
        preferred_title_keywords: queryData.preferred_title_keywords,
        high_priority_keywords: queryData.high_priority_keywords,
        low_priority_keywords: queryData.low_priority_keywords,
      };
      
      setSearchParams(rankParams);
      setCurrentPage(1);
      
      // Fetch ranked candidates directly with the rank parameters
      try {
        const response = await employerAPI.getRankedCandidates(rankParams, 1, PAGE_SIZE);
        const candidatesData: CandidatesResponse = response.data;
        
        setCandidates(candidatesData.items);
        setCurrentPage(candidatesData.current_page);
        setHasNext(candidatesData.has_next);
        setHasPrevious(candidatesData.has_previous);
        setTotalPages(candidatesData.total_pages);
        setTotalCount(candidatesData.total_count);
      } catch (rankErr) {
        throw rankErr; // Re-throw to be caught by outer catch
      }
    } catch (err: unknown) {
      // Check if it's a 400 error from the query endpoint (invalid query)
      if (err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 'status' in err.response && 
          err.response.status === 400) {
        const errorData = err.response && typeof err.response === 'object' && 'data' in err.response ? err.response.data : null;
        const errorMessage = errorData && typeof errorData === 'object' && 'Error' in errorData 
          ? String(errorData.Error) 
          : 'Your search query could not be understood.';
        setWarning(`⚠️ ${errorMessage} Showing all candidates instead.`);
        
        // Clear search params and show default ordering
        setSearchParams(null);
        setSearchQuery('');
        setCurrentPage(1);
        
        // Fetch default candidates
        try {
          const response = await employerAPI.getCandidates(1, PAGE_SIZE);
          const candidatesData: CandidatesResponse = response.data;
          
          setCandidates(candidatesData.items);
          setCurrentPage(candidatesData.current_page);
          setHasNext(candidatesData.has_next);
          setHasPrevious(candidatesData.has_previous);
          setTotalPages(candidatesData.total_pages);
          setTotalCount(candidatesData.total_count);
        } catch (defaultErr) {
          setError('Failed to load candidates. Please try again later.');
          console.error('Error loading default candidates:', defaultErr);
        }
      } else {
        setError('Failed to search candidates. Please try again later.');
        console.error('Error searching candidates:', err);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchParams(null);
    setSearchQuery('');
    setCurrentPage(1);
    setWarning(null);
    fetchCandidates(1, false);
  };

  return (
    <>
      <BusinessNavbar />
      
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <BusinessAbstractLines />
      </div>
      
      <motion.section 
        className="pt-24 pb-16 lg:pt-32 lg:pb-20 min-h-screen relative"
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
              Find Top Talent
            </h1>
            <p className="hero-subtitle text-comfortable mb-8">
              Discover exceptional candidates with our AI-powered recruitment platform
            </p>

            {/* Search Bar */}
            <div className="w-full">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for candidates (e.g., python developer, machine learning engineer)"
                    className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-brown focus:border-transparent"
                    disabled={isSearching}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className={`px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 ${
                    isSearching || !searchQuery.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-brand-brown hover:bg-brand-brown-dark text-white hover:scale-105 active:scale-95'
                  }`}
                >
                  {isSearching ? 'SEARCHING...' : 'SEARCH'}
                </button>
              </div>
              
              {searchParams && (
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm text-gray-600">AI-powered search results</span>
                  <button
                    onClick={handleClearSearch}
                    className="text-sm text-brand-brown hover:text-brand-brown-dark transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Search Notification */}
          {isSearching && (
            <motion.div
              className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-amber-700 font-medium">
                  Searching with Generative AI. This may take some minutes...
                </span>
              </div>
            </motion.div>
          )}

          {/* Warning Message */}
          {warning && (
            <motion.div
              className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-yellow-700 font-medium">{warning}</span>
            </motion.div>
          )}

          {/* Candidate Cards */}
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading candidates...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchCandidates(currentPage, !!searchParams)}
                  className="bg-brand-brown hover:bg-brand-brown-dark text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Try Again
                </button>
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No candidates found.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 sm:items-stretch">
                  {candidates.map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                    >
                      <BusinessCandidateCard candidate={candidate} />
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
                        Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} results
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
                          const showPages = windowWidth < 640 ? 3 : windowWidth < 1024 ? 5 : 7;
                          let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                          const endPage = Math.min(totalPages, startPage + showPages - 1);
                          
                          if (endPage - startPage < showPages - 1) {
                            startPage = Math.max(1, endPage - showPages + 1);
                          }

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

                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <motion.button
                                key={i}
                                onClick={() => handlePageChange(i)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  i === currentPage
                                    ? 'bg-brand-brown text-white shadow-md'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {i}
                              </motion.button>
                            );
                          }

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
      
      <BusinessFooter />
    </>
  );
}