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
    <>
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Estudiante</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Documentos</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documento..."
              className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCatFil('')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                catFil === '' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600'
              }`}>Todos</button>
            {categorias.map(c => (
              <button key={c.id} onClick={() => setCatFil(c.slug)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                  catFil === c.slug ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }`}>
                <span className={`w-2 h-2 rounded-full ${colorDot[c.color] ?? 'bg-gray-400'}`} />
                {c.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoría</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tamaño</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center text-sm text-gray-400">Cargando documentos...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 text-sm">No hay documentos disponibles.</p>
                  </td>
                </tr>
              ) : filtered.map(d => {
                const ext = getExt(d.archivo_nombre)
                const es  = extStyle[ext] ?? { bg: 'bg-gray-100', text: 'text-gray-500' }
                const cat = catMap[d.tipo]
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${es.bg} ${es.text}`}>{ext}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{d.nombre}</p>
                          {d.descripcion && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{d.descripcion}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {cat ? (
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${colorBadge[cat.color] ?? colorBadge.gray}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colorDot[cat.color] ?? 'bg-gray-400'}`} />
                          {cat.nombre}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">{d.tipo}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">{formatBytes(d.archivo_tamanio)}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">{formatFecha(d.created_at)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <a href={`http://127.0.0.1:8000/api/documentos/${d.id}/download`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {!loading && (
            <div className="px-5 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">{filtered.length} documento{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
