"use client"
import {io, Socket} from "socket.io-client" // Import Socket type if needed
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"; 
import {
  Boxes, RefreshCcw, Clock, LogOut, Bell, ShoppingCart, Loader2, Menu, X,
  CheckCircle2, Truck, Package2, ChevronDown, User, Home, Zap, ChevronRight,
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast";
import { useRef } from "react";

// Interfaces remain the same
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(true)
  const [activePage, setActivePage] = useState("dashboard")
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  
  // NEW: State to track socket connection visually
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const router = useRouter();
  const socketRef = useRef<any>(null);
  
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
        { id: 1, title: "New Order Received", message: "Order from John Doe - Qty: 2, Size: Large", time: "5 min ago", type: "order" },
        { id: 2, title: "Order Accepted", message: "Order from Mike Johnson has been accepted", time: "1 hour ago", type: "system" },
        { id: 3, title: "Order Delivered", message: "Order to Jane Smith has been delivered successfully", time: "2 hours ago", type: "system" },
      ],
      seller: { name: "AutoRack Seller", email: "seller@admin.com", totalRevenue: 30000.0, joinedDate: "2023-06-15" },
      product: {
        id: "AR001",
        name: "Premium AutoRack T-Shirt",
        description: "High-quality cotton t-shirt with AutoRack branding.",
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
    const stored = localStorage.getItem("userData")
    if (stored) {
      try { setProfile(JSON.parse(stored)) } catch { console.error("Invalid supplier data") }
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("supplier_token");
    if (!token) {
      router.push("/signin");
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/sellerOrder/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("supplier_token");
            router.push("/signin");
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error("Failed to fetch dashboard data")
        }
        const data = await res.json()
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Unable to fetch real data. Using mock data instead.")
        setDashboardData(getMockData())
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData();
  }, [router]); 

  // --- DIAGNOSTIC SOCKET LOGIC (FIXED) ---
  useEffect(() => {
    // FIXED: Changed from "supplier" to "userData" to match your storage logic
    const sellerStr = localStorage.getItem("userData");
    if (!sellerStr) return;

    let sellerId;
    try {
      const seller = JSON.parse(sellerStr);
      sellerId = seller._id || seller.id;
    } catch (e) {
      console.error("Failed to parse seller data", e);
      return;
    }

    if (!sellerId) {
      console.warn("No Seller ID found in localStorage");
      return;
    }

    // CHECK THIS URL: 
    // 1. If Next.js API routes handle sockets, 'window.location.origin' is correct.
    // 2. If you have a SEPARATE backend server (e.g., on port 5000), change this to 'http://localhost:5000'.
    const socketUrl = window.location.origin; 

    console.log(`🔌 Attempting to connect to Socket Server at: ${socketUrl}`);

    const socket = io(socketUrl, {
      path: "/socket.io",
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket CONNECTED. ID:", socket.id);
      setIsSocketConnected(true);
      
      // Emit registration
      const payload = { userId: sellerId, role: "seller" };
      console.log("📤 Sending Register Payload:", payload);
      socket.emit("register", payload);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket DISCONNECTED");
      setIsSocketConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket Connection Error:", err.message);
      setIsSocketConnected(false);
      toast.error("Live updates connection failed");
    });

    socket.on("orderPlaced", (order) => {
      // DIAGNOSTIC LOGGING
      console.log("🔥🔥🔥 'orderPlaced' EVENT RECEIVED!!! 🔥🔥🔥");
      console.log("Payload:", order);

      toast.success("📦 New order received!");

      setDashboardData((prevData) => {
        if (!prevData) return prevData;

        // Safe parsing
        const qty = order?.quantity || order?.items?.length || 1;
        const size = order?.size || order?.items?.[0]?.size || "N/A";

        return {
          ...prevData,
          stats: {
            ...prevData.stats,
            totalOrders: prevData.stats.totalOrders + 1,
            pendingOrders: prevData.stats.pendingOrders + 1,
          },
          notifications: [
            {
              id: Date.now(),
              title: "New Order Received",
              message: `Qty: ${qty}, Size: ${size}`,
              time: "Just now",
              type: "order",
            },
            ...prevData.notifications,
          ],
        };
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleNavigation = (path: string) => { window.location.href = path }
  const handleLogout = () => {
    localStorage.removeItem("supplier_token")
    localStorage.removeItem("supplier")
    window.location.href = "/signin"
  }
  const refreshData = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("supplier_token")
      const res = await fetch("/api/sellerOrder/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error("Failed to fetch dashboard data")
      const data = await res.json()
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Unable to fetch fresh data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    { title: "Customer Orders", description: "Process new orders, manage customer communications, and handle returns.", path: "/seller/customer_order", icon: <Boxes size={24} />, color: "from-blue-500 to-blue-600", borderColor: "border-blue-200" },
    { title: "Order Status Updates", description: "Manage order fulfillment, shipping, and delivery status efficiently.", path: "/seller/status_update", icon: <RefreshCcw size={24} />, color: "from-emerald-500 to-emerald-600", borderColor: "border-emerald-200" },
    { title: "Order History", description: "Access complete order history with advanced filtering and export options.", path: "/seller/order_history", icon: <Clock size={24} />, color: "from-amber-500 to-amber-600", borderColor: "border-amber-200" },
    { title: "Inventory Management", description: "Manage product stock levels, track inventory, and update availability by size.", path: "/seller/inventory_management", icon: <Package2 size={24} />, color: "from-purple-500 to-purple-600", borderColor: "border-purple-200" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Fetching your latest data...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">Unable to load dashboard data</p>
          <button onClick={refreshData} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Load Demo Data</button>
        </div>
      </div>
    )
  }

  const stats = [
    { label: "Total Orders", value: dashboardData.stats.totalOrders.toString(), change: dashboardData.stats.totalOrdersChange, icon: <ShoppingCart size={20} />, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Pending Orders", value: dashboardData.stats.pendingOrders.toString(), change: dashboardData.stats.pendingOrdersChange, icon: <Clock size={20} />, color: "text-amber-600", bgColor: "bg-amber-50" },
    { label: "Completed Sales", value: dashboardData.stats.completedSales.toString(), change: dashboardData.stats.completedSalesChange, icon: <CheckCircle2 size={20} />, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: "Active Shipments", value: dashboardData.stats.activeShipments.toString(), change: dashboardData.stats.activeShipmentsChange, icon: <Truck size={20} />, color: "text-purple-600", bgColor: "bg-purple-50" },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', background: '#18181b', color: '#fff', padding: '16px', }, success: { iconTheme: { primary: '#10b981', secondary: '#fff', }, }, }} />

      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} hidden lg:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 sticky top-0 h-screen z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
        
        <div className="h-20 flex items-center border-b border-gray-50 bg-white shrink-0 relative">
          {isSidebarOpen ? (
            <div className="w-full flex justify-between items-center px-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20"><Boxes className="text-white" size={20} /></div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg tracking-tight leading-none">AutoRack</h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-1">Seller Portal</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"><Menu size={18} /></button>
            </div>
          ) : (
            <div className="w-full flex justify-center items-center">
              <button onClick={() => setIsSidebarOpen(true)} className="flex items-center justify-center transition-transform active:scale-95" title="Open Menu">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20"><Boxes className="text-white" size={18} /></div>
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-6 space-y-6 overflow-y-auto">
          <div className={`space-y-1 ${!isSidebarOpen ? 'flex flex-col items-center' : ''}`}>
            <div>
               {isSidebarOpen && <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Overview</p>}
               <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activePage.startsWith('dashboard') ? 'text-blue-600 bg-blue-50/50 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Home size={20} className={activePage.startsWith('dashboard') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                {isSidebarOpen && <span className="text-sm">Dashboard</span>}
                {isSidebarOpen && <ChevronDown size={16} className={`ml-auto transition-transform duration-200 text-gray-400 ${isDropdownOpen ? 'rotate-180' : ''}`} />}
              </button>
              {isDropdownOpen && isSidebarOpen && (
                <div className="pl-12 mt-1 space-y-1">
                  <button onClick={() => { setActivePage('customer-orders'); handleNavigation('/seller/customer_order'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"><ShoppingCart size={16} /><span>Orders</span></button>
                  <button onClick={() => { setActivePage('inventory'); handleNavigation('/seller/inventory_management'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"><Package2 size={16} /><span>Inventory</span></button>
                  <button onClick={() => { setActivePage('order-history'); handleNavigation('/seller/order_history'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"><Clock size={16} /><span>History</span></button>
                  <button onClick={() => { setActivePage('status-update'); handleNavigation('/seller/status_update'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"><RefreshCcw size={16} /><span>Status</span></button>
                </div>
              )}
            </div>
          </div>
          <div className={`space-y-1 ${!isSidebarOpen ? 'flex flex-col items-center' : ''}`}>
             {isSidebarOpen && <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Actions</p>}
            <button onClick={() => handleNavigation('/open-points')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activePage === 'open-points' ? 'text-amber-600 bg-amber-50/50 font-medium border-l-4 border-amber-500' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Zap size={20} className={activePage === 'open-points' ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'} />
              {isSidebarOpen && <span className="text-sm">Open Points</span>}
            </button>
          </div>
        </nav>
        <div className="border-t border-gray-100 p-4 bg-gray-50/50">
          {isSidebarOpen ? (
            <div className="relative">
              <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="w-full px-3 py-3 bg-white border border-gray-200 hover:border-gray-300 rounded-xl transition-all flex items-center gap-3 group shadow-sm">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"><User size={18} className="text-white" /></div>
                <div className="flex-1 min-w-0 text-left"><p className="font-semibold text-sm text-gray-900 truncate">{dashboardData.seller.name}</p><p className="text-[11px] text-gray-500 truncate">{dashboardData.seller.email}</p></div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
                  <button onClick={() => { setShowProfile(true); setIsProfileDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm"><User size={18} /><span>View Profile</span></button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm border-t border-gray-100"><LogOut size={18} /><span>Logout</span></button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto hover:scale-105 transition-transform shadow-md shadow-blue-500/30"><User size={18} className="text-white" /></button>
              {isProfileDropdownOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
                  <div className="px-3 py-2 border-b border-gray-100 bg-gray-50"><p className="font-semibold text-xs text-gray-900 truncate">{dashboardData.seller.name}</p><p className="text-[10px] text-gray-600 truncate">{dashboardData.seller.email}</p></div>
                  <button onClick={() => { setActivePage('profile'); setIsProfileDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm"><User size={18} /><span>View Profile</span></button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm border-t border-gray-100"><LogOut size={18} /><span>Logout</span></button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all">
          <div className="h-full px-8 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30"><Boxes className="text-white" size={20} /></div>
              <div><h1 className="font-bold text-gray-900">AutoRack</h1><p className="text-xs text-gray-500">Seller Portal</p></div>
            </div>
            <div className="hidden lg:block"><h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h1><p className="text-sm text-gray-500">Welcome back, <span className="font-medium text-gray-700">{dashboardData.seller.name}</span></p></div>
            <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
            <div className="hidden lg:flex items-center gap-3">
              <div className="relative">
                {/* --- DIAGNOSTIC INDICATOR --- */}
                {isSocketConnected ? (
                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10 animate-pulse" title="Socket Connected" />
                ) : (
                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full z-10" title="Socket Disconnected" />
                )}
                <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <Bell size={20} />
                  {dashboardData.notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white">{dashboardData.notifications.length}</span>}
                </button>
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center"><h3 className="font-semibold text-gray-900">Notifications</h3><span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">{dashboardData.notifications.length} New</span></div>
                    <div className="max-h-80 overflow-y-auto">
                      {dashboardData.notifications.map((notification) => (
                        <div key={notification.id} className="p-4 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1"><p className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{notification.title}</p><p className="text-xs text-gray-500 mt-1 leading-relaxed">{notification.message}</p></div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap bg-gray-50 px-1.5 py-0.5 rounded">{notification.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-50 bg-gray-50/50 rounded-b-2xl"><button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-2 transition-colors">View All Notifications</button></div>
                  </div>
                )}
              </div>
            </div>
            {isMobileMenuOpen && (
              <div className="absolute top-20 left-0 right-0 bg-white border-b border-gray-100 p-4 lg:hidden shadow-lg z-40">
                <div className="flex flex-col gap-2">
                  <button onClick={refreshData} className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"><RefreshCcw size={20} /><span>Refresh Data</span></button>
                  <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"><Bell size={20} /><span>Notifications ({dashboardData.notifications.length})</span></button>
                  <button onClick={handleLogout} className="flex items-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-lg transition-colors font-medium"><LogOut size={18} /><span>Logout</span></button>
                </div>
              </div>
            )}
          </div>
        </header>

        {error && (
          <div className="mx-8 mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
            <div className="flex items-start gap-3"><Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-blue-800 font-medium">{error}</p></div>
            <button onClick={() => setError(null)} className="text-blue-400 hover:text-blue-600"><X size={18} /></button>
          </div>
        )}

        <main className="flex-1 px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="lg:hidden"><h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back!</h2><p className="text-gray-600">Here's what's happening with your store today.</p></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${stat.bgColor} p-2.5 rounded-xl`}><div className={stat.color}>{stat.icon}</div></div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md bg-gray-50 ${stat.color}`}>{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {cards.map((card, index) => (
                  <div key={index} onClick={() => handleNavigation(card.path)} className={`group bg-white rounded-2xl p-6 border ${card.borderColor} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer`}>
                    <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300`}><div className="text-white">{card.icon}</div></div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{card.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{card.description}</p>
                    <div className="flex items-center text-sm font-medium text-blue-600 group-hover:gap-2 transition-all"><span>Manage</span><ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      {showProfile && profile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"><User className="text-white" size={26} /></div>
              <div><h2 className="text-xl font-bold text-gray-900">{profile.name}</h2><p className="text-sm text-gray-500 capitalize">{profile.userType}</p></div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Name</p><p className="font-medium text-gray-900">{profile.name}</p></div>
              <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Company Name</p><p className="font-medium text-gray-900">{profile.companyName || "—"}</p></div>
              <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Email</p><p className="font-medium text-gray-900 break-all">{profile.email}</p></div>
            </div>
            <div className="mt-6 flex justify-end"><button onClick={() => setShowProfile(false)} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium">Close</button></div>
          </div>
        </div>
      )}
    </div>
  )
}