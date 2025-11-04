'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      
      localStorage.removeItem('token');

      setTimeout(() => {
        router.push('/signin');
      }, 1000); // 1 second delay
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen text-lg text-gray-700">
      Logging you out...
    </div>
  );
}
