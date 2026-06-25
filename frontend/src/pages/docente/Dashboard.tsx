import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import api from '../../lib/api'

interface Noticia {
  id: number
  titulo: string
  categoria: string
  fecha: string
}

interface Documento {
  id: number
  nombre: string
  archivo_nombre: string
  archivo_tamanio: number | null
}

const CAT_COLORS: Record<string, string> = {
  noticia:  'bg-blue-100 text-blue-700',
  evento:   'bg-indigo-100 text-indigo-700',
  congreso: 'bg-purple-100 text-purple-700',
  feria:    'bg-cyan-100 text-cyan-700',
  aviso:    'bg-amber-100 text-amber-700',
}

const extStyle: Record<string, { bg: string; text: string }> = {
  pdf:  { bg: 'bg-red-100',     text: 'text-red-600'     },
  docx: { bg: 'bg-blue-100',    text: 'text-blue-600'    },
  doc:  { bg: 'bg-blue-100',    text: 'text-blue-600'    },
  xlsx: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  xls:  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
}

function getExt(nombre: string) {
  return nombre.split('.').pop()?.toLowerCase() ?? 'pdf'
}

function formatBytes(b: number | null) {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function fechaFormato(raw: string) {
  return new Date(raw.slice(0, 10) + 'T12:00:00')
    .toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
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
      {ready
        ? <p className="text-xl font-bold text-slate-900 tabular-nums tracking-tight mb-1">{value.toLocaleString()}</p>
        : <div className="h-7 w-14 bg-slate-100 rounded-xl animate-pulse mb-1" />
      }
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  )
}

export function DocenteDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const docente = user?.docente

  const [noticias,      setNoticias]      = useState<Noticia[]>([])
  const [documentos,    setDocumentos]    = useState<Documento[]>([])
  const [docentesCount, setDocentesCount] = useState(0)
  const [ready,         setReady]         = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<Noticia[]>('/noticias'),
      api.get<Documento[]>('/documentos/todos'),
      api.get<unknown[]>('/docentes'),
    ]).then(([n, d, doc]) => {
      setNoticias(n.data)
      setDocumentos(d.data)
      setDocentesCount(doc.data.length)
      setReady(true)
    })
  }, [])

  const subtitulo = [docente?.titulo, docente?.area].filter(Boolean).join(' · ') || 'Docente'

  const cardDefs = [
    { val: noticias.length,   label: 'Noticias publicadas',    accent: 'bg-blue-500',    iconBg: 'bg-blue-50',    iconColor: 'text-blue-600',    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
    { val: documentos.length, label: 'Documentos disponibles', accent: 'bg-emerald-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', icon: 'M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z' },
    { val: docentesCount,     label: 'Docentes activos',       accent: 'bg-violet-500',  iconBg: 'bg-violet-50',  iconColor: 'text-violet-600',  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-y-auto flex flex-col">

      {/* Topbar */}
      <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Panel principal</h1>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12 w-full max-w-6xl mx-auto">

        {/* Bienvenida */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-[2rem] px-8 py-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg shadow-blue-500/20 mb-6">
          <div>
            <p className="text-blue-200 text-sm font-bold uppercase tracking-wide mb-1">Bienvenido de vuelta</p>
            <h2 className="text-3xl font-black tracking-tight">{docente?.nombre ?? user?.name}</h2>
            <p className="text-blue-100 text-sm mt-2 font-medium">{subtitulo}</p>
          </div>
          <button onClick={() => navigate('/dashboard/docente/perfil')}
            className="bg-white text-blue-700 hover:bg-slate-50 text-sm font-bold px-6 py-3 rounded-full transition-all shadow-sm hover:shadow-md self-start sm:self-center whitespace-nowrap">
            Ver perfil
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          {cardDefs.map(c => (
            <StatCard key={c.label} {...c} ready={ready} />
          ))}
        </div>

        {/* Noticias + Documentos */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Noticias recientes */}
          <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-100/60 overflow-hidden shadow-sm flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100/80 bg-slate-50/30">
              <h2 className="text-base font-bold text-slate-900">Noticias recientes</h2>
            </div>
            <div className="divide-y divide-slate-100/80 flex-1">
              {ready && noticias.length === 0 && (
                <p className="px-8 py-8 text-sm font-medium text-slate-400">No hay noticias recientes.</p>
              )}
              {noticias.slice(0, 5).map(n => (
                <div key={n.id} className="flex items-center gap-5 px-8 py-4 hover:bg-slate-50/60 transition-colors">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${CAT_COLORS[n.categoria] ?? 'bg-slate-100 text-slate-600'}`}>
                    {n.categoria}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{n.titulo}</p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 shrink-0 uppercase tracking-wide">{fechaFormato(n.fecha)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documentos recientes */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100/60 overflow-hidden shadow-sm flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100/80 bg-slate-50/30">
              <h2 className="text-base font-bold text-slate-900">Documentos recientes</h2>
            </div>
            <div className="divide-y divide-slate-100/80 flex-1">
              {ready && documentos.length === 0 && (
                <p className="px-8 py-8 text-sm font-medium text-slate-400">No hay documentos disponibles.</p>
              )}
              {documentos.slice(0, 5).map(d => {
                const ext = getExt(d.archivo_nombre)
                const style = extStyle[ext] ?? { bg: 'bg-slate-100', text: 'text-slate-500' }
                return (
                  <a key={d.id} href={`/api/documentos/${d.id}/download`}
                    className="flex items-center gap-4 px-8 py-4 hover:bg-slate-50/60 transition-colors group">
                    <div className={`w-10 h-10 rounded-2xl ${style.bg} ${style.text} flex items-center justify-center text-[10px] font-black uppercase shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      {ext}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{d.nombre}</p>
                      <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{formatBytes(d.archivo_tamanio)}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
