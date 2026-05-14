import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import QuizWizard from '@/components/features/estudiante/QuizWizard'
import MobileStoryModal from '@/components/features/estudiante/MobileStoryModal'

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
          <article className="hidden lg:block bg-white p-8 md:p-12 rounded-[2rem] shadow-xl text-lg lg:text-xl text-slate-700 leading-relaxed space-y-6 lg:sticky lg:top-8 h-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
            {story.content.split('\n').map((paragraph: string, idx: number) => (
              paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
            ))}
          </article>

          {/* Columna Derecha: Cuestionario */}
          <section className="scroll-mt-12" id="cuestionario">
            {hasReachedLimit ? (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] shadow-xl p-8 md:p-12 text-center text-white">
                <div className="text-6xl mb-6">🏆</div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  ¡Ya eres un experto en este cuento!
                </h2>
                <p className="text-xl md:text-2xl text-indigo-100 font-medium max-w-2xl mx-auto">
                  Has completado este cuento {attempts} veces. Intenta leer uno nuevo para seguir ganando medallas y aprendiendo.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center lg:text-left pl-4">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
                    ¡Hora de Jugar! 🎮
                  </h2>
                  <p className="text-lg text-slate-600 font-medium">
                    Demuestra lo que aprendiste y gana medallas.
                  </p>
                </div>
                
                <QuizWizard 
                  questions={story.questions || []} 
                  storyId={story.id} 
                />
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Botón Flotante y Modal para Móviles */}
      <MobileStoryModal title={story.title} content={story.content} />
    </div>
  )
}
