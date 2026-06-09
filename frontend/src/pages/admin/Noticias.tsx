import { useState, useMemo, useEffect } from 'react'
import api from '../../lib/api'
import { COLOR_OPTIONS, colorBadge, colorBg, colorDot } from '../../lib/catColors'

interface Categoria {
  id: number
  nombre: string
  slug: string
  color: string
}

interface Noticia {
  id: number
  titulo: string
  categoria: string
  estado: 'publicado' | 'borrador'
  fecha: string
  fecha_realizacion: string | null
  descripcion: string
  imagen: string | null
  destacada: boolean
}

const emptyForm = {
  titulo: '', categoria: '',
  estado: 'borrador' as Noticia['estado'], fecha: '', fecha_realizacion: '', descripcion: '', imagen: '',
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-2'

export function AdminNoticias() {
  const [noticias, setNoticias]         = useState<Noticia[]>([])
  const [categorias, setCategorias]     = useState<Categoria[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [search, setSearch]             = useState('')
  const [filterCat, setFilterCat]       = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [modalOpen, setModalOpen]       = useState(false)
  const [editingId, setEditingId]       = useState<number | null>(null)
  const [form, setForm]                 = useState(emptyForm)
  const [saving, setSaving]             = useState(false)
  const [formError, setFormError]       = useState<string | null>(null)
  const [destacandoId, setDestacandoId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Noticia | null>(null)
  const [deleting, setDeleting]           = useState(false)

  // Gestión de categorías
  const [catModal, setCatModal]           = useState(false)
  const [catForm, setCatForm]             = useState({ nombre: '', color: 'blue' })
  const [catSaving, setCatSaving]         = useState(false)
  const [catError, setCatError]           = useState<string | null>(null)
  const [editingCatId, setEditingCatId]   = useState<number | null>(null)
  const [editCatForm, setEditCatForm]     = useState({ nombre: '', color: 'blue' })

  useEffect(() => {
    Promise.all([
      api.get<Noticia[]>('/noticias/todas'),
      api.get<Categoria[]>('/categorias?modulo=noticias'),
    ]).then(([n, c]) => {
      setNoticias(n.data)
      setCategorias(c.data)
    }).catch(() => setError('No se pudo cargar las publicaciones.'))
      .finally(() => setLoading(false))
  }, [])

  const catMap = useMemo(() =>
    Object.fromEntries(categorias.map(c => [c.slug, c])), [categorias])

  const filtered = useMemo(() =>
    noticias.filter(n =>
      n.titulo.toLowerCase().includes(search.toLowerCase()) &&
      (filterCat    ? n.categoria === filterCat    : true) &&
      (filterEstado ? n.estado    === filterEstado : true)
    ), [noticias, search, filterCat, filterEstado])

  function openNew() {
    setEditingId(null)
    setForm({ ...emptyForm, categoria: categorias[0]?.slug ?? '' })
    setFormError(null); setModalOpen(true)
  }
  function openEdit(n: Noticia) {
    setEditingId(n.id)
    setForm({ titulo: n.titulo, categoria: n.categoria, estado: n.estado, fecha: n.fecha, fecha_realizacion: n.fecha_realizacion ?? '', descripcion: n.descripcion, imagen: n.imagen ?? '' })
    setFormError(null); setModalOpen(true)
  }

  async function save() {
    if (!form.titulo.trim() || !form.fecha || !form.descripcion.trim()) {
      setFormError('Título, fecha de publicación y descripción son obligatorios.')
      return
    }
    setSaving(true); setFormError(null)
    try {
      const payload = { ...form, imagen: form.imagen || null, fecha_realizacion: form.fecha_realizacion || null }
      if (editingId !== null) {
        const { data } = await api.put<Noticia>(`/noticias/${editingId}`, payload)
        setNoticias(p => p.map(n => n.id === editingId ? data : n))
      } else {
        const { data } = await api.post<Noticia>('/noticias', payload)
        setNoticias(p => [data, ...p])
      }
      setModalOpen(false)
    } catch (e: any) {
      setFormError(e?.response?.data?.message ?? 'Error al guardar la publicación.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleDestacada(n: Noticia) {
    setDestacandoId(n.id)
    try {
      const { data } = await api.post<Noticia>(`/noticias/${n.id}/destacar`)
      setNoticias(p => p.map(x => ({ ...x, destacada: x.id === n.id ? data.destacada : false })))
    } finally {
      setDestacandoId(null)
    }
  }

  async function confirmAndDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await api.delete(`/noticias/${confirmDelete.id}`)
      setNoticias(p => p.filter(n => n.id !== confirmDelete.id))
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  // CRUD categorías
  async function addCat() {
    if (!catForm.nombre.trim()) { setCatError('El nombre es obligatorio.'); return }
    setCatSaving(true); setCatError(null)
    try {
      const { data } = await api.post<Categoria>('/categorias', { ...catForm, modulo: 'noticias' })
      setCategorias(p => [...p, data])
      setCatForm({ nombre: '', color: 'blue' })
    } catch (e: any) {
      setCatError(e?.response?.data?.message ?? 'Error al crear la categoría.')
    } finally {
      setCatSaving(false)
    }
  }

  function startEditCat(c: Categoria) {
    setEditingCatId(c.id)
    setEditCatForm({ nombre: c.nombre, color: c.color })
  }

  async function saveEditCat(id: number) {
    if (!editCatForm.nombre.trim()) return
    try {
      const { data } = await api.put<Categoria>(`/categorias/${id}`, editCatForm)
      setCategorias(p => p.map(c => c.id === id ? data : c))
      setEditingCatId(null)
    } catch {}
  }

  async function deleteCat(id: number) {
    await api.delete(`/categorias/${id}`)
    setCategorias(p => p.filter(c => c.id !== id))
  }

  return (
    <>
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Administración</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Noticias y Eventos</h1>
        </div>
        {noticias.some(n => n.destacada) && (
          <span className="inline-flex items-center gap-1.5 border border-amber-200 bg-amber-50 text-amber-700 rounded-full px-3 py-1 text-xs font-medium">
            <svg className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Destacada activa
          </span>
        )}
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
            {categorias.map(c => <option key={c.id} value={c.slug}>{c.nombre}</option>)}
          </select>

          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition select-styled">
            <option value="">Todos los estados</option>
            <option value="publicado">Publicado</option>
            <option value="borrador">Borrador</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <p className="text-xs text-gray-400">{filtered.length} publicaciones</p>
            <button onClick={() => { setCatModal(true); setCatError(null); setCatForm({ nombre: '', color: 'blue' }); setEditingCatId(null) }}
              className="inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
              </svg>
              Categorías
            </button>
            <button onClick={openNew}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva publicación
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-20 text-center text-sm text-gray-400">Cargando publicaciones...</div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-20 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-20 text-center">
            <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-400 text-sm font-medium">No se encontraron publicaciones</p>
            <p className="text-gray-300 text-xs mt-1">
              {noticias.length === 0 ? 'Crea tu primera publicación con el botón de arriba.' : 'Intenta ajustar los filtros.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(n => {
              const cat = catMap[n.categoria]
              const badgeCls = colorBadge[cat?.color ?? 'gray'] ?? colorBadge.gray
              const bgCls    = colorBg[cat?.color ?? 'gray']    ?? colorBg.gray
              const fechaFormato = new Date(n.fecha.slice(0, 10) + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
              const fechaReal    = n.fecha_realizacion ? new Date(n.fecha_realizacion.slice(0, 10) + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }) : null
              return (
                <div key={n.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="relative">
                    {n.imagen
                      ? <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url('${n.imagen}')` }} />
                      : <div className={`h-44 ${bgCls} flex items-center justify-center`}>
                          <span className="text-white/30 text-6xl font-black">{(cat?.nombre ?? n.categoria)[0]}</span>
                        </div>
                    }
                    {n.destacada && (
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-amber-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                        <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        Destacada
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeCls}`}>
                        {cat?.nombre ?? n.categoria}
                      </span>
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
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-gray-400">Publicación: {fechaFormato}</span>
                        {fechaReal && <span className="text-[11px] text-indigo-500 font-medium">Realización: {fechaReal}</span>}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => toggleDestacada(n)} disabled={destacandoId === n.id} title={n.destacada ? 'Quitar destacada' : 'Marcar como destacada'}
                          className={`p-2 rounded-lg transition disabled:opacity-40 ${n.destacada ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}>
                          <svg className={`w-4 h-4 ${n.destacada ? 'fill-amber-400' : 'fill-none'}`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                        <button onClick={() => openEdit(n)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => setConfirmDelete(n)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Eliminar">
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

      {/* Modal confirmar eliminar */}
      {confirmDelete && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">¿Eliminar publicación?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Vas a eliminar <span className="font-semibold text-gray-800">"{confirmDelete.titulo}"</span>.<br />
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting}
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={confirmAndDelete} disabled={deleting}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold transition shadow-sm flex items-center gap-2">
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Eliminando...
                  </>
                ) : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal publicación */}
      {modalOpen && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{editingId !== null ? 'Editar publicación' : 'Nueva publicación'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Completa los datos de la publicación</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">
              {formError && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {formError}
                </div>
              )}
              <div>
                <label className={labelCls}>Título</label>
                <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Título de la publicación" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Categoría</label>
                  <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} className={`${inputCls} select-styled`}>
                    {categorias.map(c => <option key={c.id} value={c.slug}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Estado</label>
                  <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as Noticia['estado'] }))} className={`${inputCls} select-styled`}>
                    <option value="borrador">Borrador</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Fecha de publicación</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fecha de realización <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <input type="date" value={form.fecha_realizacion} onChange={e => setForm(f => ({ ...f, fecha_realizacion: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea rows={4} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Escribe el contenido de la publicación..." className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>URL de imagen <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input type="url" value={form.imagen} onChange={e => setForm(f => ({ ...f, imagen: e.target.value }))} placeholder="https://..." className={inputCls} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={save} disabled={saving} className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition shadow-sm">
                {saving ? 'Guardando...' : (editingId !== null ? 'Guardar cambios' : 'Publicar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal categorías */}
      {catModal && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setCatModal(false)}>
          <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Categorías · Noticias</h2>
                <p className="text-xs text-gray-400 mt-0.5">{categorias.length} categorías registradas</p>
              </div>
              <button onClick={() => setCatModal(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Lista */}
            <div className="overflow-y-auto flex-1 px-4 py-3 flex flex-col gap-1">
              {categorias.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 group">
                  {editingCatId === c.id ? (
                    <>
                      <div className="flex gap-1 shrink-0">
                        {COLOR_OPTIONS.map(col => (
                          <button key={col} onClick={() => setEditCatForm(f => ({ ...f, color: col }))}
                            className={`w-4 h-4 rounded-full ${colorDot[col]} transition ring-offset-1 ${editCatForm.color === col ? 'ring-2 ring-gray-400' : ''}`} />
                        ))}
                      </div>
                      <input autoFocus value={editCatForm.nombre} onChange={e => setEditCatForm(f => ({ ...f, nombre: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') saveEditCat(c.id); if (e.key === 'Escape') setEditingCatId(null) }}
                        className="flex-1 text-sm border-b border-blue-400 outline-none bg-transparent text-gray-900 py-0.5" />
                      <button onClick={() => saveEditCat(c.id)} className="text-blue-600 text-xs font-semibold hover:text-blue-800 shrink-0">Guardar</button>
                      <button onClick={() => setEditingCatId(null)} className="text-gray-400 text-xs hover:text-gray-600 shrink-0">✕</button>
                    </>
                  ) : (
                    <>
                      <span className={`w-3 h-3 rounded-full shrink-0 ${colorDot[c.color] ?? 'bg-gray-400'}`} />
                      <span className="flex-1 text-sm text-gray-800">{c.nombre}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => startEditCat(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Editar">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => deleteCat(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Eliminar">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Agregar */}
            <div className="px-4 py-4 border-t border-gray-100 shrink-0">
              {catError && <p className="text-xs text-red-500 mb-2">{catError}</p>}
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Nueva categoría</p>
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {COLOR_OPTIONS.map(col => (
                  <button key={col} onClick={() => setCatForm(f => ({ ...f, color: col }))}
                    className={`w-5 h-5 rounded-full ${colorDot[col]} transition ring-offset-1 ${catForm.color === col ? 'ring-2 ring-gray-400 scale-110' : 'hover:scale-110'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                <input value={catForm.nombre} onChange={e => setCatForm(f => ({ ...f, nombre: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addCat()}
                  placeholder="Nombre de la categoría"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-400" />
                <button onClick={addCat} disabled={catSaving}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
