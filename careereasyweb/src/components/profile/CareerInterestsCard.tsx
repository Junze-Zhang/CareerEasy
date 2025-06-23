'use client';

interface Career {
  id: string;
  name: string;
}

interface CareerInterestsCardProps {
  preferredCareers: Career[] | undefined;
  isOwnProfile: boolean;
  hasChanges: boolean;
  showCareerSearch: boolean;
  careerSearchTerm: string;
  selectedCareersForAdd: Career[];
  filteredCareers: Career[];
  onSave: () => void;
  onCancel: () => void;
  onRemoveCareer: (careerId: string) => void;
  onShowCareerSearch: (show: boolean) => void;
  onCareerSearchChange: (term: string) => void;
  onToggleCareerSelection: (career: Career) => void;
  onAddSelectedCareers: () => void;
}

export default function CareerInterestsCard({
  preferredCareers,
  isOwnProfile,
  hasChanges,
  showCareerSearch,
  careerSearchTerm,
  selectedCareersForAdd,
  filteredCareers,
  onSave,
  onCancel,
  onRemoveCareer,
  onShowCareerSearch,
  onCareerSearchChange,
  onToggleCareerSelection,
  onAddSelectedCareers
}: CareerInterestsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 group hover:shadow-2xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
          </svg>
          Career Interests
        </h3>
        
        {isOwnProfile && hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="text-green-600 hover:text-green-800 p-1"
              title="Save changes"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={onCancel}
              className="text-red-600 hover:text-red-800 p-1"
              title="Cancel changes"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {preferredCareers && preferredCareers.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {preferredCareers.map((career) => (
            <span key={career.id} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 group/career">
              {career.name}
              {isOwnProfile && (
                <button
                  onClick={() => onRemoveCareer(career.id)}
                  className="ml-1 text-indigo-600 hover:text-red-600 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 mb-4">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
          </svg>
          <p className="text-gray-500">No career interests selected yet</p>
        </div>
      )}

      {isOwnProfile && (
        <div className="space-y-3">
          {!showCareerSearch ? (
            <button
              onClick={() => onShowCareerSearch(true)}
              className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Career Interest
            </button>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={careerSearchTerm}
                  onChange={(e) => onCareerSearchChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Search for careers..."
                />
                <button
                  onClick={() => onShowCareerSearch(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredCareers.length > 0 ? (
                  filteredCareers.map((career) => (
                    <button
                      key={career.id}
                      onClick={() => onToggleCareerSelection(career)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCareersForAdd.find(c => c.id === career.id)
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{career.name}</span>
                        {selectedCareersForAdd.find(c => c.id === career.id) && (
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-2">
                    {careerSearchTerm.trim() ? 'No careers found matching your search' : 'No available careers to add'}
                  </p>
                )}
              </div>

              {selectedCareersForAdd.length > 0 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedCareersForAdd.map((career) => (
                      <span key={career.id} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                        {career.name}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={onAddSelectedCareers}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add Selected Careers ({selectedCareersForAdd.length})
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}