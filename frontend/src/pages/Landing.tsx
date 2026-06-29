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
    if (pool.length <= 1) return
    const t = setInterval(() => {
      setRotIndex(i => i - 1)
    }, 6000)
    return () => clearInterval(t)
  }, [pool.length])

  const safeMod = (n: number, m: number) => ((n % m) + m) % m;
  const displayPool = pool.length > 0 && pool.length <= 4 
    ? [...pool, ...pool, ...pool] 
    : pool;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative flex items-center overflow-hidden bg-blue-900" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80')" }} />
        <div className="relative z-20 px-4 sm:px-8 lg:px-16">
          <h1 className="text-white font-bold leading-tight drop-shadow-lg">
            <span className="block text-2xl sm:text-4xl md:text-5xl">Bienvenidos a</span>
            <span className="block text-2xl sm:text-4xl md:text-5xl">Tecnologías de la Información</span>
          </h1>
          <p className="text-blue-200 text-sm sm:text-lg mt-3 sm:mt-4 max-w-lg">Universidad Estatal del Sur de Manabí — UNESUM</p>
          <button onClick={() => navigate('/login')}
            className="group relative mt-8 inline-flex items-center gap-4 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-full shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden text-sm sm:text-base uppercase tracking-wide cursor-pointer"
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out skew-x-12"></div>
            
            <span className="relative z-10">Acceder al sistema</span>
            
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full relative z-10 transition-transform duration-300 group-hover:translate-x-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-sm"></span>
                <span className="text-xs sm:text-sm font-extrabold tracking-widest text-blue-600 uppercase">Actualidad</span>
              </div>
              <h2 className="text-4xl sm:text-4xl font-black text-blue-900 tracking-tight">
                Noticias <span className="text-blue-600 drop-shadow-sm">Destacadas</span>
              </h2>
            </div>
            <button onClick={() => navigate('/noticias')} className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors w-fit pb-1 cursor-pointer">
              Ver todas las noticias
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 transition-colors shadow-sm">
                <svg className="w-4 h-4 text-blue-600 group-hover:text-white transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>

          {noticias.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No hay noticias publicadas aún.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Noticia principal */}
              {featured && (
                <div className="md:col-span-2 relative rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-slate-900/5 group cursor-pointer"
                  style={{ minHeight: '340px' }} onClick={() => navigate(`/noticias/${featured.id}`)}>
                  {featured.imagen
                    ? <>
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                          style={{ backgroundImage: `url('${featured.imagen}')` }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                      </>
                    : <div className={`absolute inset-0 ${catBg[featured.categoria] ?? 'bg-blue-600'} transition-transform duration-700 group-hover:scale-105 opacity-90`} />
                  }
                  <div className="absolute top-5 left-5 z-10 flex gap-2">
                    <span className="text-white text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
                      ✨ Destacado
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10 flex justify-between items-end">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 text-blue-200">
                        <span className="bg-blue-600/80 text-white px-2.5 py-1 rounded-md backdrop-blur-sm">{catLabel[featured.categoria] ?? featured.categoria}</span>
                        <span>·</span>
                        <span>{fechaCorta(featured.fecha)}</span>
                      </div>
                      <h3 className="text-white font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-tight group-hover:text-blue-100 transition-colors drop-shadow-md">
                        {featured.titulo}
                      </h3>
                      {featured.fecha_realizacion && (
                        <div className="flex items-center gap-2 mt-4 bg-amber-500/20 w-fit px-3.5 py-1.5 rounded-xl border border-amber-500/30 backdrop-blur-sm">
                          <svg className="w-4 h-4 text-amber-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-amber-100 text-xs font-bold">Evento: {fechaCorta(featured.fecha_realizacion)}</span>
                        </div>
                      )}
                    </div>
                    {/* Read more arrow */}
                    <div className="hidden sm:flex shrink-0 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full items-center justify-center transition-all duration-300 group-hover:translate-x-2 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Noticias secundarias */}
              {displayPool.length > 0 && (
                <div className="relative w-full" style={{ height: '422px', clipPath: 'inset(-40px -40px -40px -40px)' }}>
                  {displayPool.map((n, i) => {
                    const relIndex = safeMod(i - rotIndex, displayPool.length);
                    const isVisible = relIndex >= 0 && relIndex <= 2;
                    let topPos = 0;
                    let opacity = 1;
                    
                    if (relIndex === 0) topPos = 0;
                    else if (relIndex === 1) topPos = 146;
                    else if (relIndex === 2) topPos = 292;
                    else if (relIndex === 3) { topPos = 438; opacity = 0; } // Sale por abajo
                    else if (relIndex === displayPool.length - 1) { topPos = -146; opacity = 0; } // Entra por arriba
                    else { topPos = 438; opacity = 0; } // Oculto

                    return (
                      <div key={`${n.id}-${i}`}
                        className="absolute left-0 w-full rounded-3xl overflow-hidden shadow-lg ring-1 ring-slate-900/5 group cursor-pointer transform transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-2xl hover:ring-slate-300/50 hover:scale-[1.02] bg-white"
                        style={{ 
                          height: '130px',
                          top: `${topPos}px`,
                          opacity: opacity,
                          pointerEvents: isVisible ? 'auto' : 'none',
                          zIndex: isVisible ? 10 : 0
                        }}
                        onClick={() => navigate(`/noticias/${n.id}`)}>
                        {n.imagen
                          ? <>
                              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                                style={{ backgroundImage: `url('${n.imagen}')` }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                            </>
                          : <div className={`absolute inset-0 ${catBg[n.categoria] ?? 'bg-blue-600'} transition-transform duration-700 group-hover:scale-105 opacity-90`} />
                        }
                        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 sm:px-5 sm:py-4 z-10 flex flex-col h-full justify-end">
                          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest mb-1.5 text-blue-200">
                            <span className="bg-blue-600/80 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">{catLabel[n.categoria] ?? n.categoria}</span>
                            <span>·</span>
                            <span>{fechaCorta(n.fecha)}</span>
                          </div>
                          <h4 className="text-white font-extrabold text-base leading-snug group-hover:text-blue-100 transition-colors drop-shadow-md line-clamp-2">
                            {n.titulo}
                          </h4>
                          {n.fecha_realizacion && (
                            <div className="flex items-center gap-1 mt-2 bg-amber-500/20 w-fit px-2 py-0.5 rounded-md border border-amber-500/30 backdrop-blur-sm">
                              <svg className="w-3 h-3 text-amber-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-amber-100 text-[9px] font-bold">Evento: {fechaCorta(n.fecha_realizacion)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

            </div>
          )}
        </div>
      </section>

      {/* Section: Documentos & Acceso Rápido */}
      <section className="relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/60 via-white to-white pt-32 pb-20 overflow-hidden">
        
        {/* Organic Wave Separator */}
        <div className="absolute top-0 left-0 w-full z-10" style={{ height: '80px' }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,20 C200,80 400,-20 600,25 C800,70 1000,-10 1200,30 C1320,50 1380,35 1440,25 L1440,0 L0,0 Z" fill="#f9fafb" opacity="0.5" />
            <path d="M0,35 C200,95 400,-5 600,40 C800,85 1000,5 1200,45 C1320,65 1380,50 1440,40 L1440,0 L0,0 Z" fill="#f9fafb" />
          </svg>
        </div>

        {/* Floating Indicator */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 flex justify-center items-center pointer-events-none">
          <div className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(37,99,235,0.15)] border border-blue-100 flex items-center justify-center text-blue-500/70 animate-bounce" style={{ animationDuration: '3s' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            
            {/* Left Column: Documentos */}
            {documentos.length > 0 && (
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-sm"></span>
                      <span className="text-xs sm:text-sm font-extrabold tracking-widest text-blue-600 uppercase">Repositorio</span>
                    </div>
                    <h2 className="text-4xl sm:text-4xl font-black text-blue-900 tracking-tight">
                      Documentos y <span className="text-blue-600 drop-shadow-sm">Recursos</span>
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">Descarga los documentos y formatos oficiales de la carrera</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {documentos.map((doc, i) => {
                    const t = docTipo[doc.tipo] ?? docTipo.otro
                    return (
                      <div key={doc.id} 
                        className="flex flex-col justify-between bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-blue-300 rounded-[1.25rem] p-4 shadow-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
                      >
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`shrink-0 w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center shadow-inner`}>
                              <svg className={`w-5 h-5 ${t.color}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <span className={`inline-block px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider mb-1 border border-current opacity-80 ${t.color}`}>
                                {t.label}
                              </span>
                              <h4 className="text-xs font-extrabold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                                {doc.nombre}
                              </h4>
                            </div>
                          </div>
                          
                          {doc.descripcion && (
                            <p className="text-[11px] text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                              {doc.descripcion}
                            </p>
                          )}
                        </div>

                        <div className="mt-1 pt-3 border-t border-slate-100 flex items-center justify-between">
                          {doc.archivo_tamanio
                            ? <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{fmtBytes(doc.archivo_tamanio)}</span>
                            : <span />
                          }
                          <a
                            href={`/api/documentos/${doc.id}/download`}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white text-[10px] font-bold rounded-lg transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:ring-2 hover:ring-blue-600/30"
                          >
                            <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Descargar
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Right Column: Quick actions */}
            <div className={`shrink-0 w-full ${documentos.length > 0 ? 'lg:w-[320px] xl:w-[360px]' : ''}`}>
              <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/40 rounded-[2rem] p-6 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full shadow-sm"></span>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Acceso Rápido</h3>
                </div>
                
                <div className={`grid gap-4 ${documentos.length > 0 ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-1' : 'grid-cols-2 md:grid-cols-4'}`}>
                  {[
                    { label: 'Página del SGA de la UNESUM', path: 'https://academico.unesum.edu.ec/', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', bg: 'bg-blue-50 hover:bg-blue-100 border-blue-100/50', ic: 'text-blue-600' },
                    { label: 'Página de la UNESUM',         path: 'https://www.unesum.edu.ec/', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100/50', ic: 'text-indigo-600' },
                    { label: 'Biblioteca de la UNESUM',     path: 'https://biblioteca.unesum.edu.ec/', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', bg: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-100/50', ic: 'text-cyan-600' },
                  ].map(item => (
                    <a key={item.label} href={item.path} target="_blank" rel="noopener noreferrer"
                      className={`${item.bg} border rounded-[1.25rem] p-4 flex flex-col lg:flex-row items-center lg:items-start lg:text-left gap-3 lg:gap-4 transition-all duration-300 hover:-translate-y-1 group`}>
                      <div className={`shrink-0 w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center`}>
                        <svg className={`w-6 h-6 ${item.ic}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </div>
                      <div className="flex flex-col justify-center h-12">
                        <span className={`text-sm font-bold leading-tight text-slate-700 group-hover:text-blue-700 transition-colors`}>{item.label}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-100 pt-20 pb-12 lg:pt-24 lg:pb-16 relative overflow-hidden">
        
        {/* Organic Wave Separator (mismo que el Hero) */}
        <div className="absolute -top-[1px] left-0 w-full z-10" style={{ height: '90px' }}>
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="w-full h-full rotate-180" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C200,90 400,0 600,45 C800,90 1000,10 1200,50 C1320,70 1380,55 1440,45 L1440,90 L0,90 Z" fill="#ffffff" />
          </svg>
        </div>

        {/* Decorative subtle gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            
            {/* Column 1: Brand & Desc */}
            <div className="lg:col-span-1">
              <h3 className="text-white text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-400 rounded-sm"></span>
                UNESUM - TI
              </h3>
              <p className="text-sm text-blue-200/80 leading-relaxed mb-6">
                Formando profesionales de excelencia en Tecnologías de la Información, comprometidos con el desarrollo tecnológico y social de la región y el país.
              </p>
            </div>

            {/* Column 2: Contacto */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contacto</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Km. 1.5 Vía a Noboa<br/>Jipijapa - Manabí - Ecuador</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>(05) 260-0229</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@unesum.edu.ec</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Enlaces */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Enlaces de Interés</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.unesum.edu.ec/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full"></span> Universidad Estatal del Sur de Manabí</a></li>
                <li><a href="https://academico.unesum.edu.ec/login" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full"></span> Sistema de Gestión Académica (SGA)</a></li>
                <li><a href="https://biblioteca.unesum.edu.ec/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full"></span> Biblioteca Virtual</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full"></span> Admisión y Nivelación</a></li>
              </ul>
            </div>

            {/* Column 4: Redes Sociales */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Síguenos</h4>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/people/Carrera-Tecnologia-Informacion/100072265129526/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-800/50 border border-blue-700/50 flex items-center justify-center text-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all shadow-sm">
                  {/* Facebook Icon */}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/ti_unesum" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-800/50 border border-blue-700/50 flex items-center justify-center text-blue-200 hover:bg-pink-600 hover:text-white hover:border-pink-500 transition-all shadow-sm">
                  {/* Instagram Icon */}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-blue-800/50 text-center text-xs text-blue-300">
            <p>&copy; {new Date().getFullYear()} Universidad Estatal del Sur de Manabí. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
