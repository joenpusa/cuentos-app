'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// --- HELPER DE AUTORIZACIÓN PARA DIRECTOR ---
async function requireDirectorOfInstitution(institutionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'director') {
    throw new Error('No autorizado, solo directores pueden realizar esta acción')
  }

  const { data: institution } = await supabase
    .from('institutions')
    .select('id')
    .eq('director_id', user.id)
    .single()

  if (!institution || institution.id !== institutionId) {
    throw new Error('No estás asignado como director de esta institución')
  }

  return user
}

// --- CREAR CURSO ---
export async function createCourse(formData: FormData, institutionId: string) {
  try {
    if (!institutionId) {
      return { error: 'ID de institución no válido' }
    }

    await requireDirectorOfInstitution(institutionId)

    const name = formData.get('name') as string
    const teacher_id_raw = formData.get('teacher_id') as string
    const teacher_id = teacher_id_raw ? teacher_id_raw : null

    if (!name || name.trim() === '') {
      return { error: 'El nombre del curso es obligatorio' }
    }

    const adminClient = createAdminClient()

    // Validar si el profesor pertenece a la misma institución y es profesor
    if (teacher_id) {
      const { data: teacherProfile } = await adminClient
        .from('profiles')
        .select('role, institution_id')
        .eq('id', teacher_id)
        .single()
        
      if (!teacherProfile || teacherProfile.role !== 'profesor' || teacherProfile.institution_id !== institutionId) {
        return { error: 'El profesor seleccionado no es válido o no pertenece a tu institución' }
      }
    }

    const { error: insertError } = await adminClient
      .from('courses')
      .insert({
        name: name.trim(),
        institution_id: institutionId,
        teacher_id
      })

    if (insertError) {
      console.error('Error creating course:', insertError)
      return { error: 'Error al crear el curso en la base de datos' }
    }

    revalidatePath('/director/cursos')
    return { success: true }
  } catch (error: any) {
    console.error('Exception in createCourse:', error)
    return { error: error.message || 'Error desconocido al crear el curso' }
  }
}
