'use client'

import { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteStory } from '@/app/(dashboard)/admin/actions'
import { toast } from 'sonner'

interface Props {
  id: string
  title: string
  imageUrl?: string | null
}

export function DeleteStoryButton({ id, title, imageUrl }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el cuento "${title}"? Esta acción no se puede deshacer.`)) {
      startTransition(async () => {
        toast.loading('Eliminando...', { id: 'delete-story' })
        
        const result = await deleteStory(id, imageUrl)
        
        if (result.error) {
          toast.error(result.error, { id: 'delete-story' })
        } else {
          toast.success('Cuento eliminado correctamente', { id: 'delete-story' })
        }
      })
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
      title="Eliminar cuento"
    >
      {isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
    </button>
  )
}
