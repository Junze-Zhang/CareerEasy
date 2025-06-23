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

interface ExperienceEducationCardProps {
  profile: CandidateProfile;
  isOwnProfile: boolean;
  isEditing: boolean;
  editForm: Partial<CandidateProfile>;
  experienceYears: number;
  experienceMonths: number;
  customEducation: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onExperienceYearsChange: (value: number) => void;
  onExperienceMonthsChange: (value: number) => void;
  onEducationChange: (value: string) => void;
  onCustomEducationChange: (value: string) => void;
  formatExperience: (months: number) => string;
}

export default function ExperienceEducationCard({
  profile,
  isOwnProfile,
  isEditing,
  editForm,
  experienceYears,
  experienceMonths,
  customEducation,
  onEdit,
  onSave,
  onCancel,
  onExperienceYearsChange,
  onExperienceMonthsChange,
  onEducationChange,
  onCustomEducationChange,
  formatExperience
}: ExperienceEducationCardProps) {
  const educationOptions = [
    'High School',
    'Bachelor\'s',
    'Master\'s',
    'Doctorate',
    'Other'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col group hover:shadow-2xl transition-shadow h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Experience & Education
        </h3>
        
        {isOwnProfile && !isEditing && (
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
            title="Edit experience and education"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>

      {!isEditing ? (
        // Display Mode
        <div className="space-y-4 flex-1">
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Experience</h4>
            <p className="text-gray-600">
              {profile.experience_months !== undefined && profile.experience_months !== null
                ? formatExperience(profile.experience_months)
                : 'Experience not specified'
              }
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Highest Education</h4>
            <p className="text-gray-600">
              {profile.highest_education || 'Education not specified'}
            </p>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Years</label>
                <select
                  value={experienceYears}
                  onChange={(e) => onExperienceYearsChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({length: 31}, (_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Months</label>
                <select
                  value={experienceMonths}
                  onChange={(e) => onExperienceMonthsChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Highest Education</label>
            <select
              value={editForm.highest_education || ''}
              onChange={(e) => onEducationChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
            >
              <option value="">Select education level</option>
              {educationOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            
            {editForm.highest_education === 'Other' && (
              <input
                type="text"
                value={customEducation}
                onChange={(e) => onCustomEducationChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Specify your education level"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 mt-auto">
            <button
              onClick={onSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save
            </button>
            
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}