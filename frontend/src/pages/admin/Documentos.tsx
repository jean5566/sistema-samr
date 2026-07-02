import { useState, useMemo, useEffect, useRef } from 'react'
import api from '../../lib/api'
import { CustomSelect } from '../../components/ui/CustomSelect'
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

const inputCls = 'w-full px-5 py-2.5 rounded-full border border-slate-200 text-sm text-slate-900 bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm'
const labelCls = 'block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide ml-2'

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
    <div className="min-h-screen text-slate-900 font-sans overflow-y-auto flex flex-col">
      {/* Topbar */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
        <div>
          <h1 className="text-xl sm:text-[28px] font-bold text-slate-900 tracking-tight">Documentos Institucionales</h1>
        </div>
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
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar documento..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white shadow-sm text-sm text-slate-900 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400" />
              </div>

              <CustomSelect
                value={filterTipo}
                onChange={setFilterTipo}
                placeholder="Categorías"
                options={categorias.map(c => ({ value: c.slug, label: c.nombre }))}
                buttonClassName="px-4 py-2.5 rounded-full border border-slate-200 bg-white shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none transition-all min-w-[140px]"
              />

              <CustomSelect
                value={filterAcceso}
                onChange={setFilterAcceso}
                placeholder="Acceso"
                options={[
                  { value: 'publico', label: 'Público' },
                  { value: 'interno', label: 'Solo interno' }
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

            <button onClick={openNew}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/40">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Subir Documento
            </button>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
          <table className="w-full text-sm border-collapse" style={{ borderSpacing: 0 }}>
            <thead>
              <tr className="bg-slate-200/60">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-slate-700 rounded-l-[20px]">Documento</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-slate-700 hidden sm:table-cell">Categoría</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-slate-700 hidden md:table-cell">Acceso</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-slate-700 hidden md:table-cell">Subido por</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-slate-700 hidden lg:table-cell">Fecha</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-slate-700 rounded-r-[20px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-slate-400 font-medium">Cargando documentos...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-red-500 font-medium">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <svg className="w-12 h-12 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-slate-500 text-base font-semibold">No se encontraron documentos</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {docs.length === 0 ? 'Sube tu primer documento con el botón de arriba.' : 'Intenta ajustar los filtros.'}
                    </p>
                  </td>
                </tr>
              ) : filtered.map(d => {
                const ext   = getExt(d.archivo_nombre)
                const cat   = catMap[d.tipo]
                const tc    = { label: cat?.nombre ?? d.tipo, cls: colorBadge[cat?.color ?? 'gray'] ?? colorBadge.gray }
                const es    = extStyle[ext] ?? { bg: 'bg-slate-50', text: 'text-slate-400' }
                const fecha = new Date(d.created_at).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
                return (
                  <tr key={d.id} className="group border-b border-slate-200/80 hover:bg-white transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${es.bg} flex items-center justify-center shrink-0 shadow-sm border border-white`}>
                          <span className={`text-[10px] font-black uppercase ${es.text} tracking-wider`}>{ext}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors text-xs sm:text-sm truncate">{d.nombre}</p>
                          <p className="text-slate-500 text-xs font-medium mt-0.5 hidden sm:block">{d.archivo_nombre} · {formatBytes(d.archivo_tamanio)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide ${tc.cls}`}>{tc.label}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                      {d.acceso === 'publico'
                        ? <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Público
                          </span>
                        : <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Interno
                          </span>
                      }
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-600 text-xs sm:text-sm font-medium hidden md:table-cell">{d.autor?.name ?? '—'}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-500 text-xs sm:text-sm font-medium tabular-nums hidden lg:table-cell">{fecha}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <a href={`/api/documentos/${d.id}/download`}
                          className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Descargar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                        <button onClick={() => openEdit(d)}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => remove(d.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">
              Mostrando <span className="font-bold text-slate-900">{filtered.length}</span> de <span className="font-bold text-slate-900">{docs.length}</span> documentos
            </p>
          </div>
          </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingId !== null ? 'Editar documento' : 'Subir documento'}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">PDF, DOCX o XLSX — máx. 100 MB</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white shadow-sm transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-8 py-6 flex flex-col gap-6">
              {formError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 shadow-sm">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  <p className="text-red-600 text-sm font-medium leading-relaxed">{formError}</p>
                </div>
              )}

              <div>
                <label className={labelCls}>Nombre del documento</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. Plan de estudios 2026" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Categoría</label>
                  <CustomSelect
                    value={form.tipo}
                    onChange={v => setForm(f => ({ ...f, tipo: v }))}
                    placeholder="Seleccionar..."
                    allowEmpty={false}
                    options={categorias.map(c => ({ value: c.slug, label: c.nombre }))}
                    buttonClassName={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Acceso</label>
                  <CustomSelect
                    value={form.acceso}
                    onChange={v => setForm(f => ({ ...f, acceso: v as Documento['acceso'] }))}
                    placeholder="Acceso"
                    allowEmpty={false}
                    options={[
                      { value: 'publico', label: 'Público' },
                      { value: 'interno', label: 'Solo interno' }
                    ]}
                    buttonClassName={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Descripción <span className="text-slate-400 font-normal normal-case tracking-normal">(opcional)</span></label>
                <textarea rows={3} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Breve descripción del documento..."
                  className={`${inputCls} resize-none rounded-2xl`} />
              </div>
              <div>
                <label className={labelCls}>
                  Archivo {editingId !== null && <span className="text-slate-400 font-normal normal-case tracking-normal">(dejar vacío para no cambiar)</span>}
                </label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-3xl px-6 py-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group bg-slate-50/50">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  {selectedFile
                    ? <p className="text-blue-700 text-sm font-bold">{selectedFile.name} <span className="text-blue-500/70 font-medium tracking-wide">({formatBytes(selectedFile.size)})</span></p>
                    : <>
                        <p className="text-sm text-slate-600 group-hover:text-blue-700 transition-colors font-bold">Haz clic para seleccionar</p>
                        <p className="text-xs font-medium text-slate-400 mt-1">o arrastra un archivo aquí</p>
                      </>
                  }
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.doc,.xls" className="hidden"
                    onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 shrink-0 flex items-center justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setModalOpen(false)}
                className="px-6 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                Cancelar
              </button>
              <button onClick={save} disabled={saving}
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-md shadow-blue-600/20">
                {saving ? 'Guardando...' : (editingId !== null ? 'Guardar cambios' : 'Subir documento')}
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
                <h2 className="text-xl font-bold text-slate-900">Categorías · Documentos</h2>
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
