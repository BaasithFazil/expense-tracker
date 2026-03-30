'use client'

import { supabase } from "@/lib/supabaseClient"
import { useRouter } from 'next/navigation'
import { useState } from "react"

export default function SetupProfile() {
  const [username, setUsername] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [cash, setCash] = useState('')
  const [step, setStep] = useState(1)
  const [currency, setCurrency] = useState('LKR')

  const handleSave = async () => {
    if (!username.trim()) {
      setErrorMsg('Username is required')
      return
    }
  
    const cashAmount = Number(cash)
  
    if (!cash || isNaN(cashAmount) || cashAmount < 0) {
      setErrorMsg('Enter valid cash amount')
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
  
    const user = userData.user
  
    // ✅ 1. Save profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: user.id,
          username,
        },
      ])
  
    if (profileError) {
      if (profileError.message.includes('profiles_username_key')) {
        setErrorMsg('Username already taken')
      } else {
        setErrorMsg(profileError.message)
      }
      setLoading(false)
      return
    }
  
    // 🔥 2. CHECK if account already exists (avoid duplicates)
    const { data: existingAccounts } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
  
    // 🔥 3. ONLY create if none exists
    if (!existingAccounts || existingAccounts.length === 0) {
      const { error: accountError } = await supabase
        .from('accounts')
        .insert([
          {
            user_id: user.id,
            name: 'Cash',
            balance: cashAmount,
            color: 'from-green-400 to-emerald-600',
          },
        ])
  
      if (accountError) {
        setErrorMsg(accountError.message)
        setLoading(false)
        return
      }
    }
  
    // ✅ 4. Go to dashboard
    router.push('/dashboard')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK').format(value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
  
        <h2 className="text-2xl font-semibold text-center mb-6">
          Setup Your Profile
        </h2>
  
        {/* STEP 1 - USERNAME */}
        {step === 1 && (
          <div className="space-y-4">
            <input
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
  
            <button
              onClick={() => {
                if (!username.trim()) {
                  setErrorMsg('Username required')
                  return
                }
                setErrorMsg('')
                setStep(2)
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Continue
            </button>
          </div>
        )}
  
        {/* STEP 2 - CASH */}
        {step === 2 && (
        <div className="space-y-4">
                <div className="grid place-items-center">
                <label className="text-md text-gray-800 font-semibold">
                    Cash in hand
                </label>
                </div>

            {/* Currency + Amount */}
            <div className="flex gap-2">
            
            {/* Currency Dropdown */}
            <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-3 border rounded-lg bg-white"
            >
                <option value="LKR">LKR</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
            </select>

            {/* Amount Input */}
            <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={cash ? formatCurrency(Number(cash)) : ''}
                onChange={(e) => {
                const raw = e.target.value.replace(/,/g, '')
                if (!/^\d*$/.test(raw)) return
                setCash(raw)
                }}
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

            <div className="flex gap-2">
            {/* Back */}
            <button
                onClick={() => setStep(1)}
                className="w-1/2 bg-gray-300 text-black py-3 rounded-lg"
            >
                Back
            </button>

            {/* Save */}
            <button
                onClick={handleSave}
                disabled={loading}
                className="w-1/2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Finish'}
            </button>
            </div>
        </div>
        )}
  
        {/* ERROR */}
        {errorMsg && (
          <p className="text-red-500 text-sm mt-4 text-center">
            {errorMsg}
          </p>
        )}
  
      </div>
    </div>
  )
}