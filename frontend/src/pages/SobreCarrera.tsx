export function SobreCarrera() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-6 pt-12 pb-24 space-y-20">
        
        {/* Equipo Docente */}
        <section>
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight mb-5">
              Nuestro Equipo <span className="text-blue-600">Docente</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Contamos con profesionales altamente capacitados y comprometidos con la excelencia de nuestros estudiantes.
            </p>
          </div>

          <div className="w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-lg mt-8">
            <div className="relative w-full aspect-[16/9] md:aspect-[2.5/1]">
              <img 
                src="/foto-docentes.jpg" 
                alt="Plana Docente de la Carrera" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/docentes.jpg';
                }}
              />
            </div>
          </div>
        </section>

        {/* Info Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-200">
          {[
            { title: 'Duración', value: '8 Semestres', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { title: 'Modalidad', value: 'Presencial', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { title: 'Titulación', value: 'Ingeniero en TI', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          ].map((item, idx) => (
            <div key={idx} className="p-8 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-blue-50 transition-all">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{item.title}</h3>
              <p className="text-xl font-extrabold text-slate-800">{item.value}</p>
            </div>
          ))}
        </section>

        {/* Misión y Visión */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Misión</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-base">
              Formar profesionales competentes en Tecnologías de la Información, con sólidos conocimientos científicos, técnicos y humanísticos, capaces de diseñar, implementar y gestionar soluciones tecnológicas innovadoras que contribuyan al desarrollo sostenible de la sociedad.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Visión</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-base">
              Ser una carrera de referencia regional en la formación de talento humano en Tecnologías de la Información, reconocida por la calidad académica, la investigación aplicada y la vinculación con la comunidad.
            </p>
          </div>
        </section>

      </main>
    </div>
  )
}
