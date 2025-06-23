'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CandidatePage() {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect logic
    if (typeof window !== 'undefined') {
      const candidateId = document.cookie
        .split('; ')
        .find(row => row.startsWith('candidate_id='))
        ?.split('=')[1];
      
      if (!candidateId) {
        router.push('/');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Candidate Profile</h1>
        <p className="text-gray-600">Cookie-based candidate profile page</p>
      </div>
    </div>
  );
}