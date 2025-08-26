"use client"
import {io} from "socket.io-client"
import { useState, useEffect } from "react"
import {
  Boxes,
  RefreshCcw,
  Clock,
  LogOut,
  Bell,
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Menu,
  X,
  CheckCircle2,
  Truck,
  Package2,
  TrendingUpIcon,
} from "lucide-react"

interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedSales: number
  activeShipments: number
  totalOrdersChange: string
  pendingOrdersChange: string
  completedSalesChange: string
  activeShipmentsChange: string
}

interface InventoryItem {
  size: string
  stock: number
  lowStockThreshold: number
}

interface ProductInventory {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  inventory: InventoryItem[]
  totalStock: number
}

interface DashboardData {
  stats: OrderStats
  notifications: Array<{
    id: number
    title: string
    message: string
    time: string
    type: "order" | "payment" | "stock" | "system"
  }>
  seller: {
    name: string
    email: string
    totalRevenue: number
    joinedDate: string
  }
  product: ProductInventory
}



export default function SellerDashboard() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

     // Toast state for notifications
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: 'New Order', visible: true });

  // Show toast for 3 seconds
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };


  // Mock data function
  const getMockData = (): DashboardData => {
    return {
      stats: {
        totalOrders: 25,
        pendingOrders: 8,
        completedSales: 12,
        activeShipments: 5,
        totalOrdersChange: "+3",
        pendingOrdersChange: "+2",
        completedSalesChange: "+4",
        activeShipmentsChange: "+1",
      },
      notifications: [
        {
          id: 1,
          title: "New Order Received",
          message: "Order from John Doe - Qty: 2, Size: Large",
          time: "5 min ago",
          type: "order",
        },
        {
          id: 2,
          title: "Order Accepted",
          message: "Order from Mike Johnson has been accepted",
          time: "1 hour ago",
          type: "system",
        },
        {
          id: 3,
          title: "Order Delivered",
          message: "Order to Jane Smith has been delivered successfully",
          time: "2 hours ago",
          type: "system",
        },
      ],
      seller: {
        name: "AutoRack Seller",
        email: "seller@admin.com",
        totalRevenue: 30000.0,
        joinedDate: "2023-06-15",
      },
      product: {
        id: "AR001",
        name: "Premium AutoRack T-Shirt",
        description:
          "High-quality cotton t-shirt with AutoRack branding. Perfect for casual wear and promotional events.",
        price: 29.99,
        category: "Apparel",
        image: "/placeholder.svg?height=200&width=200",
        inventory: [
          { size: "Small", stock: 15, lowStockThreshold: 5 },
          { size: "Medium", stock: 8, lowStockThreshold: 10 },
          { size: "Large", stock: 22, lowStockThreshold: 8 },
          { size: "Extra Large", stock: 3, lowStockThreshold: 5 },
        ],
        totalStock: 48,
      },
    }
  }

  useEffect(() => {
  // Get seller id from localStorage (set at login)
  const seller = typeof window !== 'undefined' ? localStorage.getItem('supplier') : null;
  let sellerId = '';
  if (seller) {
    try {
      const parsed = JSON.parse(seller);
      sellerId = parsed._id || parsed.id || '';
    } catch (e) {}
  }
  if (!sellerId) return;
  const socket = io({ path: '/socket.io' });
  socket.emit('register', { userId: sellerId, role: 'seller' });
  socket.on('orderPlaced', (order) => {
    alert('New order received!');
    // Optionally, refresh dashboard data or notifications here
  });
  return () => { socket.disconnect(); };
}, []);
useEffect(() => {
    // Test toast on every page load
    showToast('Toast test: page loaded');
  }, []);



  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const res = await fetch("/api/sellerOrder/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data")
        }
        const data = await res.json()
        setDashboardData(data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Unable to fetch real data. Using mock data instead.")
        setDashboardData(getMockData()) // fallback if desired
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const handleNavigation = (path: string) => {
    window.location.href = path
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("supplier")
    window.location.href = "/signin"
  }

  const refreshData = async () => {
    setLoading(true)
    // Simulate refresh with mock data for demo
    setTimeout(() => {
      const mockData = getMockData()
      setDashboardData(mockData)
      setLoading(false)
      setError("Data refreshed with demo data.")
    }, 1000)
  }

  const cards = [
    {
      title: "Customer Orders",
      description: "Process new orders, manage customer communications, and handle returns.",
      path: "/seller/customer_order",
      icon: <Boxes size={24} />,
      color: "border-blue-500 hover:bg-blue-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      title: "Order Status Updates",
      description: "Manage order fulfillment, shipping, and delivery status efficiently.",
      path: "/seller/status_update",
      icon: <RefreshCcw size={24} />,
      color: "border-green-500 hover:bg-green-50",
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      title: "Order History",
      description: "Access complete order history with advanced filtering and export options.",
      path: "/seller/order_history",
      icon: <Clock size={24} />,
      color: "border-orange-500 hover:bg-orange-50",
      iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
    {
      title: "Inventory Management",
      description: "Manage product stock levels, track inventory, and update availability by size.",
      path: "/seller/inventory_management",
      icon: <Package2 size={24} />,
      color: "border-purple-500 hover:bg-purple-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Fetching your latest data...</p>
        </div>
      </div>
    )
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
            Load Demo Data
          </button>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: "Total Orders",
      value: dashboardData.stats.totalOrders.toString(),
      change: dashboardData.stats.totalOrdersChange,
      icon: <ShoppingCart size={20} />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Pending Orders",
      value: dashboardData.stats.pendingOrders.toString(),
      change: dashboardData.stats.pendingOrdersChange,
      icon: <Clock size={20} />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      label: "Completed Sales",
      value: dashboardData.stats.completedSales.toString(),
      change: dashboardData.stats.completedSalesChange,
      icon: <CheckCircle2 size={20} />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      label: "Active Shipments",
      value: dashboardData.stats.activeShipments.toString(),
      change: dashboardData.stats.activeShipmentsChange,
      icon: <Truck size={20} />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ]

 return (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden font-sans">
    {/* Animated Background Elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>

    {/* Header */}
    <header className="bg-white/70 backdrop-blur-xl shadow-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-3 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300">
            <Boxes className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent select-none">
              AutoRack
            </h1>
            <p className="text-sm text-gray-600 font-medium">Seller Dashboard</p>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Navigation and Actions */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Refresh Button */}
          <button
            onClick={refreshData}
            className="p-3 text-gray-600 hover:text-gray-900 hover:bg-white/90 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Refresh Data"
          >
            <RefreshCcw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-white/90 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-haspopup="true"
              aria-expanded={isNotificationOpen}
              aria-label="Toggle notifications"
            >
              <Bell size={24} className="group-hover:scale-110 transition-transform" />
              {dashboardData.notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse font-bold select-none">
                  {dashboardData.notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 z-50 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-gray-100">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                </div>
                {dashboardData.notifications.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">No new notifications</p>
                ) : (
                  <ul>
                    {dashboardData.notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className="p-3 hover:bg-white/60 border-b border-gray-200 last:border-b-0 transition-colors cursor-pointer select-none"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          </div>
                          <time className="text-xs text-blue-600 font-medium flex-shrink-0 ml-3">
                            {notification.time}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="p-3 border-t border-gray-200">
                  <button
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold py-2 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => {
                      // Implement View All Notifications action
                      setIsNotificationOpen(false);
                    }}
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-5 py-2 rounded-2xl shadow-lg hover:shadow-red-500/30 transition-transform hover:scale-105 font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-red-400"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden mt-4 p-6 bg-white/90 rounded-2xl border border-gray-200 shadow-lg space-y-5">
          <button
            onClick={refreshData}
            className="flex items-center gap-3 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors w-full font-semibold"
          >
            <RefreshCcw size={22} />
            Refresh Data
          </button>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="flex items-center gap-3 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors w-full font-semibold"
          >
            <Bell size={22} />
            Notifications ({dashboardData.notifications.length})
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl transition-colors font-semibold w-full justify-center"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      )}
    </header>

    {/* Error Banner */}
    {error && (
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 mx-4 lg:mx-6 mt-4 rounded-r-lg shadow-md max-w-7xl mx-auto">
        <div className="flex">
          <div className="flex-shrink-0">
            <Bell className="h-6 w-6 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      </div>
    )}

    {/* Main Content */}
    <main className="flex-grow px-4 lg:px-6 py-6 lg:py-8 relative z-10 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <section className="mb-8">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
          Welcome back, {dashboardData.seller.name}!
        </h2>
      </section>

      {/* Statistics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-sm font-semibold mt-1 ${stat.color}`}>{stat.change}</p>
              </div>
              <div
                className={`p-4 rounded-2xl border ${stat.borderColor} ${stat.bgColor} shadow-2xl`}
              >
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Dashboard Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => {
              console.log("Navigating to:", card.path);
              handleNavigation(card.path);
            }}
            className={`cursor-pointer bg-white/80 backdrop-blur-xl border-2 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-2 hover:scale-105 group border-white/30 ${card.color}`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`${card.iconBg} p-4 rounded-2xl shadow-2xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <div className="text-white">{card.icon}</div>
                </div>
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                {card.title}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed flex-grow">{card.description}</p>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold text-sm group-hover:text-blue-700 transition-colors">
                    Manage →
                  </span>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs">Go</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>

    {/* Footer */}
    <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white mt-12 relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-black/25"></div>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-xl flex items-center justify-center">
                <Boxes className="text-white" size={18} />
              </div>
              <span className="text-2xl font-extrabold">AutoRack</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              Empowering sellers with cutting-edge e-commerce solutions. Your success is our priority.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/seller/products", label: "Product Management" },
                { href: "/seller/orders", label: "Order Management" },
                { href: "/seller/analytics", label: "Sales Analytics" },
                { href: "/seller/inventory", label: "Inventory Control" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-300 hover:text-white transition-colors hover:underline"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Support</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/help", label: "Help Center" },
                { href: "/documentation", label: "Documentation" },
                { href: "/seller-guide", label: "Seller Guide" },
                { href: "/contact", label: "Contact Support" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-300 hover:text-white transition-colors hover:underline"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-2xl">
                <Mail size={16} className="text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 break-all">seller@autorack.com</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-2xl">
                <Phone size={16} className="text-green-400 flex-shrink-0" />
                <span className="text-gray-300">+91 1234567890</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-2xl">
                <MapPin size={16} className="text-red-400 flex-shrink-0" />
                <span className="text-gray-300">Ahmedabad, Gujarat, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-white/25 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-300 text-sm font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} AutoRack Seller Panel. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
            <a
              href="/privacy"
              className="text-gray-300 hover:text-white transition-colors hover:underline"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-gray-300 hover:text-white transition-colors hover:underline"
            >
              Terms of Service
            </a>
            <a
              href="/security"
              className="text-gray-300 hover:text-white transition-colors hover:underline"
            >
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
)
}