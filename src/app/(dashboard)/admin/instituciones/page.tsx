import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InstitutionsClient from './InstitutionsClient'

export const dynamic = 'force-dynamic'

export default async function InstitucionesAdminPage() {
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

  // 2. Obtener la lista de instituciones
  const { data: institutions, error } = await supabase
    .from('institutions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching institutions:', error)
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200">
        Error al cargar las instituciones. Por favor, intenta más tarde.
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <InstitutionsClient institutions={institutions || []} />
    </div>
  )
}
