"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, Mail, Lock, UserCheck, CheckCircle, Building, Building2Icon,CircleUser} from "lucide-react"

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
  <div className="min-h-screen bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-6 sm:p-8">
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-8 py-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-white bg-opacity-25 flex items-center justify-center mb-4 drop-shadow-lg">
          <CircleUser className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-wide text-white mb-1 select-none">Create Account</h1>
        <p className="text-white/80 text-sm sm:text-base font-medium select-none">Join thousands of users on our platform</p>
      </div>

      <div className="p-8">
        {/* Toggle */}
        <div className="flex rounded-xl bg-gray-100 text-sm font-semibold mb-7 shadow-inner select-none">
          <Link
            href="/signin"
            className="flex-1 py-3 text-center rounded-xl text-gray-600 hover:text-indigo-700 transition-colors"
          >
            Sign In
          </Link>
          <div className="flex-1 py-3 text-center rounded-xl bg-white text-indigo-700 shadow-md cursor-default">
            Sign Up
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-sm ${
              message.includes("successful")
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            } shadow-sm`}
            role="alert"
          >
            {message.includes("successful") && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            <p className="leading-relaxed">{message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Full Name"
              className={`w-full pl-12 pr-4 py-3 rounded-xl border text-gray-700 placeholder-gray-400 font-medium text-base focus:outline-none focus:ring-4 focus:ring-indigo-200 ${
                fieldErrors.name ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:border-indigo-500'
              } transition`}
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isLoading}
              aria-invalid={fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-500">
                Please enter a valid full name.
              </p>
            )}
          </div>

          {/* Company Name */}
          <div className="relative">
            <Building2Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Company Name"
              className={`w-full pl-12 pr-4 py-3 rounded-xl border text-gray-700 placeholder-gray-400 font-medium text-base focus:outline-none focus:ring-4 focus:ring-indigo-200 ${
                fieldErrors.companyName ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:border-indigo-500'
              } transition`}
              value={CompanyName}
              onChange={e => setCompanyName(e.target.value)}
              disabled={isLoading}
              aria-invalid={fieldErrors.companyName}
              aria-describedby={fieldErrors.companyName ? "company-error" : undefined}
            />
            {fieldErrors.companyName && (
              <p id="company-error" className="mt-1 text-sm text-red-500">
                Please enter your company name.
              </p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email address"
              className={`w-full pl-12 pr-4 py-3 rounded-xl border text-gray-700 placeholder-gray-400 font-medium text-base focus:outline-none focus:ring-4 focus:ring-indigo-200 ${
                fieldErrors.email ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:border-indigo-500'
              } transition`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              aria-invalid={fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-500">
                Please enter a valid email address.
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`w-full pl-12 pr-12 py-3 rounded-xl border text-gray-700 placeholder-gray-400 font-medium text-base focus:outline-none focus:ring-4 focus:ring-indigo-200 ${
                fieldErrors.password ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:border-indigo-500'
              } transition`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              aria-invalid={fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {fieldErrors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-500">
                Password must contain uppercase, lowercase, number & special char.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className={`w-full pl-12 pr-12 py-3 rounded-xl border text-gray-700 placeholder-gray-400 font-medium text-base focus:outline-none focus:ring-4 focus:ring-indigo-200 ${
                fieldErrors.confirmPassword ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:border-indigo-500'
              } transition`}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              aria-invalid={fieldErrors.confirmPassword}
              aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {fieldErrors.confirmPassword && (
              <p id="confirmPassword-error" className="mt-1 text-sm text-red-500">
                Passwords do not match.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-gray-500 text-sm select-none">
          Already have an account?{' '}
          <Link href="/signin" className="text-indigo-600 font-semibold hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>

       <p className="mt-12 text-center text-gray-500 flex items-center justify-center gap-2 text-xs select-none">
      <Lock className="w-3 h-3" />
      Your information is secure and encrypted
    </p>
  </div>
)
 }