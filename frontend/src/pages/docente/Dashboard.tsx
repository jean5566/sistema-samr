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

export function DocenteDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const docente = user?.docente

  const [noticias, setNoticias]     = useState<Noticia[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [docentesCount, setDocentesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Noticia[]>('/noticias'),
      api.get<Documento[]>('/documentos/todos'),
      api.get<unknown[]>('/docentes'),
    ]).then(([n, d, doc]) => {
      setNoticias(n.data)
      setDocumentos(d.data)
      setDocentesCount(doc.data.length)
    }).finally(() => setLoading(false))
  }, [])

  const subtitulo = [docente?.titulo, docente?.area].filter(Boolean).join(' · ') || 'Docente'

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Docente</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Panel principal</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Bienvenida */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl px-6 py-5 text-white mb-6 flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">Bienvenido de vuelta</p>
            <h2 className="text-lg font-bold mt-0.5">{docente?.nombre ?? user?.name}</h2>
            <p className="text-blue-200 text-xs mt-1">{subtitulo}</p>
          </div>
          <button onClick={() => navigate('/dashboard/docente/perfil')}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
            Ver perfil
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Noticias publicadas',   value: noticias.length,   icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', color: 'text-blue-600',    bg: 'bg-blue-50'    },
            { label: 'Documentos disponibles', value: documentos.length, icon: 'M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',                                                                                                                                                  color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Docentes activos',      value: docentesCount,     icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',                  color: 'text-violet-600',  bg: 'bg-violet-50'  },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                <svg className={`w-5 h-5 ${s.color}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{loading ? '—' : s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-4">
          {/* Noticias recientes */}
          <div className="col-span-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Noticias recientes</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {!loading && noticias.length === 0 && (
                <p className="px-5 py-6 text-sm text-gray-400">No hay noticias recientes.</p>
              )}
              {noticias.slice(0, 5).map(n => (
                <div key={n.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${CAT_COLORS[n.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
                    {n.categoria}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{n.titulo}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{fechaFormato(n.fecha)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documentos recientes */}
          <div className="col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Documentos recientes</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {!loading && documentos.length === 0 && (
                <p className="px-5 py-6 text-sm text-gray-400">No hay documentos disponibles.</p>
              )}
              {documentos.slice(0, 5).map(d => {
                const ext = getExt(d.archivo_nombre)
                const style = extStyle[ext] ?? { bg: 'bg-gray-100', text: 'text-gray-500' }
                return (
                  <a key={d.id} href={`/api/documentos/${d.id}/download`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition">
                    <div className={`w-9 h-9 rounded-lg ${style.bg} ${style.text} flex items-center justify-center text-[10px] font-bold uppercase shrink-0`}>
                      {ext}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{d.nombre}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatBytes(d.archivo_tamanio)}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
