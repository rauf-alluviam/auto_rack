'use client';
import { useEffect, useState } from 'react';
import { Package, Calendar, MapPin, CheckCircle, Clock, XCircle, Save } from 'lucide-react';

interface Order {
  _id: string;
  product_name: string;
  quantity: number;
  size: string;
  delivery_address: string;
  estimated_delivery: string;
  is_accepted: string;
}

export default function TrackOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Server Error:", res.status, errorText);
          return;
        }

        const data = await res.json();
        if (data.orders) {
          const formattedOrders = data.orders.map((order: Order) => ({
            ...order,
            estimated_delivery: order.estimated_delivery || '',
            is_accepted: order.is_accepted || 'Pending',
          }));
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleChange = (index: number, field: keyof Order, value: string) => {
    const updatedOrders = [...orders];
    updatedOrders[index] = { ...updatedOrders[index], [field]: value };
    setOrders(updatedOrders);
  };

  const handleUpdate = async (orderId: string, delivery: string, status: string) => {
    setLoadingId(orderId);
    try {
      const res = await fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, estimated_delivery: delivery, status }),
      });
      const result = await res.json();
      if (result.success || res.ok) {
        alert('Order updated successfully');
      } else {
        alert('Update failed');
      }
    } catch (err) {
      console.error("Update error:", err);
      alert('Error while updating');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600">Track and manage customer orders</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.is_accepted === 'Accepted').length}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.is_accepted === 'Pending').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated Delivery
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order, index) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Qty: {order.quantity} • Size: {order.size}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-900 max-w-xs">
                          {order.delivery_address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input
                          type="datetime-local"
                          value={order.estimated_delivery}
                          onChange={(e) =>
                            handleChange(index, 'estimated_delivery', e.target.value)
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      {order.estimated_delivery && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(order.estimated_delivery)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.is_accepted}
                          onChange={(e) => handleChange(index, 'is_accepted', e.target.value)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(order.is_accepted)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() =>
                          handleUpdate(order._id, order.estimated_delivery, order.is_accepted)
                        }
                        disabled={loadingId === order._id}
                      >
                        {loadingId === order._id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Orders will appear here when they are placed by customers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}