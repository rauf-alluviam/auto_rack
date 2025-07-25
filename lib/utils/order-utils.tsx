import { Clock, Package, AlertCircle, ShoppingBag, Truck, CheckCircle } from "lucide-react"

export const STATUS_OPTIONS = [
  "Pending",
  "Accepted", // Added Accepted as a distinct status option for clarity
  "In Production",
  "Quality Check",
  "Packaging",
  "Shipped",
  "Delivered",
  "Rejected", 
  "Cancelled",
]

export const STATUS_CONFIG = {
  Pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  Accepted: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle }, // New config for Accepted
  "In Production": { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Package },
  "Quality Check": { color: "bg-purple-100 text-purple-800 border-purple-200", icon: AlertCircle },
  Packaging: { color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: ShoppingBag },
  Shipped: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: Truck },
  Delivered: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  Rejected: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle }, // New config for Rejected
  Cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
}

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not set"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export const StatusBadge = ({ status }: { status: string }) => {
  console.log("StatusBadge received status:", status)
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
  console.log("StatusBadge config for status:", status, config)

  const Icon = config?.icon || Clock

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config?.color || "bg-gray-100 text-gray-800"}`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  )
}
