import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import CoursesClient from './CoursesClient'

export const dynamic = 'force-dynamic'

export default async function DirectorCoursesPage() {
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
  // Asumimos que la institución está vinculada donde director_id = user.id
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

  // 3. Obtener los cursos de esa institución
  // Usamos el join implícito para obtener el nombre del profesor
  const adminClient = createAdminClient()
  const { data: coursesData, error: coursesError } = await adminClient
    .from('courses')
    .select(`
      id,
      name,
      teacher_id,
      created_at,
      profiles!fk_courses_teacher ( full_name )
    `)
    .eq('institution_id', institution.id)
    .order('created_at', { ascending: false })

  if (coursesError) {
    console.error('Error fetching courses:', coursesError)
  }

  const courses = (coursesData || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    teacher_id: c.teacher_id,
    teacher_name: c.profiles?.full_name || 'Sin profesor asignado',
    created_at: c.created_at
  }))

  // 4. Obtener profesores de la institución usando adminClient para evadir RLS
  const { data: teachersData } = await adminClient
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'profesor')
    .eq('institution_id', institution.id)

  const teachers = (teachersData || []).map(t => ({
    id: t.id,
    full_name: t.full_name,
    email: t.email
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <CoursesClient 
        courses={courses} 
        institutionId={institution.id} 
        institutionName={institution.name}
        teachers={teachers}
      />
    </div>
  )
}
