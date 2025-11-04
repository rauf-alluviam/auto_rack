'use client';

import { useEffect, useState } from 'react';

interface UserData {
  name: string;
  email: string;
  password: string;
}

export default function BuyerProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('signinData') || localStorage.getItem('signupData');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserData({
        name: parsed.name || 'N/A',
        email: parsed.email || 'N/A',
        password: '********',
      });
    }
  }, []);

  if (!userData) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Buyer Profile</h1>
      <div className="space-y-2">
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Password:</strong> {userData.password}</p>
      </div>
    </div>
  );
}
