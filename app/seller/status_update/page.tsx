'use client';

import { useEffect, useState } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  ShoppingBag, 
  AlertCircle, 
  Calendar,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

interface Order {
  _id: string;
  product_name: string;
  delivery_address: string;
  estimated_delivery: string;
  status: string;
}

interface ApiResponse {
  orders: Order[];
}

const STATUS_OPTIONS = [
  'Pending',
  'In Production',
  'Quality Check',
  'Packaging',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const STATUS_CONFIG = {
  'Pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  'In Production': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
  'Quality Check': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: AlertCircle },
  'Packaging': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: ShoppingBag },
  'Shipped': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Truck },
  'Delivered': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  'Cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
};

export default function SellerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/status');
        const data: ApiResponse | Order[] = await res.json();

        if (res.ok && data && Array.isArray((data as ApiResponse).orders)) {
          const ordersArray = (data as ApiResponse).orders;
          const uniqueOrders = ordersArray.filter(
            (order: Order, index: number, self: Order[]) =>
              index === self.findIndex((o) => o._id === order._id)
          );
          setOrders(uniqueOrders);
          setFilteredOrders(uniqueOrders);
        } else if (res.ok && Array.isArray(data)) {
          const uniqueOrders = (data as Order[]).filter(
            (order: Order, index: number, self: Order[]) =>
              index === self.findIndex((o) => o._id === order._id)
          );
          setOrders(uniqueOrders);
          setFilteredOrders(uniqueOrders);
        } else {
          setError('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    let estimated_delivery = '';

    if (newStatus === 'Packaging') {
      const now = new Date();
      now.setDate(now.getDate() + 3);
      estimated_delivery = now.toISOString().split('T')[0];
    }

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId
          ? { ...order, status: newStatus, estimated_delivery }
          : order
      )
    );

    setUpdatingStatusId(orderId);

    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus, estimated_delivery }),
      });

      if (!res.ok) throw new Error('Failed to update status');
    } catch (err) {
      console.error(err);
      setError('Error updating status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusStats = () => {
    const stats = STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = orders.filter(order => order.status === status).length;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    const Icon = config?.icon || Clock;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium mb-2">Error Loading Orders</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
                <p className="text-gray-600">Manage your order fulfillment process</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {STATUS_OPTIONS.map((status) => {
            const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
            const Icon = config?.icon || Clock;
            const count = stats[status] || 0;
            
            return (
              <div key={status} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${config?.color.split(' ')[0] || 'bg-gray-100'}`}>
                    <Icon className={`w-4 h-4 ${config?.color.split(' ')[1] || 'text-gray-600'}`} />
                  </div>
                  <span className="text-xl font-bold text-gray-900">{count}</span>
                </div>
                <p className="text-xs text-gray-600 truncate">{status}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders by product or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
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
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated Delivery
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order, index) => (
                  <tr key={`${order._id}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="font-medium text-gray-900">
                          {order.product_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {order.delivery_address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          disabled={updatingStatusId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        {updatingStatusId === order._id && (
                          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        )}
                      </div>
                      <div className="mt-2">
                        <StatusBadge status={order.status} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(order.estimated_delivery)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'All' ? 'No matching orders' : 'No orders found'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'All' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Orders will appear here when they are accepted and ready for processing.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}