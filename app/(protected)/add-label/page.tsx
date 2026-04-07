'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AddLabel() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#ef4444')

  const colors = [
    '#ef4444',
    '#22c55e',
    '#3b82f6',
    '#f59e0b',
    '#a855f7',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#64748b',
    '#0ea5e9',
  ]

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
      }
    }
    checkUser()
  }, [])

  const handleAddLabel = async () => {
    if (!name.trim()) {
      toast.error('Label name is required')
      return
    }

    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      toast.error('Not logged in')
      return
    }

    const { error } = await supabase.from('labels').insert([
      {
        user_id: user.id,
        name,
        color: selectedColor,
      },
    ])

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Label created!')
      router.back() // go back to previous page
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">

        <h2 className="text-xl font-bold mb-4 text-center">
          Create Label 🏷️
        </h2>

        {/* NAME */}
        <input
          placeholder="Label name (Food, Travel...)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        />

        {/* COLOR PICKER */}
        <div className="mb-4">
          <p className="text-sm mb-2">Pick Color</p>

          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <div
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full cursor-pointer`}
                style={{
                  backgroundColor: color,
                  border:
                    selectedColor === color
                      ? '3px solid black'
                      : '2px solid transparent',
                }}
              />
            ))}
          </div>
        </div>

        {/* PREVIEW */}
        <div className="mb-4 flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="text-sm text-gray-700">
            {name || 'Preview'}
          </span>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleAddLabel}
          disabled={!name}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg disabled:opacity-50"
        >
          Save Label
        </button>

        <button
          onClick={() => router.push('/add-expense?labelCreated=true')}
          className="w-full mt-2 text-sm text-gray-500"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}