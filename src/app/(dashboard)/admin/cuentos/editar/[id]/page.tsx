import { StoryForm } from '@/components/features/admin/StoryForm'
import { getSession, getUserProfile } from '@/services/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Editar Cuento | Escuela en Casa',
}

export default async function EditarCuentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await getUserProfile(session.id)

  if (!profile || profile.role?.trim() !== 'admin') {
    redirect('/')
  }

  const supabase = await createClient()

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !story) {
    console.error('Error fetching story for edit:', error)
    redirect('/admin')
  }

  // Preparamos los datos iniciales
  const initialData = {
    title: story.title,
    content: story.content,
    questions: Array.isArray(story.questions) ? story.questions : [],
    image_url: story.image_url,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Editar Cuento</h1>
        <p className="mt-2 text-sm text-gray-600">
          Modifica el contenido, preguntas o portada del cuento seleccionado.
        </p>
      </div>

      <StoryForm initialData={initialData} storyId={id} />
    </div>
  )
}
