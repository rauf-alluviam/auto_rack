"use client"

import { useEffect, useState } from "react"
import { Package, RefreshCw, AlertCircle, Search, Filter, Calendar, Home, History, ChevronDown, Menu, X } from "lucide-react"

// Mock status options and config for demo
const STATUS_OPTIONS = ["Pending", "Accepted", "Rejected", "In production", "Quality Check", "Packaging", "Shipped", "Delivered"]
const STATUS_CONFIG = {
  "Pending": { color: "bg-yellow-100 text-yellow-800", icon: Package },
  "Accepted": { color: "bg-green-100 text-green-800", icon: Package },
  "Rejected": { color: "bg-red-100 text-red-800", icon: Package },
  "In production": { color: "bg-blue-100 text-blue-800", icon: Package },
  "Quality Check": { color: "bg-purple-100 text-purple-800", icon: Package },
  "Packaging": { color: "bg-indigo-100 text-indigo-800", icon: Package },
  "Shipped": { color: "bg-cyan-100 text-cyan-800", icon: Package },
  "Delivered": { color: "bg-teal-100 text-teal-800", icon: Package }
}

const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || { color: "bg-gray-100 text-gray-800" }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {status}
    </span>
  )
}

interface Order {
  _id: string
  product_name: string
  customer_name: string
  delivery_address: string
  estimated_delivery: string | null
  is_accepted: string
  quantity: number
}

const Navigation = ({ currentPage, isMobileMenuOpen, setIsMobileMenuOpen }: { 
  currentPage: string
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}) => {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      {/* Mobile menu button */}
      <div className="lg:hidden p-4 border-b border-gray-200">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="font-medium">Menu</span>
        </button>
      </div>

      {/* Navigation items */}
      <div className={`p-4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="flex flex-col lg:flex-row lg:flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.name}
                href={item.href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.current
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{item.name}</span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function StatusUpdateDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mock data for demo
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        _id: "1",
        product_name: "Wooden Crate Large",
        customer_name: "John Doe",
        delivery_address: "123 Main St, New York, NY 10001",
        estimated_delivery: "2025-08-01T10:00:00Z",
        is_accepted: "Accepted",
        quantity: 2
      },
      {
        _id: "2",
        product_name: "Plastic Crate Medium",
        customer_name: "Jane Smith",
        delivery_address: "456 Oak Ave, Los Angeles, CA 90210",
        estimated_delivery: "2025-08-02T14:30:00Z",
        is_accepted: "In production",
        quantity: 5
      }
    ]
    
    setTimeout(() => {
      setOrders(mockOrders)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = orders.filter(
      (order) =>
        order.is_accepted !== "Pending" && 
        order.is_accepted !== "Delivered" && 
        order.estimated_delivery &&
        order.estimated_delivery.trim() !== "",
    )

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.is_accepted === statusFilter)
    }
    setFilteredOrders(filtered)
  }, [searchTerm, statusFilter, orders])

  const handleStatusChange = async (
    orderId: string,
    newIsAcceptedStatus: string,
    newEstimatedDelivery: string | null,
  ) => {
    const orderToUpdate = orders.find((order) => order._id === orderId)
    if (!orderToUpdate) return

    setOrders((prevOrders) =>
      newIsAcceptedStatus === "Delivered"
        ? prevOrders.filter((order) => order._id !== orderId)
        : prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, is_accepted: newIsAcceptedStatus, estimated_delivery: newEstimatedDelivery }
              : order
          )
    )

    setUpdatingStatusId(orderId)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Status updated successfully")
    } catch (err) {
      console.error("Error updating status:", err)
      setError("Error updating status")
      alert("Failed to update status. Please try again.")
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const getStatusStats = () => {
    const stats = STATUS_OPTIONS.reduce(
      (acc, status) => {
        acc[status] = orders.filter((order) => order.is_accepted === status).length
        return acc
      },
      {} as Record<string, number>,
    )
    return stats
  }

  const refreshOrders = async () => {
    setLoading(true)
    try {
      // Mock refresh
      await new Promise(resolve => setTimeout(resolve, 1000))
      setError("")
    } catch (err) {
      console.error("Error refreshing orders:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium mb-2">Error Loading Orders</p>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button
            onClick={refreshOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const stats = getStatusStats()

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <Navigation currentPage="status" isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Status Update Dashboard</h1>
                <p className="text-gray-600 text-sm lg:text-base">Manage your order status updates</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={refreshOrders}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <div className="text-left sm:text-right">
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 lg:gap-4 mb-6">
          {STATUS_OPTIONS.filter((status) => status !== "Pending" && status !== "Rejected").map((status) => {
            const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
            const Icon = config?.icon || Package
            const count = stats[status] || 0

            return (
              <div key={status} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 lg:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${config?.color.split(" ")[0] || "bg-gray-100"}`}>
                    <Icon className={`w-3 h-3 lg:w-4 lg:h-4 ${config?.color.split(" ")[1] || "text-gray-600"}`} />
                  </div>
                  <span className="text-lg lg:text-xl font-bold text-gray-900">{count}</span>
                </div>
                <p className="text-xs text-gray-600 truncate" title={status}>{status}</p>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-base"
                >
                  <option value="All">All Status</option>
                  {STATUS_OPTIONS.filter((status) => status !== "Pending" && status !== "Rejected").map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table/Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
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
                {filteredOrders.map((order, index) => (
                  <tr key={`${order._id}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="font-medium text-gray-900">{order.product_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{order.delivery_address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.quantity || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-2">
                        <div className="relative">
                          <select
                            value={order.is_accepted}
                            disabled={updatingStatusId === order._id}
                            onChange={(e) => handleStatusChange(order._id, e.target.value, order.estimated_delivery)}
                            className="appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
                          >
                            {STATUS_OPTIONS.filter((status) => status !== "Pending" && status !== "Rejected" ).map(
                              (status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ),
                            )}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                        </div>
                        {updatingStatusId === order._id && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
                        <StatusBadge status={order.is_accepted} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input
                          type="datetime-local"
                          value={order.estimated_delivery ? new Date(order.estimated_delivery).toISOString().slice(0, 16) : ""}
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

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {filteredOrders.map((order, index) => (
              <div key={`${order._id}-${index}`} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                      <Package className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 mb-1">{order.product_name}</div>
                      <div className="text-sm text-gray-600 truncate">{order.delivery_address}</div>
                      <div className="text-sm text-gray-600 mt-1">Quantity: {order.quantity || 0}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                      <div className="relative">
                        <select
                          value={order.is_accepted}
                          disabled={updatingStatusId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value, order.estimated_delivery)}
                          className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
                        >
                          {STATUS_OPTIONS.filter((status) => status !== "Pending" && status !== "Rejected" ).map(
                            (status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ),
                          )}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <StatusBadge status={order.is_accepted} />
                        {updatingStatusId === order._id && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Delivery</label>
                      <input
                        type="datetime-local"
                        value={order.estimated_delivery ? new Date(order.estimated_delivery).toISOString().slice(0, 16) : ""}
                        onChange={(e) => {
                          const newEstimatedDelivery = e.target.value
                          const updatedOrders = orders.map((o) =>
                            o._id === order._id ? { ...o, estimated_delivery: newEstimatedDelivery } : o,
                          )
                          setOrders(updatedOrders)
                          handleStatusChange(order._id, order.is_accepted, newEstimatedDelivery)
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 px-4">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "All" ? "No matching orders" : "No orders found"}
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {searchTerm || statusFilter !== "All"
                  ? "Try adjusting your search or filter criteria."
                  : "Orders will appear here once they are no longer 'Pending' and have an estimated delivery time set."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}