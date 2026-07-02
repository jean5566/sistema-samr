import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

const CATS: Record<string, string> = {
  noticia:  'Noticia',
  evento:   'Evento Académico',
  congreso: 'Congreso',
  feria:    'Feria Tecnológica',
  aviso:    'Aviso Institucional',
}

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

function fmt(raw: string) {
  return new Date(raw.slice(0, 10) + 'T12:00:00')
    .toLocaleDateString('es-EC', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export function NoticiaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [noticia, setNoticia] = useState<Noticia | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get<Noticia>(`/noticias/${id}`)
      .then(res => setNoticia(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-400 text-sm animate-pulse tracking-wide uppercase">Cargando...</p>
      </div>
    )
  }

  if (notFound || !noticia) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <p className="text-slate-400 text-lg font-medium">No se encontró este artículo</p>
        <button onClick={() => navigate('/noticias')}
          className="px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm font-medium">
          Volver a noticias
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-slate-200 relative overflow-hidden">
      {/* Patrón de puntos decorativo en el fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0 opacity-50"></div>

      <div className="relative z-10">
        {/* Header flotante minimalista */}
      <header className="max-w-4xl mx-auto px-6 py-10 flex items-center">
        <button 
          onClick={() => navigate('/noticias')}
          className="group flex items-center gap-2.5 text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Noticias
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6">
        {/* Cabecera del artículo */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
              {CATS[noticia.categoria] ?? noticia.categoria}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
            <span className="text-sm font-medium text-slate-500 capitalize">
              {fmt(noticia.fecha)}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1] mb-8">
            {noticia.titulo}
          </h1>

          {noticia.fecha_realizacion && (
            <div className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Realización: <span className="capitalize text-slate-700">{fmt(noticia.fecha_realizacion)}</span>
            </div>
          )}
        </header>

        {/* Imagen limpia */}
        {noticia.imagen && (
          <figure className="mb-14">
            <img 
              src={noticia.imagen} 
              alt={noticia.titulo} 
              className="w-full h-auto aspect-[16/9] object-cover rounded-3xl bg-slate-50 shadow-sm border border-slate-100" 
            />
          </figure>
        )}

        {/* Contenido principal */}
        <article className="prose prose-slate prose-lg sm:prose-xl max-w-none text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
          {noticia.descripcion}
        </article>
      </main>
      </div>
    </div>
  )
}
