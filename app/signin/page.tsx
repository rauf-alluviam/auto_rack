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

// ✅ Store token based on user role
if (data.token) {
  if (userRole === 'supplier' || userRole === 'seller') {
    localStorage.setItem("seller_token", data.token);
  } else if (userRole === 'buyer' || !userRole) {
    localStorage.setItem("buyer_token", data.token);
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        <div className="bg-white shadow-xl sm:shadow-2xl rounded-xl sm:rounded-2xl border border-gray-200 sm:border-white/20 overflow-hidden backdrop-blur-sm sm:backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Welcome Back</h1>
            <p className="text-purple-100 text-xs sm:text-sm">Sign in to continue to your account</p>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-lg sm:rounded-xl p-1 mb-4 sm:mb-6">
              <div className="flex-1 py-2 px-3 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium bg-white text-purple-600 shadow-sm text-center">
                Sign In
              </div>
              <Link
                href="/signup"
                className="flex-1 py-2 px-3 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors text-center"
              >
                Sign Up
              </Link>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin}  noValidate className="space-y-4 sm:space-y-5">
              {message && (
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-start gap-2 bg-red-50 border border-red-200 text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="flex-1">{message}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Secure login with 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}