import { LogoutButton } from '@/components/features/auth/LogoutButton'
import { getSession } from '@/services/auth'

export default async function EstudianteDashboard() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">Cuentos Mágicos - Estudiante</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">{session?.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Mis Cuentos</h2>
        <p className="text-gray-600 mb-8">¡Hola! Has iniciado sesión correctamente. Prepárate para leer aventuras increíbles.</p>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 italic">Contenido de los cuentos en construcción...</p>
        </div>
      </main>
    </div>
  )
}
