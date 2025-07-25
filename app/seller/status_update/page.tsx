"use client"

import { useEffect, useState } from "react"
import { Package, RefreshCw, AlertCircle, Search, Filter, Calendar, ClipboardList, History, Home } from "lucide-react"
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
    }
  ]

  return (
    <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.name}
              href={item.href}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                item.current
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </a>
          )
        })}
      </div>
    </nav>
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

  // Fetch orders when component mounts
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
        console.log('Fetched orders:', data.orders)
        
        setOrders(data.orders || [])
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError(err instanceof Error ? err.message : "Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleAcceptOrder = async (orderId: string) => {
    const estimated_delivery = "2025-07-30"

    try {
      const res = await fetch("/api/sellerOrder/updatestatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, estimated_delivery }),
      })

      const data = await res.json()

      if (res.ok) {
        alert("Order accepted")
        
        const updatedOrders = orders.map((order) =>
          order._id === orderId
            ? { ...order, is_accepted: "Accepted", estimated_delivery }
            : order
        )
        setOrders(updatedOrders)
      } else {
        alert("Error: " + data.message)
      }
    } catch (err) {
      console.error("Error:", err)
      alert("Failed to accept order")
    }
  }


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
      const res = await fetch("/api/sellerOrder/updatestatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newIsAcceptedStatus, estimated_delivery: newEstimatedDelivery }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to update status")
      }
      
      console.log("Status updated successfully:", data)
    } catch (err) {
      console.error("Error updating status:", err)
      setError("Error updating status")
      
     
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, is_accepted: orderToUpdate.is_accepted, estimated_delivery: orderToUpdate.estimated_delivery }
            : order,
        ),
      )
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium mb-2">Error Loading Orders</p>
          <p className="text-gray-600 mb-4">{error}</p>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <Navigation currentPage="status" />

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
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "All" ? "No matching orders" : "No orders found"}
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "All"
                  ? "Try adjusting your search or filter criteria."
                  : "Orders will appear here once they are no longer 'Pending' and have an estimated delivery time set. Orders marked as 'Delivered' are automatically removed from this view."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}