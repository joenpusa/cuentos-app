'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { submitQuiz } from '@/app/(dashboard)/estudiante/cuentos/[id]/actions'

// Asumiendo que esta es la estructura que viene de BD basada en el schema
type Question = {
  id: string
  tipo: 'opcion_multiple' | 'abierta'
  pregunta: string
  opciones?: { a: string; b: string; c: string; d: string }
  correcta?: 'a' | 'b' | 'c' | 'd'
}

interface QuizWizardProps {
  questions: Question[]
  storyId: string
}

export default function QuizWizard({ questions, storyId }: QuizWizardProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [finalScore, setFinalScore] = useState<number>(0)

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  const currentResponse = responses[currentQuestion.id] || ''
  
  // Validación para habilitar el botón de "Siguiente" o "Enviar"
  let isCurrentValid = false
  if (currentQuestion.tipo === 'opcion_multiple') {
    isCurrentValid = currentResponse !== ''
  } else {
    isCurrentValid = currentResponse.trim().length >= 30
  }

  const handleNext = () => {
    if (isCurrentValid && !isLastQuestion) {
      setCurrentIndex((prev) => prev + 1)
      setError(null)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setError(null)
    }
  }

  const handleOptionSelect = (optionKey: string) => {
    setResponses({ ...responses, [currentQuestion.id]: optionKey })
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponses({ ...responses, [currentQuestion.id]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!isCurrentValid) return
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitQuiz(storyId, responses)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setFinalScore(result.score ?? 0)
        
        // Disparar confetti!
        const duration = 3000
        const end = Date.now() + duration
        
        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ffb703', '#fb8500', '#8ecae6', '#219ebc']
          })
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ffb703', '#fb8500', '#8ecae6', '#219ebc']
          })
          
          if (Date.now() < end) {
            requestAnimationFrame(frame)
          }
        }
        frame()

        setShowModal(true)
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al enviar tus respuestas.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (questions.length === 0) {
    return <div className="text-center p-8 bg-white rounded-3xl shadow-lg border-4 border-dashed border-indigo-200">No hay preguntas para este cuento.</div>
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden border-4 border-indigo-100">
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-4">
        <div 
          className="bg-gradient-to-r from-indigo-400 to-purple-500 h-4 transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-8 md:p-12">
        <div className="mb-8 flex justify-between items-center">
          <span className="inline-flex items-center justify-center px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full font-bold text-sm tracking-wide">
            PREGUNTA {currentIndex + 1} DE {questions.length}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-8 leading-tight">
          {currentQuestion.pregunta}
        </h3>

        {/* Múltiple opción */}
        {currentQuestion.tipo === 'opcion_multiple' && currentQuestion.opciones && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(currentQuestion.opciones).map(([key, value]) => {
              const isSelected = currentResponse === key
              return (
                <button
                  key={key}
                  onClick={() => handleOptionSelect(key)}
                  className={`
                    group relative w-full p-6 text-left rounded-2xl border-4 transition-all duration-200
                    ${isSelected 
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-md transform scale-[1.02]' 
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                      ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600 group-hover:bg-indigo-100'}
                    `}>
                      {key.toUpperCase()}
                    </div>
                    <span className={`text-lg font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {value}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Abierta */}
        {currentQuestion.tipo === 'abierta' && (
          <div className="space-y-4">
            <textarea
              rows={5}
              value={currentResponse}
              onChange={handleTextChange}
              placeholder="Escribe aquí tu respuesta..."
              className="w-full p-6 text-lg border-4 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition-all resize-none shadow-inner bg-slate-50"
            />
            <div className="flex justify-between items-center px-2">
              <span className={`text-sm font-bold ${currentResponse.trim().length >= 30 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {currentResponse.trim().length} / 30 caracteres mínimos
              </span>
              {currentResponse.trim().length >= 30 && (
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  ¡Excelente! <span className="text-xl">✨</span>
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-rose-100 border-2 border-rose-200 text-rose-700 font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Navegación */}
        <div className="mt-12 flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0 || isSubmitting}
            className={`
              px-8 py-4 rounded-full font-bold text-lg transition-all
              ${currentIndex === 0 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95'
              }
            `}
          >
            Anterior
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!isCurrentValid || isSubmitting}
              className={`
                px-8 py-4 rounded-full font-bold text-lg shadow-lg transform transition-all active:scale-95
                ${!isCurrentValid || isSubmitting
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 hover:shadow-emerald-200/50'
                }
              `}
            >
              {isSubmitting ? 'Enviando...' : '¡Terminar!'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isCurrentValid}
              className={`
                px-8 py-4 rounded-full font-bold text-lg shadow-lg transform transition-all active:scale-95
                ${!isCurrentValid
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-200/50'
                }
              `}
            >
              Siguiente 🚀
            </button>
          )}
        </div>
      </div>

      {/* Modal de Victoria */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border-8 border-yellow-300 transform scale-100 animate-bounce-in">
            <h2 className="text-4xl md:text-5xl font-black text-indigo-900 mb-4 drop-shadow-sm">
              ¡Felicidades!
            </h2>
            <div className="my-8">
              <p className="text-slate-600 text-lg font-medium mb-4">Has ganado:</p>
              <div className="flex justify-center items-center gap-2 mb-2">
                <span className="text-6xl md:text-7xl font-black text-yellow-500 drop-shadow-md">
                  {finalScore}
                </span>
              </div>
              <p className="text-2xl font-bold text-yellow-500 uppercase tracking-widest">
                Medallas 🏅
              </p>
            </div>
            <p className="text-slate-600 text-lg mb-8 font-medium">
              ¡Sigue leyendo cuentos para convertirte en el mejor lector!
            </p>
            <button
              onClick={() => router.push('/estudiante')}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-indigo-300/50 transition-all active:scale-95"
            >
              Volver a mis cuentos
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
