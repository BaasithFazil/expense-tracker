'use client'

import { Fragment, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'
import { Listbox, Transition } from '@headlessui/react'
import toast from 'react-hot-toast'

// const options = ['Cash', 'Debit Card', 'Credit Card', 'Savings', 'Wallet']

const options = [
  {label: "Cash", value: "cash"},
  {label: "Debit Card", value: "debit"},
  {label: "Credit Card", value: "credit"},
  {label: "Wallet", value: "wallet"},
  {label: "Savings", value: "savings"},

]

export default function EditAccount() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [oldBalance, setOldBalance] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [type, setType] = useState('')
  const [selected, setSelected] = useState(options[0])

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
        setType(data.type)
      }
    }

    fetchAccount()
  }, [id])

  const handleUpdate = async () => {
    const toastId = toast.loading('Updating...')


    try {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    

    if (!user) {
      toast.error('User not found', {id: toastId})
      return
    }

    const newBalance = Number(balance)
    const difference = newBalance - oldBalance

    // 🔥 1. Update account
    await supabase
      .from('accounts')
      .update({
        name,
        balance: newBalance,
        color: selectedColor,
        type: type,
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
          date : new Date().toISOString()
        },
      ])
    }
    toast.success('Updated!', { id: toastId})
    setTimeout(()=> {
      router.push('/dashboard')
    }, 800)
  }  catch (err) {
    toast.error('Something', {id: toastId})
  }
}


const handleDelete = async () => {
  const confirmDelete = confirm(
    `Delete this account with LKR ${balance}? This cannot be undone.`
  )

  if (!confirmDelete) return

  const toastId = toast.loading('Deleting account...')

  try {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      toast.error('Not logged in', { id: toastId })
      return
    }

    // 🔥 STEP 3 — Delete ALL related transactions
    const { error: expError } = await supabase
      .from('expenses')
      .delete()
      .eq('user_id', user.id)
      .or(`account_id.eq.${id},to_account_id.eq.${id}`)

    if (expError) throw expError

    // 🔥 STEP 4 — Delete account
    const { error: accError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)

    if (accError) throw accError

    // ✅ Success
    toast.success('Account deleted!', { id: toastId })

    setTimeout(() => {
      router.push('/dashboard')
    }, 800)

  } catch (err) {
    console.error(err)
    toast.error('Failed to delete account', { id: toastId })
  }
}

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 flex justify-center md:items-center">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg bg-white p-5 md:p-8 rounded-2xl shadow-2xl border">

        <h2 className="text-xl md:text-2xl font-bold text-center max-w-xl xl:max-w-2xl">
          Edit Account ✏️
        </h2>

        {/* NAME */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">Account Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/*Account Type*/}
        <div className="mb-4 relative">
          <label className="block text-sm mb-1">Account Type</label>

          <Listbox value={type} onChange={setType}>
          <div className="relative">
            
            <Listbox.Button className="bg-white text-black px-4 py-2 w-full text-left border border-gray-500 rounded-lg">
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
              <Listbox.Options className="absolute z-10 mt-2 w-full text-black bg-white shadow-lg rounded-lg border border-gray-600">
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

          {/* <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option className="text-red-600"value="">Select type</option>
            <option value="cash">Cash</option>
            <option value="debit">Debit Card</option>
            <option value="credit">Credit Card</option>
            <option value="savings">Savings</option>
            <option value="wallet">Wallet</option>
          </select> */}
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
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleUpdate}
          disabled={!name || !balance || !type}
          className="w-full bg-indigo-600 text-white py-2 md:py-3 rounded-lg"
        >
          Update Account
        </button>

        <button
          onClick={handleDelete}
          className="w-full mt-3 bg-red-500 text-white py-2 md:py-3 rounded-lg hover:bg-red-600 transition"
        >
          Delete Account
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
