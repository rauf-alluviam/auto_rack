"use client"

import { useState, useEffect } from "react"
import {
  RefreshCcw,
  Bell,
  Package,
  Loader2,
  CheckCircle2,
  Package2,
  Save,
  Plus,
  Minus,
  Archive,
  ArrowLeft,
  AlertTriangle,
  Settings,
  Eye,
  Download,
  Filter,
  Search,
  Shield,
  Edit3,
  Clock,
} from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  inventory: {
    [size in "S" | "M" | "L" | "XL"]: number
  }
}

const sizeMap: Record<string, "S" | "M" | "L" | "XL"> = {
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
}

export default function InventoryManagementPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdatingInventory, setIsUpdatingInventory] = useState(false)
  const [isSavingAllChanges, setIsSavingAllChanges] = useState(false)
  const [inventoryUpdateSuccess, setInventoryUpdateSuccess] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  // State for managing input values and tracking changes
  const [editingInputs, setEditingInputs] = useState<{ [key: string]: { [size: string]: string } }>({})
  const [originalValues, setOriginalValues] = useState<{ [key: string]: { [size: string]: number } }>({})

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/sellerOrder/inventoryManagement")

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      const mapped = data.map((item: any) => ({
        id: item._id,
        name: item.productName,
        description: item.description || "No description available",
        price: item.price || 0,
        category: item.category || "Uncategorized",
        inventory: {
          S: item.inventory?.S || 0,
          M: item.inventory?.M || 0,
          L: item.inventory?.L || 0,
          XL: item.inventory?.XL || 0,
        },
      }))

      setProducts(mapped)

      // Initialize editing inputs and original values
      const initialInputs: { [key: string]: { [size: string]: string } } = {}
      const initialOriginals: { [key: string]: { [size: string]: number } } = {}

      mapped.forEach((product: Product) => {
        initialInputs[product.id] = {}
        initialOriginals[product.id] = {}
        Object.entries(product.inventory).forEach(([size, stock]) => {
          initialInputs[product.id][size] = stock.toString()
          initialOriginals[product.id][size] = stock
        })
      })

      setEditingInputs(initialInputs)
      setOriginalValues(initialOriginals)
      setError(null)
    } catch (error) {
      console.error("Error fetching inventory:", error)
      setError("Failed to load inventory data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateInventory = async (id: string, size: "S" | "M" | "L" | "XL", quantityChange: number) => {
    try {
      setIsUpdatingInventory(true)
      const res = await fetch("/api/sellerOrder/inventoryManagement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, size, quantityChange }),
      })

      if (!res.ok) {
        throw new Error("Failed to update inventory")
      }

      const result = await res.json()
      console.log("Update successful:", result)

      // Update local state
      const currentStock = products.find((p) => p.id === id)?.inventory[size] || 0
      const newStock = Math.max(0, currentStock + quantityChange)

      setProducts((prev) =>
        prev.map((product) => {
          if (product.id === id) {
            return {
              ...product,
              inventory: {
                ...product.inventory,
                [size]: newStock,
              },
            }
          }
          return product
        }),
      )

      // Update input values and original values
      setEditingInputs((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          [size]: newStock.toString(),
        },
      }))

      setOriginalValues((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          [size]: newStock,
        },
      }))

      setInventoryUpdateSuccess(true)
      setTimeout(() => {
        setInventoryUpdateSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("Inventory update failed:", err)
      setError("Failed to update inventory. Please try again.")
    } finally {
      setIsUpdatingInventory(false)
    }
  }

  const handleInputChange = (productId: string, size: string, value: string) => {
    // Only allow positive numbers
    if (value === "" || (/^\d+$/.test(value) && Number.parseInt(value) >= 0)) {
      setEditingInputs((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [size]: value,
        },
      }))
    }
  }

  // Function to get all changes
  const getAllChanges = () => {
    const changes: Array<{
      productId: string
      productName: string
      size: "S" | "M" | "L" | "XL"
      oldValue: number
      newValue: number
    }> = []

    Object.entries(editingInputs).forEach(([productId, sizes]) => {
      const product = products.find((p) => p.id === productId)
      Object.entries(sizes).forEach(([size, inputValue]) => {
        const newValue = Number.parseInt(inputValue) || 0
        const oldValue = originalValues[productId]?.[size] || 0

        if (newValue !== oldValue && inputValue !== "") {
          changes.push({
            productId,
            productName: product?.name || "Unknown Product",
            size: size as "S" | "M" | "L" | "XL",
            oldValue,
            newValue,
          })
        }
      })
    })

    return changes
  }

  // Function to save all changes
  const saveAllChanges = async () => {
    const changes = getAllChanges()

    if (changes.length === 0) {
      return
    }

    try {
      setIsSavingAllChanges(true)

      // Process all changes
      const updatePromises = changes.map(async (change) => {
        const quantityChange = change.newValue - change.oldValue

        const res = await fetch("/api/sellerOrder/inventoryManagement", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: change.productId,
            size: change.size,
            quantityChange,
          }),
        })

        if (!res.ok) {
          throw new Error(`Failed to update ${change.productName} - Size ${change.size}`)
        }

        return res.json()
      })

      await Promise.all(updatePromises)

      // Update local state with all changes
      setProducts((prev) =>
        prev.map((product) => {
          const productChanges = changes.filter((c) => c.productId === product.id)
          if (productChanges.length === 0) return product

          const updatedInventory = { ...product.inventory }
          productChanges.forEach((change) => {
            updatedInventory[change.size] = change.newValue
          })

          return {
            ...product,
            inventory: updatedInventory,
          }
        }),
      )

      // Update original values to match current inputs
      const newOriginalValues = { ...originalValues }
      changes.forEach((change) => {
        if (!newOriginalValues[change.productId]) {
          newOriginalValues[change.productId] = {}
        }
        newOriginalValues[change.productId][change.size] = change.newValue
      })
      setOriginalValues(newOriginalValues)

      setInventoryUpdateSuccess(true)
      setTimeout(() => {
        setInventoryUpdateSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("Batch inventory update failed:", err)
      setError("Failed to save some inventory changes. Please try again.")
    } finally {
      setIsSavingAllChanges(false)
    }
  }

  const handleStockUpdate = async (productId: string, size: "S" | "M" | "L" | "XL", change: number) => {
    await updateInventory(productId, size, change)
  }

  const handleNavigation = (path: string) => {
    window.location.href = path
  }

  const refreshData = async () => {
    await fetchDashboardData()
  }

  const getStockStatus = (stock: number, threshold = 5) => {
    if (stock === 0)
      return {
        status: "Out of Stock",
        color: "red",
        bgColor: "bg-gradient-to-r from-red-50 to-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-200",
        iconColor: "text-red-500",
      }
    if (stock <= threshold)
      return {
        status: "Low Stock",
        color: "orange",
        bgColor: "bg-gradient-to-r from-orange-50 to-orange-100",
        textColor: "text-orange-700",
        borderColor: "border-orange-200",
        iconColor: "text-orange-500",
      }
    if (stock <= threshold * 2)
      return {
        status: "Medium Stock",
        color: "yellow",
        bgColor: "bg-gradient-to-r from-yellow-50 to-yellow-100",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-200",
        iconColor: "text-yellow-500",
      }
    return {
      status: "In Stock",
      color: "green",
      bgColor: "bg-gradient-to-r from-green-50 to-green-100",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      iconColor: "text-green-500",
    }
  }

  const getStockPercentage = (stock: number, threshold = 5) => {
    const maxStock = threshold * 3
    return Math.min((stock / maxStock) * 100, 100)
  }

  const lowStockItems = products.reduce(
    (count, product) => count + Object.values(product.inventory).filter((stock) => stock > 0 && stock <= 5).length,
    0,
  )

  const outOfStockItems = products.reduce(
    (count, product) => count + Object.values(product.inventory).filter((stock) => stock === 0).length,
    0,
  )

  // Get all pending changes for display
  const pendingChanges = getAllChanges()
  const hasChanges = pendingChanges.length > 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Loading Inventory
            </h2>
            <p className="text-gray-600">Fetching your product data...</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Inventory</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={refreshData}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleNavigation("/seller")}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-200 group"
                title="Back to Dashboard"
              >
                <ArrowLeft size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                    Inventory Management
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">Manage your product stock</p>
                </div>
              </div>
            </div>
            {/* Right side */}
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg border border-orange-200">
                  <Clock size={16} />
                  <span className="text-sm font-medium">{pendingChanges.length} unsaved changes</span>
                </div>
              )}
              <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-200 group">
                <Search size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-200 group">
                <Filter size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={refreshData}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-200 group"
                title="Refresh Data"
              >
                <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              </button>
              <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-xl transition-all duration-200 group">
                <Settings size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Changes Summary */}
      {hasChanges && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-orange-800 text-lg">Pending Changes ({pendingChanges.length})</h3>
                  <p className="text-sm text-orange-600 mb-3">Review your changes before saving</p>
                  <div className="space-y-1">
                    {pendingChanges.slice(0, 3).map((change, index) => (
                      <p key={index} className="text-xs text-orange-700">
                        <span className="font-medium">{change.productName}</span> - Size {change.size}:{" "}
                        {change.oldValue} → {change.newValue}
                      </p>
                    ))}
                    {pendingChanges.length > 3 && (
                      <p className="text-xs text-orange-600 font-medium">
                        +{pendingChanges.length - 3} more changes...
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={saveAllChanges}
                disabled={isSavingAllChanges}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSavingAllChanges ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Package2 size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">Inventory Dashboard</h1>
                    <p className="text-blue-100 text-lg">Monitor and manage your product stock levels in real-time</p>
                  </div>
                </div>
                <div className="hidden lg:flex items-center space-x-4">
                  <button className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm">
                    <Eye size={20} />
                  </button>
                  <button className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm">
                    <Download size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{products.length}</p>
              <p className="text-xs text-blue-600 font-medium flex items-center">
                <Package2 size={12} className="mr-1" />
                Active products
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Low Stock Items</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{lowStockItems}</p>
              <p className="text-xs text-orange-600 font-medium">Requires attention</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Out of Stock</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{outOfStockItems}</p>
              <p className="text-xs text-red-600 font-medium">Immediate action needed</p>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
            >
              {/* Product Header */}
              {/* <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Package2 size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent mb-2">
                        {product.name}
                      </h2>
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-semibold">
                          {product.category}
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-semibold flex items-center">
                          <Shield size={14} className="mr-1" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 max-w-3xl leading-relaxed text-lg">{product.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 shadow-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">$</span>
                        </div>
                        <span className="text-sm text-green-600 font-semibold">Price</span>
                      </div>
                      <p className="font-bold text-green-700 text-2xl">${product.price}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200 shadow-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Package size={16} className="text-white" />
                        </div>
                        <span className="text-sm text-blue-600 font-semibold">Product ID</span>
                      </div>
                      <p className="font-bold text-blue-700 text-xl truncate">{product.id}</p>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Stock Management */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Archive className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent mb-1">
                      Stock Management
                    </h3>
                    <p className="text-gray-600">Adjust stock levels for each size variant</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {Object.entries(product.inventory).map(([size, stock]) => {
                    const stockStatus = getStockStatus(stock, 5)
                    const stockPercentage = getStockPercentage(stock, 5)
                    const inputValue = editingInputs[product.id]?.[size] || stock.toString()
                    const originalValue = originalValues[product.id]?.[size] || stock
                    const hasChanged = inputValue !== originalValue.toString() && inputValue !== ""

                    return (
                      <div
                        key={size}
                        className={`bg-white/60 backdrop-blur-sm border rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden ${
                          hasChanged ? "border-orange-300 bg-orange-50/30" : "border-white/40"
                        }`}
                      >
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full -translate-y-16 translate-x-16"></div>

                        {/* Change indicator */}
                        {hasChanged && (
                          <div className="absolute top-4 right-4 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                              <Package size={24} className="text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-xl">Size {size}</h4>
                              <p className="text-sm text-gray-500 font-medium">Size variant</p>
                            </div>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-full text-sm font-bold ${stockStatus.bgColor} ${stockStatus.textColor} border ${stockStatus.borderColor} shadow-lg`}
                          >
                            {stockStatus.status}
                          </div>
                        </div>

                        {/* Stock Level Indicator */}
                        <div className="mb-8 relative z-10">
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-600 font-medium">Current Stock</span>
                            <span className="font-bold text-gray-900">{stock} units</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 shadow-lg ${
                                stockPercentage <= 25
                                  ? "bg-gradient-to-r from-red-400 to-red-500"
                                  : stockPercentage <= 50
                                    ? "bg-gradient-to-r from-orange-400 to-orange-500"
                                    : stockPercentage <= 75
                                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                      : "bg-gradient-to-r from-green-400 to-green-500"
                              }`}
                              style={{ width: `${Math.max(stockPercentage, 8)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                            <span>0</span>
                            <span>Low: 5</span>
                            <span>Max: 15</span>
                          </div>
                        </div>

                        {/* Direct Input Section */}
                        <div className="mb-6 relative z-10">
                          <div className="flex items-center space-x-3 mb-4">
                            <Edit3 size={16} className="text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">Update Stock Level</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => handleInputChange(product.id, size, e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg focus:ring-2 transition-all duration-200 text-center font-bold text-xl ${
                                  hasChanged
                                    ? "border-orange-300 focus:border-orange-500 focus:ring-orange-200 text-orange-900"
                                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-200 text-gray-900"
                                }`}
                                placeholder="Enter stock quantity"
                                disabled={isSavingAllChanges}
                              />
                            </div>
                          </div>
                          {hasChanged && inputValue !== "" && (
                            <p className="text-xs text-orange-600 mt-2 font-medium">
                              Will update from {originalValue} to {inputValue} units
                            </p>
                          )}
                        </div>

                        {/* Stock Controls */}
                        <div className="space-y-6 relative z-10">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", -1)}
                              className="w-12 h-12 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-600 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                              disabled={stock <= 0 || isUpdatingInventory}
                            >
                              <Minus size={18} />
                            </button>
                            <div className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg">
                              <div className="text-center font-bold text-xl text-gray-900">{stock}</div>
                            </div>
                            <button
                              onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", 1)}
                              className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-600 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isUpdatingInventory}
                            >
                              <Plus size={18} />
                            </button>
                          </div>

                          {/* Quick Actions */}
                          <div className="grid grid-cols-4 gap-3">
                            <button
                              onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", 5)}
                              className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isUpdatingInventory}
                            >
                              +5
                            </button>
                            <button
                              onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", 10)}
                              className="px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-600 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isUpdatingInventory}
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", 25)}
                              className="px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-600 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isUpdatingInventory}
                            >
                              +25
                            </button>
                            <button
                              onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", -stock)}
                              className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-600 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={stock === 0 || isUpdatingInventory}
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Success Message */}
        {inventoryUpdateSuccess && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-green-800 text-lg">Inventory Updated Successfully!</p>
                <p className="text-sm text-green-600">
                  Your stock levels have been saved and synchronized across all systems.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-between">
          <button
            onClick={() => handleNavigation("/seller")}
            className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-white hover:border-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            disabled={isUpdatingInventory || isSavingAllChanges}
          >
            Back to Dashboard
          </button>

          <div className="flex gap-4">
            <button
              onClick={refreshData}
              disabled={isUpdatingInventory || isSavingAllChanges}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {isUpdatingInventory ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <RefreshCcw size={20} />
                  <span>Refresh Data</span>
                </>
              )}
            </button>

            {hasChanges && (
              <button
                onClick={saveAllChanges}
                disabled={isSavingAllChanges}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {isSavingAllChanges ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Saving All Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save All Changes ({pendingChanges.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
