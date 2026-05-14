'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitQuiz(storyId: string, responses: Record<string, string>) {
  const supabase = await createClient()

  // 1. Validar sesión y rol
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No estás autenticado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'estudiante') {
    return { error: 'No autorizado. Solo los estudiantes pueden enviar respuestas.' }
  }

  // 2. Verificar intentos (< 2)
  const { count, error: countError } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .eq('story_id', storyId)

  if (countError) {
    console.error('Error verificando intentos:', countError)
    return { error: 'Hubo un error al verificar tus intentos anteriores.' }
  }

  if (count !== null && count >= 2) {
    return { error: 'Ya has alcanzado el límite de 2 intentos para este cuento.' }
  }

  // 3. Obtener el cuento para calcular el puntaje de forma segura en el servidor
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('questions')
    .eq('id', storyId)
    .single()

  if (storyError || !story) {
    return { error: 'Cuento no encontrado.' }
  }

  // 4. Calcular el puntaje
  let score = 5
  const questions = story.questions || []

  for (const q of questions) {
    if (q.tipo === 'opcion_multiple') {
      const userAnswer = responses[q.id]
      if (userAnswer !== q.correcta) {
        score -= 1
      }
    }
    // Preguntas abiertas no restan puntos. 
    // Asumimos que la validación de longitud (min 30 caracteres) se hizo en cliente,
    // pero idealmente deberíamos re-validarlo aquí.
    if (q.tipo === 'abierta') {
      const userAnswer = responses[q.id] || ''
      if (userAnswer.trim().length < 30) {
        return { error: `La pregunta "${q.pregunta}" requiere al menos 30 caracteres.` }
      }
    }
  }

  // Clamp the score to a minimum of 0
  score = Math.max(0, score)

  // 5. Guardar en activities
  const { error: insertError } = await supabase
    .from('activities')
    .insert({
      student_id: user.id,
      story_id: storyId,
      responses: responses,
      score: score,
    })

  if (insertError) {
    console.error('Error insertando actividad:', insertError)
    return { error: 'Hubo un error al guardar tu resultado.' }
  }

  // Revalidar la página actual para que refleje el nuevo conteo de intentos
  revalidatePath(`/estudiante/cuentos/${storyId}`)

  return { success: true, score }
}
