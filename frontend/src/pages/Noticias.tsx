import { useEffect, useState } from 'react'
import api from '../lib/api'

interface Noticia {
  id: number
  titulo: string
  categoria: string
  fecha: string
  descripcion: string
  imagen: string | null
}

const CATS = [
  { value: '',         label: 'Todas'              },
  { value: 'noticia',  label: 'Noticia'             },
  { value: 'evento',   label: 'Evento Académico'    },
  { value: 'congreso', label: 'Congreso'            },
  { value: 'feria',    label: 'Feria Tecnológica'   },
  { value: 'aviso',    label: 'Aviso Institucional' },
]

const CAT_COLORS: Record<string, string> = {
  noticia:  'bg-blue-100 text-blue-700',
  evento:   'bg-indigo-100 text-indigo-700',
  congreso: 'bg-purple-100 text-purple-700',
  feria:    'bg-cyan-100 text-cyan-700',
  aviso:    'bg-amber-100 text-amber-700',
}

const CAT_BG: Record<string, string> = {
  noticia:  'bg-blue-500',
  evento:   'bg-indigo-500',
  congreso: 'bg-purple-500',
  feria:    'bg-cyan-500',
  aviso:    'bg-amber-400',
}

function fechaFormato(raw: string) {
  return new Date(raw.slice(0, 10) + 'T12:00:00')
    .toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading]   = useState(true)
  const [cat, setCat]           = useState('')

  useEffect(() => {
    api.get<Noticia[]>('/noticias')
      .then(res => setNoticias(res.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = cat ? noticias.filter(n => n.categoria === cat) : noticias

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-12 px-6 text-center">
        <h1 className="text-3xl font-bold">Noticias</h1>
        <p className="text-blue-200 mt-1 text-sm">Mantente al día con todo lo que ocurre en la carrera</p>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 py-3 overflow-x-auto">
          {CATS.map(c => (
            <button key={c.value} onClick={() => setCat(c.value)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                cat === c.value
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-700'
              }`}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Cargando noticias...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No hay noticias en esta categoría.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(n => (
              <div key={n.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-44 overflow-hidden relative">
                  {n.imagen
                    ? <img src={n.imagen} alt={n.titulo} className="w-full h-full object-cover" />
                    : <div className={`w-full h-full flex items-center justify-center ${CAT_BG[n.categoria] ?? 'bg-blue-400'}`}>
                        <span className="text-white text-5xl font-bold opacity-40">{n.titulo[0]}</span>
                      </div>
                  }
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CAT_COLORS[n.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
                      {CATS.find(c => c.value === n.categoria)?.label ?? n.categoria}
                    </span>
                    <span className="text-xs text-gray-400">{fechaFormato(n.fecha)}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2">{n.titulo}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{n.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
