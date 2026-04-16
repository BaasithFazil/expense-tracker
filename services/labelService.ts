import { supabase } from "@/lib/supabaseClient"

export const getLabels = async (userId: string) => {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId)
  
    if (error) throw new Error(error.message)
  
    return data
  }