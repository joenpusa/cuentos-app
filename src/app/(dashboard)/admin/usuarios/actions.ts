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

// --- CREAR USUARIO ---
export async function createUser(formData: FormData) {
  try {
    await requireAdmin()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    if (!name || !email || !password || !role) {
      return { error: 'Todos los campos son obligatorios' }
    }

    const adminClient = createAdminClient()

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar el email
      user_metadata: {
        full_name: name
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return { error: `Error al crear usuario en Auth: ${authError.message}` }
    }

    const userId = authData.user.id

    const parent_id = formData.get('parent_id') as string

    // 2. Insertar en profiles
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: userId,
        role: role,
        full_name: name,
        email: email,
        parent_id: (role === 'estudiante' && parent_id) ? parent_id : null
      })

    if (profileError) {
      console.error('Error inserting profile:', profileError)
      // Rollback (borrar el usuario recién creado si falla el perfil)
      await adminClient.auth.admin.deleteUser(userId)
      return { error: 'Error al asignar el rol del usuario' }
    }

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (error: any) {
    console.error('Exception in createUser:', error)
    return { error: error.message || 'Error desconocido' }
  }
}

// --- ELIMINAR USUARIO ---
export async function deleteUser(userId: string) {
  try {
    const currentUser = await requireAdmin()

    if (currentUser.id === userId) {
      return { error: 'No puedes eliminar tu propia cuenta' }
    }

    const adminClient = createAdminClient()

    // Borrar de auth.users también borrará en cascada de public.profiles si las FK están configuradas correctamente.
    // Para asegurar, lo borramos de ambas.
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      // Continuamos de todos modos
    }

    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return { error: `Error al eliminar usuario en Auth: ${authError.message}` }
    }

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (error: any) {
    console.error('Exception in deleteUser:', error)
    return { error: error.message || 'Error desconocido' }
  }
}
