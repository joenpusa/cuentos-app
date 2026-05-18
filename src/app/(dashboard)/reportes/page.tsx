import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import MedalsSummary from '@/components/features/estudiante/MedalsSummary'
import MedalsSummarySkeleton from '@/components/features/estudiante/MedalsSummarySkeleton'
import StudentSelector from '@/components/features/shared/StudentSelector'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ studentId?: string }>
}

export default async function ReportesPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // 1. Autenticación y Autorización
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'padre' && profile.role !== 'admin')) {
    redirect('/')
  }

  const isAdmin = profile.role === 'admin'

  // 2. Obtener lista de estudiantes según el rol
  let query = supabase.from('profiles').select('id, email, role')
  
  if (isAdmin) {
    query = query.eq('role', 'estudiante')
  } else {
    query = query.eq('parent_id', user.id)
  }

  const { data: students, error: studentsError } = await query

  if (studentsError || !students || students.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border-4 border-dashed border-slate-200">
          <div className="text-6xl mb-6">{isAdmin ? '🔍' : '👨‍👩‍👧‍👦'}</div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">No hay estudiantes disponibles</h1>
          <p className="text-slate-600 text-lg">
            {isAdmin 
              ? 'No hay estudiantes registrados en la plataforma actualmente.' 
              : 'Para ver el progreso, necesitas que un administrador asigne estudiantes a tu perfil de padre.'}
          </p>
        </div>
      </div>
    )
  }

  // 3. Determinar el estudiante seleccionado
  const params = await searchParams
  let selectedStudentId = params.studentId || students[0].id
  
  // Validar seguridad: asegurar que el studentId de la URL pertenezca a la lista permitida
  let selectedChild = students.find(c => c.id === selectedStudentId)
  
  // Si no se encuentra en la lista (manipulación de URL), forzamos al primero
  if (!selectedChild) {
    selectedStudentId = students[0].id
    selectedChild = students[0]
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Progreso de Lectura</h1>
          <p className="text-xl text-slate-500 font-medium">
            {isAdmin 
              ? 'Supervisa el avance y los logros de todos los estudiantes de la escuela.'
              : 'Supervisa el avance y los logros de tus pequeños héroes.'}
          </p>
        </div>

        {/* Selector de Estudiantes */}
        <StudentSelector 
          students={students} 
          selectedId={selectedStudentId} 
          showSearch={isAdmin} 
        />

        {/* Contenido (Resumen de Medallas) */}
        <div className="bg-white rounded-[3rem] p-6 sm:p-10 shadow-2xl border border-slate-100">
          {selectedChild ? (
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-8 text-center sm:text-left">
                Reporte de {selectedChild.email?.split('@')[0] || 'Estudiante'}
              </h2>
              
              {/* Suspense boundary for data fetching */}
              <Suspense key={selectedStudentId} fallback={<MedalsSummarySkeleton />}>
                <MedalsSummary studentId={selectedStudentId} />
              </Suspense>
            </div>
          ) : (
            <div className="text-center p-8 text-slate-500">Estudiante no encontrado.</div>
          )}
        </div>

      </div>
    </div>
  )
}
