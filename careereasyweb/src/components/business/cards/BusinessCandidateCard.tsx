'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types/api';

interface BusinessCandidateCardProps {
  candidate: Candidate;
}

export default function BusinessCandidateCard({ candidate }: BusinessCandidateCardProps) {
  const router = useRouter();

  const formatLocation = () => {
    const location = candidate.location || '';
    const country = candidate.country || '';
    
    if (location && country) {
      return `${location}, ${country}`;
    }
    return location || country || 'Location not specified';
  };

  const formatExperience = () => {
    if (candidate.experience_months === undefined || candidate.experience_months === null) {
      return 'Experience not specified';
    }
    
    const years = Math.round(candidate.experience_months / 12);
    
    if (candidate.experience_months < 9) {
      return 'Less than 1 year experience';
    } else if (years === 1) {
      return '1 year experience';
    } else {
      return `${years} years experience`;
    }
  };

  const handleCardClick = () => {
    router.push(`/business/candidate/${candidate.id}`);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] h-full flex flex-col"
      onClick={handleCardClick}
    >
      {/* Top Section: Profile Picture + Basic Info */}
      <div className="flex items-center gap-4 mb-4">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {candidate.profile_pic && candidate.profile_pic.trim() !== '' ? (
            <div className="w-20 h-20 relative">
              <Image
                src={candidate.profile_pic}
                alt={`${candidate.name || 'Candidate'} profile`}
                fill
                className="object-cover rounded-full"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-lg font-medium">
                {(candidate.name || candidate.first_name || 'N').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Name not available'}
          </h3>
          
          <div className="space-y-1">
            {/* Title */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
              <span className="text-gray-700 text-md">
                {candidate.title || candidate.standardized_title || 'Job title not specified'}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-700 text-md">
                {formatLocation()}
              </span>
            </div>

            {/* Experience */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 text-md">
                {formatExperience()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Candidate Highlights */}
      <div className="flex-1 flex flex-col">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Candidate Highlights
        </h4>
        
        <div className="flex-1">
          {candidate.ai_highlights ? (
            <ul className="space-y-2">
              {(candidate.ai_highlights || []).map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-brown rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 text-sm leading-relaxed">
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">
              No highlights available for this candidate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}