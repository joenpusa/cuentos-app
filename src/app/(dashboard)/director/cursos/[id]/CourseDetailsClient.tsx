'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserPlus, X } from 'lucide-react'
import { enrollStudent, removeStudentFromCourse } from '../actions'

interface Student {
  id: string
  full_name: string | null
  email: string | null
}

interface CourseDetailsClientProps {
  courseId: string
  courseName: string
  teacherName: string
  enrolledStudents: Student[]
  availableStudents: Student[]
}

export default function CourseDetailsClient({
  courseId,
  courseName,
  teacherName,
  enrolledStudents,
  availableStudents,
}: CourseDetailsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingStudentId, setProcessingStudentId] = useState<string | null>(null)

  const handleEnroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedStudent) {
      setError('Por favor, selecciona un estudiante')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await enrollStudent(courseId, selectedStudent)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setIsModalOpen(false)
      setSelectedStudent('')
      setIsSubmitting(false)
    }
  }

  const handleRemove = async (studentId: string, studentName: string) => {
    if (!confirm(`¿Estás seguro de que deseas desvincular a ${studentName} de este curso?`)) {
      return
    }

    setProcessingStudentId(studentId)
    const result = await removeStudentFromCourse(studentId, courseId)

    if (result.error) {
      alert(result.error)
    }
    setProcessingStudentId(null)
  }

  return (
    <div className="space-y-6">
      {/* Botón de regreso */}
      <div>
        <Link 
          href="/director/cursos" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a Mis Cursos
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-1">{courseName}</h1>
          <p className="text-slate-500">
            Profesor Líder: <span className="font-semibold text-slate-700">{teacherName || 'Sin asignar'}</span>
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 flex items-center gap-2"
        >
          <UserPlus size={18} />
          Inscribir Alumno
        </button>
      </div>

      {/* Panel de Alumnos Inscritos */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Alumnos Inscritos ({enrolledStudents.length})</h2>
        </div>
        
        {enrolledStudents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-slate-700">Aún no hay alumnos</h3>
            <p className="text-slate-500 mt-2">Agrega estudiantes al salón para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase">Nombre</th>
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase">Email</th>
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map((student) => (
                  <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="p-5 font-semibold text-slate-800">
                      {student.full_name || 'Sin nombre'}
                    </td>
                    <td className="p-5 text-slate-600">
                      {student.email || 'Sin email'}
                    </td>
                    <td className="p-5 text-right flex justify-end">
                      <button
                        onClick={() => handleRemove(student.id, student.full_name || 'Estudiante')}
                        disabled={processingStudentId === student.id}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                        title="Desvincular del curso"
                      >
                        {processingStudentId === student.id ? '...' : <><X size={16} /> Desvincular</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Inscripción */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 transform scale-100 slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">Inscribir Alumno</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedStudent('')
                  setError(null)
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEnroll} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="studentSelect" className="block text-sm font-bold text-slate-700">
                  Selecciona un estudiante
                </label>
                {availableStudents.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                    No hay estudiantes disponibles para inscribir. Todos los estudiantes de tu institución ya están asignados a un curso, o necesitas crear nuevos estudiantes.
                  </div>
                ) : (
                  <select
                    id="studentSelect"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <option value="">-- Elige un estudiante --</option>
                    {availableStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.full_name || student.email?.split('@')[0] || 'Estudiante sin nombre'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableStudents.length === 0 || !selectedStudent}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Inscribiendo...' : 'Guardar Inscripción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
