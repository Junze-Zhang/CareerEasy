'use client';

import Image from 'next/image';
import { Job } from '@/types/api';

interface JobDetailCardProps {
  job: Job;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function JobDetailCard({ job, showBackButton = false, onBack }: JobDetailCardProps) {
  const formatLocation = () => {
    const location = job.company__location || '';
    const country = job.company__country || '';
    
    if (location && country) {
      return `${location}, ${country}`;
    }
    return location || country || 'Location not specified';
  };

  const getJobLevelPrefix = () => {
    if (!job.level) return '';
    
    const level = job.level.toLowerCase();
    // Handle single character codes
    if (level === 'ng') return 'New Graduate ';
    if (level === 'j') return 'Junior ';
    if (level === 's') return 'Senior ';
    if (level === 'i') return 'Intermediate ';
    if (level === 'u') return ''; // Unspecified - no prefix
    
    // Handle full names as fallback
    if (level.includes('new graduate')) return 'New Graduate ';
    if (level.includes('junior')) return 'Junior ';
    if (level.includes('senior')) return 'Senior ';
    if (level.includes('intermediate')) return 'Intermediate ';
    
    return ''; // Default to no prefix
  };

  const formatJobTitle = () => {
    const title = job.title || job.career__name;
    if (!title) return 'No title available';
    
    const prefix = getJobLevelPrefix();
    
    // Check if title already contains the level prefix to avoid duplication
    if (prefix && title.toLowerCase().includes(prefix.toLowerCase().trim())) {
      return title;
    }
    
    return `${prefix}${title}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 relative">
      {/* Back Button - Top Left */}
      {showBackButton && onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-all group z-10"
          aria-label="Go back"
        >
          <svg 
            className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
        </button>
      )}

      {/* Top Section: Logo + Title & Company */}
      <div className={`flex items-start gap-4 ${showBackButton ? 'mt-8' : ''}`}>
        {/* Company Logo */}
        <div className="flex-shrink-0">
          {job.company__logo ? (
            <div className="w-16 h-16 relative">
              <Image
                src={job.company__logo}
                alt={`${job.company__name || job.company} logo`}
                fill
                className="object-contain rounded"
                sizes="64px"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-500 text-lg font-medium">
                {(job.company__name || job.company || '').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Job Title and Company Name */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
            {formatJobTitle()}
          </h1>
          
          {job.url ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open(job.url, '_blank', 'noopener,noreferrer');
              }}
              className="text-brand-navy font-semibold text-lg hover:underline hover:text-brand-light-blue transition-colors duration-200"
            >
              {job.company__name || job.company}
            </button>
          ) : (
            <p className="text-brand-navy font-semibold text-lg">
              {job.company__name || job.company}
            </p>
          )}
          
          {/* Location and Experience in a row */}
          <div className="flex items-center gap-6 mt-3">
            {/* Location */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-600 font-medium">
                {formatLocation()}
              </span>
            </div>

            {/* Experience Requirement */}
            {job.yoe !== undefined && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600 font-medium">
                  {job.yoe === 0 ? 'No experience required' : `${job.yoe} year${job.yoe !== 1 ? 's' : ''} of experience`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}