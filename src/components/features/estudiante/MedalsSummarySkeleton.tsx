export default function MedalsSummarySkeleton() {
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* Hero Skeleton */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl border-4 border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-32 h-32 bg-slate-200 rounded-full mb-6"></div>
        <div className="h-12 bg-slate-200 rounded-xl w-48 mb-4"></div>
        <div className="h-6 bg-slate-200 rounded-lg w-64"></div>
      </div>

      {/* Grid Skeleton */}
      <div>
        <div className="h-8 bg-slate-200 rounded-lg w-48 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-md border-2 border-slate-100 h-40 flex flex-col justify-between">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-full"></div>
                  <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="h-8 bg-slate-200 rounded-full w-24 ml-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
