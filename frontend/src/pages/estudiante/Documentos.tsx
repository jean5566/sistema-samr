import { useState } from 'react'

interface Documento {
  id: number
  nombre: string
  tipo: 'PDF' | 'DOCX' | 'XLSX'
  categoria: 'Reglamentos' | 'Formularios' | 'Horarios' | 'Circulares'
  tamaño: string
  fecha: string
  publico: boolean
}

const DOCUMENTOS: Documento[] = [
  { id: 1, nombre: 'Reglamento Interno 2026',          tipo: 'PDF',  categoria: 'Reglamentos', tamaño: '1.2 MB', fecha: '1 Mar 2026',  publico: true  },
  { id: 2, nombre: 'Formulario de Matrícula',           tipo: 'DOCX', categoria: 'Formularios', tamaño: '245 KB', fecha: '15 Feb 2026', publico: true  },
  { id: 3, nombre: 'Horarios 2026-I',                   tipo: 'PDF',  categoria: 'Horarios',    tamaño: '890 KB', fecha: '10 Feb 2026', publico: true  },
  { id: 4, nombre: 'Circular No. 012 — Titulación',    tipo: 'PDF',  categoria: 'Circulares',  tamaño: '320 KB', fecha: '5 Ene 2026',  publico: true  },
  { id: 5, nombre: 'Formulario de Convalidación',       tipo: 'DOCX', categoria: 'Formularios', tamaño: '130 KB', fecha: '20 Dic 2025', publico: true  },
  { id: 6, nombre: 'Distributivo Docente 2026-I',       tipo: 'XLSX', categoria: 'Horarios',    tamaño: '450 KB', fecha: '8 Feb 2026',  publico: true  },
  { id: 7, nombre: 'Reglamento de Prácticas',           tipo: 'PDF',  categoria: 'Reglamentos', tamaño: '780 KB', fecha: '1 Nov 2025',  publico: false },
  { id: 8, nombre: 'Solicitud de Equivalencias',        tipo: 'DOCX', categoria: 'Formularios', tamaño: '98 KB',  fecha: '15 Oct 2025', publico: true  },
]

const TIPO_COLORS: Record<string, { bg: string; text: string }> = {
  PDF:  { bg: 'bg-red-100',   text: 'text-red-600'   },
  DOCX: { bg: 'bg-blue-100',  text: 'text-blue-600'  },
  XLSX: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
}

const CAT_COLORS: Record<string, string> = {
  Reglamentos: 'bg-violet-100 text-violet-700',
  Formularios: 'bg-blue-100 text-blue-700',
  Horarios:    'bg-amber-100 text-amber-700',
  Circulares:  'bg-emerald-100 text-emerald-700',
}

export function EstudianteDocumentos() {
  const [search, setSearch] = useState('')
  const [catFil, setCatFil] = useState('Todos')
  const cats = ['Todos', 'Reglamentos', 'Formularios', 'Horarios', 'Circulares']

  const filtered = DOCUMENTOS.filter(d =>
    d.publico &&
    (catFil === 'Todos' || d.categoria === catFil) &&
    d.nombre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Estudiante</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Documentos</h1>
        </div>
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">JG</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documento..."
              className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
          </div>
          <div className="flex gap-2">
            {cats.map(c => (
              <button key={c} onClick={() => setCatFil(c)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                  catFil === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }`}>{c}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoría</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tamaño</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${TIPO_COLORS[d.tipo].bg} ${TIPO_COLORS[d.tipo].text}`}>{d.tipo}</span>
                      <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{d.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[d.categoria]}`}>{d.categoria}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">{d.tamaño}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">{d.fecha}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1 ml-auto">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No hay documentos disponibles.</div>
          )}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">{filtered.length} documento{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </>
  )
}
