'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

interface Student {
  id: string
  email: string | null
}

interface StudentSelectorProps {
  students: Student[]
  selectedId: string
  showSearch?: boolean
}

export default function StudentSelector({ students, selectedId, showSearch = false }: StudentSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStudents = students.filter(student => {
    const displayName = student.email ? student.email.split('@')[0] : 'Sin Nombre'
    return displayName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('studentId', id)
    router.push(`/reportes?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 w-full mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        
        {showSearch && (
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar estudiante..."
              className="pl-10 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <div className="w-full md:flex-1">
          {showSearch ? (
            <select
              value={selectedId}
              onChange={(e) => handleSelect(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
            >
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.email ? student.email.split('@')[0] : 'Sin Nombre'}
                  </option>
                ))
              ) : (
                <option value="" disabled>No se encontraron resultados</option>
              )}
            </select>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {filteredStudents.map((child) => {
                const isSelected = child.id === selectedId
                return (
                  <button
                    key={child.id}
                    onClick={() => handleSelect(child.id)}
                    className={`
                      px-6 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0
                      ${isSelected 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }
                    `}
                  >
                    {child.email ? child.email.split('@')[0] : 'Sin Nombre'}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
