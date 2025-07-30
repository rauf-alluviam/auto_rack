"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, Mail, Lock, UserCheck, CheckCircle, Building, Building2Icon} from "lucide-react"

export default function SignUp() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [CompanyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [userType, setUserType] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
  name: false,
  email: false,
  password: false,
  confirmPassword: false,
  companyName: false,
});

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^()\-_=+{}[\]|\\:;"'<>,./])[A-Za-z\d@$!%*?#&^()\-_=+{}[\]|\\:;"'<>,./]{8,}$/
  const nameRegex = /^[A-Za-z ]+$/

  if (!name.trim()) {
    setMessage("Please enter your name.")
    setFieldErrors(prev => ({ ...prev, name: true }))
    return
  }

  if (!nameRegex.test(name.trim())) {
    setMessage("Full Name can only contain alphabets and spaces.")
    setFieldErrors(prev => ({ ...prev, name: true }))
    return
  }

  if (!CompanyName.trim()) {
    setMessage("Please enter your Company Name.")
    setFieldErrors(prev => ({ ...prev, companyName: true }))
    return
  }

if (!email.trim()) {
  setMessage("Please enter your email.");
  setFieldErrors(prev => ({ ...prev, email: true }));
  return;
}

if (!emailRegex.test(email)) {
  setMessage("Please enter a valid email address.");
  setFieldErrors(prev => ({ ...prev, email: true }));
  return;
}

  if (!passwordRegex.test(password)) {
    setMessage("Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.")
    setFieldErrors(prev => ({ ...prev, password: true }))
    return
  }

  if (password !== confirmPassword) {
    setMessage("Passwords do not match.")
    setFieldErrors(prev => ({ ...prev, confirmPassword: true }))
    return
  }

 
  setIsLoading(true)
  setMessage("")

  const userData = {
    name: name.trim(),
    companyName: CompanyName.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    confirmPassword: confirmPassword.trim(),
    userType: userType || "buyer"
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(userData),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Network error occurred" }))
      throw new Error(errorData.error || errorData.message || `HTTP ${res.status}`)
    }

    const data = await res.json()

    if (typeof window !== 'undefined' && data.token) {
      const storageData = {
        token: data.token,
        buyerId: data.user?.id,
        signupData: JSON.stringify({
          name: name.trim(),
          companyName: CompanyName.trim(),
          email: email.trim().toLowerCase(),
          userType: userType || "buyer",
          userId: data.user?.id
        })
      }

      Object.entries(storageData).forEach(([key, value]) => {
        if (value) localStorage.setItem(key, value)
      })
    }

    setMessage("Account created successfully! Redirecting...")
    router.push("/buyers/home")

  } catch (error: any) {
    console.error("Signup error:", error)

    if (error.name === 'AbortError') {
      setMessage("Request timeout. Please check your connection and try again.")
    } else if (error.message.includes('409') || error.message.includes('exists')) {
      setMessage("An account with this email already exists.")
    } else if (error.message.includes('400') || error.message.includes('validation')) {
      setMessage("Please fill in all required fields correctly.")
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      setMessage("Network error. Please check your connection and try again.")
    } else {
      setMessage(error.message || "Signup failed. Please try again.")
    }
  } finally {
    setIsLoading(false)
  }
}


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {/* Main Card */}
        <div className="bg-white shadow-xl sm:shadow-2xl rounded-xl sm:rounded-2xl border border-gray-200 sm:border-white/20 overflow-hidden backdrop-blur-sm sm:backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Create Account</h1>
            <p className="text-blue-100 text-xs sm:text-sm">Join thousands of users on our platform</p>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-lg sm:rounded-xl p-1 mb-4 sm:mb-6">
              <Link
                href="/signin"
                className="flex-1 py-2 px-3 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors text-center"
              >
                Sign In
              </Link>
              <div className="flex-1 py-2 px-3 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium bg-white text-blue-600 shadow-sm text-center">
                Sign Up
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
              {message && (
                <div
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-start gap-2 ${
                    message.includes("successful")
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {message.includes("successful") && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  <span className="flex-1">{message}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                 
                  disabled={isLoading}
                />
              </div>

               {/*company  Name Field */}
              <div className="relative">
                <Building2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                  value={CompanyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                
                  disabled={isLoading}
                />
              </div>

              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Confirm Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full pl-10 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:active:scale-100 text-sm sm:text-base touch-manipulation"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Your information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  )
}