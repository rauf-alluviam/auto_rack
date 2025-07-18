// File: app/buyer/track_order/page.tsx
'use client';
import { useEffect, useState } from 'react';

interface Order {
  _id: string;
  product_name: string;
  estimated_delivery: string;
  current_status: string; // 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'
  tracking_id: string;
}

export default function TrackOrder() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/buyer/orders') 
      .then((res) => res.json())
      .then((data) => setOrders(data.orders));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Track Your Orders</h2>

      {orders.length === 0 ? (
        <p>No orders in progress.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="border rounded p-4 mb-6 shadow">
            <div className="flex justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold">{order.product_name}</h3>
                <p className="text-sm text-gray-600">
                  Est. Delivery: {new Date(order.estimated_delivery).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Tracking ID: {order.tracking_id}</p>
              </div>
              <span className="text-sm font-medium bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                {order.current_status}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  order.current_status === 'Packed'
                    ? 'w-1/4 bg-yellow-500'
                    : order.current_status === 'Shipped'
                    ? 'w-1/2 bg-orange-500'
                    : order.current_status === 'Out for Delivery'
                    ? 'w-3/4 bg-blue-500'
                    : order.current_status === 'Delivered'
                    ? 'w-full bg-green-500'
                    : 'w-0'
                }`}
              ></div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
