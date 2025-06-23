'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types/api';

interface BusinessPersonalInfoCardProps {
  candidate: Candidate;
}

export default function BusinessPersonalInfoCard({ candidate }: BusinessPersonalInfoCardProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };
  const formatLocation = () => {
    const location = candidate.location || '';
    const country = candidate.country || '';
    
    if (location && country) {
      return `${location}, ${country}`;
    }
    return location || country || 'Location not specified';
  };

  const formatExperience = () => {
    if (candidate.experience_months === undefined) return 'Experience not specified';
    
    const years = Math.floor(candidate.experience_months / 12);
    const months = candidate.experience_months % 12;
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''} of experience`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''} of experience`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''} of experience`;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110"
            title="Go back"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 relative">
            {candidate.profile_pic && candidate.profile_pic.trim() !== '' ? (
              <Image
                src={candidate.profile_pic}
                alt={`${candidate.name || 'Candidate'} profile`}
                fill
                className="object-cover rounded-full"
                sizes="96px"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-sm">No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Personal Details */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Name not available'}
            </h3>
            <p className="text-lg text-brand-brown font-medium">
              {candidate.title || candidate.standardized_title || 'Job title not specified'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a 
                href={`mailto:${candidate.email}`}
                className="text-brand-brown hover:text-brand-brown-dark transition-colors duration-200 hover:underline"
              >
                {candidate.email}
              </a>
            </div>

            {candidate.phone && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700">{candidate.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-700">{formatLocation()}</span>
            </div>

            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">{formatExperience()}</span>
            </div>
          </div>

          {/* Education */}
          {candidate.highest_education && (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <span className="text-gray-700">
                  {"Highest Education: "+candidate.highest_education}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}