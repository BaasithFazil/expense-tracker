'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import TransactionCard from '@/components/TransactionCard'
import { deleteTransaction, getTransactionsWithFilters} from '@/services/transactionService'
import { error } from 'console'
import { getLabels } from '@/services/labelService'

export default function TransactionsPage() {
  const router = useRouter()

  const [transactions, setTransactions] = useState<any[]>([])
  const [labels, setLabels] = useState<any[]>([])
  const [filterType, setFilterType] = useState('all')
  const [selectedLabelId, setSelectedLabelId] = useState('')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK').format(value)
  }

  
  useEffect(() => {
    fetchData()
  }, [filterType, selectedLabelId])


  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
      await fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }
  
  const fetchData = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
  
    if (!user) {
      router.push('/login')
      return
    }
  
    // ✅ labels still here (simple enough)
    const labelsData = await getLabels(user.id)
    setLabels(labelsData || [])
    
    // ✅ transactions via service
    const data = await getTransactionsWithFilters({
      userId: user.id,
      filterType,
      labelId: selectedLabelId,
    })
  
    setTransactions(data || [])
  }

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

          <TransactionCard
          key={tx.id}
          tx={tx}
          formatCurrency={formatCurrency}
          router={router}
          handleDelete={handleDelete}
          />
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