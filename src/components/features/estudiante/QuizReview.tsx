'use client'

import { Medal, CheckCircle2, XCircle } from 'lucide-react'

// Definimos las interfaces basadas en el schema
interface OpcionMultiple {
  id: string
  tipo: 'opcion_multiple'
  pregunta: string
  opciones: {
    a: string
    b: string
    c: string
    d: string
  }
  correcta: 'a' | 'b' | 'c' | 'd'
}

interface Abierta {
  id: string
  tipo: 'abierta'
  pregunta: string
}

type Question = OpcionMultiple | Abierta

interface QuizReviewProps {
  questions: Question[]
  responses: Record<string, string>
  score: number
}

export default function QuizReview({ questions, responses, score }: QuizReviewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabecera de Logro */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] shadow-xl p-8 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <Medal className="w-10 h-10 text-yellow-300 drop-shadow-md" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-2 drop-shadow-md">
            ¡Resultados de tu última lectura!
          </h2>
          <p className="text-xl md:text-2xl text-indigo-100 font-medium">
            Ganaste <span className="font-bold text-white">{score} / 5</span> medallas
          </p>
        </div>
      </div>

      {/* Revisión de Preguntas */}
      <div className="space-y-6">
        {questions.map((q, index) => {
          const userAnswer = responses[q.id]

          if (q.tipo === 'opcion_multiple') {
            const isCorrect = userAnswer === q.correcta

            return (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-snug">{q.pregunta}</h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                    const isSelected = userAnswer === opt
                    const isActuallyCorrect = q.correcta === opt
                    
                    let bgClass = "bg-slate-50 border-slate-200 text-slate-700"
                    let icon = null

                    if (isActuallyCorrect) {
                      bgClass = "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-200"
                      icon = <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    } else if (isSelected && !isActuallyCorrect) {
                      bgClass = "bg-red-100 border-red-400 text-red-800"
                      icon = <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    }

                    return (
                      <div 
                        key={opt} 
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${bgClass}`}
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/50 font-black text-sm uppercase opacity-70">
                          {opt}
                        </span>
                        <span className="flex-1 font-medium">{q.opciones[opt]}</span>
                        {icon}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          }

          if (q.tipo === 'abierta') {
            return (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-snug">{q.pregunta}</h3>
                  </div>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 relative">
                  <span className="absolute -top-3 left-4 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">
                    Tu respuesta
                  </span>
                  <p className="text-slate-700 mt-2 italic whitespace-pre-wrap">
                    {userAnswer ? `"${userAnswer}"` : <span className="text-slate-400">No respondiste esta pregunta.</span>}
                  </p>
                </div>
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
