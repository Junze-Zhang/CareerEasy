'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to step 1
    router.replace('/signup/step-1');
  }, [router]);

  return null;
}