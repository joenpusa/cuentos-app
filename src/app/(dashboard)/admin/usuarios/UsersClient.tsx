'use client'

import { useState } from 'react'
import UserForm from '@/components/features/admin/UserForm'
import { deleteUser } from '@/app/(dashboard)/admin/usuarios/actions'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  parent_id?: string | null
  created_at: string
}

interface UsersClientProps {
  users: UserData[]
}

export default function UsersClient({ users }: UsersClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleSuccess = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const openEditModal = (user: UserData) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${name}? Esta acción no se puede deshacer.`)) {
      return
    }

    setIsDeleting(id)
    try {
      const result = await deleteUser(id)
      if (result.error) {
        alert(result.error)
      }
    } catch (e) {
      alert('Error inesperado al eliminar')
    } finally {
      setIsDeleting(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold uppercase tracking-wider">Admin</span>
      case 'director':
        return <span className="px-3 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-xs font-bold uppercase tracking-wider">Director</span>
      case 'profesor':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">Profesor</span>
      case 'padre':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">Padre</span>
      case 'estudiante':
      default:
        return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">Estudiante</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header y Botón */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Usuarios</h1>
          <p className="text-slate-500">Gestiona los perfiles de la familia en Escuela en Casa.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
        >
          + Añadir Miembro
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-slate-700">No hay usuarios</h3>
            <p className="text-slate-500 mt-2">Comienza añadiendo un nuevo miembro a la familia.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase">Nombre</th>
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase">Email</th>
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase">Rol</th>
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase hidden md:table-cell">Registro</th>
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="p-5 font-semibold text-slate-800">{user.name}</td>
                    <td className="p-5 text-slate-600">{user.email}</td>
                    <td className="p-5">{getRoleBadge(user.role)}</td>
                    <td className="p-5 text-slate-500 text-sm hidden md:table-cell">
                      {new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={isDeleting === user.id}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                        title="Eliminar usuario"
                      >
                        {isDeleting === user.id ? '...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 transform scale-100 slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                {editingUser ? 'Editar Miembro' : 'Nuevo Miembro'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingUser(null)
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <UserForm 
              initialData={editingUser}
              onSuccess={handleSuccess} 
              onCancel={() => {
                setIsModalOpen(false)
                setEditingUser(null)
              }} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
