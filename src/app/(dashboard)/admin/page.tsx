import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { StoryGrid, StoryGridSkeleton, StoryRow } from '@/components/features/admin/StoryGrid'

async function StoriesList() {
  const supabase = await createClient()

  // Intentamos obtener todos los datos
  let { data: rawData, error } = await supabase
    .from('stories')
    .select(`
      *,
      profiles (
        email, 
        role 
      ),
      activities ( count )
    `)
    .order('created_at', { ascending: false })

  // Fallback si la base de datos aún no tiene 'created_at' o falla
  if (error) {
    console.error('Error with full query, trying fallback:', error)
    const fallback = await supabase
      .from('stories')
      .select(`
        *,
        activities ( count )
      `)
    rawData = fallback.data
    error = fallback.error
  }

  if (error) {
    console.error('Error fetching stories:', error)
    return <div className="text-red-500 bg-red-50 p-4 rounded-lg">Error cargando los cuentos.</div>
  }

  const stories: StoryRow[] = (rawData || []).map((row: any) => {
    let count = 0
    if (Array.isArray(row.activities) && row.activities.length > 0) {
      count = row.activities[0].count || 0
    } else if (row.activities && typeof row.activities === 'object' && 'count' in row.activities) {
      count = row.activities.count
    }

    let dateStr = undefined
    if (row.created_at) {
      dateStr = new Date(row.created_at).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    let publicImageUrl = row.image_url
    if (publicImageUrl && !publicImageUrl.startsWith('http')) {
      const { data } = supabase.storage.from('cuentos-images').getPublicUrl(publicImageUrl)
      publicImageUrl = data.publicUrl
    }

    const profileEmail = Array.isArray(row.profiles) 
      ? row.profiles[0]?.email 
      : row.profiles?.email

    return {
      id: row.id,
      title: row.title,
      image_url: publicImageUrl,
      created_at: dateStr,
      author_name: profileEmail,
      activitiesCount: count,
    }
  })

  return <StoryGrid stories={stories} />
}

export default async function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Historias</h1>
          <p className="text-gray-500 text-sm">Gestiona el contenido de lectura disponible.</p>
        </div>

        <Link
          href="/admin/cuentos/nuevo"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm text-sm"
        >
          <PlusCircle size={18} />
          Crear Cuento
        </Link>
      </div>

      <Suspense fallback={<StoryGridSkeleton />}>
        <StoriesList />
      </Suspense>
    </div>
  )
}

