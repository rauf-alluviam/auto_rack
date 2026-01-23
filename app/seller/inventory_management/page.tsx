"use client"

import { useState, useEffect } from "react"
import {
  RefreshCcw,
  Bell,
  Package,
  Loader2,
  Package2,
  Save,
  Plus,
  Minus,
  AlertTriangle,
  Clock,
  Home,
  History,
  X,
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
    },
    {
      name: "Inventory Management",
      href: "/seller/inventory_management",
      icon: Package2,
      current: currentPage === "inventory"
    }
  ]

  return (
    <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.name}
              href={item.href}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                item.current
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.name}</span>
              <span className="sm:hidden">{item.name.split(' ')[0]}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

export default function InventoryManagementPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdatingInventory, setIsUpdatingInventory] = useState(false)
  const [isSavingAllChanges, setIsSavingAllChanges] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })

  const [editingInputs, setEditingInputs] = useState<{ [key: string]: { [size: string]: string } }>({})
  const [originalValues, setOriginalValues] = useState<{ [key: string]: { [size: string]: number } }>({})

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 3000)
  }

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

      showToast("Inventory updated successfully!")
    } catch (err) {
      console.error("Inventory update failed:", err)
      setError("Failed to update inventory. Please try again.")
    } finally {
      setIsUpdatingInventory(false)
    }
  }

  const handleInputChange = (productId: string, size: string, value: string) => {
    // Allow empty string or valid positive numbers up to 999999
    if (value === "" || (/^\d+$/.test(value) && Number.parseInt(value) >= 0 && Number.parseInt(value) <= 999999)) {
      setEditingInputs((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [size]: value,
        },
      }))
    }
  }

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
        const newValue = inputValue === "" ? 0 : Number.parseInt(inputValue)
        const oldValue = originalValues[productId]?.[size] || 0
        if (newValue !== oldValue) {
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

  const saveAllChanges = async () => {
    const changes = getAllChanges()

    if (changes.length === 0) {
      return
    }

    try {
      setIsSavingAllChanges(true)

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

      const newOriginalValues = { ...originalValues }
      changes.forEach((change) => {
        if (!newOriginalValues[change.productId]) {
          newOriginalValues[change.productId] = {}
        }
        newOriginalValues[change.productId][change.size] = change.newValue
      })
      setOriginalValues(newOriginalValues)

      showToast("All changes saved successfully!")
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

  const getStockStatus = (stock: number, threshold = 5) => {
    if (stock === 0)
      return { status: "Out of Stock", color: "red" }
    if (stock <= threshold)
      return { status: "Low Stock", color: "yellow" }
    return { status: "In Stock", color: "green" }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const lowStockItems = products.reduce(
    (count, product) => count + Object.values(product.inventory).filter((stock) => stock > 0 && stock <= 5).length,
    0,
  )

  const outOfStockItems = products.reduce(
    (count, product) => count + Object.values(product.inventory).filter((stock) => stock === 0).length,
    0,
  )

  const pendingChanges = getAllChanges()
  const hasChanges = pendingChanges.length > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg font-medium">Loading inventory...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Inventory</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast.visible && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-2 duration-300">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Bell className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{toast.message}</p>
                </div>
                <button
                  onClick={() => setToast({ message: '', visible: false })}
                  className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <Navigation currentPage="inventory" />

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg shadow-blue-200">
                <Package2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600 mt-1">Manage your product stock levels</p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-blue-200 w-full sm:w-auto justify-center"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Pending Changes Banner */}
        {hasChanges && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 p-2.5 rounded-lg shadow-md flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-orange-900 text-lg mb-1">
                    Pending Changes ({pendingChanges.length})
                  </h3>
                  <p className="text-sm text-orange-700 mb-3">Review your changes before saving</p>
                  <div className="text-xs text-orange-800 space-y-1">
                    {pendingChanges.slice(0, 2).map((change, index) => (
                      <div key={index} className="font-medium">
                        {change.productName} - Size {change.size}: {formatNumber(change.oldValue)} → {formatNumber(change.newValue)}
                      </div>
                    ))}
                    {pendingChanges.length > 2 && (
                      <div className="font-semibold text-orange-900">+{pendingChanges.length - 2} more changes...</div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={saveAllChanges}
                disabled={isSavingAllChanges}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md flex-shrink-0"
              >
                {isSavingAllChanges ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Low Stock Items</p>
                <p className="text-3xl font-bold text-yellow-600">{lowStockItems}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600">{outOfStockItems}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <Package className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-5">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              {/* Product Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-lg shadow-md">
                      <Package2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                          {product.category}
                        </span>
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                          ${product.price}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              </div>

              {/* Stock Management */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(product.inventory).map(([size, stock]) => {
                  const stockStatus = getStockStatus(stock, 5)
                  const inputValue = editingInputs[product.id]?.[size] !== undefined
                    ? editingInputs[product.id]?.[size]
                    : stock.toString()
                  const originalValue = originalValues[product.id]?.[size] || stock
                  const hasChanged = inputValue !== originalValue.toString()

                  return (
                    <div
                      key={size}
                      className={`rounded-xl p-4 border-2 transition-all ${
                        hasChanged 
                          ? "border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm" 
                          : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      {/* Size Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-xs font-bold text-gray-700">{size}</span>
                          </div>
                        </div>
                        <div
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            stockStatus.color === "green"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : stockStatus.color === "yellow"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {stockStatus.status}
                        </div>
                      </div>

                      {/* Current Stock Display */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span className="font-medium">Current Stock</span>
                          <span className="font-bold text-gray-900">{formatNumber(stock)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              stock === 0
                                ? "bg-red-500"
                                : stock <= 5
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(Math.max((stock / 100) * 100, 8), 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Direct Input */}
                      <div className="mb-3">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => handleInputChange(product.id, size, e.target.value)}
                          onBlur={() => {
                            if (editingInputs[product.id]?.[size] === "") {
                              handleInputChange(product.id, size, "0")
                            }
                          }}
                          className={`w-full px-3 py-2.5 border-2 rounded-lg text-center font-bold text-sm transition-all ${
                            hasChanged
                              ? "border-orange-400 focus:border-orange-500 bg-white text-orange-900 shadow-sm"
                              : "border-gray-200 focus:border-blue-500 bg-white text-gray-900"
                          } focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                            hasChanged ? "focus:ring-orange-200" : "focus:ring-blue-200"
                          }`}
                          placeholder="Enter stock"
                          disabled={isSavingAllChanges}
                          maxLength={6}
                        />
                        {hasChanged && (
                          <p className="text-xs text-orange-700 mt-1.5 font-medium">
                            {formatNumber(originalValue)} → {inputValue === "" ? "0" : formatNumber(parseInt(inputValue))}
                          </p>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", -1)}
                            className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 border border-red-200 shadow-sm"
                            disabled={stock <= 0 || isUpdatingInventory}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-center font-bold text-sm text-gray-900 shadow-sm">
                            {formatNumber(stock)}
                          </div>
                          <button
                            onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", 1)}
                            className="w-9 h-9 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 border border-green-200 shadow-sm"
                            disabled={isUpdatingInventory}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", 5)}
                            className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 border border-blue-200"
                            disabled={isUpdatingInventory}
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", 10)}
                            className="px-2 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 border border-green-200"
                            disabled={isUpdatingInventory}
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", 25)}
                            className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 border border-purple-200"
                            disabled={isUpdatingInventory}
                          >
                            +25
                          </button>
                          <button
                            onClick={() => handleStockUpdate(product.id, size as "S" | "M" | "L" | "XL", -stock)}
                            className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 border border-gray-200"
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
          ))}
        </div>

        {/* No Products State */}
        {products.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 text-lg mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Products will appear here when they are added to your inventory.</p>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={() => window.location.href = "/seller"}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm"
          >
            Back to Dashboard
          </button>

          <div className="flex gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={isUpdatingInventory || isSavingAllChanges}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-blue-200"
            >
              {isUpdatingInventory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  Refresh Data
                </>
              )}
            </button>

            {hasChanges && (
              <button
                onClick={saveAllChanges}
                disabled={isSavingAllChanges}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
              >
                {isSavingAllChanges ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All Changes ({pendingChanges.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}