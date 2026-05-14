import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import UsersClient from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function UsuariosAdminPage() {
  const supabase = await createClient()

  // 1. Validar sesión y rol del administrador actual
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // 2. Obtener la lista de usuarios usando el cliente administrador
  const adminClient = createAdminClient()

  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers()
  
  if (authError) {
    console.error('Error fetching auth users:', authError)
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
        Error al cargar los usuarios. Verifica que la variable SUPABASE_SERVICE_ROLE_KEY esté configurada.
      </div>
    )
  }

  // 3. Obtener los perfiles (roles)
  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('*')

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])

  // 4. Combinar datos
  const users = authData.users.map(u => {
    const prof = profilesMap.get(u.id)
    // Supabase Auth puede guardar el nombre en user_metadata, 
    // o podríamos tenerlo en public.profiles (prof.full_name)
    const name = prof?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Sin nombre'
    const role = prof?.role || 'estudiante' // default fallback

    return {
      id: u.id,
      name,
      email: u.email || 'Sin email',
      role,
      created_at: u.created_at,
    }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <UsersClient users={users} />
    </div>
  )
}
