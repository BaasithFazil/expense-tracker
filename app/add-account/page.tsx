'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AddAccount() {
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const router = useRouter()
  
  const colors = [
    'from-indigo-500 to-purple-600',
    'from-green-400 to-emerald-600',
    'from-pink-500 to-rose-500',
    'from-blue-500 to-cyan-500',
    'from-orange-400 to-red-500',
  ]

  const [selectedColor, setSelectedColor] = useState(colors[0])

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
        color: selectedColor,
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
            maxLength={12}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Choose Card Color</label>

          <div className="flex gap-3 mt-2">
            {colors.map((color) => (
              <div
                key={color}
                onClick={() => setSelectedColor(color)} 
                className={`w-10 h-10 rounded-full cursor-pointer bg-linear-to-br ${color} ${
                  selectedColor === color ? 'ring-2 ring-black' : ''
                }`}
              />
            ))}
          </div>
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