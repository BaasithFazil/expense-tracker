'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/helper/getProfile'
import Navbar from '@/components/Navbar'
import TransactionCard from '@/components/TransactionCard'
import toast from 'react-hot-toast'
import { deleteTransaction } from '@/services/transactionService'
import { getAccounts, getTransactions } from '@/services/accountServices'


export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editNote, setEditNote] = useState('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [editValue, setEditValue] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  
  // const handleSave = async () => {
  //   const newAmount = Number(editValue)
  
  //   if (isNaN(newAmount) || newAmount < 0) {
  //     alert('Invalid amount')
  //     return
  //   }
  
  //   await supabase
  //     .from('accounts')
  //     .update({ balance: newAmount })
  //     .eq('id', selectedAccount.id)
  
  //   await fetchAccounts()
  //   setIsModalOpen(false)
  // }

  const totalExpenses = expenses
  .filter((e)=> e.type === 'expense')
  .reduce((sum, e)=> sum + e.amount, 0)

  const totalIncome = expenses
  .filter((e) => e.type === 'income')
  .reduce((sum, e) => sum + e.amount, 0)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK').format(value)
  }

  const reloadData = async () => {
    const { data: userData } = await supabase.auth.getUser()
  
    if (!userData.user) return
  
    // expenses
    const { data: expData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userData.user.id)
  
    setExpenses(expData || [])
  
    // accounts
    const { data: accData } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userData.user.id)
  
    setAccounts(accData || [])
  }


  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
      await reloadData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // const handleDelete = async (id: string) => {  
  //   // 1️⃣ Get the expense details first
  //   const { data: expense, error: fetchError } = await supabase
  //     .from('expenses')
  //     .select('*')
  //     .eq('id', id)
  //     .single()
  
  //   if (fetchError || !expense) {
  //     alert('Failed to fetch expense')
  //     return
  //   }
  
  //   // 2️⃣ Get the related account
  //   const { data: account, error: accountError } = await supabase
  //     .from('accounts')
  //     .select('balance')
  //     .eq('id', expense.account_id)
  //     .single()
  
  //   if (accountError || !account) {
  //     alert('Failed to fetch account')
  //     return
  //   }
  
  //   // 3️⃣ Restore balance

  //     if (expense.type === 'expense') {
  //       // add back
  //       await supabase
  //         .from('accounts')
  //         .update({
  //           balance: account.balance + expense.amount,
  //         })
  //         .eq('id', expense.account_id)
  //     }

  //     else if (expense.type === 'income') {
  //       // remove added income
  //       await supabase
  //         .from('accounts')
  //         .update({
  //           balance: account.balance - expense.amount,
  //         })
  //         .eq('id', expense.account_id)
  //     }

  //     else if (expense.type === 'transfer') {
  //       // 🔥 1️⃣ revert FROM account
  //       await supabase
  //         .from('accounts')
  //         .update({
  //           balance: account.balance + expense.amount,
  //         })
  //         .eq('id', expense.account_id)

  //       // 🔥 2️⃣ get TO account
  //       const { data: toAccount } = await supabase
  //         .from('accounts')
  //         .select('balance')
  //         .eq('id', expense.to_account_id)
  //         .single()

  //       if (toAccount) {
  //         // 🔥 3️⃣ revert TO account
  //         await supabase
  //           .from('accounts')
  //           .update({
  //             balance: toAccount.balance - expense.amount,
  //           })
  //           .eq('id', expense.to_account_id)
  //       }
  //     }
  
  //   // 4️⃣ Delete the expense
  //   const { error: deleteError } = await supabase
  //     .from('expenses')
  //     .delete()
  //     .eq('id', id)
  
  //   if (deleteError) {
  //     alert(deleteError.message)
  //     return
  //   }
  
  //   // 5️⃣ Refresh EVERYTHING (IMPORTANT)
  //   await fetchAccounts()
  //   await fetchExpenses()
  // }

  const handleUpdate = async (id: string, oldAmount: number) => {
    const newAmount = Number(editAmount)
  
    // 🧠 1. Get expense
    const { data: expData } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single()
  
    if (!expData) {
      alert('Expense not found')
      return
    }
  
    const accountId = expData.account_id
  
    // 🧠 2. Get account
    const { data: accountData } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single()
  
    if (!accountData) {
      alert('Account not found')
      return
    }
  
    // 🧠 3. Calculate difference
    const difference = oldAmount - newAmount
    const newBalance = accountData.balance + difference
  
  
    // 💰 5. Update account
    const { error: accError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', accountId)
  
    if (accError) {
      alert(accError.message)
      return
    }
  
    // ✅ 6. NOW refresh everything
    await reloadData()
  
    alert('Expense updated & balance adjusted!')
    setEditingId(null)
  }

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + acc.balance,
    0
  )

    const loadDashboardData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
    
      if (!user) return
    
      const accountsData = await getAccounts(user.id)
      const txData = await getTransactions(user.id)
    
      setAccounts(accountsData)
      setExpenses(txData)
    }

  useEffect(() => {
    const init = async () => {
      // 1️⃣ Get user
      const { data: { session } } = await supabase.auth.getSession()
  
      if (!session) {
        router.push('/login')
        return
      }
  
      const user = session.user
      setUser(user)
  
      // 2️⃣ Get profile
      const { data: profileData } = await getProfile(user.id)
  
      if (!profileData?.username) {
        router.push('/setup-profile')
        return
      }
  
      setProfile(profileData)
  
      // 3️⃣ Fetch app data
      await loadDashboardData()
  
      setLoading(false)
    }
  
    init()
  }, [])
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          
          {/* Spinner */}
          <div className="w-10 h-10 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
          
          {/* Text */}
          <p className="text-gray-600 text-sm">Loading your dashboard...</p>
  
        </div>
      </div>
    )

  }

 return (
  <>

<Navbar user={user} profile={profile} onLogout={handleLogout} />
  
<div className="bg-gray-100 min-h-screen px-4 py-6">

      {/* SUMMARY CARDS */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow border">
          <p className="text-gray-500 text-sm">Total Balance</p>
          <h2 className="text-xl font-bold text-green-600">
            LKR {formatCurrency(totalBalance)}
          </h2>
        </div>
  
        <div className="bg-white p-5 rounded-xl shadow border">
          <p className="text-gray-500 text-sm">Total Expenses</p>
          <h2 className="text-xl font-bold text-red-500">
            LKR {formatCurrency(totalExpenses)}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border">
          <p className="text-gray-500 text-sm">Total Income</p>
          <h2 className="text-xl font-bold text-green-500">
            LKR {formatCurrency(totalIncome)}
          </h2>
        </div>
      </div>

      {/* ACCOUNTS */}
            <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Accounts</h2>
  
        {accounts.length === 0 && (
          <p className="text-gray-500">No accounts yet</p>
        )}
  
      <div className="grid grid-cols-2 gap-4">
      {accounts.map((acc, index) => {
        const gradients = [
          'from-indigo-500 to-purple-600',
          'from-green-400 to-emerald-600',
          'from-pink-500 to-rose-500',
          'from-blue-500 to-cyan-500',

        ]

        const gradient = acc.color || 'from-gray-400 to-gray-600'

        return(
          <div
          key={acc.id}
          onClick={() => {
            router.push(`/account/${acc.id}`)
          }}
          className={`rounded-2xl p-5 text-white shadow-lg bg-linear-to-br ${gradient} relative`}
        >
          {/* Card chip */}
          <div className="w-10 h-6 bg-black-300 rounded mb-4"></div>
  
          {/* Account Name */}
          <p className="">{acc.name}</p>
  
          {/* Balance */}
          <h2 className="text-xl font-bold mt-1">
            LKR {formatCurrency(acc.balance)}
          </h2>
  
          {/* Fake card number */}
          <p className="">
            •••• •••• •••• {acc.id.slice(-4)}
          </p>

          <p className="text-xs opacity-80 uppercase">
            {acc.type}
          </p>

          {/* text-xs mt-4 opacity-70 tracking-widest */}
  
          {/* Optional Edit */}
          <button className="absolute bottom-3 right-3 text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
          onClick={(e) => { e.stopPropagation() 
          router.push(`/edit-account/${acc.id}`)}}
          >
            Edit
          </button>
        </div>
        )

      })}
      <div
        onClick={() => router.push('/add-account')}
        className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
      >
        <div className="text-3xl text-gray-400">+</div>
        <p className="text-sm text-gray-500 mt-1">Add Account</p>
      </div>
    </div>
      </div>


        {/* EXPENSES */}
            <div>
        <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
  
        {expenses.length === 0 && (
          <p className="text-gray-500">No expenses yet</p>
        )}
  
        <div className="space-y-3">
        {expenses.map((exp) => {
 
        return (
          <TransactionCard
          key={exp.id}
          tx={exp}
          formatCurrency={formatCurrency}
          router={router}
          handleDelete={handleDelete}
          />
    // <div
    //   key={exp.id}
    //   className="bg-white p-4 rounded-xl shadow border"
    // >
    //     {editingId === exp.id ? (
    //     <></> // keep empty for now
    //       ) : (
    //         <div className="flex justify-between items-center">
    //           <div>
    //             <p className="text-sm text-gray-500">
    //               {exp.subcategory?.name ||
    //                 (exp.note === 'Account balance edited'
    //                   ? 'Account Balance Edited'
    //                   : 'Uncategorized')}
    //             </p>

    //             <p className="text-xs text-gray-400">
    //               {exp.note}
    //             </p>

    //             <p className="text-xs text-gray-400">
    //               {new Date(exp.date).toLocaleDateString()}
    //             </p>

    //             <p className="text-sm font-semibold text-gray-500">
    //               {exp.type === 'transfer'
    //                 ? `${exp.account?.name} → ${exp.to_account?.name}`
    //                 : exp.account?.name}
    //             </p>

    //             <p className={`font-bold text-lg ${
    //               exp.type === 'expense'
    //                 ? 'text-red-500'
    //                 : exp.type === 'income'
    //                 ? 'text-green-500'
    //                 : 'text-blue-500'
    //             }`}>
    //               {exp.type === 'expense'
    //                 ? '-'
    //                 : exp.type === 'income'
    //                 ? '+'
    //                 : '↔'} LKR {formatCurrency(exp.amount)}
    //             </p>
    //           </div>

    //           <div className="flex gap-3 text-sm">
    //             <button
    //               onClick={() => router.push(`/edit-expense/${exp.id}`)}
    //               className="px-3 py-1 bg-blue-100 text-blue-600 rounded"
    //             >
    //               Edit
    //             </button>

    //             <button
    //               onClick={() => handleDelete(exp.id)}
    //               className="px-3 py-1 bg-red-100 text-red-600 rounded"
    //             >
    //               Delete
    //             </button>
    //           </div>
    //         </div>
    //       )}

    //       <p className={`text-xs font-bold uppercase ${
    //         exp.type === 'expense'
    //           ? 'text-red-500'
    //           : exp.type === 'income'
    //           ? 'text-green-500'
    //           : 'text-blue-500'
    //       }`}>
    //         {exp.type}
    //       </p>
    //     </div>
      )
    })}
        </div>
      </div>

      <button
        onClick={() => router.push('/add-expense')}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-700 transition flex items-center justify-center hover:scale-110 active:scale-95"
      >
        💸
      </button>
          </div>
      
    </> 
  )

  
}


