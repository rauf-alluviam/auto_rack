"use client"
import { io } from 'socket.io-client';
import { useEffect, useState } from "react"
import {
  Package,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  User,
  Eye,
  Home,
  History,
  Bell,
  X,
  Package2
} from "lucide-react"

interface Order {
  _id: string
  product_name: string
  delivery_address: string
  ETA: string | null
  is_accepted: "Accepted" | "Pending" | "Rejected"
  order_date: string
  quantity: number
  size: string
  buyer: {
    name: string
    email?: string
  }
  remark?: string
}


const Navigation = ({ currentPage }: { currentPage: string }) => {
  const navItems = [
    {
      name:"Dashboard",
      href: "/seller",
      icon: Home,
      current: currentPage === "dashboard"
    },
    {
      name: "Order Management",
      href: "/seller/customer_order",
      icon: Home,
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
    },
    {
      name: "Inventory Management",
      href: "/seller/inventory_management",
      icon: Package2,
      current: currentPage === "inventory"
    },
  ]

  return (
    <nav className="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-8 sticky top-16 z-40">
      <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <a
              key={item.name}
              href={item.href}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm ${
                item.current 
                ? "bg-blue-700 text-white shadow-blue-500/40" 
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              aria-current={item.current ? "page" : undefined}
            >
              <Icon className="w-5 h-5" />
              {item.name}
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
  const [showRemarkBox, setShowRemarkBox] = useState<{ [key: string]: boolean }>({})
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })

  // Pagination states: for pending and accepted orders separately
  const [currentPagePending, setCurrentPagePending] = useState(1)
  const [currentPageAccepted, setCurrentPageAccepted] = useState(1)
  const ordersPerPage = 10

  const toggleRemarkBox = (orderId: string) => {
    setShowRemarkBox(prev => ({ ...prev, [orderId]: !prev[orderId] }))
  }

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 3000)
  }

  const fetchOrders = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const response = await fetch("/api/sellerOrder/customerOrder", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error("API response not OK")

      const data = await response.json()
      const fetchedOrders = (data.orders || []).map((order: Order) => ({
        ...order,
        estimated_delivery: order.ETA || null,
      }))
      setOrders(fetchedOrders)
    } catch (err: any) {
      console.error(err)
      setError("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    // Socket for real-time updates
    const seller = typeof window !== 'undefined' ? localStorage.getItem('supplier') : null;
    let sellerId = '';
    if (seller) {
      try {
        const parsed = JSON.parse(seller);
        sellerId = parsed._id || parsed.id || '';
      } catch { }
    }
    if (!sellerId) {
      showToast('Seller ID not found. Real-time updates will not work.');
      return;
    }
    const socket = io({ path: '/socket.io' });
    socket.on('connect', () => {
      socket.emit('register', { userId: sellerId, role: 'seller' });
    });
    socket.on('orderPlaced', () => {
      showToast('New order received!');
      fetchOrders();
    });
    socket.on('connect_error', () => {
      showToast('Socket connection error');
    });
    return () => { socket.disconnect(); };
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

      const order = orders.find((o) => o._id === orderId)
      const remark = order?.remark || ""

      const res = await fetch("/api/sellerOrder/customerOrder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          estimated_delivery: delivery,
          status,
          remark,
        }),
      })

      const result = await res.json()
      if (result.success || res.ok) {
        showToast("Order updated successfully")
        await fetchOrders()
      } else {
        alert(`Update failed: ${result.error || 'Unknown error'}`)
      }
    } catch {
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
    let deliveryDate = order.ETA
    if (deliveryDate && !deliveryDate.includes('T')) {
      deliveryDate += 'T12:00:00';
    }
    handleChange(index, "is_accepted", "Accepted")
    handleUpdate(order._id, deliveryDate, "Accepted")
  }

  const pendingOrders = orders.filter(order => order.is_accepted === "Pending")
  const acceptedOrders = orders.filter(order => order.is_accepted === "Accepted")

  // Pagination slices
  const pagedPendingOrders = pendingOrders.slice((currentPagePending - 1) * ordersPerPage, currentPagePending * ordersPerPage)
  const pagedAcceptedOrders = acceptedOrders.slice((currentPageAccepted - 1) * ordersPerPage, currentPageAccepted * ordersPerPage)

  if (loading) return <div className="p-3 sm:p-4 text-center">Loading...</div>
  if (error) return <div className="p-3 sm:p-4 text-red-500 text-center">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 pt-20 p-3 sm:p-4 lg:p-6">
      {/* Fixed Header */}
      <header className="fixed top-0 inset-x-0 bg-white/90 backdrop-blur-lg border-b border-gray-300 z-50 shadow-md flex items-center px-6 h-16">
        <h1 className="text-xl font-bold text-gray-900 select-none">Seller Dashboard - Order Management</h1>
      </header>

      <div className="max-w-7xl mx-auto">

        {/* Toast */}
        {toast.visible && (
          <div className="fixed top-20 right-5 z-50 animate-in slide-in-from-right-2 duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-2xl shadow-2xl p-4 max-w-sm border-l-4 border-green-400 flex items-center space-x-4">
              <div className="w-7 h-7 bg-white/30 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold truncate">{toast.message}</p>
              <button
                onClick={() => setToast({ message: '', visible: false })}
                className="ml-auto text-white/80 hover:text-white transition-colors"
                aria-label="Close notification"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <Navigation currentPage="management" />

        {/* Header section with refresh */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Order Management</h1>
              <p className="text-base text-gray-600">Track and manage customer orders</p>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg transition-colors"
            aria-label="Refresh Orders"
          >
            <Package className="w-5 h-5" /> Refresh Orders
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{acceptedOrders.length}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Pending Approval Section */}
        {pendingOrders.length > 0 && (
          <section className="mb-10">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Pending Approval</h2>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {pendingOrders.length} pending
              </span>
            </header>

            <div className="space-y-4">
              {pagedPendingOrders.map((order, idx) => {
                const originalIndex = orders.findIndex(o => o._id === order._id)
                return (
                  <div key={order._id} className="bg-white rounded-lg shadow border border-gray-200 p-4 border-l-4 border-yellow-400">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="bg-yellow-100 p-1.5 rounded">
                            <Clock className="w-4 h-4 text-yellow-600" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900">{order.buyer?.name || "Unknown Buyer"}</h3>
                          <span className="text-xs text-gray-500">({formatDate(order.order_date)})</span>
                        </div>
                        <p className="text-xs text-gray-900 truncate mb-2">{order.product_name} • Qty: {order.quantity} • Size: {order.size}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-900 mb-3">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{order.delivery_address}</span>
                        </div>

                        <input
                          type="date"
                          value={formatDateForDateInput(order.ETA)}
                          onChange={(e) => handleChange(originalIndex, "ETA", e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400 w-32"
                          aria-label="Set Estimated Delivery Date"
                        />

                        {/* Remark Toggle and Box */}
                        <div className="mt-4">
                          <button
                            onClick={() => toggleRemarkBox(order._id)}
                            className="text-yellow-600 hover:text-yellow-800 font-semibold text-sm flex items-center gap-1"
                            aria-expanded={showRemarkBox[order._id] || false}
                            aria-controls={`remark-box-${order._id}`}
                          >
                            📝 {showRemarkBox[order._id] ? "Hide Remark" : (order.remark ? "Edit Remark" : "Add Remark")}
                          </button>
                          {showRemarkBox[order._id] && (
                            <div id={`remark-box-${order._id}`} className="mt-2 bg-yellow-50 border border-yellow-300 rounded-md p-3 shadow-inner">
                              <textarea
                                rows={3}
                                placeholder="Write your remark here..."
                                value={order.remark || ""}
                                onChange={(e) => handleChange(originalIndex, "remark", e.target.value)}
                                className="w-full rounded-md border border-yellow-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                aria-label="Seller Remark"
                              />
                              <div className="mt-2 flex justify-end gap-3">
                                <button
                                  onClick={() => {
                                    handleUpdate(order._id, order.ETA || null, order.is_accepted)
                                    setShowRemarkBox(prev => ({ ...prev, [order._id]: false }))
                                  }}
                                  className="px-4 py-1 bg-yellow-600 text-white rounded-md font-semibold hover:bg-yellow-700 transition"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setShowRemarkBox(prev => ({ ...prev, [order._id]: false }))}
                                  className="px-4 py-1 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          aria-label="View order details"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>

                        <button
                          onClick={() => handleApprove(originalIndex)}
                          disabled={loadingId === order._id || !order.ETA || order.ETA.trim() === ""}
                          className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-disabled={loadingId === order._id || !order.ETA || order.ETA.trim() === ""}
                        >
                          {loadingId === order._id ? (
                            <span className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></span>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )} Accept
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination for Pending */}
            {pendingOrders.length > ordersPerPage && (
              <nav className="flex justify-center mt-6 space-x-3" aria-label="Pending Orders Pagination">
                <button
                  onClick={() => setCurrentPagePending(prev => Math.max(prev - 1, 1))}
                  disabled={currentPagePending === 1}
                  className={`rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors ${
                    currentPagePending === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-100"
                  }`}
                  aria-disabled={currentPagePending === 1}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                {[...Array(Math.ceil(pendingOrders.length / ordersPerPage)).keys()].map(num => (
                  <button
                    key={num + 1}
                    onClick={() => setCurrentPagePending(num + 1)}
                    className={`rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors ${
                      currentPagePending === num + 1 ? "bg-yellow-500 text-white shadow" : "hover:bg-yellow-100"
                    }`}
                    aria-current={currentPagePending === num + 1 ? "page" : undefined}
                    aria-label={`Page ${num + 1}`}
                  >
                    {num + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPagePending(prev => Math.min(prev + 1, Math.ceil(pendingOrders.length / ordersPerPage)))}
                  disabled={currentPagePending === Math.ceil(pendingOrders.length / ordersPerPage)}
                  className={`rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors ${
                    currentPagePending === Math.ceil(pendingOrders.length / ordersPerPage) ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-100"
                  }`}
                  aria-disabled={currentPagePending === Math.ceil(pendingOrders.length / ordersPerPage)}
                  aria-label="Next page"
                >
                  Next
                </button>
              </nav>
            )}
          </section>
        )}

        {/* Accepted Orders Section */}
        {acceptedOrders.length > 0 && (
          <section className="mb-10">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Accepted Orders</h2>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {acceptedOrders.length} accepted
              </span>
            </header>

            <div className="space-y-4">
              {pagedAcceptedOrders.map((order, idx) => {
                const originalIndex = orders.findIndex(o => o._id === order._id)
                return (
                  <div key={order._id} className="bg-white rounded-lg shadow border border-gray-200 p-4 border-l-4 border-green-400">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="bg-green-100 p-1.5 rounded">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <h3 className="font-medium text-gray-900 text-sm truncate">{order.buyer?.name || "Unknown Buyer"}</h3>
                          <span className="text-xs text-gray-500">({formatDate(order.order_date)})</span>
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Accepted
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate mb-2">{order.product_name} • Qty: {order.quantity} • Size: {order.size}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{order.delivery_address}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label htmlFor={`eta-input-${order._id}`} className="text-xs text-gray-600 select-none">Delivery:</label>
                          <input
                            id={`eta-input-${order._id}`}
                            type="datetime-local"
                            value={formatDateForDatetimeInput(order.ETA)}
                            onChange={(e) => handleChange(originalIndex, "ETA", e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                            aria-label="Set Estimated Delivery Date and Time"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          aria-label="View order details"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination for Accepted */}
            {acceptedOrders.length > ordersPerPage && (
              <nav className="flex justify-center mt-6 space-x-3" aria-label="Accepted Orders Pagination">
                <button
                  onClick={() => setCurrentPageAccepted(prev => Math.max(prev - 1, 1))}
                  disabled={currentPageAccepted === 1}
                  className={`rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors ${
                    currentPageAccepted === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100"
                  }`}
                  aria-disabled={currentPageAccepted === 1}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                {[...Array(Math.ceil(acceptedOrders.length / ordersPerPage)).keys()].map(num => (
                  <button
                    key={num + 1}
                    onClick={() => setCurrentPageAccepted(num + 1)}
                    className={`rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors ${
                      currentPageAccepted === num + 1 ? "bg-green-600 text-white shadow" : "hover:bg-green-100"
                    }`}
                    aria-current={currentPageAccepted === num + 1 ? "page" : undefined}
                    aria-label={`Page ${num + 1}`}
                  >
                    {num + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPageAccepted(prev => Math.min(prev + 1, Math.ceil(acceptedOrders.length / ordersPerPage)))}
                  disabled={currentPageAccepted === Math.ceil(acceptedOrders.length / ordersPerPage)}
                  className={`rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors ${
                    currentPageAccepted === Math.ceil(acceptedOrders.length / ordersPerPage) ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100"
                  }`}
                  aria-disabled={currentPageAccepted === Math.ceil(acceptedOrders.length / ordersPerPage)}
                  aria-label="Next page"
                >
                  Next
                </button>
              </nav>
            )}
          </section>
        )}

        {/* No Orders State */}
        {orders.length === 0 && !loading && !error && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 text-lg">No orders found</h3>
            <p className="text-gray-500 mb-6">Orders will appear here when placed by customers.</p>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors"
            >
              <Package className="w-5 h-5" />
              Refresh Orders
            </button>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-modal-title"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto focus:outline-none"
            tabIndex={-1}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h2 id="order-modal-title" className="text-2xl font-semibold text-gray-900">
                Order Details
              </h2>
            </div>

            <section className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
                <p className="text-gray-700 text-sm"><strong>Product:&nbsp;</strong>{selectedOrder.product_name}</p>
                <p className="text-gray-700 text-sm"><strong>Quantity:&nbsp;</strong>{selectedOrder.quantity}</p>
                <p className="text-gray-700 text-sm"><strong>Size:&nbsp;</strong>{selectedOrder.size}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <p className="text-gray-700 text-sm"><strong>Customer:&nbsp;</strong>{selectedOrder.buyer?.name || "N/A"}</p>
                <p className="text-gray-700 text-sm break-words"><strong>Address:&nbsp;</strong>{selectedOrder.delivery_address}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Status</h3>
                <p className="text-gray-700 text-sm flex items-center gap-2">
                  <strong>Status:&nbsp;</strong>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedOrder.is_accepted === 'Accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedOrder.is_accepted}
                  </span>
                </p>
                <p className="text-gray-700 text-sm"><strong>Order Date:&nbsp;</strong>{formatDate(selectedOrder.order_date)}</p>
                <p className="text-gray-700 text-sm"><strong>Estimated Delivery:&nbsp;</strong>{formatDate(selectedOrder.ETA)}</p>
              </div>
            </section>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl py-3 font-semibold transition-colors"
              >
                Close
              </button>
              {selectedOrder.is_accepted === 'Pending' && (
                <button
                  onClick={() => {
                    const orderIndex = orders.findIndex(o => o._id === selectedOrder._id);
                    if (orderIndex !== -1) {
                      handleApprove(orderIndex);
                      setSelectedOrder(null);
                    }
                  }}
                  disabled={!selectedOrder.ETA}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
