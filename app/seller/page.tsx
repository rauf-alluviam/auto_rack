'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  Boxes, 
  RefreshCcw, 
  Clock, 
  LogOut, 
  Bell, 
  Settings, 
  User, 
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Shield,
  Palette,
  CreditCard,
  HelpCircle,
  TrendingUp,
  Package,
  Users,
  Star
} from 'lucide-react';

export default function SellerDashboard() {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleNavigation = (path: string) => {
  router.push(path);
};

  const handleLogout = () => {
   
    router.push('/signup');
  };

  // const settingsMenuItems = [
  //   { icon: <User size={18} />, label: 'Account Settings', path: '/seller/account' },
  //   { icon: <Shield size={18} />, label: 'Security', path: '/seller/security' },
  //   { icon: <Palette size={18} />, label: 'Appearance', path: '/seller/appearance' },
  //   { icon: <CreditCard size={18} />, label: 'Payment Settings', path: '/seller/payment' },
  //   { icon: <HelpCircle size={18} />, label: 'Help & Support', path: '/seller/help' },
  // ];

  const notifications = [
    { id: 1, title: 'New Order Received', message: 'Order #12345 has been placed', time: '2 min ago', type: 'order' },
    { id: 2, title: 'Payment Received', message: 'Payment for order #12344 confirmed', time: '1 hour ago', type: 'payment' },
    { id: 3, title: 'Stock Alert', message: 'Product ABC is running low', time: '3 hours ago', type: 'stock' },
  ];

  const profileMenuItems = [
    { icon: <User size={18} />, label: 'My Profile', path: '/seller/profile' },
    { icon: <Settings size={18} />, label: 'Account Settings', path: '/seller/account' },
    { icon: <HelpCircle size={18} />, label: 'Help Center', path: '/seller/help' },
  ];

  const cards = [
    {
      title: 'Customer Orders',
      description: 'Process new orders, manage customer communications, and handle returns.',
      path: '/seller/customer_order',
      icon: <Boxes size={32} />,
      color: 'border-blue-500 hover:bg-blue-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Order Status Updates',
      description: 'Manage order fulfillment, shipping, and delivery status efficiently.',
      path: '/seller/status_update',
      icon: <RefreshCcw size={32} />,
      color: 'border-green-500 hover:bg-green-50',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    {
      title: 'Order History',
      description: 'Access complete order history with advanced filtering and export options.',
      path: '/seller/order_history',
      icon: <Clock size={32} />,
      color: 'border-orange-500 hover:bg-orange-50',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
  ];

  const stats = [
    { label: 'Total Orders', value: '8', change: '+2', icon: <ShoppingCart size={20} />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Pending Orders', value: '2', change: '+1', icon: <Clock size={20} />, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { label: 'Completed Sales', value: '1', change: '+1', icon: <Package size={20} />, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Active Shipments', value: '4', change: '+3', icon: <RefreshCcw size={20} />, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden"
         onClick={() => {
           setIsSettingsOpen(false);
           setIsNotificationOpen(false);
           setIsProfileOpen(false);
         }}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-50" onClick={(e) => e.stopPropagation()}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-3 rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
                <Boxes className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">AutoRack</h1>
                <p className="text-sm text-gray-600 font-medium">Seller Dashboard</p>
              </div>
            </div>

            {/* Navigation and Actions */}
            <div className="flex items-center space-x-6">
              {/* Action Buttons */}
              {/* <div className="relative">
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all duration-200 group"
                >
                  <Bell size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse font-bold">3</span>
                </button>
                
                {/* Notification Dropdown */}
                {/* {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 animate-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
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
              </div> }*/} 
              
              {/* <div className="relative">
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-3 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all duration-200 group"
                >
                  <Settings size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
                
                {/* Settings Dropdown */}
                {/* {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 animate-in slide-in-from-top-2">
                    <div className="p-2">
                      {settingsMenuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            router.push(item.path);
                            setIsSettingsOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-105"
                        >
                          <div className="text-blue-600">{item.icon}</div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div> }*/}

              {/* <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-3 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all duration-200 group"
                >
                  <User size={20} className="group-hover:scale-110 transition-transform" />
                </button>
                
                {/* Profile Dropdown */}
                {/* {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 animate-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-bold text-sm text-gray-900">seller</p>
                      <p className="text-xs text-blue-600">seller@example.com</p>
                    </div>
                    <div className="p-2">
                      {profileMenuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            router.push(item.path);
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-105"
                        >
                          <div className="text-blue-600">{item.icon}</div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div> }*/} 

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-2xl hover:shadow-red-500/25 hover:scale-105 font-semibold"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-6 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-700 bg-clip-text text-transparent mb-2">
              Welcome back, Seller!
            </h2>
            <p className="text-gray-600 text-lg">Manage your business efficiently with our comprehensive seller tools.</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className={`text-sm font-semibold ${stat.color} mt-1`}>{stat.change}</p>
                  </div>
                  <div className={`${stat.color} bg-gradient-to-br from-current to-current opacity-20 p-3 rounded-xl`}>
                    <div className={`${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card, index) => (
              <div
                key={index}
                onClick={() => handleNavigation(card.path)}
                className={`bg-white/80 backdrop-blur-xl border-2 ${card.color} rounded-3xl p-8 shadow-2xl cursor-pointer transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:scale-105 group border-white/30`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`${card.iconBg} p-4 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <div className="text-white">{card.icon}</div>
                    </div>
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                    {card.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                    {card.description}
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold text-sm group-hover:text-blue-700 transition-colors">
                        Manage →
                      </span>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white mt-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-xl">
                  <Boxes className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold">AutoRack</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Empowering sellers with cutting-edge e-commerce solutions. Your success is our priority.
              </p>
              <div className="flex space-x-4">
                <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                  <Facebook className="text-white" size={20} />
                </div>
                <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                  <Twitter className="text-white" size={20} />
                </div>
                <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                  <Instagram className="text-white" size={20} />
                </div>
                <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                  <Linkedin className="text-white" size={20} />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="/seller/products" className="text-gray-300 hover:text-white transition-colors hover:underline">Product Management</a></li>
                <li><a href="/seller/orders" className="text-gray-300 hover:text-white transition-colors hover:underline">Order Management</a></li>
                <li><a href="/seller/analytics" className="text-gray-300 hover:text-white transition-colors hover:underline">Sales Analytics</a></li>
                <li><a href="/seller/inventory" className="text-gray-300 hover:text-white transition-colors hover:underline">Inventory Control</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Support</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="/help" className="text-gray-300 hover:text-white transition-colors hover:underline">Help Center</a></li>
                <li><a href="/documentation" className="text-gray-300 hover:text-white transition-colors hover:underline">Documentation</a></li>
                <li><a href="/seller-guide" className="text-gray-300 hover:text-white transition-colors hover:underline">Seller Guide</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors hover:underline">Contact Support</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Contact Us</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 p-2 bg-white/10 rounded-lg">
                  <Mail size={16} className="text-blue-400" />
                  <span className="text-gray-300">seller@autorack.com</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-white/10 rounded-lg">
                  <Phone size={16} className="text-green-400" />
                  <span className="text-gray-300">+91 1234567890</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-white/10 rounded-lg">
                  <MapPin size={16} className="text-red-400" />
                  <span className="text-gray-300">Ahmedabad, Gujarat, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm font-medium">
              © {new Date().getFullYear()} AutoRack Seller Panel. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
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