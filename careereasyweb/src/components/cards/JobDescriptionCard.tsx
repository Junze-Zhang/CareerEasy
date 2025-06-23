'use client';

import ReactMarkdown from 'react-markdown';
import { Job } from '@/types/api';

interface JobDescriptionCardProps {
  job: Job;
}

export default function JobDescriptionCard({ job }: JobDescriptionCardProps) {
  const formatJobTitle = () => {
    const title = job.title || job.career__name;
    if (!title) return 'No title available';
    return title;
  };

  const cleanDescription = (description: string) => {
    if (!description) return description;
    // Remove "markdown" prefix at the beginning
    return description.replace(/^markdown\s*/i, '').trim();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {formatJobTitle()} - {job.company__name || job.company}
        </h1>
      </div>

      <div className="markdown-content">
        {job.description ? (
          <ReactMarkdown>{cleanDescription(job.description)}</ReactMarkdown>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No detailed job description is available for this position.</p>
            {job.url && (
              <button 
                onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}
                className="mt-4 bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
              >
                View Original Job Posting
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}