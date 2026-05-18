'use client'

import { useState } from 'react'
import QuizWizard from './QuizWizard'
import QuizReview from './QuizReview'
import { RotateCcw } from 'lucide-react'

// Definimos los tipos básicos localmente para que funcione el paso de props
type Question = any // Usamos any o importamos el tipo exacto si es necesario

interface ActivityRecord {
  score: number
  responses: Record<string, string>
}

interface QuizContainerProps {
  questions: Question[]
  storyId: string
  attempts: number
  maxAttempts: number
  latestActivity: ActivityRecord | null
}

export default function QuizContainer({ 
  questions, 
  storyId, 
  attempts, 
  maxAttempts, 
  latestActivity 
}: QuizContainerProps) {
  // Mostramos el wizard directamente si no hay intentos
  // Si hay intentos, mostramos la revisión por defecto
  const [showWizard, setShowWizard] = useState(attempts === 0)

  // Si intentamos mostrar la revisión pero no hay actividad, forzamos el wizard
  if (!showWizard && !latestActivity) {
    return <QuizWizard questions={questions} storyId={storyId} />
  }

  return (
    <div className="space-y-8">
      {showWizard ? (
        <QuizWizard questions={questions} storyId={storyId} />
      ) : (
        <div className="space-y-8">
          <QuizReview 
            questions={questions} 
            responses={latestActivity!.responses} 
            score={latestActivity!.score} 
          />
          
          {attempts < maxAttempts && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-indigo-500 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                Volver a intentar el reto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
