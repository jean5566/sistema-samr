import { useState } from 'react'

interface Noticia {
  id: number
  titulo: string
  categoria: 'Académico' | 'Investigación' | 'Eventos' | 'Institucional'
  fecha: string
  descripcion: string
  img?: string
}

const NOTICIAS: Noticia[] = [
  { id: 1, titulo: 'Convocatoria a Congreso TIC 2026', categoria: 'Eventos',       fecha: '1 Abr 2026',  descripcion: 'No te pierdas el evento anual de Tecnologías de la Información. Inscripciones abiertas para estudiantes y docentes.', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80' },
  { id: 2, titulo: 'Nuevas becas disponibles',         categoria: 'Académico',     fecha: '15 Mar 2026', descripcion: 'La UNESUM abre convocatoria para becas de excelencia académica en la carrera de TI para el período 2026-I.',           img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80' },
  { id: 3, titulo: 'Resultados del proyecto IA Edu',  categoria: 'Investigación', fecha: '1 Feb 2026',  descripcion: 'El equipo de investigación presenta los avances del proyecto de Inteligencia Artificial Educativa en colaboración con universidades regionales.', img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80' },
  { id: 4, titulo: 'Actualización plan de estudios',  categoria: 'Institucional', fecha: '20 Ene 2026', descripcion: 'Se aprobó la actualización del pensum de la carrera, incorporando nuevas asignaturas de Cloud Computing y Ciberseguridad.', img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&q=80' },
  { id: 5, titulo: 'Visita empresarial al campus',    categoria: 'Eventos',       fecha: '10 Dic 2025', descripcion: 'Empresas líderes del sector TI visitaron el campus para presentar oportunidades de prácticas preprofesionales a los estudiantes.', img: '' },
  { id: 6, titulo: 'Titulación exitosa promoción 2025', categoria: 'Institucional', fecha: '5 Nov 2025', descripcion: '98 graduados de la promoción 2025 recibieron su título de Ingeniería en TI en acto solemne realizado en el auditorio central.', img: '' },
]

const CAT_COLORS: Record<string, string> = {
  'Académico':     'bg-blue-100 text-blue-700',
  'Investigación': 'bg-violet-100 text-violet-700',
  'Eventos':       'bg-amber-100 text-amber-700',
  'Institucional': 'bg-emerald-100 text-emerald-700',
}
const CAT_BG: Record<string, string> = {
  'Académico':     'bg-blue-400',
  'Investigación': 'bg-violet-500',
  'Eventos':       'bg-amber-400',
  'Institucional': 'bg-emerald-500',
}

export function NoticiasPage() {
  const [cat, setCat] = useState('Todas')
  const cats = ['Todas', 'Académico', 'Investigación', 'Eventos', 'Institucional']
  const filtered = cat === 'Todas' ? NOTICIAS : NOTICIAS.filter(n => n.categoria === cat)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-12 px-6 text-center">
        <h1 className="text-3xl font-bold">Noticias</h1>
        <p className="text-blue-200 mt-1 text-sm">Mantente al día con todo lo que ocurre en la carrera</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 py-3 overflow-x-auto">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                cat === c ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-700'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(n => (
            <div key={n.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-44 overflow-hidden relative">
                {n.img
                  ? <img src={n.img} alt={n.titulo} className="w-full h-full object-cover" />
                  : <div className={`w-full h-full flex items-center justify-center ${CAT_BG[n.categoria]}`}>
                      <span className="text-white text-5xl font-bold opacity-40">{n.categoria[0]}</span>
                    </div>
                }
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CAT_COLORS[n.categoria]}`}>{n.categoria}</span>
                  <span className="text-xs text-gray-400">{n.fecha}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2">{n.titulo}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{n.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 text-sm">No hay noticias en esta categoría.</div>
        )}
      </div>
    </div>
  )
}
