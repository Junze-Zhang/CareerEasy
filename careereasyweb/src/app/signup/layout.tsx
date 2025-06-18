import { SignUpProvider } from '@/contexts/SignUpContext';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/layout/Footer';
import AbstractLines from '@/components/background/AbstractLines';

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignUpProvider>
      <main className="min-h-screen relative bg-light">
        {/* Abstract Background Lines */}
        <AbstractLines />
        
        {/* Page Content */}
        <div className="relative z-10">
          <Navbar hideGetStarted />
          {children}
          <Footer />
        </div>
      </main>
    </SignUpProvider>
  );
}