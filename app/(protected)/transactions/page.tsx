'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function TransactionsPage() {
  const router = useRouter()

  const [transactions, setTransactions] = useState<any[]>([])
  const [labels, setLabels] = useState<any[]>([])
  const [filterType, setFilterType] = useState('all')
  const [selectedLabelId, setSelectedLabelId] = useState('')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK').format(value)
  }

  const fetchData = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      router.push('/login')
      return
    }

    // 🟢 Fetch labels
    const { data: labelData } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', user.id)

    setLabels(labelData || [])

    // 🟢 Fetch transactions with filters
    let query = supabase
      .from('expenses')
      .select(`
      *,
      account:account_id (name),
      to_account:to_account_id (name),
      label:label_id (name, color),
      category:category_id (name),
      subcategory:subcategory_id (name)
    `)

      .order('date', { ascending: false })

    if (filterType !== 'all') {
      query = query.eq('type', filterType)
    }

    if (selectedLabelId) {
      query = query.eq('label_id', selectedLabelId)
    }

    const { data: txData } = await query

    setTransactions(txData || [])

  }

  useEffect(() => {
    fetchData()
  }, [filterType, selectedLabelId])

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">All Transactions</h2>
        <button onClick={() => router.back()} className="text-sm text-indigo-600">
          ← Back
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-4">

        {/* TYPE FILTER */}
        {['all', 'expense', 'income', 'transfer'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded ${
              filterType === type
                ? 'bg-indigo-600 text-white'
                : 'bg-white border'
            }`}
          >
            {type}
          </button>
        ))}

        {/* LABEL FILTER */}
        <select
          value={selectedLabelId}
          onChange={(e) => setSelectedLabelId(e.target.value)}
          className="px-3 py-1 border rounded"
        >
          <option value="">All Labels</option>
          {labels.map((label) => (
            <option key={label.id} value={label.id}>
              {label.name}
            </option>
          ))}
        </select>
      </div>

      {/* TRANSACTIONS */}
      <div className="space-y-3">
        {transactions.map((tx) => (
          console.log("TX ITEM:", tx),
          <div key={tx.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">

          {/* TOP ROW */}
          <div className="flex justify-between items-start">

            <div>
              <p className="text-sm font-bold text-gray-800">
                {tx.subcategory?.name || (tx.note === 'Account balance edited' ? 'Account Balance Edited' : 'Uncategorized')}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {new Date(tx.date).toLocaleDateString()}
              </p>
            </div>

            <p
              className={`text-lg font-bold ${
                tx.type === 'expense'
                  ? 'text-red-500'
                  : tx.type === 'income'
                  ? 'text-green-500'
                  : 'text-blue-500'
              }`}
            >
              {tx.type === 'expense'
                ? '-'
                : tx.type === 'income'
                ? '+'
                : '↔'} LKR {formatCurrency(tx.amount)}
            </p>
          </div>

          {/* ACCOUNT */}
          <p className="text-xs text-gray-500 mt-2">
            {tx.type === 'transfer'
              ? `${tx.account?.name} → ${tx.to_account?.name}`
              : tx.account?.name}
          </p>

          {/* LABEL */}
          {tx.label && (
            <div
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mt-2"
              style={{
                backgroundColor: tx.label.color + '20',
                color: tx.label.color,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tx.label.color }}
              />
              {tx.label.name}
            </div>
          )}

          {/* NOTE */}
          {tx.note && (
            <p className="text-xs text-gray-400 mt-2">{tx.note}</p>
          )}

          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <p className="text-gray-500 text-center mt-6">
          No transactions found
        </p>
      )}
    </div>
  )
}