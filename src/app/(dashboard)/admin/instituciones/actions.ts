'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// --- HELPER DE AUTORIZACIÓN ---
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('No autorizado')
  }

  return user
}

// --- CREAR INSTITUCIÓN ---
export async function createInstitution(formData: FormData) {
  try {
    await requireAdmin()

    const name = formData.get('name') as string
    const nit_or_code = formData.get('nit_or_code') as string
    const director_id_raw = formData.get('director_id') as string
    const director_id = director_id_raw ? director_id_raw : null

    if (!name || !nit_or_code) {
      return { error: 'El nombre y el NIT o Código son obligatorios' }
    }

    const supabase = await createClient()

    const { error: insertError } = await supabase
      .from('institutions')
      .insert({
        name,
        nit_or_code,
        director_id
      })

    if (insertError) {
      console.error('Error creating institution:', insertError)
      if (insertError.code === '23505') { // Postgres Unique Violation
        return { error: 'Ya existe una institución con este NIT o Código' }
      }
      return { error: 'Error al crear la institución' }
    }

    revalidatePath('/admin/instituciones')
    return { success: true }
  } catch (error: any) {
    console.error('Exception in createInstitution:', error)
    return { error: error.message || 'Error desconocido' }
  }
}

// --- ACTUALIZAR INSTITUCIÓN ---
export async function updateInstitution(id: string, formData: FormData) {
  try {
    await requireAdmin()

    const name = formData.get('name') as string
    const nit_or_code = formData.get('nit_or_code') as string
    const director_id_raw = formData.get('director_id') as string
    const director_id = director_id_raw ? director_id_raw : null

    if (!name || !nit_or_code) {
      return { error: 'El nombre y el NIT o Código son obligatorios' }
    }

    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('institutions')
      .update({
        name,
        nit_or_code,
        director_id
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating institution:', updateError)
      if (updateError.code === '23505') { // Postgres Unique Violation
        return { error: 'Ya existe otra institución con este NIT o Código' }
      }
      return { error: 'Error al actualizar la institución' }
    }

    revalidatePath('/admin/instituciones')
    return { success: true }
  } catch (error: any) {
    console.error('Exception in updateInstitution:', error)
    return { error: error.message || 'Error desconocido' }
  }
}

// --- VINCULAR ESTUDIANTE A INSTITUCIÓN ---
export async function linkStudentToInstitution(studentId: string, institutionId: string) {
  try {
    await requireAdmin()

    if (!studentId || !institutionId) {
      return { error: 'Se requieren tanto el estudiante como la institución' }
    }

    const adminClient = createAdminClient()

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ institution_id: institutionId })
      .eq('id', studentId)

    if (updateError) {
      console.error('Error linking student:', updateError)
      return { error: `Error al vincular el estudiante: ${updateError.message}` }
    }

    revalidatePath(`/admin/instituciones/${institutionId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Exception in linkStudentToInstitution:', error)
    return { error: error.message || 'Error desconocido' }
  }
}
