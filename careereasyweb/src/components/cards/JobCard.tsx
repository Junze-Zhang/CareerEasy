'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Job } from '@/types/api';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
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
    return `${prefix}${title}`;
  };

  return (
    <Link href={`/job_detail/${job.id}`} className="block h-full">
      <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 h-full border border-gray-100 hover:border-brand-light-blue hover:scale-[1.02] flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          {/* Top Section: Logo + Title & Company */}
          <div className="flex items-start gap-4 mb-4">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.company__logo ? (
                <div className="w-12 h-12 relative">
                  <Image
                    src={job.company__logo}
                    alt={`${job.company__name || job.company} logo`}
                    fill
                    className="object-contain rounded"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-medium">
                    {(job.company__name || job.company || '').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Job Title and Company Name */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-comfortable mb-1 line-clamp-2 leading-tight">
                {formatJobTitle()}
              </h3>
              
              {job.url ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent Link click
                    e.preventDefault();
                    window.open(job.url, '_blank', 'noopener,noreferrer');
                  }}
                  className="text-brand-navy font-medium text-sm hover:underline hover:text-brand-light-blue transition-colors duration-200 text-left"
                >
                  {job.company__name || job.company}
                </button>
              ) : (
                <p className="text-brand-navy font-medium text-sm">
                  {job.company__name || job.company}
                </p>
              )}
            </div>
          </div>

          {/* Location Section */}
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-600 text-sm">
              {formatLocation()}
            </span>
          </div>

          {/* Experience Requirement */}
          {job.yoe !== undefined && (
            <div className="flex items-center gap-2 mt-auto">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-600 text-sm">
                {job.yoe === 0 ? 'No experience required' : `Requires ${job.yoe} year${job.yoe !== 1 ? 's' : ''} of experience`}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}