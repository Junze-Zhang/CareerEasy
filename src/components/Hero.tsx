import React from 'react';

const Hero: React.FC = () => (
  <section className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-b from-[#F8FAFC] to-white text-[#1E293B] py-20 px-8 min-h-[60vh]">
    <div className="max-w-xl">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-8 leading-tight">
        Find your<br />dream job with<br />AI powered<br />matching
      </h1>
      <a href="#" className="inline-block group text-lg font-medium mt-4">
        Get Started
        <span className="block h-0.5 w-full bg-[#2563EB] mt-1 group-hover:bg-[#F59E0B] transition-colors"></span>
      </a>
      <p className="mt-8 text-[#64748B] max-w-md">
        CareerEasy uses Generative AI to match candidates with the best job opportunities.
      </p>
    </div>
    <div className="mt-12 md:mt-0 md:ml-12 flex-shrink-0">
      <img src="/hero-woman.png" alt="Woman using laptop" className="w-[340px] h-auto rounded-lg shadow-lg object-cover" />
    </div>
  </section>
);

export default Hero; 