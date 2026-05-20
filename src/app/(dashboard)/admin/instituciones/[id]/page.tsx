import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InstitutionDetailsClient from './InstitutionDetailsClient'

export const dynamic = 'force-dynamic'

export default async function InstitutionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // 2. Obtener la institución
  const { data: institution, error: instError } = await supabase
    .from('institutions')
    .select('*')
    .eq('id', id)
    .single()

  if (instError || !institution) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
          Error: No se encontró la institución o no tienes permisos.
        </div>
      </div>
    )
  }

  // 3. Obtener estudiantes asociados y su curso (left join a courses)
  // Usamos una consulta que hace join implícito con Supabase PostgREST
  const { data: studentsData, error: studentsError } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      course_id,
      courses!profiles_course_id_fkey ( name )
    `)
    .eq('institution_id', id)
    .eq('role', 'estudiante')

  if (studentsError) {
    console.error('Error fetching students:', studentsError)
  }

  const students = (studentsData || []).map((s: any) => ({
    id: s.id,
    name: s.full_name || s.email?.split('@')[0] || 'Sin nombre',
    email: s.email || 'Sin email',
    course_id: s.course_id,
    course_name: s.courses?.name || 'Sin curso asignado'
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <InstitutionDetailsClient 
        institution={institution} 
        students={students} 
      />
    </div>
  )
}
