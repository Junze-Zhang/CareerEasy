import Navbar from '@/components/navigation/Navbar';
import Hero from '@/components/sections/Hero';
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
        <Footer />
      </main>
    </>
  );
} 