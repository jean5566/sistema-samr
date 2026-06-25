import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../lib/api'

interface Docente {
  id: number
  nombre: string
  titulo: string | null
  area: string | null
  email: string
  telefono: string | null
  bio: string | null
  foto_url: string | null
  permite_edicion_estudiantes: boolean
}

const COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500',  'bg-cyan-500',   'bg-indigo-500',  'bg-teal-500',
]

function iniciales(nombre: string) {
  return nombre.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function Toast({ msg, visible, ok }: { msg: string; visible: boolean; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white text-sm font-bold px-5 py-4 rounded-[1.5rem] shadow-2xl transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
        {ok
          ? <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          : <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        }
      </span>
      {msg}
    </div>
  )
}

const inputCls = 'w-full px-5 py-2.5 rounded-full border border-slate-200 text-sm text-slate-900 bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm'
const textareaCls = 'w-full px-5 py-3.5 rounded-[1.5rem] border border-slate-200 text-sm text-slate-900 bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm resize-none'
const labelCls = 'block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide ml-2'

export function EstudianteDocentes() {
  const location                      = useLocation()
  const [docentes,    setDocentes]    = useState<Docente[]>([])
  const [periodo,     setPeriodo]     = useState('')
  const [busqueda,    setBusqueda]    = useState('')
  const [loading,     setLoading]     = useState(true)
  const [selected,    setSelected]    = useState<{ docente: Docente; color: string } | null>(null)
  const [editing,     setEditing]     = useState(false)

  // Edit form state
  const [eNombre,   setENombre]   = useState('')
  const [eTitulo,   setETitulo]   = useState('')
  const [eArea,     setEArea]     = useState('')
  const [eTelefono, setETelefono] = useState('')
  const [eBio,      setEBio]      = useState('')
  const [saving,    setSaving]    = useState(false)

  const [toast, setToast] = useState({ visible: false, msg: '', ok: true })

  function showToast(msg: string, ok = true) { setToast({ visible: true, msg, ok }) }
  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast(p => ({ ...p, visible: false })), 2800)
      return () => clearTimeout(t)
    }
  }, [toast.visible])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get<Docente[]>('/docentes', { headers: { 'Cache-Control': 'no-cache' } }),
      api.get('/configuracion'),
    ]).then(([doc, cfg]) => {
      setDocentes(doc.data)
      setPeriodo(cfg.data.periodo ?? '')
    }).finally(() => setLoading(false))
  }, [location.key])

  function startEdit() {
    const d = selected!.docente
    setENombre(d.nombre)
    setETitulo(d.titulo ?? '')
    setEArea(d.area ?? '')
    setETelefono(d.telefono ?? '')
    setEBio(d.bio ?? '')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
  }

  async function guardarEdicion() {
    setSaving(true)
    try {
      const { data } = await api.put(`/estudiante/docentes/${selected!.docente.id}`, {
        nombre: eNombre, titulo: eTitulo, area: eArea, telefono: eTelefono, bio: eBio,
      })
      setDocentes(prev => prev.map(d => d.id === data.id ? data : d))
      setSelected(prev => prev ? { ...prev, docente: data } : null)
      setEditing(false)
      showToast('Perfil actualizado correctamente')
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? 'Error al guardar los cambios.', false)
    } finally {
      setSaving(false)
    }
  }

  const docentesFiltrados = docentes.filter(d => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return true
    return d.nombre.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || (d.area ?? '').toLowerCase().includes(q)
  })

  function handleBack() {
    if (editing) {
      setEditing(false)
    } else {
      setSelected(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-y-auto flex flex-col">

      {/* Topbar */}
      <div className="px-8 py-6 flex items-center gap-4 shrink-0">
        {selected && (
          <button onClick={handleBack}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors bg-white border border-slate-200 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
            {selected ? selected.docente.nombre : 'Mis Docentes'}
          </h1>
        </div>
        {selected && !editing && selected.docente.permite_edicion_estudiantes && (
          <button onClick={startEdit}
            className="ml-auto inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar perfil
          </button>
        )}
      </div>

      <div className="flex-1">

        {/* ── Lista ── */}
        {!selected && (
          <div className="px-4 sm:px-8 py-8 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Docentes registrados en el período {periodo && <span className="text-blue-600">{periodo}</span>}
              </p>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {docentesFiltrados.length} de {docentes.length} docente{docentes.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="relative max-w-md mb-6">
              <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, área o correo..."
                className={`${inputCls} pl-10`}
              />
            </div>

            {loading && <div className="flex items-center justify-center py-20 text-slate-400 font-bold text-sm">Cargando docentes...</div>}
            {!loading && docentes.length === 0 && <div className="flex items-center justify-center py-20 text-slate-400 font-bold text-sm">No hay docentes registrados.</div>}
            {!loading && docentes.length > 0 && docentesFiltrados.length === 0 && <div className="flex items-center justify-center py-20 text-slate-400 font-bold text-sm">No se encontraron docentes.</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docentesFiltrados.map((d, i) => {
                const color = COLORS[i % COLORS.length]
                return (
                  <button key={d.id} onClick={() => setSelected({ docente: d, color })}
                    className="bg-white rounded-2xl border border-slate-100/60 p-5 flex items-center gap-4 text-left hover:border-slate-200 hover:shadow-sm transition-all duration-200 group">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0">
                      {d.foto_url
                        ? <img src={d.foto_url} alt={d.nombre} className="w-full h-full object-cover object-top" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <span className="text-slate-500 text-sm font-bold tracking-tight">{iniciales(d.nombre)}</span>
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">{d.nombre}</h3>
                      <p className="text-xs font-medium text-slate-400 truncate mt-0.5">{d.email}</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Perfil (vista) ── */}
        {selected && !editing && (() => {
          const d = selected.docente
          return (
            <div className="px-4 sm:px-8 pb-12 max-w-4xl mx-auto flex flex-col md:flex-row gap-5 items-start">
              {/* Foto */}
              <div className="shrink-0 w-full md:w-44 rounded-2xl overflow-hidden shadow-md shadow-slate-200/50 relative group" style={{ height: '200px' }}>
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                {d.foto_url
                  ? <img src={d.foto_url} alt={d.nombre} className="w-full h-full object-cover object-top" />
                  : <div className={`w-full h-full ${selected.color} flex items-center justify-center`}>
                      <span className="text-white font-black text-4xl tracking-tight">{iniciales(d.nombre)}</span>
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-100/60 shadow-sm p-6 flex flex-col gap-4 w-full">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">{d.nombre}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {d.area   && <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wide">{d.area}</span>}
                    {d.titulo && <span className="text-xs font-medium text-slate-400">{d.titulo}</span>}
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100" />

                <div className="flex flex-col gap-2.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contacto</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a href={`mailto:${d.email}`} className="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors">{d.email}</a>
                  </div>
                  {d.telefono && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{d.telefono}</span>
                    </div>
                  )}
                </div>

                {d.bio && (
                  <>
                    <div className="w-full h-px bg-slate-100" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sobre el docente</p>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100/60">{d.bio}</p>
                    </div>
                  </>
                )}

                <div>
                  <a href={`mailto:${d.email}`}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm shadow-blue-600/20 hover:shadow-blue-600/40">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Enviar mensaje
                  </a>
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── Editar perfil ── */}
        {selected && editing && (() => {
          const d = selected.docente
          return (
            <div className="px-4 sm:px-8 pb-12 max-w-5xl mx-auto flex flex-col md:flex-row gap-5 items-start">
              {/* Foto (solo lectura al editar) */}
              <div className="shrink-0 w-full md:w-64 rounded-[2rem] overflow-hidden shadow-lg shadow-slate-200/50" style={{ height: '320px' }}>
                {d.foto_url
                  ? <img src={d.foto_url} alt={d.nombre} className="w-full h-full object-cover object-top" />
                  : <div className={`w-full h-full ${selected.color} flex items-center justify-center`}>
                      <span className="text-white font-black text-6xl tracking-tight shadow-sm">{iniciales(d.nombre)}</span>
                    </div>
                }
              </div>

              {/* Formulario */}
              <div className="flex-1 w-full">
                <div className="bg-white rounded-[2rem] border border-slate-100/60 overflow-hidden shadow-sm flex flex-col">
                  <div className="px-8 py-6 border-b border-slate-100/80 bg-slate-50/30">
                    <h2 className="text-base font-bold text-slate-900">Editar información del docente</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Los cambios quedarán registrados en el historial del docente.</p>
                  </div>
                  <div className="p-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelCls}>Nombre completo</label>
                        <input value={eNombre} onChange={e => setENombre(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Título académico</label>
                        <input value={eTitulo} onChange={e => setETitulo(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelCls}>Área de especialidad</label>
                        <input value={eArea} onChange={e => setEArea(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Teléfono</label>
                        <input value={eTelefono} onChange={e => setETelefono(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Biografía</label>
                      <textarea value={eBio} onChange={e => setEBio(e.target.value)} rows={4}
                        className={textareaCls} />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100/80 mt-2">
                      <button onClick={cancelEdit}
                        className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        Cancelar
                      </button>
                      <button onClick={guardarEdicion} disabled={saving}
                        className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-60 disabled:shadow-none">
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

      </div>

      <Toast msg={toast.msg} visible={toast.visible} ok={toast.ok} />
    </div>
  )
}
