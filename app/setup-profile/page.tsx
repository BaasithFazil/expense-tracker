'use client'

import { supabase } from "@/lib/supabaseClient"
import { useRouter } from 'next/navigation'
import { useState } from "react"

export default function SetupProfile() {
  const [username, setUsername] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    if (!username.trim()) {
      setErrorMsg('Username is required')
      return
    }

    setLoading(true)
    setErrorMsg('')

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      setErrorMsg('User not found')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .upsert([
        {
          id: userData.user.id,
          username,
        },
      ])

    if (error) {
      if (error.message.includes('profiles_username_key')) {
        setErrorMsg('Username already taken')
      } else {
        setErrorMsg(error.message)
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        
        <h2 className="text-2xl font-semibold text-center mb-6">
          Setup Your Profile
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errorMsg && (
            <p className="text-red-500 text-sm">{errorMsg}</p>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>

      </div>
    </div>
  )
}