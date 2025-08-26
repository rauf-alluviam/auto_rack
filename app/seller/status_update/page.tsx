"use client"
import { io } from 'socket.io-client';
import { useEffect, useState } from "react"
import { Package, RefreshCw, AlertCircle, Search, Filter, Calendar, History, Home, X, Package2 } from "lucide-react"
import { STATUS_OPTIONS, STATUS_CONFIG, StatusBadge } from "@/lib/utils/order-utils"

interface Order {
  _id: string
  product_name: string
  customer_name: string
  delivery_address: string
  estimated_delivery: string | null
  is_accepted: string
  quantity: number
}

interface ApiResponse {
  orders: Order[]
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

export default function StatusUpdateDashboard() {
  // States
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10

  // Show toast for 3 seconds
  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 3000)
  }

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError("")
        const res = await fetch("/api/sellerOrder/updatestatus", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
        })
        if (!res.ok) {
          throw new Error(`Failed to fetch orders: ${res.status}`)
        }
        const data: ApiResponse = await res.json()
        setOrders(data.orders || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Socket for real-time updates
  useEffect(() => {
    const seller = typeof window !== 'undefined' ? localStorage.getItem('supplier') : null;
    let socket: ReturnType<typeof io> | null = null;

    if (!seller) return;

    let sellerId = '';
    try {
      const parsed = JSON.parse(seller);
      sellerId = parsed._id || parsed.id || '';
    } catch (e) {
      return;
    }
    if (!sellerId) return;

    socket = io('http://localhost:3001', {
      path: '/socket.io',
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket!.emit('register', { userId: sellerId, role: 'seller' });
    });

    socket.on('orderPlaced', (newOrder) => {
      showToast(`New order: ${newOrder.product_name || 'Product'} (Qty: ${newOrder.quantity || 1})`);
      if (newOrder.estimated_delivery && newOrder.estimated_delivery.trim() !== '') {
        setOrders(prev => [newOrder, ...prev]);
      }
    });

    socket.on('orderUpdated', (updatedOrder) => {
      setOrders(prev =>
        prev.map(order =>
          order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
        )
      );
      showToast(`Order status updated: ${updatedOrder.is_accepted}`);
    });

    socket.on('connect_error', err => {
      console.error('Socket connection error:', err);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // Filter orders based on status and search term
  useEffect(() => {
    let filtered = orders.filter(
      order => 
        order.is_accepted !== "Pending" &&
        order.is_accepted !== "Delivered" &&
        order.estimated_delivery &&
        order.estimated_delivery.trim() !== ""
    )

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter(order => order.is_accepted === statusFilter)
    }

    setFilteredOrders(filtered)
    setCurrentPage(1) // Reset page to 1 each filter/search change
  }, [searchTerm, statusFilter, orders])

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  )

  // Status stats
  const getStatusStats = () => {
    const stats = STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = orders.filter(order => order.is_accepted === status).length
      return acc
    }, {} as Record<string, number>)
    return stats
  }

  // Refresh orders manually
  const refreshOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/sellerOrder/updatestatus", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        const data: ApiResponse = await res.json()
        setOrders(data.orders || [])
        setError("")
      }
    } catch (err) {
      console.error("Error refreshing orders:", err)
    } finally {
      setLoading(false)
    }
  }

  // Status change handler
  const handleStatusChange = async (
    orderId: string,
    newIsAcceptedStatus: string,
    newEstimatedDelivery: string | null,
  ) => {
    const orderToUpdate = orders.find(order => order._id === orderId)
    if (!orderToUpdate) return

    setOrders(prev =>
      newIsAcceptedStatus === "Delivered"
        ? prev.filter(order => order._id !== orderId)
        : prev.map(order => order._id === orderId ? { ...order, is_accepted: newIsAcceptedStatus, estimated_delivery: newEstimatedDelivery } : order)
    )

    setUpdatingStatusId(orderId)
    try {
      const res = await fetch("/api/sellerOrder/updatestatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId,
          status: newIsAcceptedStatus,
          estimated_delivery: newEstimatedDelivery
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update status")
      showToast(`Status updated to ${newIsAcceptedStatus}`)
    } catch (err) {
      setError("Error updating status")
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId
            ? { ...order, is_accepted: orderToUpdate.is_accepted, estimated_delivery: orderToUpdate.estimated_delivery }
            : order,
        ),
      )
      showToast("Failed to update status. Please try again.")
    } finally {
      setUpdatingStatusId(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Loading orders...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-md border border-red-200">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <p className="text-red-600 text-xl font-semibold mb-4">Error Loading Orders</p>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={refreshOrders}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  const stats = getStatusStats()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <Navigation currentPage="status" />
        {/* Toast Notification */}
        {toast.visible && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-xl p-4 max-w-sm border-l-4 border-green-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{toast.message}</p>
                </div>
                <button
                  onClick={() => setToast({ message: '', visible: false })}
                  className="ml-3 text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Status Update Dashboard</h1>
                <p className="text-gray-600">Manage your order status updates</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshOrders}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          {STATUS_OPTIONS.filter((status) => status !== "Pending" && status !== "Rejected").map((status) => {
            const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
            const Icon = config?.icon || Package
            const count = stats[status] || 0

            return (
              <div key={status} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${config?.color.split(" ")[0] || "bg-gray-100"}`}>
                    <Icon className={`w-4 h-4 ${config?.color.split(" ")[1] || "text-gray-600"}`} />
                  </div>
                  <span className="text-xl font-bold text-gray-900">{count}</span>
                </div>
                <p className="text-xs text-gray-600 truncate">{status}</p>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders by product, customer, or address..."
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
                {STATUS_OPTIONS.filter((status) => status !== "Pending" && status !== "Rejected").map((status) => (
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
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
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
                {/* NOTE: Pagination applied here */}
                {paginatedOrders.map((order, index) => (
                  <tr key={`${order._id}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="font-medium text-gray-900">{order.product_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{order.delivery_address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.quantity || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-2">
                        <select
                          value={order.is_accepted}
                          disabled={updatingStatusId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value, order.estimated_delivery)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.filter((status) => status !== "Pending" && status !== "Rejected" ).map(
                            (status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ),
                          )}
                        </select>
                        {updatingStatusId === order._id && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
                        <StatusBadge status={order.is_accepted} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input
                          type="datetime-local"
                          value={order.estimated_delivery || ""}
                          onChange={(e) => {
                            const newEstimatedDelivery = e.target.value
                            const updatedOrders = orders.map((o) =>
                              o._id === order._id ? { ...o, estimated_delivery: newEstimatedDelivery } : o,
                            )
                            setOrders(updatedOrders)
                            handleStatusChange(order._id, order.is_accepted, newEstimatedDelivery)
                          }}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {paginatedOrders.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-1">
                {searchTerm || statusFilter !== "All" ? "No matching orders" : "No orders found"}
              </h3>
              <p className="max-w-lg mx-auto">
                {searchTerm || statusFilter !== "All"
                  ? "Try adjusting your search or filter criteria."
                  : "Orders will appear here once they are no longer 'Pending' and have an estimated delivery time set. Orders marked as 'Delivered' are automatically removed from this view."}
              </p>
            </div>
          )}
        </div>

       {/* Stylish Pagination Controls */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-3 mt-6 select-none" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-500 disabled:opacity-40"
                  title="First Page"
                >
                  &#171;
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-500 disabled:opacity-40"
                  title="Previous"
                >
                  &#8249;
                </button>

                {/* Show page numbers: e.g. 1 ... 4 5 [6] 7 8 ... 12 */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;

                  // show only page numbers around the current page, with optional ellipsis
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`mx-1 px-3 py-1 rounded-full border ${
                          page === currentPage
                            ? "bg-blue-600 text-white border-blue-600 shadow font-bold"
                            : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200"
                        } transition`}
                        aria-current={page === currentPage ? "page" : undefined}
                      >
                        {page}
                      </button>
                    );
                  }

                  // Ellipsis conditions
                  if (
                    (page === currentPage - 2 && currentPage - 3 > 0) ||
                    (page === currentPage + 2 && currentPage + 3 <= totalPages)
                  ) {
                    return (
                      <span key={page} className="mx-1 px-2 py-1 text-gray-400 select-none">...</span>
                    );
                  }

                  // Don't render out-of-range buttons
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-500 disabled:opacity-40"
                  title="Next"
                >
                  &#8250;
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-500 disabled:opacity-40"
                  title="Last Page"
                >
                  &#187;
                </button>
              </nav>
            )}

      </div>
    </div>
  )
}
