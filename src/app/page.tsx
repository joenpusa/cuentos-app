import { redirect } from 'next/navigation'
import { getSession, getUserProfile } from '@/services/auth'

export default async function Home() {
  const session = await getSession()
  if (session) {
    const { data: profile } = await getUserProfile(session.id)
    if (profile && profile.role) {
      redirect(`/${profile.role.trim()}`)
    }
  }
  redirect('/login')
}
