'use client'

import { Fragment, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Listbox, Transition } from '@headlessui/react'
import toast from 'react-hot-toast'


const options = [
  {label: "Cash", value: "cash"},
  {label: "Debit Card", value: "debit"},
  {label: "Credit Card", value: "credit"},
  {label: "Wallet", value: "wallet"},
  {label: "Savings", value: "savings"},

]

export default function AddAccount() {
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const router = useRouter()
  const [type, setType] = useState('')
  
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
      toast.error('Not logged in')
      return
    }

    if(!type) {
      toast.error('Please select the account type')
      return
    }

    const { error } = await supabase.from('accounts').insert([
      {
        user_id: user.id,
        name,
        balance: Number(balance),
        color: selectedColor,
        type,
      },
    ])

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created!')
      router.push('/dashboard') // go back after creating
    }
  }

  useEffect(()=> {
    const checkUser = async() => {
      const {data : {user}} = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }
    }

    checkUser()
  }, [])

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
        {/*Account Type*/}
        <div className="mb-4">
          <label className="block text-sm mb-1">Account Type</label>

          <Listbox value={type} onChange={setType}>
          <div className="relative">
            
            <Listbox.Button className="bg-white text-gray-800 px-4 py-2 w-full text-left border border-gray-300 rounded-lg">
            {options.find((o) => o.value === type)?.label || "Select type"}
            </Listbox.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Listbox.Options className="absolute z-10 mt-2 w-full text-black bg-white shadow-lg rounded-lg border border-gray-300">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.label}
                    value={option.value}
                    className={({ active }) =>
                      `p-2 cursor-pointer ${
                        active ? "bg-gray-200" : ""
                      }`
                    }
                  >
                    {option.label}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>

          </div>
        </Listbox>
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
          onClick=
          {handleAddAccount}
          disabled={!name || !balance || !type}
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