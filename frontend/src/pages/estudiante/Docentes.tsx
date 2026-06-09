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
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
        {ok
          ? <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          : <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        }
      </span>
      {msg}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1.5'

export function EstudianteDocentes() {
  const location                      = useLocation()
  const [docentes,    setDocentes]    = useState<Docente[]>([])
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
    api.get<Docente[]>('/docentes', { headers: { 'Cache-Control': 'no-cache' } })
      .then(res => setDocentes(res.data))
      .finally(() => setLoading(false))
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

  function handleBack() {
    if (editing) {
      setEditing(false)
    } else {
      setSelected(null)
    }
  }

  return (
    <>
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 shrink-0 flex items-center gap-3">
        {selected && (
          <button onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Estudiante</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">
            {selected ? selected.docente.nombre : 'Mis Docentes'}
          </h1>
        </div>
        {/* Edit button in topbar — visible only if this docente enabled it */}
        {selected && !editing && selected.docente.permite_edicion_estudiantes && (
          <button onClick={startEdit}
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar perfil
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Lista ── */}
        {!selected && (
          <div className="px-8 py-6">
            <p className="text-xs text-gray-400 mb-5">
              Docentes registrados en el período <span className="font-semibold text-gray-600">2026-I</span>
            </p>

            {loading && <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Cargando docentes...</div>}
            {!loading && docentes.length === 0 && <div className="flex items-center justify-center py-20 text-gray-400 text-sm">No hay docentes registrados.</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {docentes.map((d, i) => {
                const color = COLORS[i % COLORS.length]
                return (
                  <div key={d.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    <div className={`h-14 ${color}`} />
                    <div className="flex justify-center -mt-8 px-4">
                      <div className="w-16 h-16 rounded-full border-4 border-white shadow overflow-hidden bg-gray-100 shrink-0">
                        {d.foto_url
                          ? <img src={d.foto_url} alt={d.nombre} className="w-full h-full object-cover object-top" />
                          : <div className={`w-full h-full ${color} flex items-center justify-center`}>
                              <span className="text-white text-lg font-bold">{iniciales(d.nombre)}</span>
                            </div>
                        }
                      </div>
                    </div>
                    <div className="px-4 pt-2 pb-4 text-center flex flex-col flex-1">
                      <h3 className="text-sm font-bold text-gray-900 leading-snug">{d.nombre}</h3>
                      <a href={`mailto:${d.email}`} className="text-xs text-gray-400 hover:text-blue-600 transition mt-1 truncate">{d.email}</a>
                      <div className="mt-auto pt-4">
                        <button onClick={() => setSelected({ docente: d, color })}
                          className="w-full text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50 transition">
                          Ver perfil
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Perfil (vista) ── */}
        {selected && !editing && (() => {
          const d = selected.docente
          return (
            <div className="px-8 py-8 flex gap-10 items-start">
              {/* Foto */}
              <div className="shrink-0 w-56 rounded-2xl overflow-hidden shadow-md" style={{ height: '280px' }}>
                {d.foto_url
                  ? <img src={d.foto_url} alt={d.nombre} className="w-full h-full object-cover object-top" />
                  : <div className={`w-full h-full ${selected.color} flex items-center justify-center`}>
                      <span className="text-white font-bold text-5xl">{iniciales(d.nombre)}</span>
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col gap-5 pt-1">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">{d.nombre}</h2>
                  {d.area   && <p className="text-blue-600 text-sm font-semibold mt-1">{d.area}</p>}
                  {d.titulo && <p className="text-gray-400 text-xs mt-0.5">{d.titulo}</p>}
                </div>

                <div className="w-full h-px bg-gray-100" />

                <div className="flex flex-col gap-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Contacto</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a href={`mailto:${d.email}`} className="text-sm text-gray-700 hover:text-blue-600 transition">{d.email}</a>
                  </div>
                  {d.telefono && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">{d.telefono}</span>
                    </div>
                  )}
                </div>

                {d.bio && (
                  <>
                    <div className="w-full h-px bg-gray-100" />
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Sobre el docente</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{d.bio}</p>
                    </div>
                  </>
                )}

                <a href={`mailto:${d.email}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-2.5 transition w-fit mt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar mensaje
                </a>
              </div>
            </div>
          )
        })()}

        {/* ── Editar perfil ── */}
        {selected && editing && (() => {
          const d = selected.docente
          return (
            <div className="px-8 py-8 flex gap-10 items-start">
              {/* Foto (solo lectura al editar) */}
              <div className="shrink-0 w-56 rounded-2xl overflow-hidden shadow-md" style={{ height: '280px' }}>
                {d.foto_url
                  ? <img src={d.foto_url} alt={d.nombre} className="w-full h-full object-cover object-top" />
                  : <div className={`w-full h-full ${selected.color} flex items-center justify-center`}>
                      <span className="text-white font-bold text-5xl">{iniciales(d.nombre)}</span>
                    </div>
                }
              </div>

              {/* Formulario */}
              <div className="flex-1">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Editar información del docente</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Los cambios quedarán registrados en el historial.</p>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Nombre completo</label>
                        <input value={eNombre} onChange={e => setENombre(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Título académico</label>
                        <input value={eTitulo} onChange={e => setETitulo(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
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
                        className={`${inputCls} resize-none`} />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button onClick={cancelEdit}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition">
                        Cancelar
                      </button>
                      <button onClick={guardarEdicion} disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition disabled:opacity-60">
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
    </>
  )
}
