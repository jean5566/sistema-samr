import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'
      }`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
      <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      {msg}
    </div>
  )
}

const notifItems = [
  { id: 'nuevos-usuarios', label: 'Nuevo usuario registrado',  desc: 'Cuando un docente o estudiante se registra.',  defaultOn: true  },
  { id: 'noticias',        label: 'Publicación de noticias',    desc: 'Cuando se publica o edita una noticia.',       defaultOn: true  },
  { id: 'documentos',      label: 'Documentos subidos',         desc: 'Cuando se sube un nuevo documento.',           defaultOn: false },
  { id: 'errores-sistema', label: 'Errores del sistema',        desc: 'Alertas críticas de rendimiento o fallos.',    defaultOn: true  },
]

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-2'

function SectionCard({ title, desc, children, onSave, saveLabel = 'Guardar cambios' }: {
  title: string; desc: string; children: React.ReactNode; onSave?: () => void; saveLabel?: string
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
      </div>
      <div className="p-6 flex flex-col gap-5">
        {children}
        {onSave && (
          <div className="flex justify-end pt-1">
            <button onClick={onSave}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition shadow-sm">
              {saveLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export function AdminConfiguracion() {
  const { user, setUser }              = useAuth()
  const [nombre,       setNombre]       = useState(user?.name  ?? '')
  const [correo,       setCorreo]       = useState(user?.email ?? '')
  const [passNueva,    setPassNueva]    = useState('')
  const [passConf,     setPassConf]     = useState('')
  const [saving,       setSaving]       = useState(false)
  const [institucion,  setInstitucion]  = useState('Universidad Estatal del Sur de Manabí')
  const [carrera,      setCarrera]      = useState('Tecnologías de la Información')
  const [periodo,      setPeriodo]      = useState('2026-1')
  const [mantenimiento,setMantenimiento]= useState(false)
  const [twoFa,        setTwoFa]        = useState(false)
  const [sesion,       setSesion]       = useState('60')
  const [intentos,     setIntentos]     = useState('5')
  const [notifs,       setNotifs]       = useState(() => Object.fromEntries(notifItems.map(n => [n.id, n.defaultOn])))
  const [toast,        setToast]        = useState({ visible: false, msg: '' })

  function showToast(msg: string) { setToast({ visible: true, msg }) }
  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast(p => ({ ...p, visible: false })), 2800)
      return () => clearTimeout(t)
    }
  }, [toast.visible])

  async function guardarPerfil() {
    if (passNueva && passNueva !== passConf) { showToast('Las contraseñas no coinciden'); return }
    if (!user) return
    setSaving(true)
    try {
      const payload: Record<string, string> = { name: nombre, email: correo }
      if (passNueva) payload.password = passNueva
      const { data } = await api.put(`/users/${user.id}`, payload)
      setUser({ ...user, name: data.name, email: data.email })
      showToast('Perfil actualizado correctamente')
      setPassNueva(''); setPassConf('')
    } catch {
      showToast('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Administración</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Configuración</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl flex flex-col gap-5">

          {/* Perfil */}
          <SectionCard title="Perfil del administrador" desc="Datos de la cuenta con la que administras el sistema." onSave={guardarPerfil} saveLabel={saving ? 'Guardando...' : 'Guardar cambios'}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nombre completo</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Correo institucional</label>
                <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-medium text-gray-700 mb-4">Cambiar contraseña</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nueva contraseña</label>
                  <input type="password" value={passNueva} onChange={e => setPassNueva(e.target.value)} placeholder="••••••••" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirmar contraseña</label>
                  <input type="password" value={passConf} onChange={e => setPassConf(e.target.value)} placeholder="••••••••" className={inputCls} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Sistema */}
          <SectionCard title="Sistema" desc="Información general y configuración de la plataforma." onSave={() => showToast('Configuración del sistema guardada')}>
            <div>
              <label className={labelCls}>Nombre de la institución</label>
              <input value={institucion} onChange={e => setInstitucion(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nombre de la carrera</label>
              <input value={carrera} onChange={e => setCarrera(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Período académico activo</label>
              <select value={periodo} onChange={e => setPeriodo(e.target.value)} className={`${inputCls} select-styled`}>
                <option value="2026-1">2026 — I</option>
                <option value="2026-2">2026 — II</option>
                <option value="2025-2">2025 — II</option>
              </select>
            </div>
            <div className="flex items-center justify-between px-4 py-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-800">Modo mantenimiento</p>
                <p className="text-xs text-gray-400 mt-0.5">Muestra una pantalla de mantenimiento a los usuarios.</p>
              </div>
              <Toggle checked={mantenimiento} onChange={setMantenimiento} />
            </div>
          </SectionCard>

          {/* Notificaciones */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Notificaciones</h2>
              <p className="text-xs text-gray-400 mt-1">Controla qué alertas recibe el administrador.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {notifItems.map(n => (
                <div key={n.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{n.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                  </div>
                  <Toggle checked={notifs[n.id]} onChange={v => setNotifs(p => ({ ...p, [n.id]: v }))} />
                </div>
              ))}
            </div>
          </section>

          {/* Seguridad */}
          <SectionCard title="Seguridad" desc="Opciones de acceso y protección del sistema." onSave={() => showToast('Configuración de seguridad guardada')}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tiempo de sesión</label>
                <select value={sesion} onChange={e => setSesion(e.target.value)} className={`${inputCls} select-styled`}>
                  <option value="30">30 minutos</option>
                  <option value="60">60 minutos</option>
                  <option value="120">2 horas</option>
                  <option value="480">8 horas</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Intentos máximos de login</label>
                <select value={intentos} onChange={e => setIntentos(e.target.value)} className={`${inputCls} select-styled`}>
                  <option value="3">3 intentos</option>
                  <option value="5">5 intentos</option>
                  <option value="10">10 intentos</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-800">Autenticación de dos factores</p>
                <p className="text-xs text-gray-400 mt-0.5">Requiere confirmación adicional al iniciar sesión.</p>
              </div>
              <Toggle checked={twoFa} onChange={setTwoFa} />
            </div>
          </SectionCard>

        </div>
      </div>

      <Toast msg={toast.msg} visible={toast.visible} />
    </>
  )
}
