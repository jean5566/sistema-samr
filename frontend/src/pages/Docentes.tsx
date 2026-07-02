import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../lib/api'

interface Docente {
  id: number
  nombre: string
  titulo: string | null
  area: string | null
  email: string
  foto_url: string | null
}


function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

export function DocentesPage() {
  const location = useLocation()
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Docente | null>(null)

  useEffect(() => {
    setLoading(true)
    api.get('/docentes', { headers: { 'Cache-Control': 'no-cache' } })
      .then(res => setDocentes(res.data))
      .finally(() => setLoading(false))
  }, [location.key])

  const q = search.toLowerCase()
  const filtered = docentes.filter(d =>
    d.nombre.toLowerCase().includes(q) ||
    (d.area ?? '').toLowerCase().includes(q)
  )

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden selection:bg-slate-200">
      {/* Patrón de puntos decorativo en el fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0 opacity-50"></div>

      <div className="relative z-10">
        {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative px-6 py-12 text-center">
          <h1 className="text-3xl font-bold text-white">Nuestro Equipo Docente</h1>
          <p className="text-blue-200 mt-1 text-sm">Conoce a los profesionales de la Facultad de Tecnologías de la Información</p>
        </div>
      </div>

      {/* Buscador Sticky (Estilo Filtros Noticias) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="relative max-w-sm mx-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-9 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none hover:border-blue-400 focus:border-blue-700 transition-colors" 
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-900"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Cargando docentes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No se encontraron docentes con esos criterios.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col">

                {/* Barra superior */}
                <div className="h-1.5 w-full bg-blue-900" />

                {/* Foto */}
                <div className="flex justify-center pt-7 pb-4">
                  <div
                    onClick={() => setSelected(d)}
                    className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-slate-100 group-hover:ring-blue-100 transition-all duration-300 shadow-md cursor-pointer hover:scale-105"
                  >
                    {d.foto_url
                      ? <img src={d.foto_url} alt={d.nombre} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center bg-slate-200">
                          <span className="text-slate-500 text-2xl font-bold">{iniciales(d.nombre)}</span>
                        </div>
                    }
                  </div>
                </div>

                {/* Info */}
                <div className="px-5 pb-5 flex-1 flex flex-col text-center">
                  <span className="inline-block self-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-blue-50 text-blue-700 mb-2">
                    {d.area || 'Docente'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1">{d.nombre}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 flex-1">{d.titulo}</p>

                  <a
                    href={`mailto:${d.email}`}
                    onClick={e => e.stopPropagation()}
                    className="mt-4 flex items-center justify-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{d.email}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      </div>

      {/* Modal perfil */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col sm:flex-row relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Lado izquierdo con foto a espacio completo */}
            <div className="relative w-full sm:w-2/5 h-64 sm:h-auto shrink-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
              <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-white rounded-full blur-2xl" />
                <div className="absolute bottom-[-20%] right-[-20%] w-full h-full bg-blue-400 rounded-full blur-2xl" />
              </div>

              {/* Foto principal */}
              {selected.foto_url ? (
                <img src={selected.foto_url} alt={selected.nombre} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-10">
                  <span className="text-white text-6xl font-bold opacity-90">{iniciales(selected.nombre)}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-8 sm:p-12 flex-1 flex flex-col text-center sm:text-left bg-white justify-center">
              <div className="mb-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider bg-blue-50 text-blue-700 mb-4 border border-blue-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {selected.area || 'Docente'}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 leading-tight">{selected.nombre}</h2>
                
                {selected.titulo ? (
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {selected.titulo}
                  </p>
                ) : (
                  <p className="text-slate-400 italic text-sm">Sin título registrado</p>
                )}
              </div>
              
              <div className="mt-4 pt-6 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Contacto</p>
                <a
                  href={`mailto:${selected.email}`}
                  className="group flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-200 w-full"
                >
                  <div className="w-9 h-9 rounded-full bg-white group-hover:bg-blue-500 shadow-sm flex items-center justify-center shrink-0 transition-colors">
                    <svg className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="truncate">{selected.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
