'use server'

import { createClient } from '@/lib/supabase/server'
import { storySchema } from '@/lib/schemas/story'
import { revalidatePath } from 'next/cache'

export async function updateStory(formData: FormData) {
  const supabase = await createClient()

  // 1. Validar la sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No estás autenticado' }
  }

  // Verificar si es admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role?.trim() !== 'admin') {
    return { error: 'No tienes permisos para realizar esta acción' }
  }

  // 2. Extraer datos del FormData
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const questionsRaw = formData.get('questions') as string
  const image = formData.get('image') as File | null

  if (!id) {
    return { error: 'ID de cuento no proporcionado' }
  }

  let questions = []
  try {
    questions = JSON.parse(questionsRaw || '[]')
  } catch (e) {
    return { error: 'Error al procesar las preguntas (JSON inválido)' }
  }

  // 3. Validar con Zod
  const parsed = storySchema.safeParse({
    title,
    content,
    questions,
  })

  if (!parsed.success) {
    return { 
      error: 'Por favor, revisa los campos del formulario', 
      fields: parsed.error.flatten().fieldErrors 
    }
  }

  // 4. Subir la imagen a Supabase Storage (si se proporcionó)
  let imageUrl = undefined // Usamos undefined para no sobreescribir si no hay imagen

  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const filePath = `portadas/${fileName}` // guardarlo dentro de la carpeta portadas/

    const { error: uploadError } = await supabase.storage
      .from('cuentos-images')
      .upload(filePath, image)

    if (uploadError) {
      console.error('Error subiendo imagen:', uploadError)
      return { error: 'Hubo un error al subir la imagen de portada. Verifica que el bucket "cuentos-images" exista.' }
    }

    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage
      .from('cuentos-images')
      .getPublicUrl(filePath)

    imageUrl = publicUrlData.publicUrl
  }

  // 5. Preparar datos a actualizar
  const updateData: any = {
    title: parsed.data.title,
    content: parsed.data.content,
    questions: parsed.data.questions,
  }

  if (imageUrl !== undefined) {
    updateData.image_url = imageUrl
  }

  // 6. Actualizar en la tabla stories
  const { error: updateError } = await supabase
    .from('stories')
    .update(updateData)
    .eq('id', id)

  if (updateError) {
    console.error('Error actualizando cuento:', updateError)
    return { error: 'Hubo un error al actualizar el cuento en la base de datos' }
  }

  revalidatePath('/admin')
  
  return { success: true }
}
