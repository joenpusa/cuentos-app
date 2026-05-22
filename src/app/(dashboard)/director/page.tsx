import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { School, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DirectorDashboard() {
  const supabase = await createClient()

  // Validar sesión y rol
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

  // Obtener la institución del director
  const { data: institution } = await supabase
    .from('institutions')
    .select('*')
    .eq('director_id', user.id)
    .single()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800">Panel de Director</h1>
        <p className="text-slate-500 mt-2">
          Bienvenido al sistema de administración de tu institución.
        </p>
      </div>

      {!institution ? (
        <div className="p-8 text-center text-amber-700 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Sin Institución Asignada</h2>
          <p>
            Actualmente no tienes ninguna escuela o institución vinculada a tu perfil. 
            Por favor, comunícate con un administrador global para que realice la asignación y puedas comenzar a gestionar tus cursos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <School size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{institution.name}</h3>
            <p className="text-sm text-slate-500 mb-6">
              NIT/Código: {institution.nit_or_code}
            </p>
            <div className="mt-auto w-full">
              <Link 
                href="/director/cursos"
                className="block w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
              >
                Gestionar Cursos
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
