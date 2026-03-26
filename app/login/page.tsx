'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) alert(error.message)
    else {
            router.push('/dashboard')
        
        }
  }

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) alert(error.message)
    else alert('Check your email!')
  }

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          router.push('/login')
        }
      }
    )
  
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <>    

<div className="min-h-screen flex">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center text-white p-10">
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome Back 👋</h1>
          <p className="text-lg">
            Login to manage your smart expense tracker.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg opacity-100">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Login to your account
          </h2>

          {/* EMAIL */}
          <input
            type="Email"
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {/* OPTIONS */}
          <div className="flex justify-between items-center mb-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#" className="text-indigo-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* LOGIN BUTTON */}
          <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
          onClick={handleLogin}>
            Login
          </button>

          {/* DIVIDER */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-2 text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* SOCIAL LOGIN */}
          <button className="w-full border p-3 rounded-lg mb-2 hover:bg-gray-100">
            Continue with Google
          </button>
          <button className="w-full border p-3 rounded-lg hover:bg-gray-100">
            Continue with Facebook
          </button>

          {/* SIGNUP */}
          <p className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <a href="#" className="text-indigo-600 font-medium" onClick={handleSignup}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div> 
</>
    
  )
}