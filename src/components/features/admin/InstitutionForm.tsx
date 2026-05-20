'use client'

import { useState, useEffect } from 'react'
import { createInstitution, updateInstitution } from '@/app/(dashboard)/admin/instituciones/actions'
import { createClient } from '@/lib/supabase/client'

export interface InstitutionData {
  id: string
  name: string
  nit_or_code: string
  director_id?: string | null
  created_at: string
}

interface InstitutionFormProps {
  initialData?: InstitutionData | null
  onSuccess: () => void
  onCancel: () => void
}

interface Director {
  id: string
  full_name: string | null
  email: string | null
}

export default function InstitutionForm({ initialData, onSuccess, onCancel }: InstitutionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [directors, setDirectors] = useState<Director[]>([])
  const [isLoadingDirectors, setIsLoadingDirectors] = useState(false)

  useEffect(() => {
    async function fetchDirectors() {
      setIsLoadingDirectors(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'director')
        
      if (!error && data) {
        setDirectors(data)
      }
      setIsLoadingDirectors(false)
    }

    fetchDirectors()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = initialData 
        ? await updateInstitution(initialData.id, formData)
        : await createInstitution(formData)
        
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        onSuccess()
      }
    } catch (err) {
      setError('Error inesperado al guardar la institución')
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
          Nombre de la Institución
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={initialData?.name}
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          placeholder="Ej: Colegio San José"
        />
      </div>

      <div>
        <label htmlFor="nit_or_code" className="block text-sm font-semibold text-slate-700 mb-1">
          NIT o Código Único
        </label>
        <input
          type="text"
          id="nit_or_code"
          name="nit_or_code"
          required
          defaultValue={initialData?.nit_or_code}
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          placeholder="Ej: 900.123.456-7"
        />
        <p className="text-xs text-slate-500 mt-1">Este identificador debe ser único en el sistema.</p>
      </div>

      <div>
        <label htmlFor="director_id" className="block text-sm font-semibold text-slate-700 mb-1">
          Director (Opcional)
        </label>
        <select
          id="director_id"
          name="director_id"
          disabled={isLoadingDirectors}
          defaultValue={initialData?.director_id || ''}
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">
            {isLoadingDirectors ? 'Cargando directores...' : 'Ninguno (Sin asignar)'}
          </option>
          {directors.map(d => (
            <option key={d.id} value={d.id}>
              {d.full_name || d.email?.split('@')[0] || 'Director sin nombre'}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">Usuarios con rol 'director'.</p>
      </div>

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
          {isSubmitting ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Institución')}
        </button>
      </div>
    </form>
  )
}
