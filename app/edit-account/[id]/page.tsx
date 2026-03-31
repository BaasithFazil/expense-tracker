'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'

export default function EditAccount() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [oldBalance, setOldBalance] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')

  const colors = [
    'from-indigo-500 to-purple-600',
    'from-green-400 to-emerald-600',
    'from-pink-500 to-rose-500',
    'from-blue-500 to-cyan-500',
    'from-orange-400 to-red-500',
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK').format(value)
  }

  const handleBalanceChange = (value: string) => {
    const raw = value.replace(/,/g, '')
    if (!/^\d*$/.test(raw)) return
    setBalance(raw)
  }

  // 🔥 Fetch existing account
  useEffect(() => {
    const fetchAccount = async () => {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setName(data.name)
        setBalance(data.balance.toString())
        setOldBalance(data.balance)
        setSelectedColor(data.color)
      }
    }

    fetchAccount()
  }, [id])

  const handleUpdate = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) return

    const newBalance = Number(balance)
    const difference = newBalance - oldBalance

    // 🔥 1. Update account
    await supabase
      .from('accounts')
      .update({
        name,
        balance: newBalance,
        color: selectedColor,
      })
      .eq('id', id)

    // 🔥 2. Record difference as transaction
    if (difference !== 0) {
      await supabase.from('expenses').insert([
        {
          user_id: user.id,
          amount: Math.abs(difference),
          category: 'Balance Adjustment',
          note: 'Account balance edited',
          type: 'adjustment',
          account_id: id,
          date : new Date().toISOString
        },
      ])
    }

    alert('Account updated!')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Edit Account ✏️
        </h2>

        {/* NAME */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">Account Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
          />
        </div>

        {/* COLOR */}
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
          <label className="text-sm text-gray-600">Balance (LKR)</label>
          <input
            value={balance ? formatCurrency(Number(balance)) : ''}
            onChange={(e) => handleBalanceChange(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleUpdate}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg"
        >
          Update Account
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full mt-3 text-sm text-gray-500"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}