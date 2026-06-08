import { useEffect, useState } from 'react'
import api from '../../lib/api'

interface Stats {
  estudiantes: number
  docentes: number
  noticias: number
  documentos: number
}

const chartBars = [
  { px: 51,  day: 'Lun' },
  { px: 91,  day: 'Mar' },
  { px: 80,  day: 'Mié' },
  { px: 120, day: 'Jue' },
  { px: 74,  day: 'Vie' },
  { px: 109, day: 'Sáb' },
  { px: 89,  day: 'Dom' },
]

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
    <div className={`bg-white rounded-xl border border-gray-200 border-t-2 ${accent} p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
      {ready
        ? <p className="text-2xl font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</p>
        : <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
      }
      <p className="text-xs font-medium text-gray-400 mt-1">{label}</p>
    </div>
  )
}

const cardDefs = [
  {
    key: 'estudiantes' as keyof Stats,
    label: 'Estudiantes',
    accent: 'border-t-blue-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    key: 'docentes' as keyof Stats,
    label: 'Docentes',
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    key: 'noticias' as keyof Stats,
    label: 'Noticias publicadas',
    accent: 'border-t-violet-500',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  },
  {
    key: 'documentos' as keyof Stats,
    label: 'Documentos',
    accent: 'border-t-emerald-500',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
]

export function AdminDashboard() {
  const [stats, setStats]           = useState<Stats | null>(null)
  const [activePeriod, setActivePeriod] = useState('Semana')

  useEffect(() => {
    api.get<Stats>('/admin/stats').then(res => setStats(res.data))
  }, [])

  const ready = stats !== null

  return (
    <>
      <style>{`
        .chart-bar { transition: background .15s; }
        .chart-bar:hover { background: #2563eb !important; }
      `}</style>

      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Administración</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Panel de Control</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-900">Actividad semanal</p>
                <p className="text-xs text-gray-400 mt-0.5">Visitas al sistema por día</p>
              </div>
              <div className="flex gap-0.5 bg-gray-100 rounded-lg p-1">
                {['Semana', 'Mes', 'Año'].map(p => (
                  <button key={p} onClick={() => setActivePeriod(p)}
                    className={`px-3 py-1.5 rounded-md text-xs transition ${
                      activePeriod === p ? 'font-semibold bg-white text-gray-800 shadow-sm' : 'font-medium text-gray-400 hover:text-gray-600'
                    }`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-2 h-36 px-1">
              {chartBars.map((b, i) => (
                <div key={b.day} className="flex-1 group relative flex flex-col justify-end h-full">
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap shadow-lg">
                    {(b.px * 12).toLocaleString()} visitas
                  </div>
                  <div className="w-full rounded-t-md chart-bar cursor-pointer"
                    style={{ height: `${b.px}px`, background: i === 3 ? '#2563eb' : '#e5e7eb' }} />
                  <p className="text-center text-[10px] text-gray-400 mt-2 group-hover:text-blue-500 transition font-medium">{b.day}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Side panels */}
          <div className="flex flex-col gap-4">

            {/* Resources */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">Recursos del sistema</p>
              <div className="flex flex-col gap-0.5">
                {[
                  {
                    name: 'Noticias',
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
                    <div key={r.name} className="py-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600">{r.name}</span>
                        {r.count !== null
                          ? <span className="text-sm font-bold text-gray-900">{r.count}</span>
                          : <div className="h-4 w-6 bg-gray-100 rounded animate-pulse" />
                        }
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${r.bar} rounded-full transition-all duration-700`}
                          style={{ width: ready ? `${pct}%` : '0%' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Server */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">Servidor</p>
                <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  En línea
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0.5 tabular-nums">42<span className="text-sm font-normal text-gray-400 ml-1">%</span></p>
              <p className="text-xs text-gray-400 mb-3">Capacidad utilizada</p>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
