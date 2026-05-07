import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types'

export async function getUserProfile(userId: string): Promise<{ data: Profile | null, error: any }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { data: data as Profile | null, error }
}

export async function getSession() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) return null
    return data.user
  } catch (error) {
    return null
  }
}
