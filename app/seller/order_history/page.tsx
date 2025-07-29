"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Package, RefreshCw, AlertCircle, Search, Calendar, Home, History } from "lucide-react"
import { formatDate, StatusBadge } from "@/lib/utils/order-utils" 

interface Order {
  _id: string
  product_name: string
  customer_name: string
  delivery_address: string
  estimated_delivery: string | null
  is_accepted: string
  status: string
  quantity: number
}

interface ApiResponse {
  orders: Order[]
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
                  ? "bg-green-600 text-white shadow-md"
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

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()  

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token") 

      if (!token) {
        console.error("No token found")
        router.push("/seller") 
        return
      }

      try {
        const res = await fetch("/api/sellerOrder/orderHistory", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        })

        if (!res.ok) {
          const err = await res.json()
          console.error("Error fetching orders:", err)
          return
        }

        const data = await res.json()
        console.log("Fetched orders:", data.orders)
        setOrders(data.orders)
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  useEffect(() => {
    let filtered = orders.filter((order) => order.status === "Delivered") 

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    setFilteredOrders(filtered)
  }, [searchTerm, orders])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-medium mb-2">Error Loading Order History</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <Navigation currentPage="history" />

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                <p className="text-gray-600">View all delivered orders</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Delivered Orders</p>
              <p className="text-2xl font-bold text-green-600">{filteredOrders.length}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Delivered</p>
                <p className="text-2xl font-bold text-green-600">{filteredOrders.length}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredOrders.filter(order => {
                    const orderDate = new Date(order.estimated_delivery || '')
                    const currentMonth = new Date().getMonth()
                    return orderDate.getMonth() === currentMonth
                  }).length}
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredOrders.reduce((sum, order) => sum + (order.quantity || 0), 0)}
                </p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div> */}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search delivered orders by product, customer, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
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
                    Delivered On
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{order.delivery_address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.is_accepted} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDate(order.estimated_delivery)}</span>
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
                {searchTerm ? "No matching delivered orders" : "No delivered orders found"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search criteria." 
                  : "Delivered orders will appear here once orders are marked as delivered."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}