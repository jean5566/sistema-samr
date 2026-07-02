import { useState, useEffect } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import { Toggle } from '../../components/ui/Toggle'
import { CustomSelect } from '../../components/ui/CustomSelect'

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
  { id: 'nuevos-usuarios', clave: 'notif_nuevos_usuarios', label: 'Nuevo usuario registrado',  desc: 'Cuando un docente o estudiante se registra.',  defaultOn: true  },
  { id: 'noticias',        clave: 'notif_noticias',        label: 'Publicación de noticias',    desc: 'Cuando se publica o edita una noticia.',       defaultOn: true  },
  { id: 'documentos',      clave: 'notif_documentos',      label: 'Documentos subidos',         desc: 'Cuando se sube un nuevo documento.',           defaultOn: false },
  { id: 'errores-sistema', clave: 'notif_errores_sistema', label: 'Errores del sistema',        desc: 'Alertas críticas de rendimiento o fallos.',    defaultOn: true  },
]

const inputCls = 'w-full px-5 py-2.5 rounded-full border border-slate-200 text-sm text-slate-900 bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm'
const labelCls = 'block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide ml-2'

type Tab = 'perfil' | 'sistema' | 'notificaciones' | 'seguridad'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'perfil',
    label: 'Perfil',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'notificaciones',
    label: 'Notificaciones',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    id: 'seguridad',
    label: 'Seguridad',
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
]

function SaveButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
      <button onClick={onClick} disabled={loading}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/40">
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  )
}

