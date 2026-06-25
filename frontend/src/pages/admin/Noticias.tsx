import { useState, useMemo, useEffect } from 'react'
import api from '../../lib/api'
import { CustomSelect } from '../../components/ui/CustomSelect'
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

const inputCls = 'w-full px-5 py-2.5 rounded-full border border-slate-200 text-sm text-slate-900 bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm'
const labelCls = 'block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide ml-2'

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-y-auto flex flex-col">
      {/* Topbar */}
      <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Noticias y Eventos</h1>
        </div>
        {noticias.some(n => n.destacada) && (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide shadow-sm">
            <svg className="w-4 h-4 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Destacada activa
          </span>
        )}
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12 w-full max-w-[1400px] mx-auto space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1 flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar publicación..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white shadow-sm text-sm text-slate-900 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400" />
            </div>

            <CustomSelect
              value={filterCat}
              onChange={setFilterCat}
              placeholder="Categorías"
              options={categorias.map(c => ({ value: c.slug, label: c.nombre }))}
              buttonClassName="px-4 py-2.5 rounded-full border border-slate-200 bg-white shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none transition-all min-w-[140px]"
            />

            <CustomSelect
              value={filterEstado}
              onChange={setFilterEstado}
              placeholder="Estados"
              options={[
                { value: 'publicado', label: 'Publicado' },
                { value: 'borrador', label: 'Borrador' }
              ]}
              buttonClassName="px-4 py-2.5 rounded-full border border-slate-200 bg-white shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none transition-all min-w-[140px]"
            />

            <button onClick={() => { setCatModal(true); setCatError(null); setCatForm({ nombre: '', color: 'blue' }); setEditingCatId(null) }}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-sm">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
              </svg>
              Categorías
            </button>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide hidden lg:block">{filtered.length} publicaciones</p>
            <button onClick={openNew}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nueva publicación
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white/50 rounded-3xl py-20 text-center text-sm font-bold text-slate-400">Cargando publicaciones...</div>
        ) : error ? (
          <div className="bg-red-50/50 rounded-3xl py-20 text-center text-sm font-bold text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/50 rounded-3xl border border-slate-100 py-24 text-center">
            <svg className="w-12 h-12 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-slate-500 text-base font-semibold">No se encontraron publicaciones</p>
            <p className="text-slate-400 text-sm mt-1">
              {noticias.length === 0 ? 'Crea tu primera publicación con el botón de arriba.' : 'Intenta ajustar los filtros.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {filtered.map(n => {
              const cat = catMap[n.categoria]
              const bgCls    = colorBg[cat?.color ?? 'gray']    ?? colorBg.gray
              const dotCls   = colorDot[cat?.color ?? 'gray']   ?? 'bg-slate-400'
              const fechaFormato = new Date(n.fecha.slice(0, 10) + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
              const fechaReal    = n.fecha_realizacion ? new Date(n.fecha_realizacion.slice(0, 10) + 'T12:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }) : null
              return (
                <div key={n.id} className="group/item flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
                  {/* Miniatura */}
                  <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-slate-100/60 bg-slate-50">
                    {n.imagen
                      ? <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${n.imagen}')` }} />
                      : <div className={`w-full h-full ${bgCls} flex items-center justify-center`}>
                          <span className="text-white/40 text-lg font-bold">{(cat?.nombre ?? n.categoria)[0]}</span>
                        </div>
                    }
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 text-sm truncate group-hover/item:text-blue-600 transition-colors">
                        {n.titulo}
                      </h3>
                      {n.destacada && (
                        <svg className="shrink-0 w-3.5 h-3.5 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
                        {cat?.nombre ?? n.categoria}
                      </span>
                      <span className="text-slate-300 text-[10px]">●</span>
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${n.estado === 'publicado' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {n.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                      </span>
                      <span className="text-slate-300 text-[10px]">●</span>
                      <span>{fechaFormato}</span>
                      {fechaReal && (
                        <>
                          <span className="text-slate-300 text-[10px]">●</span>
                          <span className="text-slate-400">Real: {fechaReal}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => toggleDestacada(n)} disabled={destacandoId === n.id} title={n.destacada ? 'Quitar destacada' : 'Marcar como destacada'}
                      className={`p-2 rounded-lg transition-all disabled:opacity-40 ${n.destacada ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}>
                      <svg className={`w-4 h-4 ${n.destacada ? 'fill-amber-400' : 'fill-none'}`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <button onClick={() => openEdit(n)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => setConfirmDelete(n)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal confirmar eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">¿Eliminar publicación?</h2>
                <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                  Vas a eliminar <span className="font-bold text-slate-800">"{confirmDelete.titulo}"</span>.<br />
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting}
                className="px-6 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={confirmAndDelete} disabled={deleting}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-2">
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal publicación */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingId !== null ? 'Editar publicación' : 'Nueva publicación'}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Completa los datos de la publicación</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white shadow-sm transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto px-8 py-6 flex flex-col gap-6">
              {formError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 shadow-sm">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <p className="text-red-600 text-sm font-medium leading-relaxed">{formError}</p>
                </div>
              )}
              <div>
                <label className={labelCls}>Título</label>
                <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Título de la publicación" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Categoría</label>
                  <CustomSelect
                    value={form.categoria}
                    onChange={v => setForm(f => ({ ...f, categoria: v }))}
                    placeholder="Seleccionar..."
                    allowEmpty={false}
                    options={categorias.map(c => ({ value: c.slug, label: c.nombre }))}
                    buttonClassName={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Estado</label>
                  <CustomSelect
                    value={form.estado}
                    onChange={v => setForm(f => ({ ...f, estado: v as Noticia['estado'] }))}
                    placeholder="Estado"
                    allowEmpty={false}
                    options={[
                      { value: 'borrador', label: 'Borrador' },
                      { value: 'publicado', label: 'Publicado' }
                    ]}
                    buttonClassName={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Fecha de publicación</label>
                  <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fecha de realización <span className="text-slate-400 font-normal normal-case tracking-normal">(opcional)</span></label>
                  <input type="date" value={form.fecha_realizacion} onChange={e => setForm(f => ({ ...f, fecha_realizacion: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea rows={4} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Escribe el contenido de la publicación..." className={`${inputCls} resize-none rounded-2xl`} />
              </div>
              <div>
                <label className={labelCls}>URL de imagen <span className="text-slate-400 font-normal normal-case tracking-normal">(opcional)</span></label>
                <input type="url" value={form.imagen} onChange={e => setForm(f => ({ ...f, imagen: e.target.value }))} placeholder="https://..." className={inputCls} />
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 bg-slate-50/50">
              <button onClick={() => setModalOpen(false)} className="px-6 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">Cancelar</button>
              <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/20">
                {saving ? 'Guardando...' : (editingId !== null ? 'Guardar cambios' : 'Publicar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal categorías */}
      {catModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setCatModal(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Categorías · Noticias</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">{categorias.length} categorías registradas</p>
              </div>
              <button onClick={() => setCatModal(false)} className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white shadow-sm transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-1.5">
              {categorias.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 group border border-transparent hover:border-slate-100 transition-all">
                  {editingCatId === c.id ? (
                    <>
                      <div className="flex gap-1 shrink-0">
                        {COLOR_OPTIONS.map(col => (
                          <button key={col} onClick={() => setEditCatForm(f => ({ ...f, color: col }))}
                            className={`w-5 h-5 rounded-full ${colorDot[col]} transition ring-offset-1 ${editCatForm.color === col ? 'ring-2 ring-slate-400' : ''}`} />
                        ))}
                      </div>
                      <input autoFocus value={editCatForm.nombre} onChange={e => setEditCatForm(f => ({ ...f, nombre: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') saveEditCat(c.id); if (e.key === 'Escape') setEditingCatId(null) }}
                        className="flex-1 text-sm font-bold border-b-2 border-blue-400 outline-none bg-transparent text-slate-900 py-0.5 px-1" />
                      <button onClick={() => saveEditCat(c.id)} className="text-blue-600 text-xs font-bold hover:text-blue-800 shrink-0 uppercase tracking-wider">Guardar</button>
                      <button onClick={() => setEditingCatId(null)} className="text-slate-400 text-xs font-bold hover:text-slate-600 shrink-0 uppercase tracking-wider ml-1">✕</button>
                    </>
                  ) : (
                    <>
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${colorDot[c.color] ?? 'bg-slate-400'}`} />
                      <span className="flex-1 text-sm font-bold text-slate-800">{c.nombre}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditCat(c)} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => deleteCat(c.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="px-8 py-5 border-t border-slate-100 shrink-0 bg-slate-50/50">
              {catError && <p className="text-sm font-medium text-red-500 mb-3">{catError}</p>}
              <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide ml-1">Nueva categoría</p>
              <div className="flex gap-2 mb-4 flex-wrap ml-1">
                {COLOR_OPTIONS.map(col => (
                  <button key={col} onClick={() => setCatForm(f => ({ ...f, color: col }))}
                    className={`w-6 h-6 rounded-full ${colorDot[col]} transition-all ring-offset-2 ${catForm.color === col ? 'ring-2 ring-slate-400 scale-110 shadow-md' : 'hover:scale-110 shadow-sm'}`} />
                ))}
              </div>
              <div className="flex gap-3">
                <input value={catForm.nombre} onChange={e => setCatForm(f => ({ ...f, nombre: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addCat()}
                  placeholder="Nombre de la categoría"
                  className="flex-1 px-5 py-2.5 rounded-full border border-slate-200 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm" />
                <button onClick={addCat} disabled={catSaving}
                  className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
