import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import UsersClient from '@/app/(dashboard)/admin/usuarios/UsersClient'

export const dynamic = 'force-dynamic'

export default async function DirectorUsuariosPage() {
  const supabase = await createClient()

  // 1. Validar sesión y rol
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'director') {
    redirect('/')
  }

  // 2. Obtener la institución del director
  const { data: institution } = await supabase
    .from('institutions')
    .select('id, name')
    .eq('director_id', user.id)
    .single()

  if (!institution) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
          <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
          <p>No tienes una institución asignada como director. Por favor, contacta a un administrador global.</p>
        </div>
      </div>
    )
  }

  const adminClient = createAdminClient()

  // 3. Obtener los perfiles que pertenecen a esta institución
  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('institution_id', institution.id)

  if (profilesError) {
    console.error('Error fetching institution profiles:', profilesError)
  }

  // 4. Obtener todos los usuarios de Auth y filtrar
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers()
  
  if (authError) {
    console.error('Error fetching auth users:', authError)
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
        Error al cargar los usuarios. Verifica que la variable SUPABASE_SERVICE_ROLE_KEY esté configurada.
      </div>
    )
  }

  // Solo nos importan los usuarios de Auth cuyo ID exista en nuestros profiles (que ya están filtrados por institution_id)
  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])
  const filteredAuthUsers = authData.users.filter(u => profilesMap.has(u.id))

  // 5. Combinar datos
  const users = filteredAuthUsers.map(u => {
    const prof = profilesMap.get(u.id)
    const name = prof?.full_name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Sin nombre'
    const role = prof?.role || 'estudiante'

    return {
      id: u.id,
      name,
      email: u.email || 'Sin email',
      role,
      parent_id: prof?.parent_id || null,
      created_at: u.created_at,
    }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // 6. Obtener padres de esta institución para el formulario
  const { data: parentsData } = await adminClient
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'padre')
    .eq('institution_id', institution.id)

  const parents = parentsData || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-slate-500">Comunidad de {institution.name}</h2>
      </div>
      <UsersClient users={users} isDirector={true} parents={parents} />
    </div>
  )
}
