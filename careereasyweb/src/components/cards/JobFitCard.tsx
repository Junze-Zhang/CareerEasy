'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { candidateAPI } from '@/services/api';
import { isAuthenticated } from '@/utils/auth';

interface JobFitCardProps {
  jobId: string;
}

export default function JobFitCard({ jobId }: JobFitCardProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    setUserLoggedIn(isAuthenticated());
  }, []);

  const handleCheckFit = async () => {
    if (!userLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      setAnalysisResult(null);

      const response = await candidateAPI.checkFit({ job_id: jobId });
      setAnalysisResult(response.data.Success);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { Error?: string } } }).response?.data?.Error 
        : undefined;
      setError(errorMessage || 'Failed to analyze job fit. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <div className="text-center">
        {!analysisResult ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              AM I A GOOD FIT FOR THIS JOB?
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleCheckFit}
              disabled={isAnalyzing}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                isAnalyzing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-brand-light-blue hover:bg-brand-light-blue-dark text-black hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing... This can take some minutes</span>
                </>
              ) : !userLoggedIn ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign in to check</span>
                </>
              ) : (
                'Check My Fit'
              )}
            </button>

            {isAnalyzing && (
              <p className="text-gray-600 text-sm mt-3">
                Our AI is analyzing your profile against the job requirements. This process may take several minutes.
              </p>
            )}
          </>
        ) : (
          <div className="text-left">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Job Fit Analysis
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown>{analysisResult}</ReactMarkdown>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={() => {
                  const candidateId = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('candidate_id='))
                    ?.split('=')[1];
                  if (candidateId) {
                    window.location.href = `/${candidateId}`;
                  }
                }}
                className="bg-brand-navy hover:bg-brand-navy-dark text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
              >
                View My Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}