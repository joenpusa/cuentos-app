'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createCourse } from '@/app/(dashboard)/director/cursos/actions'

interface Teacher {
  id: string
  full_name: string | null
  email: string | null
}

interface CourseFormProps {
  institutionId: string
  teachers: Teacher[]
  onSuccess: () => void
  onCancel: () => void
}

export default function CourseForm({ institutionId, teachers, onSuccess, onCancel }: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createCourse(formData, institutionId)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        onSuccess()
      }
    } catch (err) {
      setError('Error inesperado al crear el curso')
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
          Nombre del Curso / Aula
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          placeholder="Ej: Grado 302"
        />
      </div>

      <div className="animate-fade-in-down">
        <label htmlFor="teacher_id" className="block text-sm font-semibold text-slate-700 mb-1">
          Profesor Líder (Opcional)
        </label>
        <select
          id="teacher_id"
          name="teacher_id"
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">Ninguno (Sin asignar)</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>
              {t.full_name || t.email?.split('@')[0] || 'Profesor sin nombre'}
            </option>
          ))}
        </select>
        {teachers.length === 0 && (
          <p className="text-xs text-amber-600 mt-2 font-medium">
            No hay perfiles con rol "profesor" asociados a esta institución. Debes crear y asociar un profesor primero en la sección de usuarios.
          </p>
        )}
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
          {isSubmitting ? 'Guardando...' : 'Crear Curso'}
        </button>
      </div>
    </form>
  )
}
