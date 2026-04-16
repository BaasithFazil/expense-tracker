'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import TransactionCard from '@/components/TransactionCard'
import { deleteTransaction } from '@/services/transactionService'

export default function AccountDetails() {
  const { id } = useParams()
  const router = useRouter()

  const [transactions, setTransactions] = useState<any[]>([])
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [labels, setLabels] = useState<any[]>([])
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

    // ✅ get labels
    const { data: labelData } = await supabase
    .from('labels')
    .select('*')
    .eq('user_id', user.id)

    setLabels(labelData || [])

    // ✅ get account info
    const { data: accData } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single()

    setAccount(accData)

    const accountId = Array.isArray(id) ? id[0] : id

    let query = supabase
        .from('expenses')
        .select(`
        *,
        account:account_id (id, name),
        to_account:to_account_id (id, name),
        label:label_id (id, name, color),
        category:category_id (name),
        subcategory:subcategory_id (name)
      `)
        .or(`account_id.eq.${accountId},to_account_id.eq.${accountId}`)
        .order('date', { ascending: false })

        

        if (filterType !== 'all') {
          if (filterType === 'transfer') {
            query = query.eq('type', 'transfer')
          } else {
            query = query.eq('type', filterType)
          }
        }

      // ✅ label filter
      if (selectedLabelId) {
        query = query.eq('label_id', selectedLabelId)
      }

      const { data: txData } = await query
      setTransactions(txData || [])

      setLoading(false)
  }

  useEffect(() => {
   if(id) fetchData()
  }, [id, filterType, selectedLabelId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }


  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
      await fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }


  // const handleDelete = async (id: string) => {
  //   // 1. get transaction
  //   const { data: tx } = await supabase
  //     .from('expenses')
  //     .select('*')
  //     .eq('id', id)
  //     .single()
  
  //   if (!tx) return
  
  //   // 2. reverse balances
  //   if (tx.type === 'expense') {
  //     const { data: acc } = await supabase
  //       .from('accounts')
  //       .select('balance')
  //       .eq('id', tx.account_id)
  //       .single()

  //       if(!acc) return
  
  //     await supabase
  //       .from('accounts')
  //       .update({ balance: acc.balance + tx.amount })
  //       .eq('id', tx.account_id)
  //   }
  
  //   if (tx.type === 'income') {
  //     const { data: acc } = await supabase
  //       .from('accounts')
  //       .select('balance')
  //       .eq('id', tx.account_id)
  //       .single()

  //       if(!acc) return
  
  //     await supabase
  //       .from('accounts')
  //       .update({ balance: acc.balance - tx.amount })
  //       .eq('id', tx.account_id)
  //   }
  
  //   if (tx.type === 'transfer') {
  //     const { data: fromAcc } = await supabase
  //       .from('accounts')
  //       .select('balance')
  //       .eq('id', tx.account_id)
  //       .single()

  //       if(!fromAcc) return
  
  //     const { data: toAcc } = await supabase
  //       .from('accounts')
  //       .select('balance')
  //       .eq('id', tx.to_account_id)
  //       .single()

  //       if(!toAcc) return
  
  //     await supabase
  //       .from('accounts')
  //       .update({ balance: fromAcc.balance + tx.amount })
  //       .eq('id', tx.account_id)
  
  //     await supabase
  //       .from('accounts')
  //       .update({ balance: toAcc.balance - tx.amount })
  //       .eq('id', tx.to_account_id)
  //   }
  
  //   // 3. delete
  //   await supabase
  //     .from('expenses')
  //     .delete()
  //     .eq('id', id)
  
  //   // 4. refresh
  //   fetchData()
  // }



  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* Account Info */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-lg font-bold">{account?.name}</h2>
        <p className="text-gray-500">
          Balance: LKR {formatCurrency(account?.balance || 0)}
        </p>
      </div>

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

      {/* Transactions */}
      <h2 className="text-lg font-semibold mb-3">
        Transactions
      </h2>

      {transactions.length === 0 && (
          
        
        <p className="text-gray-500">No transactions found</p>
      )}

      <div className="space-y-3">
        {transactions.map((tx) => (
        <TransactionCard
        key={tx.id}
        tx={tx}
        formatCurrency={formatCurrency}
        router={router}
        handleDelete={handleDelete}
        />


       

          // <div
          //   key={tx.id}
          //   className="bg-white p-4 rounded-xl shadow border"
          // >
          //   <p className="text-sm text-gray-500">
          //   <p className="text-sm text-gray-500">
          //         {tx.subcategory?.name ||
          //           (tx.note === 'Account balance edited'
          //             ? 'Account Balance Edited'
          //             : 'Uncategorized')}
          //       </p>
          //   </p>

          //   <p className="text-xs text-gray-400">
          //     {tx.note}
          //   </p>

          //   {tx.label && (
          //   <div
          //     className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mt-2"
          //     style={{
          //       backgroundColor: tx.label.color + '20',
          //       color: tx.label.color,
          //     }}
          //   >
          //     <div
          //       className="w-2 h-2 rounded-full"
          //       style={{ backgroundColor: tx.label.color }}
          //     />
          //     {tx.label.name}
          //   </div>
          // )}

          //   <p className="text-xs text-gray-400">
          //     {new Date(tx.date).toLocaleDateString()}
          //   </p>

          //   <p className="text-sm font-semibold text-gray-500">
          //   {tx.type === 'transfer'
          //     ? `${tx.account?.name || "unknown"} → ${tx.to_account?.name || "unknown"}`
          //     : tx.account?.name || "unkown"}
          // </p>

          //   <p
          //     className={`font-bold ${
          //       tx.type === 'expense'
          //         ? 'text-red-500'
          //         : tx.type === 'income'
          //         ? 'text-green-500'
          //         : 'text-blue-500'
          //     }`}
          //   >
          //     {tx.type === 'expense'
          //       ? '-'
          //       : tx.type === 'income'
          //       ? '+'
          //       : '↔'} LKR {tx.amount}
          //   </p>

          //   <p className="text-xs uppercase font-bold">
          //     {tx.type}
          //   </p>
          // </div>
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