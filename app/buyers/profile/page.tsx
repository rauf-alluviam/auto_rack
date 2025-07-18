'use client';
import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, User } from 'lucide-react';

export default function BuyerProfile() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    
    const storedUser = localStorage.getItem('buyers');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserData({
        name: parsed.name || 'N/A',
        email: parsed.email || 'N/A',
        phone: parsed.phone || 'Not Provided',
        address: parsed.address || 'Not Provided',
      });
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold mb-6">My Profile</h2>
      
      <div className="bg-white shadow-md rounded-lg p-6 space-y-6 border">
        <div className="flex items-center space-x-4">
          <User className="text-blue-600" size={32} />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{userData.name}</h3>
            <p className="text-gray-500 text-sm">Registered Buyer</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <Mail className="mr-2 text-blue-500" size={20} />
            <span>{userData.email}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Phone className="mr-2 text-green-500" size={20} />
            <span>{userData.phone}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <MapPin className="mr-2 text-purple-500" size={20} />
            <span>{userData.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
