
import fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(envContent.split('\n').filter(line => line.includes('=')).map(line => line.split('=')))

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim()

console.log('Testing Supabase reachability with fetch:')
console.log('URL:', supabaseUrl)

async function test() {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`)
    console.log('Response status:', response.status)
    if (response.ok) {
      console.log('Successfully reached Supabase API!')
    } else {
      const text = await response.text()
      console.log('Reached API but got error (expected if settings are restricted):', text)
    }
  } catch (err) {
    console.error('Fetch failed with error:')
    console.error(err)
  }
}

test()
