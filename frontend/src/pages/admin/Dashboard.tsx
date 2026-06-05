import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const statsData = [
  { val: 1248,   label: 'Estudiantes',     trend: '+3.2%', trendUp: true,  accent: 'border-t-blue-500',    iconBg: 'bg-blue-50',    iconColor: 'text-blue-600',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { val: 24,     label: 'Materias activas',trend: '+2',    trendUp: true,  accent: 'border-t-violet-500',  iconBg: 'bg-violet-50',  iconColor: 'text-violet-600',  icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { val: 160345, label: 'Accesos totales', trend: '+12.5%',trendUp: true,  accent: 'border-t-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { val: 38,     label: 'Docentes',        trend: '+1',    trendUp: true,  accent: 'border-t-amber-500',   iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',   icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

const chartBars = [
  { px: 51,  day: 'Lun' },
  { px: 91,  day: 'Mar' },
  { px: 80,  day: 'Mié' },
  { px: 120, day: 'Jue' },
  { px: 74,  day: 'Vie' },
  { px: 109, day: 'Sáb' },
  { px: 89,  day: 'Dom' },
]

function useCounter(target: number) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let current = 0
    const step = target / (1200 / 16)
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setValue(Math.floor(current))
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return value
}

function StatCard({ stat, delay }: { stat: typeof statsData[0]; delay: number }) {
  const value = useCounter(stat.val)
  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-t-2 ${stat.accent} p-5 shadow-sm dash-fade`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
          <svg className={`w-5 h-5 ${stat.iconColor}`} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
          </svg>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
          stat.trendUp
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-red-200 bg-red-50 text-red-600'
        }`}>{stat.trend}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</p>
      <p className="text-xs font-medium text-gray-400 mt-1">{stat.label}</p>
    </div>
  )
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const [activePeriod, setActivePeriod] = useState('Semana')

  return (
    <>
      <style>{`
        .dash-fade { animation: dashFadeIn .35s ease both; }
        @keyframes dashFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        .chart-bar { transition: background .15s; }
        .chart-bar:hover { background: #2563eb !important; }
      `}</style>

      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Administración</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Panel de Control</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-1">
            {[
              { label: 'Resumen',    path: null },
              { label: 'Usuarios',   path: '/dashboard/admin/usuarios' },
              { label: 'Noticias',   path: '/dashboard/admin/noticias' },
              { label: 'Documentos', path: '/dashboard/admin/documentos' },
            ].map(item => (
              <button key={item.label}
                onClick={() => item.path && navigate(item.path)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition ${
                  !item.path ? 'bg-white text-gray-800 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">CM</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {statsData.map((s, i) => <StatCard key={s.label} stat={s} delay={i * 60} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 dash-fade" style={{ animationDelay: '200ms' }}>
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 dash-fade" style={{ animationDelay: '300ms' }}>
              <p className="text-sm font-semibold text-gray-900 mb-4">Recursos del sistema</p>
              <div className="flex flex-col gap-0.5">
                {[
                  { name: 'Noticias',   count: 6,  bar: 'bg-blue-500',   pct: '40%' },
                  { name: 'Documentos', count: 6,  bar: 'bg-violet-500', pct: '40%' },
                  { name: 'Materias',   count: 24, bar: 'bg-amber-400',  pct: '80%' },
                ].map(r => (
                  <div key={r.name} className="py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-600">{r.name}</span>
                      <span className="text-sm font-bold text-gray-900">{r.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${r.bar} rounded-full transition-all`} style={{ width: r.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Server */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 dash-fade" style={{ animationDelay: '400ms' }}>
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
