'use client'

import { useState } from 'react'
import Link from 'next/link'
import StudentLinkModal from './StudentLinkModal'

interface Institution {
  id: string
  name: string
  nit_or_code: string
}

interface Student {
  id: string
  name: string
  email: string
  course_id: string | null
  course_name: string
}

interface Props {
  institution: Institution
  students: Student[]
}

export default function InstitutionDetailsClient({ institution, students }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/admin/instituciones" 
              className="text-slate-400 hover:text-indigo-600 transition-colors"
            >
              ← Volver
            </Link>
          </div>
          <h1 className="text-3xl font-black text-slate-800">{institution.name}</h1>
          <p className="text-slate-500 font-mono text-sm">NIT/Código: {institution.nit_or_code}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
        >
          + Asociar Estudiante
        </button>
      </div>

      {/* Tabla de Estudiantes */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Estudiantes Inscritos</h2>
        </div>
        
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">👨‍🎓</div>
            <h3 className="text-xl font-bold text-slate-700">Sin estudiantes</h3>
            <p className="text-slate-500 mt-2">No hay estudiantes asociados a esta institución aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase">Nombre</th>
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase">Email</th>
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase">Curso</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-5 font-semibold text-slate-800">{student.name}</td>
                    <td className="p-5 text-slate-600 text-sm">{student.email}</td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        {student.course_name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <StudentLinkModal 
          institutionId={institution.id} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  )
}
