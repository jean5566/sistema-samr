import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import api from '../../lib/api'

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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'}`}
    >
      <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

interface LogEntry {
  id: number
  user_id: number
  nombre: string | null
  email: string | null
  docente_id: number | null
  docente_nombre: string | null
  cambios: Record<string, any> | null
  created_at: string
}

const LOG_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500']

function iniciales(nombre: string | null) {
  if (!nombre) return '?'
  return nombre.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function formatCambios(cambios: Record<string, any> | null): string {
  if (!cambios) return '—'
  return Object.entries(cambios).map(([k, v]) => {
    if (k === 'contraseña') return 'Contraseña actualizada'
    if (typeof v === 'object' && v !== null && 'anterior' in v && 'nuevo' in v) {
      return `${k.charAt(0).toUpperCase() + k.slice(1)}: "${v.anterior}" → "${v.nuevo}"`
    }
    return k
  }).join(' · ')
}

function formatFecha(raw: string) {
  return new Date(raw).toLocaleDateString('es-EC', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function DocenteConfiguracion() {
  const { user, setUser }          = useAuth()
  const docente                    = user?.docente

  const [permitirEdicion, setPermitirEdicion] = useState(docente?.permite_edicion_estudiantes ?? false)
  const [logs,            setLogs]            = useState<LogEntry[]>([])
  const [loadingLogs,     setLoadingLogs]     = useState(true)
  const [toast,           setToast]           = useState({ visible: false, msg: '', ok: true })

  function showToast(msg: string, ok = true) { setToast({ visible: true, msg, ok }) }
  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast(p => ({ ...p, visible: false })), 2800)
      return () => clearTimeout(t)
    }
  }, [toast.visible])

  useEffect(() => {
    if (!docente) return
    api.get('/configuracion/log')
      .then(res => {
        // Solo ediciones del perfil de ESTE docente
        setLogs((res.data as LogEntry[]).filter(l => l.docente_id === docente.id))
      })
      .finally(() => setLoadingLogs(false))
  }, [docente?.id])

  async function toggleEdicion(val: boolean) {
    if (!docente) return
    setPermitirEdicion(val)
    try {
      const { data } = await api.put(`/docentes/${docente.id}`, { permite_edicion_estudiantes: val })
      setUser({ ...user!, docente: data })
      showToast(val ? 'Los estudiantes ahora pueden editar tu perfil' : 'Edición de perfil deshabilitada')
    } catch {
      setPermitirEdicion(!val)
      showToast('Error al guardar la configuración', false)
    }
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Docente</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Configuración</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl flex flex-col gap-5">

          {/* Acceso de estudiantes */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Mi perfil</h2>
              <p className="text-xs text-gray-400 mt-1">Controla si los estudiantes pueden editar la información de tu perfil.</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between px-4 py-4 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-800">Permitir que los estudiantes editen mi perfil</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {permitirEdicion
                      ? 'Activo — los estudiantes pueden editar tu nombre, área, título y biografía.'
                      : 'Inactivo — los estudiantes solo pueden ver tu perfil.'}
                  </p>
                </div>
                <Toggle checked={permitirEdicion} onChange={toggleEdicion} />
              </div>
            </div>
          </section>

          {/* Historial de ediciones */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Historial de ediciones</h2>
                <p className="text-xs text-gray-400 mt-1">Estudiantes que han modificado tu perfil.</p>
              </div>
              {!loadingLogs && logs.length > 0 && (
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{logs.length}</span>
              )}
            </div>

            {loadingLogs ? (
              <div className="p-5 flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="py-14 flex flex-col items-center text-center px-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">Aún no hay ediciones registradas.</p>
                <p className="text-xs text-gray-300 mt-1">Aquí aparecerán los cambios que hagan los estudiantes en tu perfil.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {logs.map(l => (
                  <div key={l.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition">
                    <div className={`w-8 h-8 rounded-full ${LOG_COLORS[l.user_id % LOG_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {iniciales(l.nombre)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{l.nombre ?? 'Estudiante eliminado'}</p>
                      <p className="text-xs text-gray-400 truncate">{formatCambios(l.cambios)}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap">{formatFecha(l.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

      <Toast msg={toast.msg} visible={toast.visible} ok={toast.ok} />
    </>
  )
}
