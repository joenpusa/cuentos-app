
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(envContent.split('\n').filter(line => line.includes('=')).map(line => line.split('=')))

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

console.log('Testing Supabase connection with:')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  },
  realtime: {
    enabled: false
  }
})

async function test() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'joenpusa@gmail.com',
      password: 'admin12'
    })
    
    if (error) {
      console.log('Login attempt failed (this is expected if credentials are wrong, but ENOTFOUND should be gone):')
      console.error(error.message)
    } else {
      console.log('Login successful!')
    }
  } catch (err) {
    console.error('Connection failed with error:')
    console.error(err)
  }
}

test()
