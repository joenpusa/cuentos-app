'use client'

import { useState } from 'react'
import StoryContentViewer from '@/components/features/estudiante/StoryContentViewer'

interface MobileStoryModalProps {
  title: string
  content: string
}

export default function MobileStoryModal({ title, content }: MobileStoryModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Solo se renderiza en pantallas pequeñas (lg:hidden oculta este componente en desktop)
  return (
    <div className="lg:hidden">
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-500/50 hover:bg-indigo-700 transition-transform active:scale-95 flex items-center gap-2 font-bold"
        aria-label="Leer Cuento"
      >
        <span className="text-2xl">📖</span>
        <span>Cuento</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-2xl h-[85vh] sm:h-[80vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col slide-in-from-bottom-full sm:slide-in-from-bottom-0">
            {/* Header del Modal */}
            <div className="flex justify-between items-center p-6 border-b-2 border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 line-clamp-1">{title}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-xl hover:bg-slate-200 transition-colors"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            
            {/* Contenido del Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <StoryContentViewer content={content} className="text-lg text-slate-700 leading-relaxed space-y-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
