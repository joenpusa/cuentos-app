import { LogoutButton } from '@/components/features/auth/LogoutButton'
import { getSession } from '@/services/auth'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export default async function AdminDashboard() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">Cuentos Mágicos - Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">{session?.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h2>
            <p className="text-gray-600">Gestiona los cuentos y usuarios desde aquí.</p>
          </div>
          
          <Link 
            href="/admin/cuentos/nuevo" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-md"
          >
            <PlusCircle size={20} />
            Crear Nuevo Cuento
          </Link>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cuentos recientes</h3>
            <p className="text-gray-500 mb-6">Comienza creando tu primera historia interactiva.</p>
            <Link 
              href="/admin/cuentos/nuevo" 
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              + Agregar cuento ahora
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
