import { supabase } from '@/lib/supabaseClient'

export const deleteTransaction = async (id: string) => {
  const { data: tx } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (!tx) throw new Error('Transaction not found')

  // handle all types
  if (tx.type === 'expense') {
    const { data: acc } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', tx.account_id)
      .single()

      if (!acc) return

    await supabase
      .from('accounts')
      .update({ balance: acc.balance + tx.amount })
      .eq('id', tx.account_id)
  }

  if (tx.type === 'income') {
    const { data: acc } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', tx.account_id)
      .single()

      if (!acc) return

    await supabase
      .from('accounts')
      .update({ balance: acc.balance - tx.amount })
      .eq('id', tx.account_id)
  }

  if (tx.type === 'transfer') {
    const { data: fromAcc } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', tx.account_id)
      .single()

    const { data: toAcc } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', tx.to_account_id)
      .single()

      if (!fromAcc) return

    await supabase
      .from('accounts')
      .update({ balance: fromAcc.balance + tx.amount })
      .eq('id', tx.account_id)

      if (!toAcc) return

    await supabase
      .from('accounts')
      .update({ balance: toAcc.balance - tx.amount })
      .eq('id', tx.to_account_id)
  }

  await supabase.from('expenses').delete().eq('id', id)
}



export const getTransactionsWithFilters = async ({
  userId,
  filterType,
  labelId,
}: {
  userId: string
  filterType: string
  labelId: string
}) => {
  let query = supabase
    .from('expenses')
    .select(`
      *,
      account:account_id (name),
      to_account:to_account_id (name),
      label:label_id (name, color),
      category:category_id (name),
      subcategory:subcategory_id (name)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (filterType !== 'all') {
    query = query.eq('type', filterType)
  }

  if (labelId) {
    query = query.eq('label_id', labelId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  return data
}


