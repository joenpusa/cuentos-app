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

// --- INSCRIBIR ESTUDIANTE A CURSO ---
export async function enrollStudent(courseId: string, studentId: string) {
  try {
    const adminClient = createAdminClient()

    // 1. Obtener información del curso para validar la institución
    const { data: course } = await adminClient
      .from('courses')
      .select('institution_id')
      .eq('id', courseId)
      .single()

    if (!course) {
      return { error: 'El curso no existe' }
    }

    // 2. Validar que el usuario en sesión es director de la institución de este curso
    await requireDirectorOfInstitution(course.institution_id)

    // 3. Validar que el estudiante pertenece a la misma institución y no tiene curso asignado
    const { data: student } = await adminClient
      .from('profiles')
      .select('institution_id, role, course_id')
      .eq('id', studentId)
      .single()

    if (!student || student.role !== 'estudiante') {
      return { error: 'El perfil seleccionado no es válido o no es un estudiante' }
    }

    if (student.institution_id !== course.institution_id) {
      return { error: 'El estudiante no pertenece a la institución de este curso' }
    }

    if (student.course_id) {
      return { error: 'El estudiante ya está inscrito en otro curso' }
    }

    // 4. Actualizar el curso del estudiante
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ course_id: courseId })
      .eq('id', studentId)

    if (updateError) {
      console.error('Error al inscribir estudiante:', updateError)
      return { error: 'Error al inscribir el estudiante en la base de datos' }
    }

    revalidatePath(`/director/cursos/${courseId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Exception in enrollStudent:', error)
    return { error: error.message || 'Error desconocido al inscribir estudiante' }
  }
}

// --- DESVINCULAR ESTUDIANTE DE CURSO ---
export async function removeStudentFromCourse(studentId: string, courseId: string) {
  try {
    const adminClient = createAdminClient()

    // 1. Obtener información del curso para validar la institución
    const { data: course } = await adminClient
      .from('courses')
      .select('institution_id')
      .eq('id', courseId)
      .single()

    if (!course) {
      return { error: 'El curso no existe' }
    }

    // 2. Validar que el usuario en sesión es director de la institución de este curso
    await requireDirectorOfInstitution(course.institution_id)

    // 3. Validar que el estudiante pertenece al curso actual
    const { data: student } = await adminClient
      .from('profiles')
      .select('course_id')
      .eq('id', studentId)
      .single()

    if (!student || student.course_id !== courseId) {
      return { error: 'El estudiante no pertenece a este curso' }
    }

    // 4. Actualizar el curso del estudiante a NULL
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ course_id: null })
      .eq('id', studentId)

    if (updateError) {
      console.error('Error al desvincular estudiante:', updateError)
      return { error: 'Error al desvincular el estudiante en la base de datos' }
    }

    revalidatePath(`/director/cursos/${courseId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Exception in removeStudentFromCourse:', error)
    return { error: error.message || 'Error desconocido al desvincular estudiante' }
  }
}
