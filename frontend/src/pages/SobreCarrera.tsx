import { useState, useEffect } from 'react'

function Typewriter({ text, delay = 100 }: { text: string, delay?: number }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, delay)
    return () => clearInterval(timer)
  }, [text, delay])

  return (
    <span>
      {displayedText}
      <span className="animate-pulse border-r-4 border-blue-500 ml-1 inline-block h-[0.7em] translate-y-0.5 opacity-70"></span>
    </span>
  )
}

export function SobreCarrera() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-slate-200 relative overflow-hidden">
      {/* Patrón de puntos decorativo en el fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0 opacity-50"></div>

      <div className="relative z-10">
        {/* Header original (conservado por preferencia del usuario) */}
      <div className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative px-6 py-12 text-center">
          <h1 className="text-3xl font-bold text-white">Sobre la Carrera</h1>
          <p className="text-blue-200 mt-1 text-sm">Conoce nuestra propuesta académica, equipo docente y los valores que nos guían</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 pt-16 pb-32 space-y-24">
        {/* Info Grid Minimalista */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: 'Duración',
              value: '8 Semestres',
              sub: '4 años de formación',
              icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            },
            {
              title: 'Modalidad',
              value: 'Presencial',
              sub: 'Campus universitario',
              icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
            },
            {
              title: 'Titulación',
              value: 'Ing. en TI',
              sub: 'Título profesional',
              icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col border-t border-slate-200 pt-6 group"
            >
              <div className="flex items-center gap-3 mb-4 text-blue-600 group-hover:text-blue-800 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <p className="text-xs font-bold uppercase tracking-widest">{item.title}</p>
              </div>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500 mb-1">
                <Typewriter text={item.value} delay={80} />
              </p>
              <p className="text-sm text-slate-500">{item.sub}</p>
            </div>
          ))}
        </section>

        {/* Equipo Docente */}
        <section>
          <div className="mb-10">
            <h2 className="text-4xl font-black tracking-tight mb-4 text-slate-900">
              Equipo <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">Docente</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">
              Profesionales altamente capacitados y comprometidos con la excelencia académica, guiando a la próxima generación de líderes en tecnología.
            </p>
          </div>

          <figure className="relative w-full aspect-[16/9] md:aspect-[2.5/1] rounded-3xl overflow-hidden group shadow-xl hover:shadow-2xl transition-shadow duration-500 border border-slate-200/60 ring-1 ring-slate-900/5">
            <img
              src="/foto-docentes.jpg"
              alt="Plana Docente de la Carrera"
              className="w-full h-full object-cover object-[center_75%] group-hover:scale-105 transition-transform duration-1000 ease-in-out"
              onError={(e) => {
                e.currentTarget.src = '/docentes.jpg';
              }}
            />
            {/* Overlay elegante */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
            
            {/* Badge decorativo flotante */}
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
              
            </div>
          </figure>
        </section>

        {/* Misión y Visión */}
        <section>
          <div className="mb-12 border-b border-slate-100 pb-8">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Propósito y <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">Visión</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            {/* Misión */}
            <article>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Nuestra Misión
              </h3>
              <p className="text-slate-700 leading-relaxed text-lg md:text-xl font-medium">
                Formar profesionales competentes en Tecnologías de la Información, con sólidos conocimientos científicos, técnicos y humanísticos, capaces de diseñar, implementar y gestionar soluciones tecnológicas innovadoras que contribuyan al desarrollo sostenible de la sociedad.
              </p>
            </article>

            {/* Visión */}
            <article>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Nuestra Visión
              </h3>
              <p className="text-slate-700 leading-relaxed text-lg md:text-xl font-medium">
                Ser una carrera de referencia regional en la formación de talento humano en Tecnologías de la Información, reconocida por la calidad académica, la investigación aplicada y la vinculación con la comunidad.
              </p>
            </article>
          </div>
        </section>
      </main>
      </div>
    </div>
  )
}
