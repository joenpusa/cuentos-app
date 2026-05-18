import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import QuizContainer from '@/components/features/estudiante/QuizContainer'
import MobileStoryModal from '@/components/features/estudiante/MobileStoryModal'
import StoryContentViewer from '@/components/features/estudiante/StoryContentViewer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EstudianteCuentoPage({ params }: PageProps) {
  // Asegurarnos de usar await en params en Next.js 15
  const { id } = await params
  const supabase = await createClient()

  // 1. Validar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Verificar rol
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'estudiante') {
    redirect('/')
  }

  // 2. Obtener el cuento
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single()

  if (storyError || !story) {
    notFound()
  }

  // 3. Obtener el número de intentos
  const { count, error: countError } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .eq('story_id', id)

  const attempts = count ?? 0
  const maxAttempts = 2
  const hasReachedLimit = attempts >= maxAttempts

  // 4. Obtener el último intento (si existe)
  const { data: latestActivity } = await supabase
    .from('activities')
    .select('score, responses')
    .eq('student_id', user.id)
    .eq('story_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header y Portada del Cuento (Full width) */}
        <header className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-4 border-white/50 relative">
          {story.image_url && (
            <div className="w-full h-64 md:h-96 relative bg-indigo-100">
              <Image
                src={story.image_url}
                alt={`Portada de ${story.title}`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          <div className={`p-8 md:p-12 relative ${story.image_url ? '-mt-24 text-white z-10' : 'text-slate-800'}`}>
            <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-md">
              {story.title}
            </h1>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-start">
          {/* Columna Izquierda: Cuento (Solo Escritorio/Tablet) */}
          <article className="hidden lg:block bg-white p-8 md:p-12 rounded-[2rem] shadow-xl lg:sticky lg:top-8 h-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
            <StoryContentViewer content={story.content} className="text-lg lg:text-xl text-slate-700 leading-relaxed space-y-6" />
          </article>

          {/* Columna Derecha: Cuestionario / Revisión */}
          <section className="scroll-mt-12" id="cuestionario">
            <QuizContainer
              questions={story.questions || []}
              storyId={story.id}
              attempts={attempts}
              maxAttempts={maxAttempts}
              latestActivity={latestActivity}
            />
          </section>
        </div>
      </div>

      {/* Botón Flotante y Modal para Móviles */}
      <MobileStoryModal title={story.title} content={story.content} />
    </div>
  )
}
