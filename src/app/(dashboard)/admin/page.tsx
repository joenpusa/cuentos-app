import { LogoutButton } from '@/components/features/auth/LogoutButton'
import { getSession } from '@/services/auth'
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
    // activities ( count ) devuelve un array con un objeto o un número directo dependiendo del entorno
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

    // Asegurarse de que tenemos la URL pública completa de la imagen
    let publicImageUrl = row.image_url
    
    // Si la url solo contiene el path (ej. 'portadas/mi-imagen.jpg') y no es nula, construimos la pública
    if (publicImageUrl && !publicImageUrl.startsWith('http')) {
      const { data } = supabase.storage.from('cuentos-images').getPublicUrl(publicImageUrl)
      publicImageUrl = data.publicUrl
    }

    // Supabase devuelve perfiles como un objeto si es una relación uno a uno/muchos a uno
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
  const session = await getSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">Cuentos Mágicos - Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">{session?.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h2>
            <p className="text-gray-600">Gestiona los cuentos y usuarios desde aquí.</p>
          </div>
          
          <Link 
            href="/admin/cuentos/nuevo" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
          >
            <PlusCircle size={20} />
            Crear Nuevo Cuento
          </Link>
        </div>
        
        <Suspense fallback={<StoryGridSkeleton />}>
          <StoriesList />
        </Suspense>
      </main>
    </div>
  )
}
