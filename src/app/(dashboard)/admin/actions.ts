'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteStory(id: string, imageUrl?: string | null) {
  const supabase = await createClient()

  // 1. Validar sesión y rol
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autenticado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role?.trim() !== 'admin') {
    return { error: 'No autorizado' }
  }

  // 2. Eliminar imagen de Storage si existe
  if (imageUrl) {
    // Extraer la ruta de la imagen desde la URL
    // Asumimos que la URL termina en /cuentos-images/portadas/archivo.ext
    const urlParts = imageUrl.split('/cuentos-images/')
    if (urlParts.length === 2) {
      const filePath = urlParts[1]
      const { error: storageError } = await supabase.storage
        .from('cuentos-images')
        .remove([filePath])

      if (storageError) {
        console.error('Error eliminando imagen del storage:', storageError)
        // Continuamos de todas formas para eliminar el registro de BD
      }
    }
  }

  // 3. Eliminar de la base de datos (depende de ON DELETE CASCADE si hay foreign keys)
  const { error: dbError } = await supabase
    .from('stories')
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error('Error eliminando cuento de la BD:', dbError)
    // Error típico si activities apunta a stories y no tiene CASCADE
    if (dbError.code === '23503') { 
      return { error: 'No se puede eliminar el cuento porque ya tiene actividades registradas. Elimina las actividades primero.' }
    }
    return { error: 'Error al eliminar el cuento de la base de datos.' }
  }

  revalidatePath('/admin')
  return { success: true }
}
