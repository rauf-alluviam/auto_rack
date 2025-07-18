'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const[userType, setUserType] = useState('');
  

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    setMessage('Passwords do not match');
    return;
  }

  //Save to localStorage
  const userData = {
    name,
    email,
    password,
    userType,
  };
  localStorage.setItem('signupData', JSON.stringify(userData));

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (res.ok) {
      setMessage('Signup successful');

      // Role-based redirect
      if (userType === 'buyer') {
        router.push('/buyers/home');
      } else if (userType === 'seller') {
        router.push('/seller/home');
      }
    } else {
      const data = await res.json();
      setMessage(data.error || 'Signup failed');
    }
  } catch (err) {
    setMessage('Error connecting to server');
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white shadow-lg p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>

        {message && <p className="text-sm text-red-600 mb-3">{message}</p>}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 border rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
         <select
         className="w-full p-2 border rounded mb-3"
        value={userType}
        onChange={(e) => setUserType(e.target.value)}
         required
>
     <option value="">Select Role</option>
     <option value="buyer">Buyer</option>
    <option value="supplier">Supplier</option>
       </select>

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-2 border rounded mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Sign Up
        </button>

        <p className="text-sm mt-4 text-center">
          Already have an account?{' '}
          <Link href="/signin" className="text-blue-500 underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
