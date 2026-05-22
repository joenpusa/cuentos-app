'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/services/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsed = loginSchema.safeParse({ email, password })

  if (!parsed.success) {
    return {
      error: 'Por favor, revisa los datos ingresados',
      fields: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: 'Credenciales inválidas',
    }
  }

  // Obtener perfil para redirigir
  const { data: profile } = await getUserProfile(data.user.id)

  if (!profile) {
    return {
      error: 'No se encontró el perfil de usuario',
    }
  }

  revalidatePath('/', 'layout')

  // Redirigir según rol
  switch (profile.role) {
    case 'admin':
      redirect('/admin')
      break
    case 'estudiante':
      redirect('/estudiante')
      break
    case 'padre':
      redirect('/padre')
      break
    case 'director':
      redirect('/director')
      break
    case 'profesor':
      redirect('/profesor')
      break
    default:
      redirect('/')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
