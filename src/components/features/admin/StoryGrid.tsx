'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Edit, Image as ImageIcon, Users } from 'lucide-react'
import { DeleteStoryButton } from '@/components/features/admin/DeleteStoryButton'

export interface StoryRow {
  id: string
  title: string
  image_url: string | null
  created_at?: string
  author_name?: string
  activitiesCount: number
}

interface Props {
  stories: StoryRow[]
}

export function StoryGrid({ stories }: Props) {
  if (stories.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cuentos recientes</h3>
          <p className="text-gray-500 mb-6">Comienza creando tu primera historia interactiva.</p>
          <Link 
            href="/admin/cuentos/nuevo" 
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            + Agregar cuento ahora
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story, index) => (
        <div 
          key={story.id} 
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
        >
          {/* Imagen / Portada */}
          <div className="relative h-48 bg-gray-200 flex items-center justify-center border-b border-gray-100">
            {story.image_url ? (
              <Image 
                src={story.image_url} 
                alt={story.title}
                fill
                className="object-cover transition-opacity duration-300 opacity-0"
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement
                  target.classList.remove('opacity-0')
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 3} // Priority a las primeras 3 imágenes para LCP
              />
            ) : (
              <ImageIcon className="text-gray-400" size={48} />
            )}
            
            {/* Badge de contador flotante */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 z-10">
              <Users size={14} />
              {story.activitiesCount} {story.activitiesCount === 1 ? 'realización' : 'realizaciones'}
            </div>
          </div>

          {/* Contenido */}
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{story.title}</h3>
            
            <div className="mt-auto pt-4 space-y-1">
              {story.author_name && (
                <p className="text-xs text-gray-500">Por: <span className="font-medium text-gray-700">{story.author_name}</span></p>
              )}
              {story.created_at && (
                <p className="text-xs text-gray-400">Creado: {story.created_at}</p>
              )}
            </div>
          </div>

          {/* Footer / Acciones */}
          <div className="bg-gray-50 p-3 px-5 border-t border-gray-100 flex justify-between items-center">
            <Link 
              href={`/admin/cuentos/editar/${story.id}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
            >
              <Edit size={16} />
              Editar
            </Link>
            
            <DeleteStoryButton id={story.id} title={story.title} imageUrl={story.image_url} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StoryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="p-5">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between">
            <div className="h-5 bg-gray-200 rounded w-20" />
            <div className="h-5 bg-gray-200 rounded w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}
