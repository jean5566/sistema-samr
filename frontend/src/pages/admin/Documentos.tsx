import { useState, useMemo, useRef } from 'react'

interface Documento {
  id: number
  nombre: string
  tipo: 'planificacion' | 'curriculo' | 'reglamento' | 'resolucion' | 'otro'
  acceso: 'publico' | 'interno'
  descripcion: string
  archivo: string
  subidoPor: string
  fecha: string
}

const tipoConfig: Record<string, { label: string; cls: string }> = {
  planificacion: { label: 'Planificación',  cls: 'border-blue-200 bg-blue-50 text-blue-700'      },
  curriculo:     { label: 'Rediseño Curr.', cls: 'border-violet-200 bg-violet-50 text-violet-700'  },
  reglamento:    { label: 'Reglamento',     cls: 'border-amber-200 bg-amber-50 text-amber-700'    },
  resolucion:    { label: 'Resolución',     cls: 'border-purple-200 bg-purple-50 text-purple-700' },
  otro:          { label: 'Otro',           cls: 'border-gray-200 bg-gray-50 text-gray-500'        },
}

const extStyle: Record<string, { bg: string; text: string }> = {
  pdf:  { bg: 'bg-red-50',    text: 'text-red-600'    },
  docx: { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  doc:  { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  xlsx: { bg: 'bg-emerald-50',text: 'text-emerald-600' },
  xls:  { bg: 'bg-emerald-50',text: 'text-emerald-600' },
}

const initialDocs: Documento[] = [
  { id: 1, nombre: 'Plan de Estudios 2026',                   tipo: 'planificacion', acceso: 'publico',  descripcion: 'Malla curricular vigente del período 2026.',               archivo: 'plan_estudios_2026.pdf',      subidoPor: 'Carlos Mendoza', fecha: '2026-01-10' },
  { id: 2, nombre: 'Rediseño Curricular TI 2025',             tipo: 'curriculo',     acceso: 'publico',  descripcion: 'Propuesta aprobada de rediseño curricular.',               archivo: 'rediseno_curriculo_2025.pdf', subidoPor: 'Carlos Mendoza', fecha: '2025-11-20' },
  { id: 3, nombre: 'Reglamento Interno de la Carrera',        tipo: 'reglamento',    acceso: 'publico',  descripcion: 'Normativa general que rige la carrera de TI.',             archivo: 'reglamento_cti.pdf',          subidoPor: 'Carlos Mendoza', fecha: '2025-08-05' },
  { id: 4, nombre: 'Resolución de Aprobación Período 2026-I', tipo: 'resolucion',    acceso: 'interno',  descripcion: 'Resolución emitida por el consejo directivo.',             archivo: 'resolucion_2026_I.pdf',       subidoPor: 'Carlos Mendoza', fecha: '2026-01-15' },
  { id: 5, nombre: 'Planificación Académica Semestre I 2026', tipo: 'planificacion', acceso: 'interno',  descripcion: 'Distribución de materias, horarios y docentes.',           archivo: 'planificacion_2026_I.xlsx',   subidoPor: 'Carlos Mendoza', fecha: '2026-02-01' },
  { id: 6, nombre: 'Reglamento de Titulación',                tipo: 'reglamento',    acceso: 'publico',  descripcion: 'Proceso, requisitos y modalidades para la titulación.',   archivo: 'reglamento_titulacion.pdf',   subidoPor: 'Carlos Mendoza', fecha: '2025-09-12' },
]

const emptyForm = { nombre: '', tipo: 'planificacion' as Documento['tipo'], acceso: 'publico' as Documento['acceso'], descripcion: '', archivo: '' }
const getExt = (nombre: string) => nombre.split('.').pop()?.toLowerCase() ?? 'pdf'

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-2'

export function AdminDocumentos() {
  const [docs, setDocs]                   = useState<Documento[]>(initialDocs)
  const [search, setSearch]               = useState('')
  const [filterTipo, setFilterTipo]       = useState('')
  const [filterAcceso, setFilterAcceso]   = useState('')
  const [modalOpen, setModalOpen]         = useState(false)
  const [editingId, setEditingId]         = useState<number | null>(null)
  const [form, setForm]                   = useState(emptyForm)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() =>
    docs.filter(d =>
      d.nombre.toLowerCase().includes(search.toLowerCase()) &&
      (filterTipo   ? d.tipo   === filterTipo   : true) &&
      (filterAcceso ? d.acceso === filterAcceso : true)
    ), [docs, search, filterTipo, filterAcceso])

  function openNew()  { setEditingId(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(id: number) {
    const d = docs.find(x => x.id === id)!
    setEditingId(id)
    setForm({ nombre: d.nombre, tipo: d.tipo, acceso: d.acceso, descripcion: d.descripcion, archivo: d.archivo })
    setModalOpen(true)
  }
  function save() {
    if (!form.nombre) return
    const archivo = fileRef.current?.files?.[0]?.name || form.archivo || 'documento.pdf'
    if (editingId !== null) {
      setDocs(p => p.map(d => d.id === editingId ? { ...d, ...form, archivo } : d))
    } else {
      setDocs(p => [{ id: Date.now(), ...form, archivo, subidoPor: 'Carlos Mendoza', fecha: new Date().toISOString().slice(0, 10) }, ...p])
    }
    setModalOpen(false)
  }

  return (
    <>
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Administración</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Documentos Institucionales</h1>
        </div>
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">CM</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documento..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-400" />
            </div>

            <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition select-styled">
              <option value="">Todas las categorías</option>
              <option value="planificacion">Planificación Académica</option>
              <option value="curriculo">Rediseño Curricular</option>
              <option value="reglamento">Reglamento</option>
              <option value="resolucion">Resolución</option>
              <option value="otro">Otro</option>
            </select>

            <select value={filterAcceso} onChange={e => setFilterAcceso(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition select-styled">
              <option value="">Todo el acceso</option>
              <option value="publico">Público</option>
              <option value="interno">Solo interno</option>
            </select>

            <button onClick={openNew}
              className="ml-auto inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Subir documento
            </button>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Documento', 'Categoría', 'Acceso', 'Subido por', 'Fecha', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 text-sm font-medium">No se encontraron documentos</p>
                  </td>
                </tr>
              ) : filtered.map(d => {
                const ext  = getExt(d.archivo)
                const tc   = tipoConfig[d.tipo]
                const es   = extStyle[ext] ?? { bg: 'bg-gray-50', text: 'text-gray-400' }
                const fecha = new Date(d.fecha + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
                return (
                  <tr key={d.id} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${es.bg} flex items-center justify-center shrink-0`}>
                          <span className={`text-[10px] font-bold uppercase ${es.text}`}>{ext}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{d.nombre}</p>
                          {d.descripcion && <p className="text-gray-400 text-xs mt-0.5 line-clamp-1 max-w-xs">{d.descripcion}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${tc.cls}`}>{tc.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      {d.acceso === 'publico'
                        ? <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Público
                          </span>
                        : <span className="inline-flex items-center gap-1.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Interno
                          </span>
                      }
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-sm">{d.subidoPor}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs tabular-nums">{fecha}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => alert(`Descargando: ${d.archivo}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition" title="Descargar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button onClick={() => openEdit(d.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setDocs(p => p.filter(x => x.id !== d.id))}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Eliminar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Footer */}
          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Mostrando <span className="font-semibold text-gray-600">{filtered.length}</span> de <span className="font-semibold text-gray-600">{docs.length}</span> documentos
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{editingId !== null ? 'Editar documento' : 'Subir documento'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX o XLSX — máx. 20 MB</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5">
              <div>
                <label className={labelCls}>Nombre del documento</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. Plan de estudios 2026" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Categoría</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as Documento['tipo'] }))} className={`${inputCls} select-styled`}>
                    <option value="planificacion">Planificación Académica</option>
                    <option value="curriculo">Rediseño Curricular</option>
                    <option value="reglamento">Reglamento</option>
                    <option value="resolucion">Resolución</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Acceso</label>
                  <select value={form.acceso} onChange={e => setForm(f => ({ ...f, acceso: e.target.value as Documento['acceso'] }))} className={`${inputCls} select-styled`}>
                    <option value="publico">Público</option>
                    <option value="interno">Solo interno</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
                <textarea rows={3} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Breve descripción del documento..."
                  className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Archivo</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl px-4 py-7 text-center hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer group">
                  <svg className="w-7 h-7 mx-auto mb-2 text-gray-300 group-hover:text-blue-400 transition" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  {form.archivo
                    ? <p className="text-blue-600 text-sm font-semibold">{form.archivo}</p>
                    : <>
                        <p className="text-sm text-gray-500 group-hover:text-blue-600 transition font-medium">Haz clic para seleccionar</p>
                        <p className="text-xs text-gray-400 mt-0.5">o arrastra un archivo aquí</p>
                      </>
                  }
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.doc,.xls" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) setForm(p => ({ ...p, archivo: f.name })) }} />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={save}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm">
                {editingId !== null ? 'Guardar cambios' : 'Subir documento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
