'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'

export default function AccountDetails() {
  const { id } = useParams()
  const router = useRouter()

  const [transactions, setTransactions] = useState<any[]>([])
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK').format(value)
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) {
        router.push('/login')
        return
      }

      // ✅ get account info
      const { data: accData } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single()

      setAccount(accData)

      // ✅ get transactions for THIS account
      const { data: txData } = await supabase
        .from('expenses')
        .select('*')
        .or(`account_id.eq.${id},to_account_id.eq.${id}`)
        .order('date', { ascending: false })

      setTransactions(txData || [])
      setLoading(false)
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* Account Info */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-lg font-bold">{account?.name}</h2>
        <p className="text-gray-500">
          Balance: LKR {formatCurrency(account?.balance || 0)}
        </p>
      </div>

      {/* Transactions */}
      <h2 className="text-lg font-semibold mb-3">
        Transactions
      </h2>

      {transactions.length === 0 && (
        <p className="text-gray-500">No transactions found</p>
      )}

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-white p-4 rounded-xl shadow border"
          >
            <p className="text-sm text-gray-500">
              {tx.category}
            </p>

            <p className="text-xs text-gray-400">
              {tx.note}
            </p>

            <p className="text-xs text-gray-400">
              {new Date(tx.date).toLocaleDateString()}
            </p>

            <p
              className={`font-bold ${
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
                : '↔'} LKR {tx.amount}
            </p>

            <p className="text-xs uppercase font-bold">
              {tx.type}
            </p>
          </div>
        ))}
      </div>
        <button
            onClick={() => router.back()}
            className="mb-4 text-sm text-indigo-600"
            >
            ← Back
        </button>
    </div>
    
  )
}