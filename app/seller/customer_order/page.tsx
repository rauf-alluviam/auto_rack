"use client"
import { io } from 'socket.io-client';
import { useEffect, useState } from "react"
import { Package, Calendar, MapPin, CheckCircle, Clock, User, Eye, Home, History,Bell ,X} from "lucide-react"
import { Order } from "@/lib/models/order"

interface Order {
  _id: string
  product_name: string
  customer_name: string
  delivery_address: string
  ETA: string | null 
  is_accepted: "Accepted" | "Pending" | "Rejected"
  order_date: string
  quantity: number
  size: string
}

 
// Navigation Component
const Navigation = ({ currentPage }: { currentPage: string }) => {
  const navItems = [
    {
      name: "Dashboard",
      href: "/seller", 
      icon: Home,
      current: currentPage === "dashboard"
    },
    {
      name: "Order Management",
      href: "/seller/customer_order", 
      icon: Package,
      current: currentPage === "management"
    },
    {
      name: "Status Updates",
      href: "/seller/status_update", 
      icon: Package,
      current: currentPage === "status"
    },
    {
      name: "Order History",
      href: "/seller/order_history", 
      icon: History,
      current: currentPage === "history"
    }
  ]

  return (
    <nav className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.name}
              href={item.href}
              className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                item.current
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{item.name}</span>
              <span className="sm:hidden">{item.name.split(' ')[0]}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

function formatDateForDatetimeInput(dateString: string | null) {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateForDateInput(dateString: string | null) {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export default function CustomerOrderDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const socket = io("http://localhost:3000", {
  path: "/socket.io",
  transports: ["websocket"],
});
 // Toast state for notifications
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Show toast for 3 seconds
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const [showAllPending, setShowAllPending] = useState<boolean>(false)
const [showAllAccepted, setShowAllAccepted] = useState<boolean>(false)
const ORDERS_TO_SHOW: number = 5 // Show 5 orders initially
  
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token") 
      if (!token) {
        throw new Error("No token found")
      }

      const response = await fetch("/api/sellerOrder/customerOrder", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("API response not OK")
      }

      const data = await response.json()
      const fetchedOrders = (data.orders || []).map((order: Order) => ({
        ...order,
        estimated_delivery: order.ETA || null,
      }))
      setOrders(fetchedOrders)
      setLoading(false)
    } catch (err: any) {
      console.error(err)
      setError("Failed to fetch orders")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";

    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  

  useEffect(() => {
    const seller = typeof window !== 'undefined' ? localStorage.getItem('supplier') : null;
    let sellerId = '';
    if (seller) {
      try {
        const parsed = JSON.parse(seller);
        sellerId = parsed._id || parsed.id || '';
      } catch (e) { console.warn('Failed to parse supplier from localStorage', e); }
    }
    if (!sellerId) {
      showToast('Seller ID not found. Real-time updates will not work.');
      return;
    }
    const socket = io({ path: '/socket.io' });
    socket.on('connect', () => {
      console.log('Socket connected', socket.id);
      socket.emit('register', { userId: sellerId, role: 'seller' });
    });
    socket.on('orderPlaced', (order) => {
      console.log('Received orderPlaced event', order);
      showToast('New order received!');
      fetchOrders();
    });
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      showToast('Socket connection error');
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    // Test toast on every page load
    showToast('Toast test: page loaded');
  }, []);

  const handleChange = (index: number, field: keyof Order, value: string) => {
    const updatedOrders = [...orders]
    updatedOrders[index] = { ...updatedOrders[index], [field]: value }
    setOrders(updatedOrders)
  }

  const handleUpdate = async (orderId: string, delivery: string | null, status: Order["is_accepted"]) => {
    setLoadingId(orderId)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      console.log('Sending update request:', { orderId, estimated_delivery: delivery, status })

      const res = await fetch("/api/sellerOrder/customerOrder", {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({ 
          orderId, 
          estimated_delivery: delivery, 
          status 
        }),
      })

      const result = await res.json()
      console.log('Update response:', result)
      
      if (result.success || res.ok) {
        alert("Order updated successfully")
        await fetchOrders()
      } else {
        console.error('Update failed:', result)
        alert(`Update failed: ${result.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error("Update error:", err)
      alert("Error while updating")
    } finally {
      setLoadingId(null)
    }
  }

  const handleApprove = (index: number) => {
    const order = orders[index]
    if (!order.ETA || order.ETA.trim() === "") {
      alert("Please set an estimated delivery date and time before accepting the order.")
      return
    }
    
    let deliveryDate = order.ETA;
    if (deliveryDate && !deliveryDate.includes('T')) {
      deliveryDate = deliveryDate + 'T12:00:00';
    }
    
    handleChange(index, "is_accepted", "Accepted")
    handleUpdate(order._id, deliveryDate, "Accepted")
  }

  const pendingOrders = orders.filter((order) => order.is_accepted === "Pending")
  const acceptedOrders = orders.filter((order) => order.is_accepted === "Accepted")
  const totalOrders = orders.length

  if (loading) return <div className="p-3 sm:p-4 text-center">Loading...</div>
  if (error) return <div className="p-3 sm:p-4 text-red-500 text-center">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        
              {/* Enhanced Toast Notification */}
              {toast.visible && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
                  <div className="bg-gradient-to-r from-blue-500 to-green-600 text-white rounded-lg shadow-xl p-4 max-w-sm border-l-4 border-green-300">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          <Bell className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">{toast.message}</p>
                      </div>
                      <button
                        onClick={() => setToast({ message: 'New Order', visible: true })}
                        className="ml-3 text-white/80 hover:text-white transition-colors"
                      >
                         <X className="h-4 w-4" /> 
                      </button>
                    </div>
                  </div>
                </div>
              )}
        {/* Navigation */}
        <Navigation currentPage="management" />

        {/* Header */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="text-sm sm:text-base text-gray-600">Track and manage customer orders</p>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center"
            >
              <Package className="w-4 h-4" />
              Refresh Orders
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{acceptedOrders.length}</p>
              </div>
              <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
              </div>
              <div className="bg-yellow-100 p-1.5 sm:p-2 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Pending Approval Section */}
        {pendingOrders.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Pending Approval</h2>
                  <p className="text-sm sm:text-base text-gray-600">Orders waiting for your approval</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {pendingOrders.length} pending
                </div>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {(showAllPending ? pendingOrders : pendingOrders.slice(0, ORDERS_TO_SHOW)).map((order: Order, index: number) => {
                      const originalIndex = orders.findIndex((o) => o._id === order._id)
                      return (
                        <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 border-l-4 border-l-yellow-400">
                          <div className="flex items-center justify-between gap-3">
                            {/* Left side - Order info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="bg-yellow-100 p-1.5 rounded">
                                  <Clock className="w-3 h-3 text-yellow-600" />
                                </div>
                                <h3 className="font-medium text-gray-900 text-sm truncate">{order.customer_name}</h3>
                                <span className="text-xs text-gray-500">({formatDate(order.order_date)})</span>
                              </div>
                              <p className="text-xs text-gray-600 truncate mb-1">{order.product_name} • Qty: {order.quantity} • Size: {order.size}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{order.delivery_address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="date"
                                  value={formatDateForDateInput(order.ETA)}
                                  onChange={(e) => handleChange(originalIndex, "ETA", e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-32"
                                />
                              </div>
                            </div>
                            
                            {/* Right side - Actions */}
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </button>
                              <button
                                onClick={() => handleApprove(originalIndex)}
                                disabled={loadingId === order._id || !order.ETA || order.ETA.trim() === ""}
                                className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loadingId === order._id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-2 w-2 border border-white border-t-transparent"></div>
                                    Accept
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    Accept
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
              {pendingOrders.length > ORDERS_TO_SHOW && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowAllPending(!showAllPending)}
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {showAllPending ? 'Show Less' : `Show More (${pendingOrders.length - ORDERS_TO_SHOW} more)`}
                </button>
              </div>
            )}


            </div>
          </div>
        )}
        
        {/* Accepted Orders Section */}
        {acceptedOrders.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Accepted Orders</h2>
                  <p className="text-sm sm:text-base text-gray-600">Orders that have been approved</p>
                </div>
                <div className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {acceptedOrders.length} accepted
                </div>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
             {(showAllAccepted ? acceptedOrders : acceptedOrders.slice(0, ORDERS_TO_SHOW)).map((order: Order, index: number) => {
                  const originalIndex = orders.findIndex((o) => o._id === order._id)
                  return (
                    <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 border-l-4 border-l-green-400">
                      <div className="flex items-center justify-between gap-3">
                        {/* Left side - Order info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="bg-green-100 p-1.5 rounded">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            </div>
                            <h3 className="font-medium text-gray-900 text-sm truncate">{order.customer_name}</h3>
                            <span className="text-xs text-gray-500">({formatDate(order.order_date)})</span>
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                              <CheckCircle className="w-2 h-2" />
                              Accepted
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate mb-1">{order.product_name} • Qty: {order.quantity} • Size: {order.size}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{order.delivery_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">Delivery:</span>
                            <input
                              type="datetime-local"
                              value={formatDateForDatetimeInput(order.ETA)}
                              onChange={(e) => handleChange(originalIndex, "ETA", e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        {/* Right side - Actions */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
            {acceptedOrders.length > ORDERS_TO_SHOW && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowAllAccepted(!showAllAccepted)}
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {showAllAccepted ? 'Show Less' : `Show More (${acceptedOrders.length - ORDERS_TO_SHOW} more)`}
                  </button>
                </div>
              )}
          </div>
        </div>
        )}
        
        {/* No Orders State */}
        {orders.length === 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12">
            <div className="text-center">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">No orders found</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">Orders will appear here when they are placed by customers.</p>
              <button
                onClick={fetchOrders}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Package className="w-4 h-4" />
                Refresh Orders
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* View Order Modal */}
      {selectedOrder && (
       <div onClick={() => setSelectedOrder(null)}  className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4">
          <div  onClick={(e) => e.stopPropagation()}  className="bg-white rounded-lg sm:rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">

            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Order Details</h2>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Product Information</h3>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Product:</strong> {selectedOrder.product_name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Quantity:</strong> {selectedOrder.quantity}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Size:</strong> {selectedOrder.size}
                  </p>
                </div>
              </div>


              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Customer Information</h3>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Customer:</strong> {selectedOrder.customer_name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">
                    <strong>Address:</strong> {selectedOrder.delivery_address}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Order Status</h3>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.is_accepted === 'Accepted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedOrder.is_accepted}
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Order Date:</strong> {formatDate(selectedOrder.order_date)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Estimated Delivery:</strong> {formatDate(selectedOrder.ETA)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Close
              </button>
              {selectedOrder.is_accepted === 'Pending' && (
                <button
                  onClick={() => {
                    const orderIndex = orders.findIndex(o => o._id === selectedOrder._id)
                    if (orderIndex !== -1) {
                      handleApprove(orderIndex)
                      setSelectedOrder(null)
                    }
                  }}
                  disabled={!selectedOrder.ETA}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
                >
                  Accept Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}