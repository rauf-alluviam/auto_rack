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
  Menu,
  X,
  ChevronDown,
  Users
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingUser, setLoadingUser] = useState(true)
  const [ordersError, setOrdersError] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
    
  const router = useRouter();

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

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest('.mobile-menu')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

  if (loadingUser || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (!buyerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium mb-2">Error Loading Orders</p>
          <p className="text-gray-600 mb-4">{ordersError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="text-white" size={20} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  AutoRack
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Buyer Dashboard</p>
              </div>
            </div>
            
            {/* Desktop Header Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2.5 w-64 lg:w-80 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm"
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
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mobile-menu mt-4 pb-4 border-t border-gray-200">
              <div className="space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2.5 w-full bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm"
                  />
                </div>
                
                {/* Mobile New Order Button */}
                <button
                  onClick={() => {
                    router.push("/buyers/place_order")
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Order
                </button>
                
                {/* Mobile Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl transition-all duration-200 font-medium"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {loadingOrders ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                    Welcome back
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 truncate">{buyerData.email}</p>
                  {buyerData.phone && (
                    <p className="text-xs sm:text-sm text-gray-500 truncate">Phone: {buyerData.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-yellow-100 rounded-lg p-2 sm:p-3">
                    <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                  <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {orders.filter((o) => o.is_accepted === "Pending").length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-2 sm:p-3">
                    <Package className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Accepted</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {orders.filter((o) => o.is_accepted === "Accepted").length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-red-100 rounded-lg p-2 sm:p-3">
                    <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {orders.filter((o) => o.is_accepted === "Rejected").length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6 border border-gray-200 col-span-2 lg:col-span-1">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-lg p-2 sm:p-3">
                    <Package className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                    <p className="text-sm text-gray-600">View and track all your orders</p>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full sm:w-auto"
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
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
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
                  <div className="space-y-4 sm:space-y-6">
                    {filteredOrders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 mb-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                              <div className="flex items-center">
                                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="font-medium text-gray-900 text-sm sm:text-base">
                                  {order.quantity} x {order.product_name} (Size: {order.size})
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-600 break-words">
                                {order.delivery_address}
                              </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-gray-600">
                                  Ordered: {formatDateForDisplay(order.order_date)}
                                </span>
                              </div>
                              {order.estimated_delivery && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    ETA: {formatDateForDisplay(order.estimated_delivery)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <span
                            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full self-start sm:self-auto ${getStatusColor(order.is_accepted)}`}
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