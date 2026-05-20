'use client'

import { useState } from 'react'
import Link from 'next/link'
import InstitutionForm from '@/components/features/admin/InstitutionForm'

interface InstitutionData {
  id: string
  name: string
  nit_or_code: string
  director_id?: string | null
  created_at: string
}

interface InstitutionsClientProps {
  institutions: InstitutionData[]
}

export default function InstitutionsClient({ institutions }: InstitutionsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInstitution, setEditingInstitution] = useState<InstitutionData | null>(null)

  const handleSuccess = () => {
    setIsModalOpen(false)
    setEditingInstitution(null)
  }

  const openCreateModal = () => {
    setEditingInstitution(null)
    setIsModalOpen(true)
  }

  const openEditModal = (inst: InstitutionData) => {
    setEditingInstitution(inst)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header y Botón */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Instituciones</h1>
          <p className="text-slate-500">Gestiona los colegios e instituciones asociadas.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
        >
          + Añadir Institución
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        {institutions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">🏫</div>
            <h3 className="text-xl font-bold text-slate-700">No hay instituciones</h3>
            <p className="text-slate-500 mt-2">Comienza añadiendo un nuevo colegio al sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase">Nombre</th>
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase">NIT / Código</th>
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase hidden md:table-cell">Registro</th>
                  <th className="p-5 text-sm font-bold text-slate-500 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst) => (
                  <tr key={inst.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="p-5 font-semibold text-slate-800">{inst.name}</td>
                    <td className="p-5 text-slate-600 font-mono text-sm">{inst.nit_or_code}</td>
                    <td className="p-5 text-slate-500 text-sm hidden md:table-cell">
                      {new Date(inst.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2">
                      <Link
                        href={`/admin/instituciones/${inst.id}`}
                        className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Ver Detalles
                      </Link>
                      <button
                        onClick={() => openEditModal(inst)}
                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Editar
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
                {editingInstitution ? 'Editar Institución' : 'Nueva Institución'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingInstitution(null)
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <InstitutionForm 
              initialData={editingInstitution}
              onSuccess={handleSuccess} 
              onCancel={() => {
                setIsModalOpen(false)
                setEditingInstitution(null)
              }} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
