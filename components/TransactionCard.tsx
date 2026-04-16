'use client'

import toast from "react-hot-toast"

type TransactionCardProps = {
    tx: any
    formatCurrency: (value: number) => string
    router: any
    handleDelete: (id: string) => void
  }

export default function TransactionCard({ tx, formatCurrency, router, handleDelete } : TransactionCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow border">

      <div className="flex justify-between items-center">
        <div>
          {/* TITLE */}
          <p className="text-sm text-gray-500">
            {tx.subcategory?.name ||
              (tx.note === 'Account balance edited'
                ? 'Account Balance Edited'
                : 'Uncategorized')}
          </p>

          {/* NOTE */}
          <p className="text-xs text-gray-400">
            {tx.note}
          </p>

          {/* DATE */}
          <p className="text-xs text-gray-400">
            {new Date(tx.date).toLocaleDateString()}
          </p>

          {/* ACCOUNT */}
          <p className="text-sm font-semibold text-gray-500">
            {tx.type === 'transfer'
              ? `${tx.account?.name} → ${tx.to_account?.name}`
              : tx.account?.name}
          </p>

          {/* AMOUNT */}
          <p className={`font-bold text-lg ${
            tx.type === 'expense'
              ? 'text-red-500'
              : tx.type === 'income'
              ? 'text-green-500'
              : 'text-blue-500'
          }`}>
            {tx.type === 'expense'
              ? '-'
              : tx.type === 'income'
              ? '+'
              : '↔'} LKR {formatCurrency(tx.amount)}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 text-sm">
          <button
            onClick={() => router.push(`/edit-expense/${tx.id}`)}
            className="px-3 py-1 bg-blue-100 text-blue-600 rounded"
          >
            Edit
          </button>

          <button
            onClick={() => {
                if (!confirm('Delete this transaction?')) return
                handleDelete(tx.id)
            }}
            className="px-3 py-1 bg-red-100 text-red-600 rounded"
          >
            Delete
          </button>
        </div>
      </div>

      {/* TYPE */}
      <p className={`text-xs font-bold uppercase ${
        tx.type === 'expense'
          ? 'text-red-500'
          : tx.type === 'income'
          ? 'text-green-500'
          : 'text-blue-500'
      }`}>
        {tx.type}
      </p>

    </div>
  )
}