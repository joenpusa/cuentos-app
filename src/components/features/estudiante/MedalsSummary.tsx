import { getStudentProgress } from '@/services/progress'
import Image from 'next/image'

interface MedalsSummaryProps {
  studentId: string
}

export default async function MedalsSummary({ studentId }: MedalsSummaryProps) {
  let progress

  try {
    progress = await getStudentProgress(studentId)
  } catch (error) {
    return (
      <div className="bg-rose-50 p-6 rounded-2xl border-2 border-rose-200 text-rose-700 text-center font-bold">
        No se pudo cargar el progreso. Verifica tus permisos.
      </div>
    )
  }

  return (
    <div className="space-y-12 w-full max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-[2.5rem] p-10 md:p-16 shadow-2xl shadow-yellow-200 text-center relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl transform -rotate-12">⭐</div>
          <div className="absolute bottom-10 right-10 text-6xl transform rotate-12">🌟</div>
          <div className="absolute top-20 right-20 text-4xl transform rotate-45">✨</div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="text-8xl md:text-[10rem] drop-shadow-xl mb-6 transform hover:scale-110 transition-transform duration-300">
            🏅
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white drop-shadow-md mb-4">
            {progress.totalMedals}
          </h2>
          <p className="text-2xl md:text-3xl font-extrabold text-amber-900 bg-white/30 px-6 py-2 rounded-full inline-block backdrop-blur-sm">
            Medallas Totales
          </p>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="flex justify-center">
        <div className="bg-white px-8 py-4 rounded-full shadow-lg border-2 border-slate-100 flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <span className="text-xl font-bold text-slate-700">
            {progress.completedStories} {progress.completedStories === 1 ? 'cuento leído' : 'cuentos leídos'}
          </span>
        </div>
      </div>

      {/* Historial Reciente */}
      <div>
        <h3 className="text-3xl font-black text-slate-800 mb-8 px-4 flex items-center gap-3">
          <span>📜</span> Últimas Aventuras
        </h3>
        
        {progress.recentActivities.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border-4 border-dashed border-slate-200">
            <div className="text-5xl mb-4">📖</div>
            <h4 className="text-xl font-bold text-slate-600">Aún no hay aventuras</h4>
            <p className="text-slate-500 mt-2">¡Lee tu primer cuento para ganar medallas!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progress.recentActivities.map((act) => (
              <div 
                key={act.id} 
                className="bg-white rounded-[2rem] p-5 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex gap-4 items-start mb-4 flex-1">
                  {act.stories?.image_url ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden relative flex-shrink-0 bg-indigo-50">
                      <Image 
                        src={act.stories.image_url} 
                        alt={act.stories?.title || 'Cuento'} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl flex-shrink-0">
                      📘
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2 mb-1">
                      {act.stories?.title || 'Cuento Desconocido'}
                    </h4>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      {new Date(act.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="mt-auto flex justify-end">
                  <div className="bg-yellow-100 px-4 py-2 rounded-xl border-2 border-yellow-300 flex items-center gap-2 font-black text-yellow-700">
                    <span>+{act.score}</span>
                    <span className="text-xl">🥇</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
