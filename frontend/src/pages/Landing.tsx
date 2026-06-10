import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../lib/api'

const STORAGE_URL = 'http://127.0.0.1:8000/storage'

interface Documento {
  id: number
  nombre: string
  tipo: 'planificacion' | 'curriculo' | 'reglamento' | 'resolucion' | 'otro'
  descripcion: string | null
  archivo: string
  archivo_nombre: string
  archivo_tamanio: number | null
}

const docTipo: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  planificacion: { label: 'Planificación', color: 'text-blue-700',    bg: 'bg-blue-50',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  curriculo:     { label: 'Currículo',     color: 'text-emerald-700', bg: 'bg-emerald-50', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  reglamento:    { label: 'Reglamento',    color: 'text-purple-700',  bg: 'bg-purple-50',  icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
  resolucion:    { label: 'Resolución',    color: 'text-amber-700',   bg: 'bg-amber-50',   icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  otro:          { label: 'Documento',     color: 'text-gray-600',    bg: 'bg-gray-50',    icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
}

function fmtBytes(b: number | null) {
  if (!b) return ''
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

interface Noticia {
  id: number
  titulo: string
  categoria: string
  fecha: string
  fecha_realizacion: string | null
  descripcion: string
  imagen: string | null
  destacada: boolean
}

const catLabel: Record<string, string> = {
  noticia:  'Noticia',
  evento:   'Evento Académico',
  congreso: 'Congreso',
  feria:    'Feria Tecnológica',
  aviso:    'Aviso Institucional',
}

const catBg: Record<string, string> = {
  noticia:  'bg-blue-500',
  evento:   'bg-indigo-500',
  congreso: 'bg-purple-500',
  feria:    'bg-cyan-500',
  aviso:    'bg-amber-400',
}

function fechaCorta(raw: string) {
  return new Date(raw.slice(0, 10) + 'T12:00:00')
    .toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function Landing() {
  const navigate = useNavigate()
  const [noticias, setNoticias]     = useState<Noticia[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [rotIndex, setRotIndex]     = useState(0)
  const [visible, setVisible]       = useState(true)

  useEffect(() => {
    api.get<Noticia[]>('/noticias').then(res => setNoticias(res.data))
    api.get<Documento[]>('/documentos').then(res => setDocumentos(res.data))
  }, [])

  const featured = noticias.find(n => n.destacada) ?? noticias[0] ?? null
  const pool     = noticias.filter(n => n.id !== featured?.id)

  useEffect(() => {
    if (pool.length <= 2) return
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setRotIndex(i => i + 1)
        setVisible(true)
      }, 550)
    }, 6000)
    return () => clearInterval(t)
  }, [pool.length])

  const secondary = pool.length > 0
    ? [pool[rotIndex % pool.length], pool[(rotIndex + 1) % pool.length]].filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative flex items-center overflow-hidden bg-blue-900" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80')" }} />
        <div className="relative z-20 px-16">
          <h1 className="text-white font-bold leading-tight drop-shadow-lg">
            <span className="block text-4xl md:text-5xl">Bienvenidos a</span>
            <span className="block text-4xl md:text-5xl">Tecnologías de la Información</span>
          </h1>
          <p className="text-blue-200 text-lg mt-4 max-w-lg">Universidad Estatal del Sur de Manabí — UNESUM</p>
          <button onClick={() => navigate('/login')}
            className="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition shadow-lg text-sm">
            Acceder al sistema
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full z-30" style={{ height: '90px' }}>
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C200,90 400,0 600,45 C800,90 1000,10 1200,50 C1320,70 1380,55 1440,45 L1440,90 L0,90 Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Noticias */}
      <section className="bg-gray-50 pb-14 pt-6">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6 border-b-2 border-blue-100 pb-2 text-blue-900">Noticias Destacadas</h2>

          {noticias.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No hay noticias publicadas aún.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Noticia principal */}
              {featured && (
                <div className="md:col-span-2 relative rounded-2xl overflow-hidden shadow-md group cursor-pointer"
                  style={{ minHeight: '260px' }} onClick={() => navigate(`/noticias/${featured.id}`)}>
                  {featured.imagen
                    ? <>
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{ backgroundImage: `url('${featured.imagen}')` }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      </>
                    : <div className={`absolute inset-0 ${catBg[featured.categoria] ?? 'bg-blue-500'} group-hover:brightness-110 transition`} />
                  }
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide bg-blue-500">Destacado</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-blue-300">
                      {catLabel[featured.categoria] ?? featured.categoria} · {fechaCorta(featured.fecha)}
                    </p>
                    <h3 className="text-white font-bold text-2xl leading-tight">{featured.titulo}</h3>
                    {featured.fecha_realizacion && (
                      <div className="flex items-center gap-1.5 mt-3">
                        <svg className="w-3.5 h-3.5 text-amber-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-amber-300 text-xs font-semibold">Se realiza el {fechaCorta(featured.fecha_realizacion)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Noticias secundarias */}
              {secondary.length > 0 && (
                <div className="flex flex-col gap-6">
                  {secondary.map((n, i) => (
                    <div key={n.id}
                      className={`relative rounded-2xl overflow-hidden shadow-md group cursor-pointer flex-1 noticia-enter ${visible ? 'opacity-100' : 'opacity-0'}`}
                      style={{ minHeight: '160px', transition: 'opacity 0.5s ease', animationDelay: `${i * 120}ms` }}
                      onClick={() => navigate(`/noticias/${n.id}`)}>
                      {n.imagen
                        ? <>
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                              style={{ backgroundImage: `url('${n.imagen}')` }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                          </>
                        : <div className={`absolute inset-0 ${catBg[n.categoria] ?? 'bg-blue-500'} group-hover:brightness-110 transition`} />
                      }
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                        <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-0.5">
                          {catLabel[n.categoria] ?? n.categoria} · {fechaCorta(n.fecha)}
                        </p>
                        <h4 className="text-white font-bold text-sm leading-tight">{n.titulo}</h4>
                        {n.fecha_realizacion && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <svg className="w-3 h-3 text-amber-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-amber-300 text-[11px] font-semibold">Se realiza el {fechaCorta(n.fecha_realizacion)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      </section>

      {/* Documentos */}
      {documentos.length > 0 && (
        <section className="bg-white py-14">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-6 border-b-2 border-blue-100 pb-2">
              <div>
                <h2 className="text-2xl font-bold text-blue-900">Documentos y Recursos</h2>
                <p className="text-sm text-gray-400 mt-0.5">Descarga los documentos oficiales de la carrera</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentos.map(doc => {
                const t = docTipo[doc.tipo] ?? docTipo.otro
                return (
                  <div key={doc.id} className="flex items-start gap-4 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-2xl p-5 transition-colors group">
                    <div className={`shrink-0 w-11 h-11 rounded-xl ${t.bg} flex items-center justify-center`}>
                      <svg className={`w-5 h-5 ${t.color}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${t.color}`}>{t.label}</span>
                      <h4 className="text-sm font-semibold text-gray-900 leading-snug mt-0.5 truncate">{doc.nombre}</h4>
                      {doc.descripcion && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{doc.descripcion}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        {doc.archivo_tamanio
                          ? <span className="text-[11px] text-gray-400">{fmtBytes(doc.archivo_tamanio)}</span>
                          : <span />
                        }
                        <a
                          href={`/api/documentos/${doc.id}/download`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Descargar
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">Acceso rápido</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Sobre la Carrera', path: '/sobre',    icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z', bg: 'bg-blue-50', ic: 'text-blue-600' },
              { label: 'Docentes',         path: '/docentes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', bg: 'bg-indigo-50', ic: 'text-indigo-600' },
              { label: 'Noticias',         path: '/noticias', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', bg: 'bg-cyan-50', ic: 'text-cyan-600' },
              { label: 'Ingresar',         path: '/login',    icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1', bg: 'bg-blue-900', ic: 'text-white' },
            ].map(item => (
              <button key={item.label} onClick={() => navigate(item.path)}
                className={`${item.bg} rounded-2xl p-6 flex flex-col items-center gap-3 hover:scale-105 transition-transform shadow-sm`}>
                <svg className={`w-8 h-8 ${item.ic}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className={`text-sm font-semibold ${item.label === 'Ingresar' ? 'text-white' : 'text-gray-700'}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
