import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import CourseDetailsClient from './CourseDetailsClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CourseDetailsPage({ params }: PageProps) {
  const { id: courseId } = await params
  const supabase = await createClient()

  // 1. Validar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Validar perfil y que sea director
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'director') {
    redirect('/')
  }

  // 3. Obtener la institución del director
  const { data: institution } = await supabase
    .from('institutions')
    .select('id')
    .eq('director_id', user.id)
    .single()

  if (!institution) {
    redirect('/director')
  }

  const adminClient = createAdminClient()

  // 4. Obtener detalles del curso validando la institución
  const { data: course, error: courseError } = await adminClient
    .from('courses')
    .select('*, profiles!fk_courses_teacher(full_name)')
    .eq('id', courseId)
    .eq('institution_id', institution.id)
    .single()

  if (courseError || !course) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
          <h2 className="text-xl font-bold mb-2">Curso no encontrado</h2>
          <p>El curso que buscas no existe o no tienes permisos para verlo.</p>
        </div>
      </div>
    )
  }

  // 5. Obtener alumnos inscritos
  const { data: enrolledStudentsData } = await adminClient
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'estudiante')
    .eq('course_id', courseId)
    .order('full_name')

  const enrolledStudents = enrolledStudentsData || []

  // 6. Obtener alumnos disponibles en la institución (course_id es null)
  const { data: availableStudentsData } = await adminClient
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'estudiante')
    .eq('institution_id', institution.id)
    .is('course_id', null)
    .order('full_name')

  const availableStudents = availableStudentsData || []

  // Manejo seguro del nombre del profesor (si es que existe la relación profile)
  const teacherName = course.profiles && Array.isArray(course.profiles) && course.profiles.length > 0
    ? course.profiles[0].full_name || ''
    : course.profiles && !Array.isArray(course.profiles) 
      ? (course.profiles as any).full_name || ''
      : ''

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <CourseDetailsClient 
        courseId={course.id}
        courseName={course.name}
        teacherName={teacherName}
        enrolledStudents={enrolledStudents}
        availableStudents={availableStudents}
      />
    </div>
  )
}
