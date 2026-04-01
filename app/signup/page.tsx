'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [username, setUsername] = useState('')

  const handleSignup = async () => {
    if (!email || !password) {
      alert('Email and password required')
      return
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Account created! You can login now.')
      router.push('/login')
    }

    const user = data.user

    if(user) {
        await supabase.from('profiles').insert([
            {
                id: user.id,
                username : username,
            },
        ])
    }

    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg">

        <div>
          <h1 className='text-center text-sm text-red-600 text-xl font-bold'>Creation Disabled</h1>
          <p className='text-center text-sm text-red-600'>Disabled for now. Need an account? Contact Baasith </p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>

        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled
          onClick={handleSignup}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg"
        >
          Sign Up
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-indigo-600"
          >
            Login
          </button>
        </p>

        
      </div>
    </div>
  )
}