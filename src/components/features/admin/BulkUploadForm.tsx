'use client'

import { useState } from 'react'
import { bulkUploadUsers } from '@/app/(dashboard)/admin/usuarios/actions'
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'

interface UploadReport {
  successCount: number
  createdUsers: { name: string; email: string; pin: string }[]
  errors: { line?: string; email?: string; reason: string }[]
}

export default function BulkUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [role, setRole] = useState<'estudiante' | 'padre'>('estudiante')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [report, setReport] = useState<UploadReport | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setReport(null)
      setGlobalError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setIsSubmitting(true)
    setGlobalError(null)
    setReport(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('role', role)

    const result = await bulkUploadUsers(formData)

    if (result.error) {
      setGlobalError(result.error)
    } else if (result.report) {
      setReport(result.report)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Carga Masiva de Usuarios</h2>
        <p className="text-slate-500 mb-6">
          Sube un archivo CSV con las columnas <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">nombre, email</code> para registrar múltiples usuarios a la vez. El sistema autogenerará una contraseña numérica (PIN) para cada uno.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {globalError && (
            <div className="p-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span>{globalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-bold text-slate-700">
                Rol de los usuarios
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'estudiante' | 'padre')}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white transition-all cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="estudiante">Estudiante</option>
                <option value="padre">Padre</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Archivo CSV
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="fileUpload"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="fileUpload"
                  className="w-full p-3 border border-slate-300 rounded-xl bg-white flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-colors"
                >
                  <span className="text-slate-500 truncate mr-2">
                    {file ? file.name : 'Seleccionar archivo...'}
                  </span>
                  <Upload size={18} className="text-indigo-500 flex-shrink-0" />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={!file || isSubmitting}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                'Procesando...'
              ) : (
                <>
                  <FileText size={18} /> Procesar Archivo
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Resultados de la carga */}
      {report && (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={28} className="text-emerald-500" />
            <h3 className="text-2xl font-black text-slate-800">Resultado de la Carga</h3>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-lg">
              Usuarios creados exitosamente: <strong className="text-emerald-600">{report.successCount}</strong>
            </p>
          </div>

          {report.createdUsers.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-700 mb-3">Credenciales Generadas</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-3 border-b border-slate-200">Nombre</th>
                      <th className="p-3 border-b border-slate-200">Email</th>
                      <th className="p-3 border-b border-slate-200">PIN Generado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.createdUsers.map((user, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-800">{user.name}</td>
                        <td className="p-3 text-slate-600">{user.email}</td>
                        <td className="p-3 font-mono font-bold text-indigo-600">{user.pin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                * Por favor, guarda estos PINs numéricos. Los usuarios los necesitarán para iniciar sesión.
              </p>
            </div>
          )}

          {report.errors.length > 0 && (
            <div className="mt-8">
              <h4 className="font-bold text-rose-700 mb-3 flex items-center gap-2">
                <AlertCircle size={18} /> Filas con Errores ({report.errors.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse bg-rose-50 border border-rose-100 rounded-lg overflow-hidden">
                  <thead className="bg-rose-100/50">
                    <tr>
                      <th className="p-3 border-b border-rose-100 text-rose-800">Email / Línea original</th>
                      <th className="p-3 border-b border-rose-100 text-rose-800">Motivo del fallo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.errors.map((err, idx) => (
                      <tr key={idx} className="border-b border-rose-100 hover:bg-rose-100/30">
                        <td className="p-3 text-rose-700">{err.email || err.line}</td>
                        <td className="p-3 text-rose-600 font-medium">{err.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
