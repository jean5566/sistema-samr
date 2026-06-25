import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import api from '../../lib/api'

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

function StatCard({ val, label, accent, iconBg, iconColor, icon, ready }: {
  val: number; label: string; accent: string; iconBg: string; iconColor: string; icon: string; ready: boolean
}) {
  const value = useCounter(val, ready)
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 p-6 shadow-sm flex flex-col group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1.5 ${accent} opacity-80 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
      <p className="text-xl font-bold text-slate-900 tabular-nums tracking-tight mb-1">{value.toLocaleString()}</p>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  )
}

export function EstudianteDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [periodo, setPeriodo] = useState('')
  const [totalDocentes, setTotalDocentes] = useState(0)
  const [totalDocumentos, setTotalDocumentos] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/docentes'),
      api.get('/documentos'),
      api.get('/configuracion'),
    ]).then(([docentes, documentos, cfg]) => {
      setTotalDocentes(docentes.data.length)
      setTotalDocumentos(documentos.data.length)
      setPeriodo(cfg.data.periodo ?? '')
    }).finally(() => setReady(true))
  }, [])

  const cardDefs = [
    { val: totalDocentes,   label: 'Docentes registrados',    accent: 'bg-blue-500',    iconBg: 'bg-blue-50',    iconColor: 'text-blue-600',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { val: totalDocumentos, label: 'Documentos disponibles',  accent: 'bg-violet-500',  iconBg: 'bg-violet-50',  iconColor: 'text-violet-600',  icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-y-auto flex flex-col">

      {/* Topbar */}
      <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Panel principal</h1>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12 w-full max-w-7xl mx-auto">

        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-[2rem] px-8 py-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg shadow-blue-500/20 mb-6">
          <div>
            <p className="text-blue-200 text-sm font-bold uppercase tracking-wide mb-1">Bienvenido</p>
            <h2 className="text-3xl font-black tracking-tight">{user?.name}</h2>
            <p className="text-blue-100 text-sm mt-2 font-medium">{user?.email}</p>
          </div>
          {periodo && (
            <div className="text-left sm:text-right">
              <p className="text-blue-200 text-sm font-bold uppercase tracking-wide mb-1">Período actual</p>
              <p className="text-3xl font-black tracking-tight">{periodo}</p>
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {cardDefs.map(c => (
            <StatCard key={c.label} {...c} ready={ready} />
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <button onClick={() => navigate('/dashboard/estudiante/docentes')}
            className="bg-white border border-slate-100/60 rounded-[2rem] p-6 flex items-center gap-5 hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 shadow-sm hover:shadow-md group text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Mis docentes</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Ver información de contacto y solicitar citas</p>
            </div>
          </button>
          <button onClick={() => navigate('/dashboard/estudiante/documentos')}
            className="bg-white border border-slate-100/60 rounded-[2rem] p-6 flex items-center gap-5 hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 shadow-sm hover:shadow-md group text-left">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors">Documentos</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Reglamentos, sílabos y formularios</p>
            </div>
          </button>
          <button onClick={() => navigate('/dashboard/estudiante/mis-archivos')}
            className="bg-white border border-slate-100/60 rounded-[2rem] p-6 flex items-center gap-5 hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 shadow-sm hover:shadow-md group text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Mis archivos</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Tu almacenamiento privado, solo visible para ti</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  )
}
