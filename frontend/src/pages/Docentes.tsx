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

const COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
]

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
    <div className="min-h-screen bg-gray-50">
      {/* Header (Estilo Noticias) */}
      <div className="bg-blue-900 text-white py-12 px-6 text-center">
        <h1 className="text-3xl font-bold">Nuestro Equipo Docente</h1>
        <p className="text-blue-200 mt-1 text-sm">Conoce a los profesionales de la Facultad de Tecnologías de la Información</p>
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
              placeholder="Buscar por nombre o área..."
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

      {/* Cards (Estilo Noticias) */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Cargando docentes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No se encontraron docentes con esos criterios.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(d => (
              <div key={d.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col">
                <div className="h-44 overflow-hidden relative">
                  {d.foto_url
                    ? <img src={d.foto_url} alt={d.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center bg-blue-100">
                        <span className="text-blue-300 text-5xl font-bold">{iniciales(d.nombre)}</span>
                      </div>
                  }
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-blue-100 text-blue-700">
                      {d.area || 'Docente'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2">{d.nombre}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{d.titulo}</p>
                  
                  <div className="flex-1"></div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <a href={`mailto:${d.email}`} className="text-xs text-blue-600 font-semibold group-hover:underline flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      {d.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
