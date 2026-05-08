import { StoryForm } from '@/components/features/admin/StoryForm'
import { getSession, getUserProfile } from '@/services/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Nuevo Cuento | Cuentos Mágicos',
}

export default async function NuevoCuentoPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await getUserProfile(session.id)
  
  if (!profile || profile.role?.trim() !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Crear Nuevo Cuento</h1>
        <p className="mt-2 text-sm text-gray-600">
          Completa el formulario para publicar una nueva historia y diseña un cuestionario interactivo para los niños.
        </p>
      </div>

      <StoryForm />
    </div>
  )
}
