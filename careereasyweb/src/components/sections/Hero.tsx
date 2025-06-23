import Image from 'next/image';

export default function Hero() {
  return (
    <section className="pt-24 pb-16 lg:pt-32 lg:pb-20 min-h-screen relative">
      <div className="container-max section-padding relative z-10">
        <div className="flex flex-col items-center text-center space-y-10">
          {/* Text Content */}
          <div className="space-y-6 max-w-4xl">
            <div className="space-y-6">
              <h1 className="hero-title text-comfortable">
                Find Your Dream Job
                <br />
                <span className="text-brand-navy">with AI Assistance</span>
              </h1>
              <p className="hero-subtitle max-w-3xl mx-auto text-comfortable">
                Leverage the power of artificial intelligence to discover career opportunities that match your skills, experience, and aspirations.
              </p>
            </div>

            {/* Call to Action Buttons
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                <span>Get Started</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 font-semibold text-lg px-8 py-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Learn More</span>
              </button>
            </div> */}

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 max-w-5xl mx-auto">
              <div className="flex items-center space-x-3 justify-center sm:justify-start">
                <div className="w-5 h-5 bg-brand-navy rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-comfortable font-medium text-sm lg:text-sm whitespace-nowrap">AI-Powered Job Matching</span>
              </div>
              <div className="flex items-center space-x-3 justify-center sm:justify-start">
                <div className="w-5 h-5 bg-brand-navy rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-comfortable font-medium text-sm lg:text-sm whitespace-nowrap">Smart Resume Analysis</span>
              </div>
              <div className="flex items-center space-x-3 justify-center sm:justify-start">
                <div className="w-5 h-5 bg-brand-navy rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-comfortable font-medium text-sm lg:text-sm whitespace-nowrap">Job Recommendations</span>
              </div>
              <div className="flex items-center space-x-3 justify-center sm:justify-start">
                <div className="w-5 h-5 bg-brand-navy rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-comfortable font-medium text-sm lg:text-sm whitespace-nowrap">Career Path Guidance</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative w-full max-w-4xl">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-[3/2] relative">
                <Image
                  src="/businessman-hero.jpg"
                  alt="Professional businessman representing career success"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-brand-light-blue rounded-full opacity-80"></div>
              <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-brand-navy rounded-full opacity-60"></div>
              <div className="absolute top-1/4 -left-2 w-4 h-4 bg-brand-light-blue rounded-full opacity-70"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 