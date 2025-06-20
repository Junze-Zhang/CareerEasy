import Navbar from '@/components/navigation/Navbar';
import Hero from '@/components/sections/Hero';
import Footer from '@/components/layout/Footer';
import AbstractLines from '@/components/background/AbstractLines';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-hidden">
      <Navbar />
      
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <AbstractLines />
      </div>
      
      <main className="min-h-screen relative z-10">
        <Hero />
        <Footer />
      </main>
    </div>
  );
} 