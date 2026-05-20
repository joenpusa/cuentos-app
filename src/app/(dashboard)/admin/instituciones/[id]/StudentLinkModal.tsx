'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { linkStudentToInstitution } from '@/app/(dashboard)/admin/instituciones/actions'

interface StudentLinkModalProps {
  institutionId: string
  onClose: () => void
}

interface OrphanStudent {
  id: string
  name: string
  email: string
}

export default function StudentLinkModal({ institutionId, onClose }: StudentLinkModalProps) {
  const [students, setStudents] = useState<OrphanStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrphans() {
      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'estudiante')
        .is('institution_id', null)
        
      if (!error && data) {
        setStudents(data.map((s: any) => ({
          id: s.id,
          name: s.full_name || s.email?.split('@')[0] || 'Sin nombre',
          email: s.email || 'Sin correo'
        })))
      }
      setIsLoading(false)
    }

    fetchOrphans()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    setIsSubmitting(true)
    setError(null)

    const result = await linkStudentToInstitution(selectedStudent, institutionId)
    
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 transform scale-100 slide-in-from-bottom-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">Asociar Estudiante</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>
        
        {isLoading ? (
          <div className="py-8 text-center text-slate-500">Cargando estudiantes disponibles...</div>
        ) : students.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            No hay estudiantes "huérfanos" disponibles en el sistema.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg font-medium border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="student" className="block text-sm font-semibold text-slate-700 mb-1">
                Selecciona un Estudiante
              </label>
              <select
                id="student"
                required
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all cursor-pointer"
              >
                <option value="">-- Seleccionar --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Solo se muestran los estudiantes que no pertenecen a ninguna institución.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedStudent}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Guardando...' : 'Asociar Estudiante'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