export function AdminConfiguracion() {
  const { user, setUser }              = useAuth()
  const [activeTab,    setActiveTab]   = useState<Tab>('perfil')
  const [nombre,       setNombre]       = useState(user?.name  ?? '')
  const [correo,       setCorreo]       = useState(user?.email ?? '')
  const [passNueva,    setPassNueva]    = useState('')
  const [passConf,     setPassConf]     = useState('')
  const [saving,       setSaving]       = useState(false)
  const [savingSistema,   setSavingSistema]   = useState(false)
  const [savingSeguridad,  setSavingSeguridad]  = useState(false)
  const [savingNotifs,     setSavingNotifs]     = useState(false)
  const [institucion,  setInstitucion]  = useState('')
  const [carrera,      setCarrera]      = useState('')
  const [periodo,      setPeriodo]      = useState('')
  const [mantenimiento,setMantenimiento]= useState(false)
  const [loadingSistema, setLoadingSistema] = useState(true)
  const [twoFa,            setTwoFa]            = useState(false)
  const [sesion,           setSesion]           = useState('60')
  const [intentos,         setIntentos]         = useState('5')
  const [registroHabilitado, setRegistroHabilitado] = useState(true)
  const [notifs,       setNotifs]       = useState(() => Object.fromEntries(notifItems.map(n => [n.id, n.defaultOn])))

  type Sesion = { id: number; user_agent: string | null; ip_address: string | null; last_used_at: string | null; created_at: string; es_actual: boolean }
  const [sesiones,       setSesiones]       = useState<Sesion[]>([])
  const [loadingSesiones,setLoadingSesiones] = useState(false)
  const [toast,        setToast]        = useState({ visible: false, msg: '' })

  function showToast(msg: string) { setToast({ visible: true, msg }) }
  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast(p => ({ ...p, visible: false })), 2800)
      return () => clearTimeout(t)
    }
  }, [toast.visible])

  useEffect(() => {
    if (activeTab === 'seguridad') cargarSesiones()
  }, [activeTab])

  useEffect(() => {
    api.get('/configuracion').then(({ data }) => {
      if (data.institucion  !== undefined) setInstitucion(data.institucion)
      if (data.carrera      !== undefined) setCarrera(data.carrera)
      if (data.periodo      !== undefined) setPeriodo(data.periodo)
      if (data.mantenimiento  !== undefined) setMantenimiento(data.mantenimiento === 'true')
    if (data.sesion_minutos      !== undefined) setSesion(data.sesion_minutos)
    if (data.intentos_login      !== undefined) setIntentos(data.intentos_login)
    if (data.registro_habilitado !== undefined) setRegistroHabilitado(data.registro_habilitado === '1')
    const notifDefaults = Object.fromEntries(notifItems.map(n => [n.id, n.defaultOn]))
    notifItems.forEach(n => {
      if (data[n.clave] !== undefined) notifDefaults[n.id] = data[n.clave] === '1'
    })
    setNotifs(notifDefaults)
    }).finally(() => setLoadingSistema(false))
  }, [])

  function parseBrowser(ua: string | null) {
    if (!ua) return { name: 'Navegador desconocido', os: '' }
    let name = 'Navegador'
    if (ua.includes('Edg/'))                              name = 'Microsoft Edge'
    else if (ua.includes('OPR/') || ua.includes('Opera')) name = 'Opera'
    else if (ua.includes('Chrome/'))                      name = 'Google Chrome'
    else if (ua.includes('Firefox/'))                     name = 'Firefox'
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) name = 'Safari'
    let os = ''
    if (ua.includes('Windows'))                           os = 'Windows'
    else if (ua.includes('Mac OS'))                       os = 'macOS'
    else if (ua.includes('Android'))                      os = 'Android'
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
    else if (ua.includes('Linux'))                        os = 'Linux'
    return { name, os }
  }

  function timeAgo(dateStr: string | null) {
    if (!dateStr) return 'Sin actividad'
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (mins < 1)   return 'Hace un momento'
    if (mins < 60)  return `Hace ${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)   return `Hace ${hrs}h`
    return `Hace ${Math.floor(hrs / 24)}d`
  }

  async function cargarSesiones() {
    setLoadingSesiones(true)
    try {
      const { data } = await api.get('/sesiones')
      setSesiones(data)
    } finally {
      setLoadingSesiones(false)
    }
  }

  async function revocarSesion(id: number) {
    await api.delete(`/sesiones/${id}`)
    setSesiones(p => p.filter(s => s.id !== id))
    showToast('Sesión cerrada')
  }

  async function cerrarOtrasSesiones() {
    await api.delete('/sesiones/otras')
    setSesiones(p => p.filter(s => s.es_actual))
    showToast('Otras sesiones cerradas')
  }

  async function guardarNotificaciones() {
    setSavingNotifs(true)
    try {
      await Promise.all(
        notifItems.map(n => api.post('/configuracion', { clave: n.clave, valor: notifs[n.id] ? '1' : '0' }))
      )
      showToast('Preferencias de notificaciones guardadas')
    } catch {
      showToast('Error al guardar las notificaciones')
    } finally {
      setSavingNotifs(false)
    }
  }

  async function guardarSeguridad() {
    setSavingSeguridad(true)
    try {
      await Promise.all([
        api.post('/configuracion', { clave: 'sesion_minutos',      valor: sesion }),
        api.post('/configuracion', { clave: 'intentos_login',      valor: intentos }),
        api.post('/configuracion', { clave: 'registro_habilitado', valor: registroHabilitado ? '1' : '0' }),
      ])
      showToast('Configuración de seguridad guardada')
    } catch {
      showToast('Error al guardar la configuración')
    } finally {
      setSavingSeguridad(false)
    }
  }

  async function guardarSistema() {
    setSavingSistema(true)
    try {
      await Promise.all([
        api.post('/configuracion', { clave: 'institucion',   valor: institucion }),
        api.post('/configuracion', { clave: 'carrera',       valor: carrera }),
        api.post('/configuracion', { clave: 'periodo',       valor: periodo }),
        api.post('/configuracion', { clave: 'mantenimiento', valor: String(mantenimiento) }),
      ])
      showToast('Configuración del sistema guardada')
    } catch {
      showToast('Error al guardar la configuración')
    } finally {
      setSavingSistema(false)
    }
  }

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
    <div className="min-h-screen text-slate-900 font-sans overflow-y-auto flex flex-col">
      {/* Topbar */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 shrink-0">
        <h1 className="text-lg sm:text-[28px] font-bold text-slate-900 tracking-tight">Configuración</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Administra las preferencias y ajustes del sistema.</p>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12 w-full max-w-[1400px] mx-auto">

        {/* Tabs móvil — scroll horizontal */}
        <div className="lg:hidden mb-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-1">
            {tabs.map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={active ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-6 items-start">

          {/* Sidebar de tabs — solo desktop */}
          <aside className="hidden lg:block w-52 shrink-0 sticky top-6">
            <nav className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-2 flex flex-col gap-0.5">
              {tabs.map(tab => {
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className={active ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Contenido del tab activo */}
          <div className="flex-1 min-w-0">

            {/* TAB: Perfil */}
            {activeTab === 'perfil' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Perfil del administrador</h2>
                  <p className="text-sm text-slate-500 mt-1">Datos de la cuenta con la que administras el sistema.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Nombre completo</label>
                    <input value={nombre} onChange={e => setNombre(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Correo institucional</label>
                    <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <p className="text-sm font-bold text-slate-800 mb-4 ml-2">Cambiar contraseña</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <SaveButton onClick={guardarPerfil} loading={saving} />
              </div>
            )}

            {/* TAB: Sistema */}
            {activeTab === 'sistema' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Sistema</h2>
                  <p className="text-sm text-slate-500 mt-1">Información general y configuración de la plataforma.</p>
                </div>

                {loadingSistema ? (
                  <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Cargando configuración...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <CustomSelect
                          value={periodo}
                          onChange={setPeriodo}
                          placeholder="Seleccionar..."
                          allowEmpty={false}
                          options={[
                            { value: 'P1 2025', label: 'P1 2025' },
                            { value: 'P2 2025', label: 'P2 2025' },
                            { value: 'P1 2026', label: 'P1 2026' },
                            { value: 'P2 2026', label: 'P2 2026' },
                            { value: 'P1 2027', label: 'P1 2027' },
                            { value: 'P2 2027', label: 'P2 2027' },
                          ]}
                          buttonClassName={inputCls}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Modo mantenimiento</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Muestra una pantalla de mantenimiento a los usuarios.</p>
                      </div>
                      <Toggle checked={mantenimiento} onChange={setMantenimiento} />
                    </div>

                    <SaveButton onClick={guardarSistema} loading={savingSistema} />
                  </>
                )}
              </div>
            )}

            {/* TAB: Notificaciones */}
            {activeTab === 'notificaciones' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Notificaciones</h2>
                  <p className="text-sm text-slate-500 mt-1">Controla qué alertas recibe el administrador.</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {notifItems.map(n => (
                    <div key={n.id} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/60 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{n.label}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">{n.desc}</p>
                      </div>
                      <Toggle checked={notifs[n.id]} onChange={v => setNotifs(p => ({ ...p, [n.id]: v }))} />
                    </div>
                  ))}
                </div>
                <div className="px-8 py-5 border-t border-slate-100">
                  <SaveButton onClick={guardarNotificaciones} loading={savingNotifs} />
                </div>
              </div>
            )}

            {/* TAB: Seguridad */}
            {activeTab === 'seguridad' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Seguridad</h2>
                  <p className="text-sm text-slate-500 mt-1">Opciones de acceso y protección del sistema.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Tiempo de sesión</label>
                    <CustomSelect
                      value={sesion}
                      onChange={setSesion}
                      placeholder="Seleccionar..."
                      allowEmpty={false}
                      options={[
                        { value: '30', label: '30 minutos' },
                        { value: '60', label: '60 minutos' },
                        { value: '120', label: '2 horas' },
                        { value: '480', label: '8 horas' }
                      ]}
                      buttonClassName={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Intentos máximos de login</label>
                    <CustomSelect
                      value={intentos}
                      onChange={setIntentos}
                      placeholder="Seleccionar..."
                      allowEmpty={false}
                      options={[
                        { value: '3', label: '3 intentos' },
                        { value: '5', label: '5 intentos' },
                        { value: '10', label: '10 intentos' }
                      ]}
                      buttonClassName={inputCls}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Registro de nuevos usuarios</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Permite que docentes y estudiantes creen su cuenta.</p>
                  </div>
                  <Toggle checked={registroHabilitado} onChange={setRegistroHabilitado} />
                </div>

                <div className="flex items-center justify-between px-6 py-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Autenticación de dos factores</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Requiere confirmación adicional al iniciar sesión.</p>
                  </div>
                  <Toggle checked={twoFa} onChange={setTwoFa} />
                </div>

                <SaveButton onClick={guardarSeguridad} loading={savingSeguridad} />

                {/* Sesiones activas */}
                <div className="border-t border-slate-100 pt-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Sesiones activas</p>
                      <p className="text-xs text-slate-500 mt-0.5">Dispositivos con acceso activo a tu cuenta.</p>
                    </div>
                    {sesiones.some(s => !s.es_actual) && (
                      <button onClick={cerrarOtrasSesiones}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                        Cerrar otras sesiones
                      </button>
                    )}
                  </div>

                  {loadingSesiones ? (
                    <div className="text-center py-8 text-slate-400 text-sm">Cargando sesiones...</div>
                  ) : sesiones.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">No hay sesiones registradas.</div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {sesiones.map(s => {
                        const { name: browser, os } = parseBrowser(s.user_agent)
                        return (
                          <div key={s.id} className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-colors ${s.es_actual ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                            {/* Icono navegador */}
                            <div className={`shrink-0 ${s.es_actual ? 'text-blue-400' : 'text-slate-300'}`}>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
                              </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-bold text-slate-800">{browser}</p>
                                {os && <span className="text-xs text-slate-400">{os}</span>}
                                {s.es_actual && (
                                  <span className="text-[11px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                                    Sesión actual
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {s.ip_address ?? 'IP desconocida'} · {timeAgo(s.last_used_at ?? s.created_at)}
                              </p>
                            </div>

                            {!s.es_actual && (
                              <button onClick={() => revocarSesion(s.id)}
                                className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50">
                                Cerrar
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Toast msg={toast.msg} visible={toast.visible} />
    </div>
  )
}
