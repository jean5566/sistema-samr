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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    )
  }

  if (notFound || !noticia) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg font-semibold">Noticia no encontrada</p>
        <button onClick={() => navigate('/noticias')}
          className="text-blue-600 hover:underline text-sm">
          Volver a noticias
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Imagen de portada */}
      <div className="relative w-full" style={{ height: '380px' }}>
        {noticia.imagen
          ? <>
              <img src={noticia.imagen} alt={noticia.titulo} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </>
          : <div className={`w-full h-full ${CAT_BG[noticia.categoria] ?? 'bg-blue-500'} flex items-center justify-center`}>
              <span className="text-white/20 text-[120px] font-black leading-none">{noticia.titulo[0]}</span>
            </div>
        }
        {/* Botón volver */}
        <button onClick={() => navigate('/noticias')}
          className="absolute top-5 left-5 z-10 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        {/* Categoría badge */}
        <div className="absolute bottom-6 left-6 z-10">
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${CAT_COLORS[noticia.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
            {CATS[noticia.categoria] ?? noticia.categoria}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-5">{noticia.titulo}</h1>

        {/* Fechas */}
        <div className="flex flex-wrap gap-5 mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Publicado el <strong className="text-gray-700 font-semibold capitalize">{fmt(noticia.fecha)}</strong></span>
          </div>
          {noticia.fecha_realizacion && (
            <div className="flex items-center gap-2 text-sm text-indigo-600">
              <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Fecha de realización: <strong className="font-semibold capitalize">{fmt(noticia.fecha_realizacion)}</strong></span>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-gray-200 mb-8" />

        {/* Descripción completa */}
        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
          {noticia.descripcion}
        </div>
      </div>
    </div>
  )
}
