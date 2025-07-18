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
  HelpCircle
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
    // Note: localStorage not available in Claude environment
    // localStorage.removeItem('token');
    router.push('/auth/logout');
  };

  const settingsMenuItems = [
    { icon: <User size={18} />, label: 'Account Settings', path: '/seller/account' },
    { icon: <Shield size={18} />, label: 'Security', path: '/seller/security' },
    { icon: <Palette size={18} />, label: 'Appearance', path: '/seller/appearance' },
    { icon: <CreditCard size={18} />, label: 'Payment Settings', path: '/seller/payment' },
    { icon: <HelpCircle size={18} />, label: 'Help & Support', path: '/seller/help' },
  ];

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
      path: '/seller/order-history',
      icon: <Clock size={32} />,
      color: 'border-orange-500 hover:bg-orange-50',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100"
         onClick={() => {
           setIsSettingsOpen(false);
           setIsNotificationOpen(false);
           setIsProfileOpen(false);
         }}>
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo  */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Boxes className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AutoRack</h1>
                <p className="text-sm text-gray-600">Seller Dashboard</p>
              </div>
            </div>

            {/* Navigation and Actions */}
            <div className="flex items-center space-x-6">
              {/* Action Buttons */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </button>
                
                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            <span className="text-xs text-gray-500">{notification.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings size={20} />
                </button>
                
                {/* Settings Dropdown */}
                {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-2">
                      {settingsMenuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            router.push(item.path);
                            setIsSettingsOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {item.icon}
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User size={20} />
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-sm text-gray-900">seller</p>
                      <p className="text-xs text-gray-600">seller@example.com</p>
                    </div>
                    <div className="p-2">
                      {profileMenuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            router.push(item.path);
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {item.icon}
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Seller!</h2>
            <p className="text-gray-600">Manage your business efficiently with our comprehensive seller tools.</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <div
                key={index}
                onClick={() => handleNavigation(card.path)}
                className={`bg-white border-2 ${card.color} rounded-2xl p-6 shadow-lg cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 group`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${card.iconBg} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white">{card.icon}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                    {card.description}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700">
                      Manage →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Boxes className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold">AutoRack</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Empowering sellers with cutting-edge e-commerce solutions. Your success is our priority.
              </p>
              <div className="flex space-x-3">
                <Facebook className="text-gray-400 hover:text-white cursor-pointer transition-colors" size={20} />
                <Twitter className="text-gray-400 hover:text-white cursor-pointer transition-colors" size={20} />
                <Instagram className="text-gray-400 hover:text-white cursor-pointer transition-colors" size={20} />
                <Linkedin className="text-gray-400 hover:text-white cursor-pointer transition-colors" size={20} />
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/seller/products" className="text-gray-300 hover:text-white transition-colors">Product Management</a></li>
                <li><a href="/seller/orders" className="text-gray-300 hover:text-white transition-colors">Order Management</a></li>
                <li><a href="/seller/analytics" className="text-gray-300 hover:text-white transition-colors">Sales Analytics</a></li>
                <li><a href="/seller/inventory" className="text-gray-300 hover:text-white transition-colors">Inventory Control</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/documentation" className="text-gray-300 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/seller-guide" className="text-gray-300 hover:text-white transition-colors">Seller Guide</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Us</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-300">seller@autorack.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-300">+91 1234567890</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-300">Ahmedabad, Gujarat, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} AutoRack Seller Panel. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="/security" className="text-gray-400 hover:text-white text-sm transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}