'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import toast from 'react-hot-toast'


export default function AddExpense() {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [accountId, setAccountId] = useState('')
  const [amountError, setAmountError] = useState('')
  const [accountError, setAccountError] = useState('')
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense')
  const [toAccountId, setToAccountId] = useState('')
  const router = useRouter()
  const [labels, setLabels] = useState<any[]>([])
  const [selectedLabel, setSelectedLabel] = useState<any>(null)
  const [showLabelBox, setShowLabelBox] = useState(false)
  const searchParams = useSearchParams()


  const params = useParams();
  const id = params.id as string
  const isEditMode = !!id;


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK').format(value)
  }

  const handleUpdate = async () => {

    // ✅ STEP 1: get old expense
    const { data: old } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single()
  
    // ✅ STEP 2: get FROM account
    const { data: fromAccount } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', old.account_id)
      .single()
  
    // ✅ STEP 3: get TO account (only for transfer)
    let toAccount = null
  
    if (old.type === 'transfer') {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', old.to_account_id)
        .single()
  
      toAccount = data
    }
  
    // ✅ STEP 4: calculations
    const newAmount = Number(amount)
    const oldAmount = old.amount
  
    // 🔥 👉 STEP 4 GOES HERE 👇 (THIS IS WHAT YOU ASKED)
  
    if (old.type === 'transfer') {
  
      const availableBalance = fromAccount.balance + oldAmount
  
      if (newAmount > availableBalance) {
        toast.error('Insufficient balance')
        return
      }
  
      const newFromBalance = availableBalance - newAmount
  
      const newToBalance =
        toAccount.balance - oldAmount + newAmount
  
      // update FROM
      await supabase
        .from('accounts')
        .update({ balance: newFromBalance })
        .eq('id', old.account_id)
  
      // update TO
      await supabase
        .from('accounts')
        .update({ balance: newToBalance })
        .eq('id', old.to_account_id)
    }
  
    // ✅ STEP 5: expense / income
    else {
      const difference = oldAmount - newAmount
  
      const newBalance = fromAccount.balance + difference
  
      if (newBalance < 0) {
        toast.error('Insufficient balance')
        return
      }
  
      await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', old.account_id)
    }
  
    // ✅ STEP 6: update transaction
    await supabase
      .from('expenses')
      .update({
        amount: newAmount,
        category,
        note,
      })
      .eq('id', id)
  
    toast.success('Updated!')
    router.push('/dashboard')
  }

  useEffect(() => {

    const fetchExpense = async () => {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('id', id)
          .single()
      
        if (error || !data) {
          toast.error('Failed to load expense')
          return
        }
      
        setAmount(data.amount.toString())
        setCategory(data.category || '')
        setNote(data.note || '')
        setType(data.type)
        setAccountId(data.account_id)
        setToAccountId(data.to_account_id || '')
      }
      
      fetchExpense()


    const draft = localStorage.getItem('expenseDraft');

    if(draft) {
      const data = JSON.parse(draft);

      setAmount(data.amount || '')
      setCategory(data.category || '')
      setNote(data.note || '')
      setAccountId(data.accountId || '')
      setType(data.type || 'expense')
      setToAccountId(data.toAccountId || '')
  
      localStorage.removeItem('expenseDraft')
    }
    if(searchParams.get('labelCreated')){
      toast.success('Label created!');
    }
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

    const fetchLabels = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
    
      if (!user) return
    
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('user_id', user.id)
    
      if (!error) {
        setLabels(data || [])
      }
    }

    fetchAccounts()
    fetchLabels()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
  
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {type === 'expense' && 'Add Expense 💸'}
        {type === 'income' && 'Add Income 💰'}
        {type === 'transfer' && 'Transfer Money 🔄'}
        </h2>

        <div className="flex gap-2 mb-4">
        {/* Expense */}
        <button
          disabled
          className={`flex-1 py-2 rounded ${
            type === 'expense'
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Expense
        </button>

        {/* Income */}
        <button
          disabled
          className={`flex-1 py-2 rounded ${
            type === 'income'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Income
        </button>

        {/* Transfer */}
        <button
          disabled
          className={`flex-1 py-2 rounded ${
            type === 'transfer'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Transfer
        </button>
      </div>
  
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
                {acc.name} (LKR {formatCurrency(acc.balance)})
              </option>
            ))}
          </select>

          {type === 'transfer' && (
          <div className="mt-3">
            <label className="text-sm text-gray-600">
              Transfer To Account
            </label>

            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full mt-1 p-3 border rounded-lg"
            >
              <option value="">Select account</option>

              {accounts
                .filter(acc => acc.id !== accountId) // prevent same account
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
            </select>
          </div>
        )}

          {accounts.length === 0 && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <p className="text-sm text-yellow-700 mb-2">
                  No accounts found
                </p>

                <button
                  onClick={() => router.push('/add-account')}
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  + Add Account
                </button>
              </div>
            )}
  
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

          {amount && !isNaN(Number(amount)) && (
            <p className="text-sm text-gray-500 mt-1">
              LKR {formatCurrency(Number(amount))}
            </p>
          )}
  
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

        <div className="mb-4 relative">
  <label className="text-sm text-gray-600">Label</label>

  {/* SELECT BOX */}
  <div
    onClick={() => setShowLabelBox(!showLabelBox)}
    className="w-full mt-1 p-3 border rounded-lg bg-white cursor-pointer flex items-center gap-2"
  >
    {selectedLabel ? (
      <>
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: selectedLabel.color }}
        />
        <span>{selectedLabel.name}</span>
      </>
    ) : (
      <span className="text-gray-400">Select Label</span>
    )}
  </div>

  {/* DROPDOWN */}
  {showLabelBox && (
    <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow">
      
      {/* NO LABELS */}
      {labels.length === 0 && (
        <div className="p-3 text-sm text-gray-500">
          No labels found
        </div>
      )}

      {/* LABEL LIST */}
      {labels.map((label) => (
        <div
          key={label.id}
          onClick={() => {
            setSelectedLabel(label)
            setShowLabelBox(false)
          }}
          className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
          >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: label.color }}
          />
          <span>{label.name}</span>
        </div>
      ))}

      {/* ADD LABEL */}
      <div
          onClick={() => {
            localStorage.setItem(
              'expenseDraft',
              JSON.stringify({
                amount,
                category,
                note,
                accountId,
                type,
                toAccountId,
              })
            )
        
            router.push('/add-label')
          }}
        className="p-2 text-indigo-600 cursor-pointer hover:bg-gray-100 border-t"
      >
              + Add Label
            </div>
          </div>
        )}
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
          onClick={handleUpdate}
          disabled={
            !amount ||
            Number(amount) <= 0 ||
            !accountId ||
            (type === 'transfer' && !toAccountId)
          }
          className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {type === 'expense' && 'Update Expense'}
          {type === 'income' && 'Update Income'}
          {type === 'transfer' && 'Update Transfer'}
        </button>

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