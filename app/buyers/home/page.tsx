"use client"
import { useRouter } from "next/navigation"

import { useState, useEffect } from "react"
import {
  ShoppingCart,
  Package,
  Clock,
  LogOut,
  Bell,
  Settings,
  User,
  Search,
  Plus,
  MapPin,
  Calendar,
  AlertCircle,
  RefreshCw,

 
} from "lucide-react"

interface Order {
  _id: string
  product_name: string
  customer_name?: string
  delivery_address: string
  estimated_delivery: string | null
  is_accepted: "Accepted" | "Pending" | "Rejected" | "In production" | "Quality Check" | "Packaging" | "Shipped" | "Delivered"
  order_date: string
  quantity: number
  size: string
  buyer: string
}

interface BuyerData {
  _id?: string
  name: string
  email: string
  phone?: string
  address?: string
}

export default function BuyerDashboard() {
  const [buyerData, setBuyerData] = useState<BuyerData | null>(null)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingUser, setLoadingUser] = useState(true)
  const [ordersError, setOrdersError] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
 
    
    const router = useRouter();

  // const notifications: {
  //   id: number;
  //   title: string;
  //   message: string;
  //   time: string;
  //   type?: string;
  // }[] = [
  //   { id: 1, title: "Order Shipped", message: "Your order #... has been shipped", time: "2 hours ago" },
  //   { id: 2, title: "New Offers", message: "Special discount – 20% off", time: "1 day ago", type: "offer" },
  // ];

  // const profileMenuItems: {
  //   icon: React.ReactNode;
  //   label: string;
  //   path: string;
  // }[] = [
  //   { icon: <User size={18} />, label: "My Profile", path: "/buyers/profile" },
  //   { icon: <Settings size={18} />, label: "Account Settings", path: "/buyers/account" },
  // ];
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }

  const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    } catch (e) {
      console.error("Invalid date string:", dateString, e)
      return "Invalid Date"
    }
  }

  const navigateToSignin = () => {
    window.location.href = "/signin"
  }

  const navigateToPlaceOrder = () => {
    window.location.href = "/buyers/place_order"
  }

  const navigateToProfile = (path: string) => {
    window.location.href = path
  }

  useEffect(() => {
    const checkAuth = () => {
      setLoadingUser(true)
      const storedToken = localStorage.getItem("token")
      if (!storedToken) {
        console.log("No token found. Redirecting to signin...")
        navigateToSignin()
        return
      }

      const decoded: any = decodeToken(storedToken)
      if (!decoded || !decoded.id) {
        console.log("Invalid token structure")
        localStorage.clear()
        navigateToSignin()
        return
      }

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        console.log("Token expired")
        localStorage.clear()
        navigateToSignin()
        return
      }

      setToken(storedToken)

      const buyerInfo: BuyerData = {
        _id: decoded.id,
        name: decoded.name || "User",
        email: decoded.email || "user@example.com",
      }

      const userData = localStorage.getItem("userData")
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData)
          buyerInfo.phone = parsedUserData.phone
          buyerInfo.address = parsedUserData.address
        } catch (parseError) {
          console.error("Error parsing user data:", parseError)
        }
      }

      setBuyerData(buyerInfo)
      setAuthChecked(true)
      setLoadingUser(false)
    }

    if (!authChecked) {
      checkAuth()
    }
  }, [authChecked])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!buyerData?._id || !token || !authChecked) return

      setLoadingOrders(true)
      setOrdersError("")

      try {
        const res = await fetch(`/api/orders`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.clear()
            navigateToSignin()
            return
          }
          throw new Error(`Failed to fetch orders: ${res.status}`)
        }

        const data = await res.json()
        setOrders(data.orders || [])
        setOrdersError("")
      } catch (error) {
        console.error("Error fetching orders:", error)
        setOrdersError("Failed to load orders. Please try again.")
      } finally {
        setLoadingOrders(false)
      }
    }

    if (authChecked && buyerData && token) {
      fetchOrders()
    }
  }, [buyerData?._id, token, authChecked])

  const handleLogout = () => {
    localStorage.clear()
    setBuyerData(null)
    setToken(null)
    setAuthChecked(false)
    setOrders([])
    navigateToSignin()
  }

  const getStatusColor = (status: Order["is_accepted"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Accepted":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "In production":
        return "bg-gray-100 text-gray-800"
      case "Quality Check":
        return "bg-blue-100 text-blue-800"
      case "Packaging":
        return "bg-purple-100 text-purple-800"
      case "Shipped":
        return "bg-indigo-100 text-indigo-800"
      case "Delivered":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: Order["is_accepted"]) => status

 
  if (loadingUser || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  
  if (!buyerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium mb-2">Authentication Required</p>
          <p className="text-gray-600">Please sign in to access your dashboard.</p>
        </div>
      </div>
    )
  }

  if (ordersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium mb-2">Error Loading Orders</p>
          <p className="text-gray-600">{ordersError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === "all") return true
    return order.is_accepted === selectedFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  AutoRack
                </h1>
                <p className="text-sm text-gray-600 font-medium">Buyer Dashboard</p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2.5 w-80 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm"
                />
              </div>
              
              {/* New Order Button */}
              <button
                onClick={() => router.push("/buyers/place_order")}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Order
              </button>
              
              {/* Notifications */}
              {/* <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    2
                  </span>
                </button>
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-gray-50 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div> */}
              
              {/* Profile */}
              {/* <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="hidden md:block font-medium text-gray-700">{buyerData.name}</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{buyerData.name}</p>
                      <p className="text-sm text-gray-600">{buyerData.email}</p>
                      {buyerData.phone && (
                        <p className="text-sm text-gray-600">{buyerData.phone}</p>
                      )}
                    </div>
                    <div className="p-2">
                      {profileMenuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            router.push(item.path)
                            setIsProfileOpen(false)
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
              </div> */}
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loadingOrders ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome back, {buyerData.name}!</h2>
                  <p className="text-gray-600">{buyerData.email}</p>
                  {buyerData.phone && <p className="text-sm text-gray-500">Phone: {buyerData.phone}</p>}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.filter((o) => o.is_accepted === "Pending").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Accepted</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.filter((o) => o.is_accepted === "Accepted").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-red-100 rounded-lg p-3">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.filter((o) => o.is_accepted === "Rejected").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                    <p className="text-sm text-gray-600">View and track all your orders</p>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="all">All Orders</option>
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="In production">In Production</option>
                      <option value="Quality Check">Quality Check</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {orders.length === 0 
                        ? "You haven't placed any orders yet." 
                        : "No orders found for the selected filter."
                      }
                    </p>
                    {orders.length === 0 && (
                      <button
                        onClick={() => router.push("/buyers/place_order")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Place Your First Order
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredOrders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center">
                                <Package className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="font-medium text-gray-900">
                                  {order.quantity} x {order.product_name} (Size: {order.size})
                                </span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">{order.delivery_address}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">
                                  Ordered: {formatDateForDisplay(order.order_date)}
                                </span>
                              </div>
                              {order.estimated_delivery && (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-600">
                                    ETA: {formatDateForDisplay(order.estimated_delivery)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.is_accepted)}`}
                          >
                            {formatStatus(order.is_accepted)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}