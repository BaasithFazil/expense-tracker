'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/helper/getProfile'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editNote, setEditNote] = useState('')
  const [accounts, setAccounts] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [editValue, setEditValue] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  

  const openEditModal = (account: any) => {
    setSelectedAccount(account)
    setEditValue(account.balance.toString())
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    const newAmount = Number(editValue)
  
    if (isNaN(newAmount) || newAmount < 0) {
      alert('Invalid amount')
      return
    }
  
    await supabase
      .from('accounts')
      .update({ balance: newAmount })
      .eq('id', selectedAccount.id)
  
    await fetchAccounts()
    setIsModalOpen(false)
  }

  // const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)


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
    const confirmDelete = confirm('Are you sure?')
    if (!confirmDelete) return
  
    // 1️⃣ Get the expense details first
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single()
  
    if (fetchError || !expense) {
      alert('Failed to fetch expense')
      return
    }
  
    // 2️⃣ Get the related account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', expense.account_id)
      .single()
  
    if (accountError || !account) {
      alert('Failed to fetch account')
      return
    }
  
    // 3️⃣ Restore balance
    // 3️⃣ Restore balance (FIXED LOGIC)

      if (expense.type === 'expense') {
        // add back
        await supabase
          .from('accounts')
          .update({
            balance: account.balance + expense.amount,
          })
          .eq('id', expense.account_id)
      }

      else if (expense.type === 'income') {
        // remove added income
        await supabase
          .from('accounts')
          .update({
            balance: account.balance - expense.amount,
          })
          .eq('id', expense.account_id)
      }

      else if (expense.type === 'transfer') {
        // 🔥 1️⃣ revert FROM account
        await supabase
          .from('accounts')
          .update({
            balance: account.balance + expense.amount,
          })
          .eq('id', expense.account_id)

        // 🔥 2️⃣ get TO account
        const { data: toAccount } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', expense.to_account_id)
          .single()

        if (toAccount) {
          // 🔥 3️⃣ revert TO account
          await supabase
            .from('accounts')
            .update({
              balance: toAccount.balance - expense.amount,
            })
            .eq('id', expense.to_account_id)
        }
      }
  
    // 4️⃣ Delete the expense
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
  
    if (deleteError) {
      alert(deleteError.message)
      return
    }
  
    // 5️⃣ Refresh EVERYTHING (IMPORTANT)
    await fetchAccounts()
    await fetchExpenses()
  }


  const startEdit = (exp: any) => {
    setEditingId(exp.id)
    setEditAmount(exp.amount)
    setEditCategory(exp.category)
    setEditNote(exp.note)
  }

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
  
    // 💰 4. Update expense
    const { error: expError } = await supabase
      .from('expenses')
      .update({
        amount: newAmount,
        category: editCategory,
        note: editNote,
      })
      .eq('id', id)
  
    if (expError) {
      alert(expError.message)
      return
    }
  
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

  const fetchAccounts = async ()=> {
   const { data: userData} = await supabase.auth.getUser()
   const user = userData.user

   if(!user) return
   const  {data, error} = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', {ascending: true})

  if (error) {
    console.error(error)
    return
  }
  setAccounts(data)
  }

  const fetchExpenses = async () => {
    const { data: userData} = await supabase.auth.getUser()

    const user = userData.user

    if(!user) return

    const {data, error} = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
  
    if (error) {
      console.error(error)
      return
    }
  
    setExpenses(data)
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
      await fetchAccounts()
      await fetchExpenses()
  
      setLoading(false)
    }
  
    init()
  }, [])

  if (loading) return <p>Loading...</p>

 return (
    <div className="min-h-screen bg-gray-100 p-6">
  
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          {user && (
          <p className="text-sm text-gray-500">
            Welcome, {profile?.username || user.email}
          </p>
        )}
        </div>
  
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
  
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
          className={`rounded-2xl p-5 text-white shadow-lg bg-linear-to-br ${gradient} relative overflow-hidden`}
        >
          {/* Card chip */}
          <div className="w-10 h-6 bg-black-300 rounded mb-4"></div>
  
          {/* Account Name */}
          <p className="text-sm opacity-80">{acc.name}</p>
  
          {/* Balance */}
          <h2 className="text-xl font-bold mt-1">
            LKR {formatCurrency(acc.balance)}
          </h2>
  
          {/* Fake card number */}
          <p className="text-xs mt-4 opacity-70 tracking-widest">
            •••• •••• •••• {acc.id.slice(-4)}
          </p>
  
          {/* Optional Edit */}
          <button className="absolute bottom-3 right-3 text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
          onClick={() => openEditModal(acc)}
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
          
          
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white p-4 rounded-xl shadow border"
            >
              {editingId === exp.id ? (
                <>
                  <input
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full p-2 mb-2 border rounded"
                  />
  
                  <input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2 mb-2 border rounded"
                  />
  
                  <input
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="w-full p-2 mb-2 border rounded"
                  />
  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(exp.id, exp.amount)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
  
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      {exp.category}
                    </p>
                    <p className="text-xs text-gray-400">
                      {exp.note}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(exp.date).toLocaleDateString()}
                    </p>

                    <p className={`font-bold ${
                      exp.type === 'expense'
                        ? 'text-red-500'
                        : exp.type === 'income'
                        ? 'text-green-500'
                        : 'text-blue-500'
                    }`}>
                      {exp.type === 'expense'
                        ? '-'
                        : exp.type === 'income'
                        ? '+'
                        : '↔'} LKR {exp.amount}
                    </p>
                  </div>
  
                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={() => startEdit(exp)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
  
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

                  <p
                    className={`text-xs font-bold uppercase ${
                      exp.type === 'expense'
                        ? 'text-red-500'
                        : exp.type === 'income'
                        ? 'text-green-500'
                        : 'text-blue-500'
                    }`}
                  >
                    {exp.type}
                  </p>
            </div>
          ))}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white p-6 rounded w-80">
                
                <h2 className="text-lg font-bold mb-4">
                  Edit{selectedAccount?.name}
                </h2>

                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, '')
                    if (!/^\d*$/.test(raw)) return
                    setEditValue(raw)
                  }}
                  className="border p-2 w-full rounded"
                />

                <div className="flex justify-end gap-2 mt-4">
                  
                  {/* Cancel */}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1 border rounded"
                  >
                    Cancel
                  </button>

                  {/* ✅ THIS is where handleSave goes */}
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    Save
                  </button>

                </div>
              </div>
            </div>
            )}
        </div>
      </div>
      <button
        onClick={() => router.push('/add-expense')}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-700 transition flex items-center justify-center hover:scale-110 active:scale-95"
      >
        💸
      </button>
    </div> 
  )

  
}


