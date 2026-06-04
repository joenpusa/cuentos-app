'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// --- HELPER DE AUTORIZACIÓN ---
async function requireAdminOrDirector() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'director')) {
    throw new Error('No autorizado')
  }

  let institutionId = null
  if (profile.role === 'director') {
    const { data: institution } = await supabase
      .from('institutions')
      .select('id')
      .eq('director_id', user.id)
      .single()
      
    if (!institution) {
      throw new Error('No tienes una institución asignada')
    }
    institutionId = institution.id
  }

  return { user, role: profile.role, institutionId }
}

// --- CREAR USUARIO ---
export async function createUser(formData: FormData) {
  try {
    const { role: currentUserRole, institutionId } = await requireAdminOrDirector()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    if (!name || !email || !password || !role) {
      return { error: 'Todos los campos son obligatorios' }
    }

    // Restricciones para directores
    if (currentUserRole === 'director' && (role === 'admin' || role === 'director')) {
      return { error: 'Los directores no pueden crear administradores ni otros directores' }
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
        parent_id: (role === 'estudiante' && parent_id) ? parent_id : null,
        institution_id: currentUserRole === 'director' ? institutionId : null
      })

    if (profileError) {
      console.error('Error inserting profile:', profileError)
      // Rollback (borrar el usuario recién creado si falla el perfil)
      await adminClient.auth.admin.deleteUser(userId)
      return { error: 'Error al asignar el rol del usuario' }
    }

    revalidatePath('/admin/usuarios')
    revalidatePath('/director/usuarios')
    return { success: true }
  } catch (error: any) {
    console.error('Exception in createUser:', error)
    return { error: error.message || 'Error desconocido' }
  }
}

// --- ELIMINAR USUARIO ---
export async function deleteUser(userId: string) {
  try {
    const { user: currentUser, role: currentUserRole, institutionId } = await requireAdminOrDirector()

    if (currentUser.id === userId) {
      return { error: 'No puedes eliminar tu propia cuenta' }
    }

    const adminClient = createAdminClient()

    // Si es director, validar que el usuario a eliminar pertenezca a su institución
    if (currentUserRole === 'director') {
      const { data: targetProfile } = await adminClient
        .from('profiles')
        .select('institution_id')
        .eq('id', userId)
        .single()
        
      if (!targetProfile || targetProfile.institution_id !== institutionId) {
        return { error: 'No tienes permiso para eliminar este usuario' }
      }
    }

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
    revalidatePath('/director/usuarios')
    return { success: true }
  } catch (error: any) {
    console.error('Exception in deleteUser:', error)
    return { error: error.message || 'Error desconocido' }
  }
}

// --- ACTUALIZAR USUARIO ---
export async function updateUser(userId: string, formData: FormData) {
  try {
    const { role: currentUserRole, institutionId } = await requireAdminOrDirector()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string
    const parent_id = formData.get('parent_id') as string

    if (!name || !email || !role) {
      return { error: 'Nombre, email y rol son obligatorios' }
    }

    // Restricciones para directores
    if (currentUserRole === 'director' && (role === 'admin' || role === 'director')) {
      return { error: 'Los directores no pueden asignar roles de administrador ni director' }
    }

    const adminClient = createAdminClient()

    // Si es director, validar que el usuario a editar pertenezca a su institución
    if (currentUserRole === 'director') {
      const { data: targetProfile } = await adminClient
        .from('profiles')
        .select('institution_id')
        .eq('id', userId)
        .single()
        
      if (!targetProfile || targetProfile.institution_id !== institutionId) {
        return { error: 'No tienes permiso para editar este usuario' }
      }
    }

    // 1. Actualizar usuario en Auth
    const authUpdatePayload: any = {
      email,
      user_metadata: {
        full_name: name
      }
    }
    
    // Solo actualizar contraseña si se proporcionó una nueva
    if (password && password.trim() !== '') {
      authUpdatePayload.password = password
    }

    const { error: authError } = await adminClient.auth.admin.updateUserById(
      userId,
      authUpdatePayload
    )

    if (authError) {
      console.error('Error updating auth user:', authError)
      return { error: `Error al actualizar usuario en Auth: ${authError.message}` }
    }

    // 2. Actualizar en profiles
    const updatePayload: any = {
      role: role,
      full_name: name,
      email: email,
      parent_id: (role === 'estudiante' && parent_id) ? parent_id : null
    }

    if (currentUserRole === 'director') {
      updatePayload.institution_id = institutionId
    }

    const { error: profileError } = await adminClient
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return { error: 'Error al actualizar el perfil del usuario' }
    }

    revalidatePath('/admin/usuarios')
    revalidatePath('/director/usuarios')
    return { success: true }
  } catch (error: any) {
    console.error('Exception in updateUser:', error)
    return { error: error.message || 'Error desconocido' }
  }
}

// --- CARGA MASIVA DE USUARIOS ---
export async function bulkUploadUsers(formData: FormData) {
  try {
    const { role: currentUserRole, institutionId } = await requireAdminOrDirector()
    
    const role = formData.get('role') as string
    const file = formData.get('file') as File

    if (!role || !file) {
      return { error: 'El rol y el archivo son obligatorios' }
    }

    if (role !== 'estudiante' && role !== 'padre') {
      return { error: 'El rol debe ser estudiante o padre' }
    }

    const adminClient = createAdminClient()
    const textContent = await file.text()
    
    // Parseo manual básico de CSV (para casos simples donde nombre,email)
    const lines = textContent.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    // Remueve cabeceras si existen y son reconocibles
    if (lines.length > 0 && lines[0].toLowerCase().includes('nombre') && lines[0].toLowerCase().includes('email')) {
      lines.shift()
    }

    let successCount = 0
    const createdUsers = []
    const errors = []

    for (const line of lines) {
      // Separar por comas. Si hay más de dos columnas, ignoramos el resto por ahora.
      const parts = line.split(',')
      if (parts.length < 2) {
        errors.push({ line, reason: 'Formato inválido (se esperaba nombre,email)' })
        continue
      }

      const name = parts[0].trim()
      const email = parts[1].trim()

      if (!name || !email) {
        errors.push({ line, reason: 'Falta nombre o email' })
        continue
      }

      // Autogenerar PIN de 6 dígitos
      const generatedPin = Math.floor(100000 + Math.random() * 900000).toString()

      // 1. Intentar crear en Auth
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password: generatedPin,
        email_confirm: true,
        user_metadata: {
          full_name: name
        }
      })

      if (authError) {
        errors.push({ email, reason: authError.message })
        continue
      }

      const userId = authData.user.id

      // 2. Insertar en profiles
      const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
          id: userId,
          role: role,
          full_name: name,
          email: email,
          institution_id: currentUserRole === 'director' ? institutionId : null
        })

      if (profileError) {
        await adminClient.auth.admin.deleteUser(userId)
        errors.push({ email, reason: 'Error al registrar perfil de usuario en base de datos' })
        continue
      }

      successCount++
      createdUsers.push({
        name,
        email,
        pin: generatedPin
      })
    }

    revalidatePath('/admin/usuarios')
    revalidatePath('/director/usuarios')
    
    return { 
      success: true, 
      report: {
        successCount,
        createdUsers,
        errors
      } 
    }
  } catch (error: any) {
    console.error('Exception in bulkUploadUsers:', error)
    return { error: error.message || 'Error desconocido durante la carga masiva' }
  }
}
