'use client';

interface HighlightsCardProps {
  highlights: string[] | null;
  isOwnProfile: boolean;
  isUpdatingHighlights: boolean;
  onRegenerateHighlights: () => void;
}

export default function HighlightsCard({
  highlights,
  isOwnProfile,
  isUpdatingHighlights,
  onRegenerateHighlights
}: HighlightsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Highlights
        </h2>
        
        {isOwnProfile && (
          <button
            onClick={onRegenerateHighlights}
            disabled={isUpdatingHighlights}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
              isUpdatingHighlights
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 active:scale-95'
            }`}
          >
            {isUpdatingHighlights ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Regenerate with AI
              </>
            )}
          </button>
        )}
      </div>

      {highlights && highlights.length > 0 ? (
        <ul className="space-y-2">
          {highlights.map((highlight, index) => (
            <li key={index} className="flex items-start gap-2">
              <svg className="w-2 h-2 text-blue-600 mt-2 flex-shrink-0" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              <span className="text-gray-700 leading-relaxed">{highlight}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-gray-500">No highlights available</p>
          {isOwnProfile && (
            <p className="text-sm text-gray-400 mt-1">Upload a resume to generate AI highlights</p>
          )}
        </div>
      )}
    </div>
  );
}