"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { CheckCircle, X, Package } from "lucide-react";

interface DecodedToken {
  id: string;
}

interface Order {
  _id: string;
  quantity: number;
  size: string;
  address: string;
  status: string;
  is_accepted: string;
  order_date: string;
  createdAt: string;
}

export default function PlaceOrderPage() {
  const router = useRouter();
  const [quantity, setQuantity] = useState("");
  const [size, setSize] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userId, setUserId] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      router.push("/signin");
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      setUserId(decoded.id);
     
      fetchUserOrders(token);
    } catch (err) {
      console.error("Invalid token", err);
      const errorMessage = err instanceof Error ? err.message : "Token validation failed";
      alert(`Invalid session: ${errorMessage}. Please log in again.`);
      router.push("/signin");
    }

    setIsMounted(true);
  }, [router]);

  // Fetch orders for the current user
  const fetchUserOrders = async (token: string) => {
    try {
      const response = await fetch("/api/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
      console.log("User orders:", data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!quantity || !size || !address) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const orderData = {
      quantity: parseInt(quantity),
      size,
      address,
    };

    console.log("Submitting order data:", orderData);
    console.log("User ID from token:", userId);

    try {
      const token = localStorage.getItem("token");
      console.log("Token exists:", !!token);
      
      if (!token) {
        alert("No authentication token found. Please log in again.");
        router.push("/signin");
        return;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        console.error("Parsed error data:", errorData);
        throw new Error(errorData.error || errorData.details || "Failed to place order");
      }

      const result = await response.json();
      console.log("Order placed successfully:", result);
      
      // Refresh orders list after placing new order
      if (token) {
        await fetchUserOrders(token);
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      alert(`Failed to place order: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Submitted</h2>
          <p className="text-gray-600 mb-6">Your request has been processed successfully.</p>
          <button
            onClick={() => router.push("/buyers/home")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Place New Order</h2>
          <button
            onClick={() => router.push("/buyers/home")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex">
          {/* Form Section */}
          <div className="w-1/2 p-6 border-r border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Crate Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crate Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-700"
                >
                  <option value="">Select size</option>
                  <option value="Small Crate">Small Crate</option>
                  <option value="Medium Crate">Medium Crate</option>
                  <option value="Large Crate">Large Crate</option>
                  <option value="Extra Large Crate">Extra Large Crate</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                />
              </div>

              {/* Delivery Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Location</label>
                <textarea
                  placeholder="Enter complete delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/buyers/home")}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </form>
          </div>

          {/* Orders List Section */}
          <div className="w-1/2 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Orders</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No orders yet</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{order.size}</p>
                        <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Address: {order.address ? `${order.address.substring(0, 50)}...` : order.address}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ordered: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}