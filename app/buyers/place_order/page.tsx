'use client';

import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, TruckElectric } from 'lucide-react';

export default function Placeholder() {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [size, setSize] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const orderData = {
    product_name: productName,
    quantity,
    size,
    delivery_address: address,
    description,
  };

  try {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result = await res.json();

    if (res.ok) {
      setIsSubmitted(true);
      console.log('Order Submitted:',result);

      
      setTimeout(() => {
        setIsSubmitted(true);
        setProductName('');
        setQuantity('');
        setSize('');
        setAddress('');
        setDescription('');
      }, );
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    console.error('Network error',error)
    alert('somthing went wrong.please try again')
  }
};

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Submitted</h2>
          <p className="text-gray-600">Your request has been processed successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="bg-blue-100 p-3 rounded-full inline-block mb-4">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Place Product Order
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Product Name</label>
            <input 
              type="text"
              placeholder="Enter product name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">Quantity</label>
              <input 
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Size</label>
              <input 
                type="text"
                placeholder="Size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">Delivery Address</label>
            <textarea 
              placeholder="Enter delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">Special Notes (Optional)</label>
            <textarea 
              placeholder="Any special requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}