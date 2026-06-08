import { useEffect, useState } from 'react'
import api from '../lib/api'

interface Docente {
  id: number
  nombre: string
  titulo: string
  area: string
  email: string
  foto_url: string | null
}

const COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500',  'bg-cyan-500',   'bg-indigo-500',  'bg-teal-500',
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
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    api.get('/docentes')
      .then(res => setDocentes(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = docentes.filter(d =>
    d.nombre.toLowerCase().includes(search.toLowerCase()) ||
    d.area.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-12 px-6 text-center">
        <h1 className="text-3xl font-bold">Nuestros Docentes</h1>
        <p className="text-blue-200 mt-1 text-sm">Conoce al equipo académico de la carrera de TI</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 max-w-sm relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar docente o área..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-300 shadow-sm" />
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-400 text-sm">Cargando docentes...</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((d, i) => (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-20 h-20 rounded-full ${COLORS[i % COLORS.length]} mx-auto mb-4 overflow-hidden flex items-center justify-center`}>
                {d.foto_url
                  ? <img src={d.foto_url} alt={d.nombre} className="w-full h-full object-cover" />
                  : <span className="text-white text-2xl font-bold">{iniciales(d.nombre)}</span>}
              </div>
              <h3 className="text-sm font-bold text-gray-900 leading-snug">{d.nombre}</h3>
              <p className="text-xs text-gray-400 mt-1">{d.titulo}</p>
              <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{d.area}</span>
              <a href={`mailto:${d.email}`} className="block text-xs text-blue-600 hover:underline mt-3 truncate">{d.email}</a>
            </div>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 text-sm">No se encontraron docentes.</div>
        )}
      </div>
    </div>
  )
}
