import { useEffect, useState } from 'react'
import api from '../../lib/api'

interface Docente {
  id: number
  nombre: string
  titulo: string
  area: string
  email: string
  telefono: string | null
  bio: string | null
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

export function EstudianteDocentes() {
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/docentes')
      .then(res => setDocentes(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Estudiante</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Mis Docentes</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <p className="text-xs text-gray-400 mb-5">
          Docentes registrados en el período <span className="font-semibold text-gray-600">2026-I</span>
        </p>

        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Cargando docentes...</div>
        )}

        {!loading && docentes.length === 0 && (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">No hay docentes registrados.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {docentes.map((d, i) => (
            <div key={d.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-20 ${COLORS[i % COLORS.length]} flex items-center justify-center overflow-hidden`}>
                {d.foto_url
                  ? <img src={d.foto_url} alt={d.nombre} className="w-full h-full object-cover" />
                  : <span className="text-white text-3xl font-bold">{iniciales(d.nombre)}</span>}
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold text-gray-900">{d.nombre}</h3>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">{d.area}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.titulo}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    <a href={`mailto:${d.email}`} className="hover:text-blue-600 transition truncate">{d.email}</a>
                  </div>
                  {d.telefono && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {d.telefono}
                    </div>
                  )}
                </div>
                <a href={`mailto:${d.email}`}
                  className="mt-4 w-full block text-center text-xs font-semibold text-blue-600 border border-blue-200 rounded-md py-1.5 hover:bg-blue-50 transition">
                  Enviar mensaje
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
