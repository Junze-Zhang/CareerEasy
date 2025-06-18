import Navbar from '@/components/navigation/Navbar';
import Hero from '@/components/sections/Hero';
import JobsList from '@/components/sections/JobsList';
import Footer from '@/components/layout/Footer';
import AbstractLines from '@/components/background/AbstractLines';

export default function Home() {
  return (
    <>
      <Navbar />
      
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <AbstractLines />
      </div>
      
      <main className="min-h-screen relative">
        <Hero />
        
        {/* Explore available opportunities section */}
        <section className="py-12 relative z-10">
          <div className="container-max section-padding">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-comfortable mb-8">
                Explore available opportunities
              </h2>
            </div>
            
            {/* Job Cards placed directly on background */}
            <JobsList />
          </div>
        </section>
        
        <Footer />
      </main>
    </>
  );
} 