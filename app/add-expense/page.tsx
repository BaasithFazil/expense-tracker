'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AddExpense() {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [accountId, setAccountId] = useState('')
  const [amountError, setAmountError] = useState('')
  const [accountError, setAccountError] = useState('')

  const handleAdd = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!accountId) {
      alert('Please select an account')
      return
    }
  
    if (!user) {
      alert('Not logged in')
      return
    }
  
    if (!accountId) {
      alert('Please select an account')
      return
    }

    // 💰 1. Get account
    const { data: accountData, error: accError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single()
  
    if (accError || !accountData) {
      alert('Account fetch failed')
      return
    }
  
    const expenseAmount = Number(amount)
    const currentBalance = accountData.balance

            // ❌ invalid input
    if (!amount || isNaN(expenseAmount)) {
      alert('Please enter a valid amount')
      return
    }

    // ❌ negative or zero
    if (expenseAmount <= 0) {
      alert('Amount must be greater than 0')
      return
    }
  
    // ❌ prevent overspending
    if (expenseAmount > currentBalance) {
      alert('Insufficient balance')
      return
    }

    let valid = true

    setAmountError('')
    setAccountError('')

    // account check
    if (!accountId) {
      setAccountError('Please select an account')
      valid = false
    }

    if (!amount || isNaN(expenseAmount)) {
      setAmountError('Enter a valid amount')
      valid = false
    } else if (expenseAmount <= 0) {
      setAmountError('Amount must be greater than 0')
      valid = false
    }

    if (!valid) return
  
    const newBalance = currentBalance - expenseAmount
  
    // 💰 2. Insert expense (ONLY ONCE)
    const { error: insertError } = await supabase.from('expenses').insert([
      {
        user_id: user.id,
        amount: expenseAmount,
        category,
        note,
        date: new Date().toISOString(),
        account_id: accountId,
      },
    ])
  
    if (insertError) {
      alert(insertError.message)
      return
    }
  
    // 💰 3. Update balance
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', accountId)
  
    console.log("Update error:", updateError)
  
    if (updateError) {
      alert(updateError.message)
    } else {
      alert('Expense added & balance updated!')
  
      setAmount('')
      setCategory('')
      setNote('')
    }
  }

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data: userData } = await supabase.auth.getUser()
  
      if (!userData.user) return
  
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userData.user.id)
  
      if (!error) {
        setAccounts(data || [])
      }
    }
  
    fetchAccounts()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
  
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Add Expense 💸
        </h2>
  
        {/* ACCOUNT SELECT */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">Account</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (LKR {acc.balance})
              </option>
            ))}
          </select>
  
          {accountError && (
            <p className="text-red-500 text-xs mt-1">{accountError}</p>
          )}
        </div>
  
        {/* AMOUNT */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">Amount</label>
          <input
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
  
          {amountError && (
            <p className="text-red-500 text-xs mt-1">{amountError}</p>
          )}
        </div>
  
        {/* CATEGORY */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">Category</label>
          <input
            placeholder="Food, Travel, Bills..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
  
        {/* NOTE */}
        <div className="mb-6">
          <label className="text-sm text-gray-600">Note</label>
          <input
            placeholder="Optional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
  
        {/* BUTTON */}
        <button
          onClick={handleAdd}
          disabled={!amount || Number(amount) <= 0 || !accountId}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Expense
        </button>
      </div>
    </div>
  )
}