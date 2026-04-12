'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SelectSubcategory() {
  const params = useSearchParams()
  const router = useRouter()

  const categoryId = params.get('categoryId')
  const categoryName = params.get('name')

  const [subs, setSubs] = useState<any[]>([])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)

      setSubs(data || [])
    }
    fetch()
  }, [categoryId])

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">{categoryName}</h2>

      {subs.map((sub) => (
        <div
          key={sub.id}
          onClick={() => {
            const draft = JSON.parse(localStorage.getItem('expenseDraft') || '{}')

            localStorage.setItem(
              'expenseDraft',
              JSON.stringify({
                ...draft,
                selectedCategory: {
                  id: categoryId,
                  name: categoryName
                },
                selectedSub: {
                  id: sub.id,
                  name: sub.name
                }
              })
            )
            router.push('/add-expense')
          }}
          className="p-4 border-b cursor-pointer"
        >
          {sub.name}
        </div>
      ))}
    </div>
  )
}