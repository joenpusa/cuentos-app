import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserProfile } from '@/services/auth'

export interface ProgressSummary {
  totalMedals: number
  completedStories: number
  recentActivities: {
    id: string
    story_id: string
    score: number
    created_at: string
    stories: {
      title: string
      image_url: string | null
    }
  }[]
}

export async function getStudentProgress(studentId: string): Promise<ProgressSummary> {
  const supabase = await createClient()

  // 1. Validar Autorización
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await getUserProfile(user.id)
  if (!profile) throw new Error('Perfil no encontrado')

  // El usuario puede ver este progreso si:
  // - Es un admin.
  // - Es el estudiante dueño de los datos.
  // - Es un padre cuyo parent_id coincide con el perfil del estudiante.
  let isAuthorized = false

  if (profile.role === 'admin') {
    isAuthorized = true
  } else if (profile.role === 'estudiante' && user.id === studentId) {
    isAuthorized = true
  } else if (profile.role === 'padre') {
    // Validar si el studentId pertenece a este padre
    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('parent_id')
      .eq('id', studentId)
      .single()

    // Requiere que studentProfile.parent_id esté presente en la BD
    if (studentProfile && (studentProfile as any).parent_id === user.id) {
      isAuthorized = true
    }
  }

  if (!isAuthorized) {
    throw new Error('No autorizado para ver el progreso de este estudiante')
  }

  // 2. Fetch Data

  const adminClient = createAdminClient()

  // Total Medals
  const { data: allActivities, error: activitiesError } = await adminClient
    .from('activities')
    .select('score, story_id')
    .eq('student_id', studentId)

  if (activitiesError) {
    throw new Error('Error al cargar actividades')
  }

  let totalMedals = 0
  const uniqueStories = new Set<string>()

  if (allActivities) {
    for (const act of allActivities) {
      totalMedals += (act.score || 0)
      uniqueStories.add(act.story_id)
    }
  }

  // Recent History (últimos 5)
  const { data: recent, error: recentError } = await adminClient
    .from('activities')
    .select(`
      id, 
      story_id, 
      score, 
      created_at,
      stories (title, image_url)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (recentError) {
    console.error('Error fetching recent activities', recentError)
  }

  return {
    totalMedals,
    completedStories: uniqueStories.size,
    recentActivities: (recent as any[]) || []
  }
}
