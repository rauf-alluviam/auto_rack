"use client"

import { useEffect, useState } from "react"
import { Package, Calendar, MapPin, CheckCircle, Clock, User, Eye, Home, History } from "lucide-react"
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

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-500">{error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <Navigation currentPage="management" />

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-600">Track and manage customer orders</p>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Package className="w-4 h-4" />
              Refresh Orders
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{acceptedOrders.length}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-purple-600">
                  {orders.reduce((sum, order) => sum + (order.quantity || 0), 0)}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Pending Approval Section */}
        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Pending Approval</h2>
                  <p className="text-gray-600">Orders waiting for your approval</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {pendingOrders.length} pending
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {pendingOrders.map((order, index) => {
                const originalIndex = orders.findIndex((o) => o._id === order._id)
                return (
                  <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 border-l-4 border-l-yellow-400">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-yellow-100 p-2 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{order.customer_name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <div className="flex items-center gap-1">
                                <span>
                                  {order.product_name} (Qty: {order.quantity}, Size: {order.size})
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{order.delivery_address}</span>
                              </div>
                            </div>
                            {/* Estimated Delivery input for pending orders */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <label htmlFor={`estimated-delivery-${order._id}`} className="sr-only">
                                Estimated Delivery
                              </label>
                              <input
                                id={`estimated-delivery-${order._id}`}
                                type="date"
                                value={formatDateForDateInput(order.ETA)}
                                onChange={(e) => handleChange(originalIndex, "ETA", e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Ordered: {formatDate(order.order_date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleApprove(originalIndex)}
                          disabled={
                            loadingId === order._id ||
                            !order.ETA||
                            order.ETA.trim() === ""
                          }
                          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingId === order._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Accepting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Accept Order
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Accepted Orders Section */}
        {acceptedOrders.length > 0 && (
          <div className="mb-8">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Accepted Orders</h2>
                  <p className="text-gray-600">Orders that have been approved</p>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {acceptedOrders.length} accepted
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {acceptedOrders.map((order, index) => {
                const originalIndex = orders.findIndex((o) => o._id === order._id)
                return (
                  <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 border-l-4 border-l-green-400">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{order.customer_name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <div className="flex items-center gap-1">
                                <span>
                                  {order.product_name} (Qty: {order.quantity}, Size: {order.size})
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{order.delivery_address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Ordered: {formatDate(order.order_date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <input
                            type="datetime-local"
                            value={formatDateForDatetimeInput(order.ETA)}
                            onChange={(e) => handleChange(originalIndex, "ETA", e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {/* Display "Accepted" status */}
                        <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Accepted
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* No Orders State */}
        {orders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-4">Orders will appear here when they are placed by customers.</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Product Information</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Product:</strong> {selectedOrder.product_name}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Quantity:</strong> {selectedOrder.quantity}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Size:</strong> {selectedOrder.size}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Customer:</strong> {selectedOrder.customer_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Address:</strong> {selectedOrder.delivery_address}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Order Status</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedOrder.is_accepted === 'Accepted' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedOrder.is_accepted}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Order Date:</strong> {formatDate(selectedOrder.order_date)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estimated Delivery:</strong> {formatDate(selectedOrder.ETA)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
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
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
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