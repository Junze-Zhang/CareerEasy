'use client';

import { useState } from 'react';
import { Candidate } from '@/types/api';
import { employerAPI } from '@/services/api';

interface BusinessResumeCardProps {
  candidate: Candidate;
  candidateId: string;
}

export default function BusinessResumeCard({ candidate, candidateId }: BusinessResumeCardProps) {
  const [viewingResume, setViewingResume] = useState<'standardized' | 'original' | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadResume = async () => {
    try {
      setIsDownloading(true);
      const response = await employerAPI.downloadCandidateResume(candidateId);
      
      // Get content type from response headers to determine file type
      const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'] || '';
      
      // Try to extract filename from Content-Disposition header
      let filename = `${candidate.name || 'candidate'}_resume`;
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      } else {
        // Determine file extension based on content type
        let extension = '';
        if (contentType.includes('application/pdf')) {
          extension = '.pdf';
        } else if (contentType.includes('text/markdown') || contentType.includes('text/x-markdown')) {
          extension = '.md';
        } else if (contentType.includes('text/plain')) {
          extension = '.txt';
        } else if (contentType.includes('application/msword')) {
          extension = '.doc';
        } else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
          extension = '.docx';
        } else {
          // Default to original extension or .txt
          extension = '.txt';
        }
        filename = `${candidate.name || 'candidate'}_resume${extension}`;
      }
      
      // Create blob with appropriate content type
      const blob = new Blob([response.data], { type: contentType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      // You could add error handling UI here if needed
    } finally {
      setIsDownloading(false);
    }
  };

  const hasStandardizedResume = candidate.standardized_resume && candidate.standardized_resume.trim() !== '';
  const hasOriginalResume = candidate.has_original_resume;
  const hasOriginalResumeFile = candidate.has_original_resume; // Can download original file
  const hasResumeText = candidate.resume && candidate.resume.trim() !== ''; // Can view text

  if (!hasStandardizedResume && !hasOriginalResume && !hasResumeText) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Resume</h2>
        </div>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No resume available for this candidate.</p>
        </div>
      </div>
    );
  }

  if (viewingResume) {
    // Always show original resume
    const resumeContent = candidate.resume;

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Resume</h2>
          <button
            onClick={() => setViewingResume(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6 max-h-96 overflow-y-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
            {resumeContent}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Resume</h2>
      </div>

      <div className="space-y-4">
        {(hasOriginalResumeFile || hasResumeText) && (
          <div className="p-6 border border-brand-brown rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-brown rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Candidate Resume</h3>
                  <p className="text-gray-600 text-sm">
                    {hasOriginalResumeFile ? 'Download the original resume file' : 'View the resume content'}
                  </p>
                </div>
              </div>
              <button
                onClick={hasOriginalResumeFile ? handleDownloadResume : () => setViewingResume('original')}
                disabled={isDownloading}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  isDownloading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-brand-brown hover:bg-brand-brown-dark text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Downloading...</span>
                  </>
                ) : hasOriginalResumeFile ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download Resume</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}