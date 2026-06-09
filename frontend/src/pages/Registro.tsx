import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

type Role = 'docente' | 'estudiante'

const roleOptions = [
  { id: 'estudiante' as Role, label: 'Estudiante', icon: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z' },
  { id: 'docente'    as Role, label: 'Docente',    icon: 'M20 17a2 2 0 002-2V4a2 2 0 00-2-2H9.46c.35.61.54 1.3.54 2h10v11h-9v2h9zM15 7a2 2 0 00-2-2H4a2 2 0 00-2 2v13l4-4h9a2 2 0 002-2V7z' },
]

export function Registro() {
  const [habilitado, setHabilitado] = useState<boolean | null>(null)
  const [role, setRole]             = useState<Role | null>(null)
  const [name, setName]             = useState('')
  const [email, setEmail]           = useState('')
  const [pass, setPass]             = useState('')
  const [passConf, setPassConf]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [pendiente, setPendiente]   = useState(false)

  useEffect(() => {
    api.get<{ habilitado: boolean }>('/registro-estado')
      .then(r => setHabilitado(r.data.habilitado))
      .catch(() => setHabilitado(false))
  }, [])

  async function handleRegister() {
    if (!role)             { setError('Selecciona tu tipo de usuario.'); return }
    if (!name)             { setError('Ingresa tu nombre completo.'); return }
    if (!email)            { setError('Ingresa tu correo institucional.'); return }
    if (!pass)             { setError('Ingresa una contraseña.'); return }
    if (pass !== passConf) { setError('Las contraseñas no coinciden.'); return }
    setError('')
    setLoading(true)
    try {
      await api.post('/register', { name, email, password: pass, password_confirmation: passConf, role })
      setPendiente(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const firstError =
        e.response?.data?.errors
          ? Object.values(e.response.data.errors)[0]?.[0]
          : e.response?.data?.message
      setError(firstError ?? 'Error al registrarse. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">

      {/* Header mobile */}
      <div className="lg:hidden flex flex-col items-center mb-8">
        <img src="/logo.png" alt="CTI UNESUM"
          className="h-14 w-14 object-contain rounded-full bg-blue-50 p-1 shadow mb-3" />
        <h1 className="text-blue-900 text-lg font-bold">Tecnologías de la Información</h1>
        <p className="text-gray-400 text-xs mt-0.5">Universidad Estatal del Sur de Manabí</p>
      </div>

      {/* Cargando */}
      {habilitado === null && (
        <div className="flex justify-center py-16">
          <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {/* Registro deshabilitado */}
      {habilitado === false && (
        <div className="auth-fade-3 flex flex-col items-center gap-4 py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center shadow-inner">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0-6v.01M5.07 19H19a2 2 0 001.75-2.97l-6.94-12a2 2 0 00-3.5 0l-6.94 12A2 2 0 005.07 19z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Registro no disponible</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              El registro está deshabilitado.<br />Contacta al administrador para obtener acceso.
            </p>
          </div>
          <Link to="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition mt-1">
            Ir al login
          </Link>
        </div>
      )}

      {/* Solicitud enviada */}
      {habilitado === true && pendiente && (
        <div className="flex flex-col items-center gap-5 py-10 text-center">
          <div className="relative flex items-center justify-center">
            <div className="auth-pulse-ring-1 absolute w-24 h-24 rounded-full border-4 border-amber-400/40" />
            <div className="auth-pulse-ring-2 absolute w-24 h-24 rounded-full border-4 border-amber-400/25" />
            <div className="auth-success-in w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-xl shadow-amber-400/40">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="auth-msg-appear flex flex-col gap-2">
            <p className="text-xl font-bold text-gray-900">¡Solicitud enviada!</p>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
              Tu cuenta está <span className="font-semibold text-amber-600">pendiente de aprobación</span>.<br />
              El administrador revisará tu solicitud y te dará acceso.
            </p>
            <Link to="/login"
              className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Volver al login
            </Link>
          </div>
        </div>
      )}

      {/* Formulario */}
      {habilitado === true && !pendiente && (
        <>
          <h2 className="auth-fade-1 text-2xl font-bold text-gray-900">Crear cuenta</h2>
          <p className="auth-fade-2 text-sm text-gray-500 mt-1 mb-6">Completa tus datos para registrarte.</p>

          {/* Rol */}
          <div className="auth-fade-3 mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Soy...</p>
            <div className="grid grid-cols-2 gap-3">
              {roleOptions.map(r => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  className={`auth-role-btn flex flex-col items-center gap-2 py-4 rounded-2xl border-2 text-xs font-bold ${
                    role === r.id
                      ? 'selected border-blue-500 bg-blue-50 text-blue-700 shadow-lg shadow-blue-200/60'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/60 text-gray-400 hover:text-blue-600 bg-white'
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    role === r.id ? 'bg-blue-600 shadow-md shadow-blue-400/40' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-5 h-5 ${role === r.id ? 'text-white' : 'text-gray-400'}`}
                      fill="currentColor" viewBox="0 0 24 24">
                      <path d={r.icon} />
                    </svg>
                  </div>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div className="auth-fade-4 mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre completo"
                className="auth-input w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 bg-white shadow-sm" />
            </div>
          </div>

          {/* Correo */}
          <div className="auth-fade-4 mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Correo institucional</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="usuario@unesum.edu.ec"
                className="auth-input w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 bg-white shadow-sm" />
            </div>
          </div>

          {/* Contraseñas */}
          <div className="auth-fade-5 grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                </div>
                <input type={showPass ? 'text' : 'password'} value={pass}
                  onChange={e => setPass(e.target.value)} placeholder="••••••••"
                  className="auth-input w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 bg-white shadow-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirmar</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                </div>
                <input type={showPass ? 'text' : 'password'} value={passConf}
                  onChange={e => setPassConf(e.target.value)} placeholder="••••••••"
                  className="auth-input w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 bg-white shadow-sm" />
              </div>
            </div>
          </div>

          <label className="auth-fade-6 flex items-center gap-2 mb-5 cursor-pointer select-none w-fit">
            <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)}
              className="accent-blue-600 w-3.5 h-3.5" />
            <span className="text-xs text-gray-400">Mostrar contraseñas</span>
          </label>

          {error && (
            <div className="flex items-center gap-2.5 mb-5 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <p className="text-red-500 text-xs">{error}</p>
            </div>
          )}

          <button onClick={handleRegister} disabled={loading}
            className="auth-fade-7 auth-shimmer-btn w-full text-white font-bold py-3.5 rounded-xl text-sm shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#1e3a6e 0%,#3d6db5 100%)', boxShadow:'0 8px 24px rgba(30,58,110,0.35)' }}>
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creando cuenta...
              </>
            ) : 'Crear cuenta'}
          </button>

          <div className="auth-fade-7 flex justify-center mt-6">
            <p className="text-gray-400 text-xs">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition">
                Inicia sesión
              </Link>
            </p>
          </div>
        </>
      )}

    </div>
  )
}
