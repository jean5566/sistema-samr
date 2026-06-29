import { useState, useEffect, useMemo } from 'react'
import api from '../../lib/api'
import { colorBadge, colorDot } from '../../lib/catColors'

interface Categoria {
  id: number
  nombre: string
  slug: string
  color: string
}

interface Documento {
  id: number
  nombre: string
  tipo: string
  descripcion: string | null
  archivo_nombre: string
  archivo_tamanio: number | null
  archivo_url: string
  created_at: string
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

function formatFecha(raw: string) {
  return new Date(raw).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function EstudianteDocumentos() {
  const [docs, setDocs]           = useState<Documento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [catFil, setCatFil]       = useState('')

  useEffect(() => {
    Promise.all([
      api.get<Documento[]>('/documentos'),
      api.get<Categoria[]>('/categorias?modulo=documentos'),
    ]).then(([d, c]) => {
      setDocs(d.data)
      setCategorias(c.data)
    }).finally(() => setLoading(false))
  }, [])

  const catMap = useMemo(() =>
    Object.fromEntries(categorias.map(c => [c.slug, c])), [categorias])

  const filtered = useMemo(() =>
    docs.filter(d =>
      (catFil ? d.tipo === catFil : true) &&
      d.nombre.toLowerCase().includes(search.toLowerCase())
    ), [docs, search, catFil])

  return (
    <div className="min-h-screen text-slate-900 font-sans overflow-y-auto flex flex-col">
      <div className="px-4 sm:px-8 py-4 sm:py-6 shrink-0">
        <h1 className="text-lg sm:text-[28px] font-bold text-slate-900 tracking-tight">Documentos</h1>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documento..."
                className="w-full pl-11 pr-5 py-2.5 rounded-full border border-slate-200 text-sm text-slate-900 bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm" />
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCatFil('')}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all shadow-sm ${
                  catFil === '' ? 'bg-blue-600 text-white border-blue-600 shadow-blue-600/20' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                }`}>Todos</button>
              {categorias.map(c => (
                <button key={c.id} onClick={() => setCatFil(c.slug)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all shadow-sm ${
                    catFil === c.slug ? 'bg-blue-600 text-white border-blue-600 shadow-blue-600/20' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${colorDot[c.color] ?? 'bg-slate-400'}`} />
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-[2rem] border border-slate-100/60 overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100/80">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Documento</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Categoría</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Tamaño</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {loading ? (
                    <tr><td colSpan={5} className="py-16 text-center text-sm font-bold text-slate-400">Cargando documentos...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100/60 shadow-sm">
                          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-slate-500 font-bold">No hay documentos disponibles.</p>
                      </td>
                    </tr>
                  ) : filtered.map(d => {
                    const ext = getExt(d.archivo_nombre)
                    const es  = extStyle[ext] ?? { bg: 'bg-slate-100', text: 'text-slate-600' }
                    const cat = catMap[d.tipo]
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm border border-white shrink-0 ${es.bg} ${es.text}`}>{ext}</span>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{d.nombre}</p>
                              {d.descripcion && (
                                <p className="text-xs font-medium text-slate-500 mt-0.5 truncate max-w-[140px] sm:max-w-xs hidden sm:block">{d.descripcion}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                          {cat ? (
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${colorBadge[cat.color] ?? colorBadge.gray}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${colorDot[cat.color] ?? 'bg-slate-400'}`} />
                              {cat.nombre}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">{d.tipo}</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-slate-500 hidden lg:table-cell">{formatBytes(d.archivo_tamanio)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-slate-500 hidden lg:table-cell">{formatFecha(d.created_at)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <a href={`/api/documentos/${d.id}/download`}
                            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 sm:px-4 py-2 rounded-full transition-all shadow-sm border border-blue-100 hover:border-blue-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="hidden sm:inline">Descargar</span>
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {!loading && (
              <div className="px-6 py-4 border-t border-slate-100/80 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{filtered.length} documento{filtered.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
