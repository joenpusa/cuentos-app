import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // updateSession maneja la renovación de cookies y devuelve la respuesta, el usuario y el cliente
  const { supabaseResponse, user, supabase } = await updateSession(request)

  const path = request.nextUrl.pathname

  // Rutas protegidas según el rol
  const protectedRoutes = {
    admin: '/admin',
    estudiante: '/estudiante',
    padre: '/padre',
  }

  const isProtectedRoute = Object.values(protectedRoutes).some(route => path.startsWith(route))

  if (isProtectedRoute) {
    if (!user) {
      // Si no hay sesión, redirigir al login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Si hay sesión, validamos el rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const role = profile.role?.trim()

    // Validar acceso según el rol
    if (path.startsWith(protectedRoutes.admin) && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    if (path.startsWith(protectedRoutes.estudiante) && role !== 'estudiante') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (path.startsWith(protectedRoutes.padre) && role !== 'padre') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Si el usuario está logueado y trata de ir al login o a la raíz (/), redirigirlo a su panel
  if (user && (path === '/' || path.startsWith('/login'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile && profile.role) {
      const role = profile.role.trim()
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
