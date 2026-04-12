'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ManageCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [newSub, setNewSub] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data: cat } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userData.user.id)

    const { data: sub } = await supabase
      .from('subcategories')
      .select('*')

    setCategories(cat || [])
    setSubcategories(sub || [])
  }

  const addCategory = async () => {
    if (!newCategory) return

    const { data: userData } = await supabase.auth.getUser()

    await supabase.from('categories').insert([
      {
        name: newCategory,
        user_id: userData.user?.id,
      },
    ])

    setNewCategory('')
    fetchData()
  }

  const addSubcategory = async (categoryId: string) => {
    const name = newSub[categoryId]
    if (!name) return

    await supabase.from('subcategories').insert([
      {
        name,
        category_id: categoryId,
      },
    ])

    setNewSub({ ...newSub, [categoryId]: '' })
    fetchData()
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete category?')) return
    await supabase.from('categories').delete().eq('id', id)
    fetchData()
  }

  const deleteSub = async (id: string) => {
    if (!confirm('Delete subcategory?')) return
    await supabase.from('subcategories').delete().eq('id', id)
    fetchData()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Manage Categories</h1>

      {/* Add Category */}
      <div className="flex gap-2 mb-6">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New Category"
          className="border p-2 flex-1"
        />
        <button onClick={addCategory} className="bg-blue-500 text-white px-4">
          Add
        </button>
      </div>

      {/* List */}
      {categories.map((cat) => (
        <div key={cat.id} className="border p-3 mb-4 rounded">
          <div className="flex justify-between">
            <h2 className="font-semibold">{cat.name}</h2>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>

          {/* Subcategories */}
          <div className="ml-4 mt-2">
            {subcategories
              .filter((s) => s.category_id === cat.id)
              .map((sub) => (
                <div key={sub.id} className="flex justify-between text-sm">
                  <span>- {sub.name}</span>
                  <button
                    onClick={() => deleteSub(sub.id)}
                    className="text-red-400"
                  >
                    delete
                  </button>
                </div>
              ))}

            {/* Add sub */}
            <div className="flex gap-2 mt-2">
              <input
                value={newSub[cat.id] || ''}
                onChange={(e) =>
                  setNewSub({ ...newSub, [cat.id]: e.target.value })
                }
                placeholder="Add subcategory"
                className="border p-1 flex-1"
              />
              <button
                onClick={() => addSubcategory(cat.id)}
                className="text-blue-500"
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}