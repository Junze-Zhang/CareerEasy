import type { Metadata } from 'next';
import { Public_Sans } from 'next/font/google';
import './globals.css';
import { NotificationProvider } from '@/context/NotificationContext';

const publicSans = Public_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CareerEasy - Find Your Dream Job with AI Assistance',
  description: 'AI-powered job board helping professionals find their dream careers with intelligent matching, resume building, and career guidance.',
  keywords: 'jobs, career, AI, job search, resume builder, interview preparation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${publicSans.className} antialiased`}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
} 