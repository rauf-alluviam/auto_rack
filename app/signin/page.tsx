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
    setIsLoading(true);
    setMessage("");

    if (!email || !password) {
      setMessage("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        body: JSON.stringify({ 
          email: email.trim(), 
          password: password.trim() 
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Login failed");
      }

      // Store the token
      localStorage.setItem("token", data.token);
      
      
      console.log("Login response data:", data);
      
     
      let userRole = null;
      
     
      if (data.user?.userType) {
        userRole = data.user.userType.toLowerCase();
      } else if (data.user?.role) {
        userRole = data.user.role.toLowerCase();
      }
      
     
      if (!userRole && data.token) {
        try {
          const decoded = jwtDecode<DecodedToken>(data.token);
          console.log("Decoded token:", decoded);
          userRole = (decoded.userType || decoded.role)?.toLowerCase();
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
        }
      }

     
      console.log("Determined user role:", userRole);

     
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: userRole,
        userType: userRole,
        address: data.user.address,
      };

     
      if (userRole === 'supplier' || userRole === 'seller') {
        console.log("Redirecting to seller dashboard");
        localStorage.setItem("supplier", JSON.stringify(userData));
        router.push("/seller");
      } else if (userRole === 'buyer') {
        console.log("Redirecting to buyer dashboard");
        localStorage.setItem("buyer", JSON.stringify(userData));
        router.push("/buyers/home");
      } else {
        
        console.error("Unable to determine user role:", userRole);
        setMessage(`Unable to determine account type. Role received: ${userRole}`);
        setIsLoading(false);
        return;
      }

    } catch (error: any) {
      console.error("Login error:", error);
      setMessage(error.message || "An error occurred during sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-purple-100 text-sm">Sign in to continue to your account</p>
          </div>

          <div className="p-8">
            {/* Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <div className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-white text-purple-600 shadow-sm text-center">
                Sign In
              </div>
              <Link
                href="/signup"
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors text-center"
              >
                Sign Up
              </Link>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {message && (
                <div className="p-4 rounded-xl text-sm flex items-center gap-2 bg-red-50 border border-red-200 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  {message}
                </div>
              )}

              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Secure login with 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}