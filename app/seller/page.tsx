'use client';
import { useState, useEffect } from 'react';
import { 
  Boxes, 
  RefreshCcw, 
  Clock, 
  LogOut, 
  Bell, 
  User, 
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  Package,
  Loader2,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedSales: number;
  activeShipments: number;
  totalOrdersChange: string;
  pendingOrdersChange: string;
  completedSalesChange: string;
  activeShipmentsChange: string;
}

interface DashboardData {
  stats: OrderStats;
  notifications: Array<{
    id: number;
    title: string;
    message: string;
    time: string;
    type: 'order' | 'payment' | 'stock' | 'system';
  }>;
  seller: {
    name: string;
    email: string;
    totalRevenue: number;
    joinedDate: string;
  };
}

export default function SellerDashboard() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDashboardData(getMockData());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(getMockData());
        setError('Using demo data. Connect to your backend for real data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Mock data function
  const getMockData = (): DashboardData => {
    return {
      stats: {
        totalOrders: 25,
        pendingOrders: 8,
        completedSales: 12,
        activeShipments: 5,
        totalOrdersChange: '+3',
        pendingOrdersChange: '+2',
        completedSalesChange: '+4',
        activeShipmentsChange: '+1',
      },
      notifications: [
        {
          id: 1,
          title: 'New Order Received',
          message: 'Order from John Doe - Qty: 2, Size: Large',
          time: '5 min ago',
          type: 'order'
        },
        {
          id: 2,
          title: 'Order Accepted',
          message: 'Order from Mike Johnson has been accepted',
          time: '1 hour ago',
          type: 'system'
        },
        {
          id: 3,
          title: 'Order Delivered',
          message: 'Order to Jane Smith has been delivered successfully',
          time: '2 hours ago',
          type: 'system'
        },
      ],
      seller: {
        name: 'AutoRack Seller',
        email: 'seller@admin.com',
        totalRevenue: 30000.00,
        joinedDate: '2023-06-15',
      },
    };
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('supplier');
    window.location.href = '/signin';
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setDashboardData(getMockData());
      setLoading(false);
    }, 1000);
  };

  const cards = [
    {
      title: 'Customer Orders',
      description: 'Process new orders, manage customer communications, and handle returns.',
      path: '/seller/customer_order',
      icon: <Boxes size={24} />,
      color: 'border-blue-500 hover:bg-blue-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Order Status Updates',
      description: 'Manage order fulfillment, shipping, and delivery status efficiently.',
      path: '/seller/status_update',
      icon: <RefreshCcw size={24} />,
      color: 'border-green-500 hover:bg-green-50',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    {
      title: 'Order History',
      description: 'Access complete order history with advanced filtering and export options.',
      path: '/seller/order_history',
      icon: <Clock size={24} />,
      color: 'border-orange-500 hover:bg-orange-50',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Fetching your latest data...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="text-center">
          <h2 className="text-xl lg:text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">Unable to load dashboard data</p>
          <button 
            onClick={refreshData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Total Orders', 
      value: dashboardData.stats.totalOrders.toString(), 
      change: dashboardData.stats.totalOrdersChange, 
      icon: <ShoppingCart size={20} />, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100' 
    },
    { 
      label: 'Pending Orders', 
      value: dashboardData.stats.pendingOrders.toString(), 
      change: dashboardData.stats.pendingOrdersChange, 
      icon: <Clock size={20} />, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100' 
    },
    { 
      label: 'Completed Sales', 
      value: dashboardData.stats.completedSales.toString(), 
      change: dashboardData.stats.completedSalesChange, 
      icon: <Package size={20} />, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100' 
    },
    { 
      label: 'Active Shipments', 
      value: dashboardData.stats.activeShipments.toString(), 
      change: dashboardData.stats.activeShipmentsChange, 
      icon: <RefreshCcw size={20} />, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100' 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-2 lg:p-3 rounded-xl lg:rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
                <Boxes className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">AutoRack</h1>
                <p className="text-xs lg:text-sm text-gray-600 font-medium">Seller Dashboard</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation and Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Refresh Button */}
              <button
                onClick={refreshData}
                className="p-3 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all duration-200 group"
                title="Refresh Data"
              >
                <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all duration-200 group"
                >
                  <Bell size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse font-bold">
                    {dashboardData.notifications.length}
                  </span>
                </button>
                
                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {dashboardData.notifications.map((notification) => (
                        <div key={notification.id} className="p-3 hover:bg-white/60 border-b border-gray-100 last:border-b-0 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            <span className="text-xs text-blue-600 font-medium">{notification.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold py-2 hover:bg-blue-50 rounded-lg transition-colors">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl transition-all duration-200 shadow-2xl hover:shadow-red-500/25 hover:scale-105 font-semibold text-sm lg:text-base"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 p-4 bg-white/90 rounded-xl border border-gray-200">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={refreshData}
                  className="flex items-center gap-2 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCcw size={20} />
                  <span>Refresh Data</span>
                </button>
                
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="flex items-center gap-2 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell size={20} />
                  <span>Notifications ({dashboardData.notifications.length})</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mx-4 lg:mx-6 mt-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <Bell className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow px-4 lg:px-6 py-6 lg:py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h2 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-700 bg-clip-text text-transparent mb-2">
                  Welcome back, {dashboardData.seller.name}!
                </h2>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className={`text-xs lg:text-sm font-semibold ${stat.color} mt-1`}>{stat.change}</p>
                  </div>
                  <div className={`${stat.color} bg-gradient-to-br from-current to-current opacity-20 p-2 lg:p-3 rounded-lg lg:rounded-xl`}>
                    <div className={`${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {cards.map((card, index) => (
              <div
                key={index}
                onClick={() => handleNavigation(card.path)}
                className={`bg-white/80 backdrop-blur-xl border-2 ${card.color} rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-2xl cursor-pointer transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:scale-105 group border-white/30`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <div className={`${card.iconBg} p-3 lg:p-4 rounded-xl lg:rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <div className="text-white">{card.icon}</div>
                    </div>
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  </div>
                  
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3 group-hover:text-blue-700 transition-colors">
                    {card.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm lg:text-base leading-relaxed flex-grow">
                    {card.description}
                  </p>
                  
                  <div className="mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold text-sm group-hover:text-blue-700 transition-colors">
                        Manage →
                      </span>
                      <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs">Go</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white mt-8 lg:mt-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 lg:p-3 rounded-xl lg:rounded-2xl shadow-xl">
                  <Boxes className="text-white" size={16} />
                </div>
                <span className="text-lg lg:text-xl font-bold">AutoRack</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Empowering sellers with cutting-edge e-commerce solutions. Your success is our priority.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-base lg:text-lg font-bold text-white">Quick Links</h3>
              <ul className="space-y-2 lg:space-y-3 text-sm">
                <li><a href="/seller/products" className="text-gray-300 hover:text-white transition-colors hover:underline">Product Management</a></li>
                <li><a href="/seller/orders" className="text-gray-300 hover:text-white transition-colors hover:underline">Order Management</a></li>
                <li><a href="/seller/analytics" className="text-gray-300 hover:text-white transition-colors hover:underline">Sales Analytics</a></li>
                <li><a href="/seller/inventory" className="text-gray-300 hover:text-white transition-colors hover:underline">Inventory Control</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-base lg:text-lg font-bold text-white">Support</h3>
              <ul className="space-y-2 lg:space-y-3 text-sm">
                <li><a href="/help" className="text-gray-300 hover:text-white transition-colors hover:underline">Help Center</a></li>
                <li><a href="/documentation" className="text-gray-300 hover:text-white transition-colors hover:underline">Documentation</a></li>
                <li><a href="/seller-guide" className="text-gray-300 hover:text-white transition-colors hover:underline">Seller Guide</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors hover:underline">Contact Support</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-base lg:text-lg font-bold text-white">Contact Us</h3>
              <div className="space-y-2 lg:space-y-3 text-sm">
                <div className="flex items-center space-x-3 p-2 bg-white/10 rounded-lg">
                  <Mail size={14} className="text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300 break-all">seller@autorack.com</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-white/10 rounded-lg">
                  <Phone size={14} className="text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">+91 1234567890</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-white/10 rounded-lg">
                  <MapPin size={14} className="text-red-400 flex-shrink-0" />
                  <span className="text-gray-300">Ahmedabad, Gujarat, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-white/20 mt-6 lg:mt-8 pt-6 lg:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-300 text-sm font-medium text-center md:text-left">
              © {new Date().getFullYear()} AutoRack Seller Panel. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-4 lg:space-x-6">
              <a href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors hover:underline">Privacy Policy</a>
              <a href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors hover:underline">Terms of Service</a>
              <a href="/security" className="text-gray-300 hover:text-white text-sm transition-colors hover:underline">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}