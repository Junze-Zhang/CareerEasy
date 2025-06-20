import Link from 'next/link';

export default function CandidateInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Candidate Info</h1>
        <p className="text-gray-600 mb-8">This route works! Dynamic routes should work too.</p>
        <Link href="/candidate_info/bdbeaba7-ed8a-401b-86e6-1388014f98ca" className="text-blue-600 hover:underline">
          Test Dynamic Route
        </Link>
      </div>
    </div>
  );
}