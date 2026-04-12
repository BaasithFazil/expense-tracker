'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SelectCategory() {
  const [categories, setCategories] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('categories').select('*')
      setCategories(data || [])
    }
    fetch()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Categories</h2>

      {categories.map((cat) => (
        <div
          key={cat.id}
          onClick={() => {
            router.push(`/select-subcategory?categoryId=${cat.id}&name=${cat.name}`)
          }}
          className="p-4 border-b cursor-pointer"
        >
          {cat.name}
        </div>
      ))}
    </div>
  )
}