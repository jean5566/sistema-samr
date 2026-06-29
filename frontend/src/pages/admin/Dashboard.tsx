import { useEffect, useState } from 'react'
import api from '../../lib/api'

interface Stats {
  estudiantes: number
  docentes: number
  noticias: number
  documentos: number
}

function useCounter(target: number, ready: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!ready) return
    let current = 0
    const step = target / (1200 / 16)
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setValue(Math.floor(current))
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, ready])
  return value
}

interface StatCardProps {
  val: number
  label: string
  accent: string
  iconBg: string
  iconColor: string
  icon: string
  ready: boolean
}

function StatCard({ val, label, accent, iconBg, iconColor, icon, ready }: StatCardProps) {
  const value = useCounter(val, ready)
  return (
    <div className={`bg-white rounded-[2rem] border border-slate-100/60 p-4 sm:p-6 shadow-sm flex flex-col group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-full h-1.5 ${accent} opacity-80 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
      {ready
        ? <p className="text-base sm:text-xl font-bold text-slate-900 tabular-nums tracking-tight mb-1">{value.toLocaleString()}</p>
        : <div className="h-6 sm:h-7 w-12 sm:w-14 bg-slate-100 rounded-xl animate-pulse mb-1" />
      }
      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  )
}

const cardDefs = [
  {
    key: 'estudiantes' as keyof Stats,
    label: 'Estudiantes',
    accent: 'bg-blue-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    key: 'docentes' as keyof Stats,
    label: 'Docentes',
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    key: 'noticias' as keyof Stats,
    label: 'Noticias',
    accent: 'bg-violet-500',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  },
  {
    key: 'documentos' as keyof Stats,
    label: 'Documentos',
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
]

export function AdminDashboard() {
  const [stats, setStats]           = useState<Stats | null>(null)

  useEffect(() => {
    api.get<Stats>('/admin/stats').then(res => setStats(res.data))
  }, [])

  const ready = stats !== null

  return (
    <div className="min-h-screen text-slate-900 font-sans overflow-y-auto flex flex-col">
      {/* Topbar */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
        <div>
          <h1 className="text-xl sm:text-[28px] font-bold text-slate-900 tracking-tight">Panel de Control</h1>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12 w-full max-w-[1400px] mx-auto">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-4 sm:mb-6">
            {cardDefs.map(c => (
              <StatCard
                key={c.key}
                val={stats?.[c.key] ?? 0}
                label={c.label}
                accent={c.accent}
                iconBg={c.iconBg}
                iconColor={c.iconColor}
                icon={c.icon}
                ready={ready}
              />
            ))}
          </div>

          {/* Recursos del sistema */}
          <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-sm p-4 sm:p-6 group hover:shadow-lg transition-all duration-300">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-5">Recursos del sistema</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  name: 'Noticias publicadas',
                  count: stats?.noticias ?? null,
                  bar: 'bg-violet-500',
                  max: Math.max(stats?.noticias ?? 1, stats?.documentos ?? 1, 1),
                },
                {
                  name: 'Documentos',
                  count: stats?.documentos ?? null,
                  bar: 'bg-blue-500',
                  max: Math.max(stats?.noticias ?? 1, stats?.documentos ?? 1, 1),
                },
              ].map(r => {
                const pct = r.count !== null ? Math.max(10, Math.round((r.count / r.max) * 100)) : 0
                return (
                  <div key={r.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{r.name}</span>
                      {r.count !== null
                        ? <span className="text-xs font-black text-slate-900 tabular-nums">{r.count}</span>
                        : <div className="h-5 w-8 bg-slate-100 rounded-md animate-pulse" />
                      }
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full ${r.bar} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: ready ? `${pct}%` : '0%' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
      </div>
    </div>
  )
}
