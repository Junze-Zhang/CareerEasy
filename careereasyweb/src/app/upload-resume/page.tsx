'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Navbar, Footer, AbstractLines } from '@/components';
import { candidateAPI } from '@/services/api';
import { useNotification } from '@/context/NotificationContext';

export default function UploadResumePage() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (typeof document !== 'undefined') {
      const candidateId = document.cookie
        .split('; ')
        .find(row => row.startsWith('candidate_id='))
        ?.split('=')[1];
      
      const candidateAccountId = document.cookie
        .split('; ')
        .find(row => row.startsWith('candidate_account_id='))
        ?.split('=')[1];
      
      if (candidateId && candidateAccountId) {
        setIsLoggedIn(true);
        // Fetch existing resume if available
        fetchExistingResume();
      } else {
        // Redirect to hero page instead of login
        router.push('/');
      }
    }
  }, [router]);

  const fetchExistingResume = async () => {
    try {
      const candidateId = document.cookie
        .split('; ')
        .find(row => row.startsWith('candidate_id='))
        ?.split('=')[1];
      
      if (candidateId) {
        const response = await candidateAPI.candidateInfo(candidateId);
        if (response.data.resume) {
          setResumeText(response.data.resume);
        }
      }
    } catch (err) {
      console.error('Failed to fetch existing resume:', err);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)) {
      if (file.size <= 25 * 1024 * 1024) { // 25MB limit
        setSelectedFile(file);
        setError(null);
        setUploadSuccess(false);
      } else {
        setError('File size must be less than 25MB');
        setSelectedFile(null);
      }
    } else {
      setError('Please select a .pdf, .doc, .docx, .txt or .md file');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      await candidateAPI.uploadResume(formData);
      
      setUploadSuccess(true);
      setSelectedFile(null);
      
      // Fetch the updated resume text
      await fetchExistingResume();
      
      // Reset file input
      const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Trigger AI analysis immediately after successful upload
      addNotification({
        message: 'Resume uploaded successfully! Starting AI analysis in background (this can take up to 20 minutes)...',
        timeout: 5000
      });

      // Start AI analysis in background
      candidateAPI.extractCandidateInfo().then(() => {
        addNotification({
          message: 'AI resume analysis complete.',
          action: () => {
            const candidateId = document.cookie
              .split('; ')
              .find(row => row.startsWith('candidate_id='))
              ?.split('=')[1];
            if (candidateId) {
              router.push(`/${candidateId}?refresh=${Date.now()}`);
            }
          },
          actionText: 'Go to my profile',
          timeout: 15000
        });
      }).catch((error) => {
        console.error('AI analysis failed:', error);
        addNotification({
          message: 'AI resume analysis failed. You can retry from your profile.',
          timeout: 8000
        });
      });

    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { Error?: string } } };
        if (axiosError.response?.data?.Error) {
          const errorMessage = axiosError.response.data.Error;
          // Handle rate limiting error specifically
          if (errorMessage.includes('upload limit') || errorMessage.includes('rate limit')) {
            setError('Upload limit reached. You can upload up to 5 resumes per 10 minutes. Please wait and try again.');
          } else {
            setError(errorMessage);
          }
        } else {
          setError('Failed to upload resume. Please try again.');
        }
      } else {
        setError('Failed to upload resume. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    router.push('/home');
  };


  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
      <AbstractLines />
      <Navbar />
      
      <main className="pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Upload Your Resume
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Share your professional experience with potential employers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Resume</h2>
              
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-gray-600">
                  <p className="text-lg font-medium mb-2">Drop your resume here</p>
                  <p className="text-sm">or</p>
                </div>
                <label htmlFor="resume-upload" className="mt-4 inline-block">
                  <span className="bg-brand-light-blue hover:bg-brand-light-blue-dark text-black px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors">
                    Select File
                  </span>
                  <input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-3">
                  Supported formats: .pdf, .doc, .docx, .txt, .md (Max 25MB)
                </p>
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`w-full mt-6 py-3 px-6 rounded-xl font-medium transition-colors ${
                  selectedFile && !isUploading
                    ? 'bg-brand-navy hover:bg-brand-navy-dark text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isUploading ? 'Uploading...' : 'Upload Resume'}
              </button>

              {/* Status Messages */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-4 space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-green-600 text-sm">Resume uploaded successfully!</p>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full bg-brand-navy hover:bg-brand-navy-dark text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Next: Continue to Job Board
                  </button>
                </div>
              )}
              
              {/* Back Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.back()}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              </div>
            </div>

            {/* Resume Preview Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Resume (Parsed)</h2>
              
              {resumeText ? (
                <div className="border rounded-xl p-6 max-h-96 overflow-y-auto bg-gray-50">
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-h1:text-lg prose-h1:border-b-2 prose-h1:border-gray-400 prose-h1:pb-1 prose-h1:mt-6 prose-h1:mb-3 prose-h2:text-base prose-h2:border-b prose-h2:border-gray-300 prose-h2:pb-1 prose-h2:mt-4 prose-h2:mb-2 prose-p:text-gray-700 prose-p:text-sm prose-p:leading-relaxed prose-p:mb-2 prose-ul:text-gray-700 prose-ul:text-sm prose-li:mb-1 prose-strong:font-semibold prose-a:text-blue-600 prose-a:hover:underline">
                    <ReactMarkdown>{resumeText}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No resume uploaded yet</p>
                  <p className="text-sm text-gray-400 mt-2">Upload a resume to see the preview here</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}