"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  userType: string;
  exp: number;
  iat: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  role: string;
  address?: string;
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quick validation before showing loading state
    const emailTrimmed = email.trim().toLowerCase()
    const passwordTrimmed = password.trim()

   const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

if (!emailTrimmed || !passwordTrimmed) {
  setMessage("Please fill in all fields");
  return;
}

if (!emailRegex.test(emailTrimmed)) {
  setMessage("Please enter a valid email address");
  return;
}


    // Only set loading after validation passes
    setIsLoading(true);
    setMessage("");

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const res = await fetch("/api/signin", {
        method: "POST",
        body: JSON.stringify({ 
          email: emailTrimmed, 
          password: passwordTrimmed 
        }),
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Network error occurred" }))
        throw new Error(errorData.message || errorData.error || `HTTP ${res.status}`)
      }
const data = await res.json();

let userRole = data.user?.userType?.toLowerCase() || data.user?.role?.toLowerCase();

if (!userRole && data.token) {
  try {
    const decoded = jwtDecode<DecodedToken>(data.token);
    userRole = (decoded.userType || decoded.role)?.toLowerCase();
  } catch (decodeError) {
    console.warn("Token decode failed:", decodeError);
    userRole = "buyer"; 
  }
}

// ✅ Store token under both generic and role-specific keys
if (data.token) {
  localStorage.setItem("token",         data.token)          // ← dashboard uses this
  if (userRole === 'supplier' || userRole === 'seller') {
    localStorage.setItem("seller_token", data.token)
  } else {
    localStorage.setItem("buyer_token",  data.token)
  }
}


// ✅ Store user object
const userData = {
  id: data.user?.id,
  name: data.user?.name,
  email: data.user?.email,
  role: userRole,
  userType: userRole,
  address: data.user?.address,
};

if (userRole === 'supplier' || userRole === 'seller') {
  localStorage.setItem("supplier", JSON.stringify(userData));
  router.push("/seller");
} else if (userRole === 'buyer' || !userRole) {
  localStorage.setItem("buyer", JSON.stringify(userData));
  router.push("/buyers/home");
} else {
  throw new Error(`Unknown user role: ${userRole}`);
}


    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.name === 'AbortError') {
        setMessage("Request timeout. Please check your connection and try again.");
      } else if (error.message.includes('401') || error.message.includes('credentials') || error.message.includes('password')) {
        setMessage("Invalid email or password. Please try again.");
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        setMessage("Account not found. Please check your email or sign up.");
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        setMessage("Network error. Please check your connection and try again.");
      } else {
        setMessage(error.message || "An error occurred during sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

return (
  <div className="min-h-screen bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-6 sm:p-8">
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-10 py-10 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-white bg-opacity-25 flex items-center justify-center mb-5 drop-shadow-lg">
          <LogIn className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2 select-none">Welcome Back</h1>
        <p className="text-white/80 text-base font-medium select-none">
          Sign in to continue to your account
        </p>
      </div>

      <div className="px-10 py-10">
        {/* Toggle Buttons */}
        <div className="flex bg-gray-100 rounded-xl text-sm font-semibold mb-8 shadow-inner select-none text-center">
          <div className="flex-1 py-4 rounded-xl bg-white text-purple-700 shadow-md cursor-default">
            Sign In
          </div>
          <Link
            href="/signup"
            className="flex-1 py-4 rounded-xl text-gray-600 hover:text-indigo-700 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-7 rounded-xl px-5 py-4 flex items-center gap-3 font-medium text-sm shadow-sm ${
              message.toLowerCase().includes("invalid") || message.toLowerCase().includes("error")
                ? "bg-red-100 border border-red-200 text-red-800"
                : "bg-green-100 border border-green-200 text-green-800"
            }`}
            role="alert"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="leading-relaxed">{message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} noValidate className="space-y-7">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-14 pr-5 py-4 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 font-medium text-base focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-gray-50 focus:bg-white transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              aria-label="Email address"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-14 pr-14 py-4 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 font-medium text-base focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 bg-gray-50 focus:bg-white transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-10 text-center text-gray-500 text-base select-none">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-indigo-600 font-semibold hover:text-indigo-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>

    {/* Trust Indicators */}
    <p className="mt-10 text-center text-gray-500 flex items-center justify-center gap-2 text-xs select-none">
      <Lock className="w-4 h-4" />
      Secure login with 256-bit SSL encryption
    </p>
  </div>
);
}