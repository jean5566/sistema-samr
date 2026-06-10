import { useState, useMemo, useEffect, useRef } from 'react'
import api from '../../lib/api'
import { COLOR_OPTIONS, colorBadge, colorDot } from '../../lib/catColors'

interface Categoria {
  id: number
  nombre: string
  slug: string
  color: string
}

interface Documento {
  id: number
  nombre: string
  tipo: string
  acceso: 'publico' | 'interno'
  descripcion: string | null
  archivo: string
  archivo_nombre: string
  archivo_tamanio: number | null
  archivo_url: string
  created_at: string
  autor: { id: number; name: string }
}

const extStyle: Record<string, { bg: string; text: string }> = {
  pdf:  { bg: 'bg-red-50',    text: 'text-red-600'    },
  docx: { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  doc:  { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  xlsx: { bg: 'bg-emerald-50',text: 'text-emerald-600' },
  xls:  { bg: 'bg-emerald-50',text: 'text-emerald-600' },
}

const getExt = (nombre: string) => nombre.split('.').pop()?.toLowerCase() ?? 'pdf'

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const emptyForm = {
  nombre: '', tipo: '',
  acceso: 'publico' as Documento['acceso'], descripcion: '',
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-2'

export function AdminDocumentos() {
  const [docs, setDocs]                   = useState<Documento[]>([])
  const [categorias, setCategorias]       = useState<Categoria[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [search, setSearch]               = useState('')
  const [filterTipo, setFilterTipo]       = useState('')
  const [filterAcceso, setFilterAcceso]   = useState('')
  const [modalOpen, setModalOpen]         = useState(false)
  const [editingId, setEditingId]         = useState<number | null>(null)
  const [form, setForm]                   = useState(emptyForm)
  const [selectedFile, setSelectedFile]   = useState<File | null>(null)
  const [saving, setSaving]               = useState(false)
  const [formError, setFormError]         = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Gestión de categorías
  const [catModal, setCatModal]           = useState(false)
  const [catForm, setCatForm]             = useState({ nombre: '', color: 'blue' })
  const [catSaving, setCatSaving]         = useState(false)
  const [catError, setCatError]           = useState<string | null>(null)
  const [editingCatId, setEditingCatId]   = useState<number | null>(null)
  const [editCatForm, setEditCatForm]     = useState({ nombre: '', color: 'blue' })

  useEffect(() => {
    Promise.all([
      api.get<Documento[]>('/documentos/todos'),
      api.get<Categoria[]>('/categorias?modulo=documentos'),
    ]).then(([d, c]) => {
      setDocs(d.data)
      setCategorias(c.data)
    }).catch(() => setError('No se pudo cargar los documentos.'))
      .finally(() => setLoading(false))
  }, [])

  const catMap = useMemo(() =>
    Object.fromEntries(categorias.map(c => [c.slug, c])), [categorias])

  const filtered = useMemo(() =>
    docs.filter(d =>
      d.nombre.toLowerCase().includes(search.toLowerCase()) &&
      (filterTipo   ? d.tipo   === filterTipo   : true) &&
      (filterAcceso ? d.acceso === filterAcceso : true)
    ), [docs, search, filterTipo, filterAcceso])

  function openNew() {
    setEditingId(null)
    setForm({ ...emptyForm, tipo: categorias[0]?.slug ?? '' })
    setSelectedFile(null); setFormError(null); setModalOpen(true)
  }
  function openEdit(d: Documento) {
    setEditingId(d.id)
    setForm({ nombre: d.nombre, tipo: d.tipo, acceso: d.acceso, descripcion: d.descripcion ?? '' })
    setSelectedFile(null); setFormError(null); setModalOpen(true)
  }

  async function addCat() {
    if (!catForm.nombre.trim()) { setCatError('El nombre es obligatorio.'); return }
    setCatSaving(true); setCatError(null)
    try {
      const { data } = await api.post<Categoria>('/categorias', { ...catForm, modulo: 'documentos' })
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

  async function save() {
    if (!form.nombre.trim()) { setFormError('El nombre es obligatorio.'); return }
    if (editingId === null && !selectedFile) { setFormError('Debes seleccionar un archivo.'); return }

    setSaving(true); setFormError(null)
    try {
      const fd = new FormData()
      fd.append('nombre', form.nombre)
      fd.append('tipo', form.tipo)
      fd.append('acceso', form.acceso)
      fd.append('descripcion', form.descripcion)
      if (selectedFile) fd.append('archivo', selectedFile)
      if (editingId !== null) fd.append('_method', 'PUT')

      const url = editingId !== null ? `/documentos/${editingId}` : '/documentos'
      const { data } = await api.post<Documento>(url, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (editingId !== null) {
        setDocs(p => p.map(d => d.id === editingId ? data : d))
      } else {
        setDocs(p => [data, ...p])
      }
      setModalOpen(false)
    } catch (e: any) {
      const errs = e?.response?.data?.errors
      const msg  = errs ? Object.values(errs).flat().join(' ') : (e?.response?.data?.message ?? 'Error al guardar.')
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    await api.delete(`/documentos/${id}`)
    setDocs(p => p.filter(d => d.id !== id))
  }

  return (
    <>
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Administración</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Documentos Institucionales</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
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
              {categorias.map(c => <option key={c.id} value={c.slug}>{c.nombre}</option>)}
            </select>

            <select value={filterAcceso} onChange={e => setFilterAcceso(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition select-styled">
              <option value="">Todo el acceso</option>
              <option value="publico">Público</option>
              <option value="interno">Solo interno</option>
            </select>

            <button onClick={() => { setCatModal(true); setCatError(null); setCatForm({ nombre: '', color: 'blue' }); setEditingCatId(null) }}
              className="ml-auto inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
              </svg>
              Categorías
            </button>
            <button onClick={openNew}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm">
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
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-400">Cargando documentos...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-red-500">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 text-sm font-medium">No se encontraron documentos</p>
                    <p className="text-gray-300 text-xs mt-1">
                      {docs.length === 0 ? 'Sube tu primer documento con el botón de arriba.' : 'Intenta ajustar los filtros.'}
                    </p>
                  </td>
                </tr>
              ) : filtered.map(d => {
                const ext   = getExt(d.archivo_nombre)
                const cat   = catMap[d.tipo]
                const tc    = { label: cat?.nombre ?? d.tipo, cls: colorBadge[cat?.color ?? 'gray'] ?? colorBadge.gray }
                const es    = extStyle[ext] ?? { bg: 'bg-gray-50', text: 'text-gray-400' }
                const fecha = new Date(d.created_at).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
                return (
                  <tr key={d.id} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${es.bg} flex items-center justify-center shrink-0`}>
                          <span className={`text-[10px] font-bold uppercase ${es.text}`}>{ext}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{d.nombre}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{d.archivo_nombre} · {formatBytes(d.archivo_tamanio)}</p>
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
                    <td className="px-5 py-4 text-gray-600 text-sm">{d.autor?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs tabular-nums">{fecha}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/api/documentos/${d.id}/download`}
                          className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition" title="Descargar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                        <button onClick={() => openEdit(d)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => remove(d.id)}
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
          <div className="border-t border-gray-100 px-5 py-3">
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
              {formError && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  {formError}
                </div>
              )}

              <div>
                <label className={labelCls}>Nombre del documento</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. Plan de estudios 2026" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Categoría</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className={`${inputCls} select-styled`}>
                    {categorias.map(c => <option key={c.id} value={c.slug}>{c.nombre}</option>)}
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
                <label className={labelCls}>
                  Archivo {editingId !== null && <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>}
                </label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl px-4 py-7 text-center hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer group">
                  <svg className="w-7 h-7 mx-auto mb-2 text-gray-300 group-hover:text-blue-400 transition" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  {selectedFile
                    ? <p className="text-blue-600 text-sm font-semibold">{selectedFile.name} <span className="text-gray-400 font-normal">({formatBytes(selectedFile.size)})</span></p>
                    : <>
                        <p className="text-sm text-gray-500 group-hover:text-blue-600 transition font-medium">Haz clic para seleccionar</p>
                        <p className="text-xs text-gray-400 mt-0.5">o arrastra un archivo aquí</p>
                      </>
                  }
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.doc,.xls" className="hidden"
                    onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={save} disabled={saving}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition shadow-sm">
                {saving ? 'Guardando...' : (editingId !== null ? 'Guardar cambios' : 'Subir documento')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal categorías */}
      {catModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setCatModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Categorías · Documentos</h2>
                <p className="text-xs text-gray-400 mt-0.5">{categorias.length} categorías registradas</p>
              </div>
              <button onClick={() => setCatModal(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

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
