'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();

      
      const userData = {
        email: email,
        role: data.role || 'buyer', 
        token: data.token || '',    
      };
      localStorage.setItem('user', JSON.stringify(userData));

      setMessage('Login successful ');

     
      router.push('/buyers/place_order');
    } else {
      const data = await res.json();
      setMessage(data.error || 'Login failed ');
    }
  } catch (err) {
    setMessage('Error connecting to server');
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>

        {message && <p className="text-sm text-red-600 mb-3">{message}</p>}

        <input
          type="email"
          placeholder="signin_Email"
          className="w-full p-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="signin_Password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Sign In
        </button>

        <p className="text-sm mt-4 text-center">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-blue-500 underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}

   