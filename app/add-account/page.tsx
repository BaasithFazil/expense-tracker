'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AddAccount() {
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const router = useRouter()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK').format(value)
  }

  const handleBalanceChange = (value: string) => {
    // remove commas
    const rawValue = value.replace(/,/g, '')
  
    // allow only digits
    if (!/^\d*$/.test(rawValue)) return
  
    setBalance(rawValue)
  }

  const handleSubmit = async () => {
    const numericBalance = Number(balance)
  
    if (!balance || isNaN(numericBalance) || numericBalance < 0) {
      alert('Enter valid balance')
      return
    }
  
    await supabase.from('accounts').insert([
      {
        name,
        balance: numericBalance, // ✅ clean number
      },
    ])
  }

  const handleAddAccount = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      alert('Not logged in')
      return
    }

    const { error } = await supabase.from('accounts').insert([
      {
        user_id: user.id,
        name,
        balance: Number(balance),
      },
    ])


    if (error) {
      alert(error.message)
    } else {
      alert('Account created!')
      router.push('/dashboard') // go back after creating
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
  
        {/* TITLE */}
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create Account 🏦
        </h2>
  
        {/* ACCOUNT NAME */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">Account Name</label>
          <input
            placeholder="Cash, Bank, Wallet..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
  
        {/* BALANCE */}
        <div className="mb-6">
          <label className="text-sm text-gray-600">Initial Balance (LKR)</label>
          <input
            type="text"
            inputMode='numeric'
            placeholder="Enter amount"
            value={balance ? formatCurrency(Number(balance)): ''}
            onChange={(e) => handleBalanceChange(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
  
        {/* BUTTON */}
        <button
          onClick={handleAddAccount}
          disabled={!name || !balance}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Account
        </button>
  
        {/* BACK LINK */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full mt-3 text-sm text-gray-500 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}