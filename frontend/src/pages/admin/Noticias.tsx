import { useState, useMemo } from 'react'

interface Noticia {
  id: number
  titulo: string
  categoria: 'noticia' | 'evento' | 'congreso' | 'feria' | 'aviso'
  estado: 'publicado' | 'borrador'
  fecha: string
  descripcion: string
  imagen: string
}

const catConfig: Record<string, { label: string; cls: string }> = {
  noticia:  { label: 'Noticia',             cls: 'border-blue-200 bg-blue-50 text-blue-700'     },
  evento:   { label: 'Evento Académico',    cls: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
  congreso: { label: 'Congreso',            cls: 'border-purple-200 bg-purple-50 text-purple-700' },
  feria:    { label: 'Feria Tecnológica',   cls: 'border-cyan-200 bg-cyan-50 text-cyan-700'      },
  aviso:    { label: 'Aviso Institucional', cls: 'border-amber-200 bg-amber-50 text-amber-700'   },
}

const catBg: Record<string, string> = {
  noticia: 'bg-blue-500', evento: 'bg-indigo-500', congreso: 'bg-purple-500', feria: 'bg-cyan-500', aviso: 'bg-amber-400',
}

const initialNoticias: Noticia[] = [
  { id: 1, titulo: 'Convocatoria al Congreso TIC 2026',          categoria: 'congreso', estado: 'publicado', fecha: '2026-04-15', descripcion: 'Inscripciones abiertas para el congreso anual de Tecnologías de la Información.',       imagen: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80' },
  { id: 2, titulo: 'Nuevas becas disponibles para estudiantes',   categoria: 'aviso',    estado: 'publicado', fecha: '2026-03-20', descripcion: 'La carrera abre convocatoria para becas de excelencia académica del período 2026-I.',    imagen: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80' },
  { id: 3, titulo: 'Feria de Innovación Tecnológica UNESUM',      categoria: 'feria',    estado: 'publicado', fecha: '2026-05-10', descripcion: 'Exhibición de proyectos desarrollados por estudiantes de la carrera.',                  imagen: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80' },
  { id: 4, titulo: 'Resultados del proyecto IA Educativa',        categoria: 'noticia',  estado: 'publicado', fecha: '2026-02-28', descripcion: 'El equipo de investigación presenta los resultados del estudio sobre IA.',              imagen: '' },
  { id: 5, titulo: 'Semana de inducción para estudiantes nuevos', categoria: 'evento',   estado: 'borrador',  fecha: '2026-04-07', descripcion: 'Actividades de bienvenida y charlas para estudiantes que ingresan al primer semestre.', imagen: '' },
]

const emptyForm = { titulo: '', categoria: 'noticia' as Noticia['categoria'], estado: 'publicado' as Noticia['estado'], fecha: '', descripcion: '', imagen: '' }

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-2'

export function AdminNoticias() {
  const [noticias, setNoticias]           = useState<Noticia[]>(initialNoticias)
  const [search, setSearch]               = useState('')
  const [filterCat, setFilterCat]         = useState('')
  const [filterEstado, setFilterEstado]   = useState('')
  const [modalOpen, setModalOpen]         = useState(false)
  const [editingId, setEditingId]         = useState<number | null>(null)
  const [form, setForm]                   = useState(emptyForm)

  const filtered = useMemo(() =>
    noticias.filter(n =>
      n.titulo.toLowerCase().includes(search.toLowerCase()) &&
      (filterCat    ? n.categoria === filterCat    : true) &&
      (filterEstado ? n.estado    === filterEstado : true)
    ), [noticias, search, filterCat, filterEstado])

  function openNew()  { setEditingId(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(id: number) {
    const n = noticias.find(x => x.id === id)!
    setEditingId(id)
    setForm({ titulo: n.titulo, categoria: n.categoria, estado: n.estado, fecha: n.fecha, descripcion: n.descripcion, imagen: n.imagen })
    setModalOpen(true)
  }
  function save() {
    if (!form.titulo || !form.fecha) return
    if (editingId !== null) {
      setNoticias(p => p.map(n => n.id === editingId ? { ...n, ...form } : n))
    } else {
      setNoticias(p => [{ id: Date.now(), ...form }, ...p])
    }
    setModalOpen(false)
  }

  return (
    <>
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Administración</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Noticias y Eventos</h1>
        </div>
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">CM</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 mb-5 flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar publicación..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-400" />
          </div>

          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition select-styled">
            <option value="">Todas las categorías</option>
            <option value="noticia">Noticia</option>
            <option value="evento">Evento Académico</option>
            <option value="congreso">Congreso</option>
            <option value="feria">Feria Tecnológica</option>
            <option value="aviso">Aviso Institucional</option>
          </select>

          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition select-styled">
            <option value="">Todos los estados</option>
            <option value="publicado">Publicado</option>
            <option value="borrador">Borrador</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <p className="text-xs text-gray-400">{filtered.length} publicaciones</p>
            <button onClick={openNew}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva publicación
            </button>
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-20 text-center">
            <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-400 text-sm font-medium">No se encontraron publicaciones</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(n => {
              const cat = catConfig[n.categoria]
              const fechaFormato = new Date(n.fecha + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
              return (
                <div key={n.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  {n.imagen
                    ? <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url('${n.imagen}')` }} />
                    : <div className={`h-44 ${catBg[n.categoria]} flex items-center justify-center`}>
                        <span className="text-white/30 text-6xl font-black">{cat.label[0]}</span>
                      </div>
                  }
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.cls}`}>{cat.label}</span>
                      {n.estado === 'publicado'
                        ? <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Publicado
                          </span>
                        : <span className="inline-flex items-center gap-1.5 border border-amber-200 bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Borrador
                          </span>
                      }
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">{n.titulo}</h3>
                    <p className="text-gray-400 text-xs flex-1 line-clamp-2 leading-relaxed">{n.descripcion}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <span className="text-[11px] text-gray-400">{fechaFormato}</span>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => openEdit(n.id)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setNoticias(p => p.filter(x => x.id !== n.id))} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{editingId !== null ? 'Editar publicación' : 'Nueva publicación'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Completa los datos de la publicación</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">
              <div>
                <label className={labelCls}>Título</label>
                <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Título de la publicación" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Categoría</label>
                  <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as Noticia['categoria'] }))} className={`${inputCls} select-styled`}>
                    <option value="noticia">Noticia</option>
                    <option value="evento">Evento Académico</option>
                    <option value="congreso">Congreso</option>
                    <option value="feria">Feria Tecnológica</option>
                    <option value="aviso">Aviso Institucional</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Estado</label>
                  <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as Noticia['estado'] }))} className={`${inputCls} select-styled`}>
                    <option value="publicado">Publicado</option>
                    <option value="borrador">Borrador</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Fecha de publicación</label>
                <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea rows={4} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Escribe el contenido de la publicación..."
                  className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>URL de imagen <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input type="url" value={form.imagen} onChange={e => setForm(f => ({ ...f, imagen: e.target.value }))}
                  placeholder="https://..." className={inputCls} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={save}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm">
                {editingId !== null ? 'Guardar cambios' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
