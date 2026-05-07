import { LoginForm } from '@/components/features/auth/LoginForm'
import { getSession, getUserProfile } from '@/services/auth'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/features/auth/LogoutButton'

export default async function LoginPage() {
  const session = await getSession()
  
  if (session) {
    const { data: profile, error } = await getUserProfile(session.id)
    if (profile && profile.role) {
      redirect(`/${profile.role.trim()}`)
    } else {
      // Romper el bucle de redirección si el perfil no existe
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full border border-red-100 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error de Perfil</h2>
            <p className="text-gray-700 mb-2">
              Has iniciado sesión correctamente, pero hubo un problema al leer tu perfil en la base de datos.
            </p>
            {error && (
              <div className="bg-red-50 p-3 rounded text-sm text-red-800 text-left mb-6 font-mono break-all overflow-auto max-h-40">
                <strong>Detalles del error:</strong><br />
                {JSON.stringify(error, null, 2)}
              </div>
            )}
            {!error && (
              <p className="text-gray-500 mb-6 text-sm">
                Asegúrate de que el ID del usuario en <code>auth.users</code> coincide exactamente con el ID en tu tabla <code>profiles</code>.
              </p>
            )}
            <div className="flex justify-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
