import { supabase } from '@/lib/supabaseClient'

export const getAccounts = async (userId: string) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return data
}


export const getTransactions = async (userId: string) => {
    const { data, error } = await supabase
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
  
    if (error) throw new Error(error.message)
  
    return data
  }