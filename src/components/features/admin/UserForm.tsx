'use client'

import { useState, useEffect } from 'react'
import { createUser, updateUser } from '@/app/(dashboard)/admin/usuarios/actions'
import { createClient } from '@/lib/supabase/client'

export interface UserData {
  id: string
  name: string
  email: string
  role: string
  parent_id?: string | null
  created_at?: string
}

interface UserFormProps {
  initialData?: UserData | null
  onSuccess: () => void
  onCancel: () => void
}

interface Parent {
  id: string
  full_name: string | null
  email: string | null
}

export default function UserForm({ initialData, onSuccess, onCancel }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedRole, setSelectedRole] = useState(initialData?.role || '')
  const [parents, setParents] = useState<Parent[]>([])
  const [isLoadingParents, setIsLoadingParents] = useState(false)

  useEffect(() => {
    async function fetchParents() {
      setIsLoadingParents(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'padre')
        
      if (!error && data) {
        setParents(data)
      }
      setIsLoadingParents(false)
    }

    if (selectedRole === 'estudiante') {
      fetchParents()
    }
  }, [selectedRole])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = initialData
        ? await updateUser(initialData.id, formData)
        : await createUser(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        onSuccess()
      }
    } catch (err) {
      setError('Error inesperado al guardar el usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg font-medium border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
          Nombre Completo
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={initialData?.name}
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          placeholder="Ej: Juan Pérez"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
          Correo Electrónico
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          defaultValue={initialData?.email}
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          placeholder="juan@ejemplo.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
          Contraseña {initialData && <span className="text-slate-400 font-normal">(Opcional)</span>}
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required={!initialData}
          minLength={6}
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          placeholder={initialData ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"}
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-1">
          Rol del Usuario
        </label>
        <select
          id="role"
          name="role"
          required
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all cursor-pointer"
        >
          <option value="">Selecciona un rol...</option>
          <option value="estudiante">Estudiante</option>
          <option value="padre">Padre</option>
          <option value="profesor">Profesor</option>
          <option value="director">Director</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      {selectedRole === 'estudiante' && (
        <div className="animate-fade-in-down">
          <label htmlFor="parent_id" className="block text-sm font-semibold text-slate-700 mb-1">
            Padre / Tutor (Opcional)
          </label>
          <select
            id="parent_id"
            name="parent_id"
            disabled={isLoadingParents}
            defaultValue={initialData?.parent_id || ''}
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">
              {isLoadingParents ? 'Cargando padres...' : 'Ninguno (Sin asignar)'}
            </option>
            {parents.map(p => (
              <option key={p.id} value={p.id}>
                {p.full_name || p.email?.split('@')[0] || 'Padre sin nombre'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Miembro')}
        </button>
      </div>
    </form>
  )
}
