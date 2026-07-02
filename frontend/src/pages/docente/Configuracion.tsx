import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import api from '../../lib/api'
import { Toggle } from '../../components/ui/Toggle'

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
    <div className="min-h-screen text-slate-900 font-sans overflow-y-auto flex flex-col">
      <div className="px-4 sm:px-8 py-4 sm:py-6 shrink-0">
        <h1 className="text-lg sm:text-[28px] font-bold text-slate-900 tracking-tight">Configuración</h1>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* Acceso de estudiantes */}
          <section className="bg-white rounded-[2rem] border border-slate-100/60 shadow-sm overflow-hidden flex flex-col group/card">
            <div className="px-8 py-6 border-b border-slate-100/80 bg-slate-50/30">
              <h2 className="text-base font-bold text-slate-900">Mi perfil</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Controla si los estudiantes pueden editar la información de tu perfil.</p>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-sm font-bold text-slate-800">Permitir que los estudiantes editen mi perfil</p>
                  <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
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
          <section className="bg-white rounded-[2rem] border border-slate-100/60 shadow-sm overflow-hidden flex flex-col group/card">
            <div className="px-8 py-6 border-b border-slate-100/80 bg-slate-50/30 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Historial de ediciones</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Estudiantes que han modificado tu perfil.</p>
              </div>
              {!loadingLogs && logs.length > 0 && (
                <span className="text-xs font-black text-slate-500 bg-slate-200/60 px-3 py-1.5 rounded-full">{logs.length}</span>
              )}
            </div>

            {loadingLogs ? (
              <div className="p-8 flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-base font-bold text-slate-500">Aún no hay ediciones registradas.</p>
                <p className="text-sm font-medium text-slate-400 mt-1">Aquí aparecerán los cambios que hagan los estudiantes en tu perfil.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100/80">
                {logs.map(l => (
                  <div key={l.id} className="flex items-center gap-4 px-8 py-5 hover:bg-slate-50/60 transition-colors">
                    <div className={`w-10 h-10 rounded-full ${LOG_COLORS[l.user_id % LOG_COLORS.length]} flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm`}>
                      {iniciales(l.nombre)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{l.nombre ?? 'Estudiante eliminado'}</p>
                      <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{formatCambios(l.cambios)}</p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 shrink-0 whitespace-nowrap uppercase tracking-wider">{formatFecha(l.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

      <Toast msg={toast.msg} visible={toast.visible} ok={toast.ok} />
    </div>
  )
}
