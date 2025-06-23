'use client';

interface Career {
  id: string;
  name: string;
}

interface CandidateProfile {
  name: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  location: string;
  country: string;
  title: string;
  profile_pic: string;
  highlights: string[];
  preferred_career_types?: Career[];
  experience_months?: number;
  has_original_resume?: boolean;
  resume?: string;
  highest_education?: string;
  skills?: string[];
}

interface ResumeCardProps {
  profile: CandidateProfile;
  onDownloadResume: () => void;
  onShowResume: () => void;
  onUploadResume: () => void;
}

export default function ResumeCard({
  profile,
  onDownloadResume,
  onShowResume,
  onUploadResume
}: ResumeCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col hover:shadow-2xl transition-shadow h-full">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Resume
        </h3>
      </div>

      <div className="space-y-3 flex-1">
        {/* Download Original Resume - Blue Button */}
        {profile.has_original_resume && (
          <button
            onClick={onDownloadResume}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Original Resume
          </button>
        )}

        {/* Show Resume Text - Blue Button */}
        {profile.resume && (
          <button
            onClick={onShowResume}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Show Resume Text
          </button>
        )}

        {/* Upload New Resume - Clickable Text */}
        <div className="text-center pt-2">
          <button
            onClick={onUploadResume}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-0.5 relative group"
          >
            Upload New Resume
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-800 transition-all duration-300 group-hover:w-full"></span>
          </button>
        </div>

        {!profile.has_original_resume && !profile.resume && (
          <div className="text-center py-4">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">No resume uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}