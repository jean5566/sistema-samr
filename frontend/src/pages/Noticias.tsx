import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

interface Noticia {
  id: number
  titulo: string
  categoria: string
  fecha: string
  fecha_realizacion: string | null
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
  const navigate = useNavigate()
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-slate-200 relative overflow-hidden">
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
          <h1 className="text-3xl font-bold text-white">Noticias</h1>
          <p className="text-blue-200 mt-1 text-sm">Mantente al día con todo lo que ocurre en la carrera</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 mb-12">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-6 py-4 overflow-x-auto no-scrollbar">
          {CATS.map(c => (
            <button key={c.value} onClick={() => setCat(c.value)}
              className={`shrink-0 text-sm font-semibold transition-colors ${
                cat === c.value
                  ? 'text-slate-900 border-b-2 border-slate-900 pb-1'
                  : 'text-slate-400 hover:text-slate-600 pb-1 border-b-2 border-transparent'
              }`}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-6">
        {loading ? (
          <div className="py-20 text-slate-400 text-sm animate-pulse tracking-wide uppercase">Cargando noticias...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-slate-400 text-base font-medium">No hay noticias en esta categoría.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filtered.map(n => (
              <article key={n.id} onClick={() => navigate(`/noticias/${n.id}`)}
                className="group cursor-pointer flex flex-col">
                
                {/* Imagen limpia */}
                <figure className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-50 mb-5 border border-slate-100">
                  {n.imagen ? (
                    <img src={n.imagen} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <span className="text-slate-300 text-6xl font-black">{n.titulo[0]}</span>
                    </div>
                  )}
                  {/* Etiqueta flotante */}
                  <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm`}>
                      {CATS.find(c => c.value === n.categoria)?.label ?? n.categoria}
                    </span>
                  </div>
                </figure>

                {/* Contenido */}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-slate-400 capitalize">{fechaFormato(n.fecha)}</span>
                    {n.fecha_realizacion && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <span className="text-xs font-medium text-indigo-500 flex items-center gap-1">
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           {fechaFormato(n.fecha_realizacion)}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {n.titulo}
                  </h3>
                  
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4">
                    {n.descripcion}
                  </p>
                  
                  <div className="mt-auto">
                     <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                       Leer artículo 
                       <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                       </svg>
                     </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
