import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function StoriesList() {
  const supabase = await createClient()

  const { data: stories, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching stories for student:', error)
    return <div className="text-red-500 bg-red-50 p-4 rounded-lg">Error cargando los cuentos.</div>
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500 italic">No hay cuentos disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {stories.map((story) => {
        let publicImageUrl = story.image_url
        if (publicImageUrl && !publicImageUrl.startsWith('http')) {
          const { data } = supabase.storage.from('cuentos-images').getPublicUrl(publicImageUrl)
          publicImageUrl = data.publicUrl
        }

        return (
          <div key={story.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full bg-indigo-50">
              {publicImageUrl ? (
                <img 
                  src={publicImageUrl} 
                  alt={story.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-300">
                  <span className="text-4xl">📚</span>
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">{story.title}</h3>
              <div className="mt-auto pt-4">
                <Link 
                  href={`/estudiante/cuentos/${story.id}`}
                  className="block w-full py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-center transition-colors shadow-sm"
                >
                  ¡Comenzar a leer!
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StoriesListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-80 animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-5">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded-xl w-full mt-auto"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function EstudianteDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Mis Cuentos</h1>
      <p className="text-gray-500 text-sm mb-8">¡Prepárate para leer aventuras increíbles!</p>

      <Suspense fallback={<StoriesListSkeleton />}>
        <StoriesList />
      </Suspense>
    </div>
  )
}
