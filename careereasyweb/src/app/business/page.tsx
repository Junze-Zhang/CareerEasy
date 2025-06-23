'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/business/home');
  }, [router]);

  return null;
}