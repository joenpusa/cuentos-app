import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import MedalsSummary from '@/components/features/estudiante/MedalsSummary'
import MedalsSummarySkeleton from '@/components/features/estudiante/MedalsSummarySkeleton'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ studentId?: string }>
}

export default async function ReportesPadrePage({ searchParams }: PageProps) {
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

  if (!profile || profile.role !== 'padre') {
    redirect('/')
  }

  // 2. Obtener lista de hijos
  // Nota: Esto requiere que exista la columna parent_id en profiles
  const { data: children, error: childrenError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('parent_id', user.id)

  if (childrenError || !children || children.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[2rem] p-12 text-center shadow-xl border-4 border-dashed border-slate-200">
          <div className="text-6xl mb-6">👨‍👩‍👧‍👦</div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">No tienes estudiantes asignados</h1>
          <p className="text-slate-600 text-lg">
            Para ver el progreso, necesitas que un administrador asigne estudiantes a tu perfil de padre.
          </p>
        </div>
      </div>
    )
  }

  // 3. Determinar el hijo seleccionado
  const params = await searchParams
  const selectedStudentId = params.studentId || children[0].id
  const selectedChild = children.find(c => c.id === selectedStudentId)

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Progreso de Lectura</h1>
          <p className="text-xl text-slate-500 font-medium">Supervisa el avance y los logros de tus pequeños héroes.</p>
        </div>

        {/* Selector de Hijos (Tabs) */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 inline-flex overflow-x-auto max-w-full custom-scrollbar">
          <div className="flex gap-2">
            {children.map((child) => {
              const isSelected = child.id === selectedStudentId
              return (
                <Link
                  key={child.id}
                  href={`/padre/reportes?studentId=${child.id}`}
                  className={`
                    px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-200
                    ${isSelected 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                    }
                  `}
                >
                  {child.full_name || 'Sin Nombre'}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Contenido (Resumen de Medallas) */}
        <div className="bg-white rounded-[3rem] p-6 sm:p-10 shadow-2xl border border-slate-100">
          {selectedChild ? (
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-8 text-center sm:text-left">
                Reporte de {selectedChild.full_name || 'Estudiante'}
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
