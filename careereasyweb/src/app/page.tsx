import Navbar from '@/components/navigation/Navbar';
import Hero from '@/components/sections/Hero';
import Footer from '@/components/layout/Footer';
import AbstractLines from '@/components/background/AbstractLines';

export default function Home() {
  return (
    <main className="min-h-screen relative bg-light">
      {/* Abstract Background Lines */}
      <AbstractLines />
      
      {/* Page Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Footer />
      </div>
    </main>
  );
} 