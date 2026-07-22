import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const destinos: Record<string, string> = {
  admin:      '/dashboard/admin',
  docente:    '/dashboard/docente/perfil',
  estudiante: '/dashboard/estudiante',
}

const DOMINIO_CORREO = '@unesum.edu.ec'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail]       = useState('')
  const [pass, setPass]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    if (!email || !pass) { setError('Ingresa tu correo y contraseña.'); return }
    if (!email.toLowerCase().endsWith(DOMINIO_CORREO)) {
      setError(`El correo debe pertenecer al dominio ${DOMINIO_CORREO}`)
      return
    }
    setError('')
    setLoading(true)
    try {
      const user = await login(email, pass)
      navigate(destinos[user.role] ?? '/')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message ?? 'No se pudo iniciar sesión.')
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

      <h2 className="auth-fade-1 text-2xl font-bold text-gray-900">Bienvenido</h2>
      <p className="auth-fade-2 text-sm text-gray-500 mt-1 mb-8">Ingresa tus datos para acceder al sistema.</p>

      {/* Correo */}
      <div className="auth-fade-3 mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Correo institucional</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="usuario@unesum.edu.ec"
            className="auth-input w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 bg-white shadow-sm" />
        </div>
      </div>

      {/* Contraseña */}
      <div className="auth-fade-4 mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-500">Contraseña</label>
          <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 transition">¿Olvidaste tu contraseña?</Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </div>
          <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••"
            className="auth-input w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 bg-white shadow-sm" />
          <button type="button" onClick={() => setShowPass(p => !p)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500 transition">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 mb-5 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="text-red-500 text-xs">{error}</p>
        </div>
      )}

      <button onClick={handleLogin} disabled={loading}
        className="auth-fade-5 auth-shimmer-btn w-full text-white font-bold py-3.5 rounded-xl text-sm shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background:'linear-gradient(135deg,#1e3a6e 0%,#3d6db5 100%)', boxShadow:'0 8px 24px rgba(30,58,110,0.35)' }}>
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Ingresando...
          </>
        ) : 'Ingresar'}
      </button>

      <div className="auth-fade-6 flex flex-col items-center gap-1.5 mt-6">
        <p className="text-gray-400 text-xs">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-blue-600 hover:text-blue-800 font-semibold transition">Regístrate</Link>
        </p>
        <p className="text-gray-400 text-xs">
          ¿Problemas?{' '}
          <a href="mailto:soporte@unesum.edu.ec" className="text-blue-600 hover:text-blue-800 font-semibold transition">Contacta soporte</a>
        </p>
      </div>

    </div>
  )
}
