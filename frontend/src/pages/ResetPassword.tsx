import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../lib/api'

export function ResetPassword() {
  const navigate       = useNavigate()
  const [searchParams]  = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [pass, setPass]         = useState('')
  const [passConf, setPassConf] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [listo, setListo]       = useState(false)

  async function handleSubmit() {
    if (!token || !email) { setError('El enlace de recuperación no es válido.'); return }
    if (!pass)             { setError('Ingresa tu nueva contraseña.'); return }
    if (pass.length <= 8)  { setError('La contraseña debe tener más de 8 caracteres.'); return }
    if (pass !== passConf) { setError('Las contraseñas no coinciden.'); return }
    setError('')
    setLoading(true)
    try {
      await api.post('/reset-password', {
        token, email, password: pass, password_confirmation: passConf,
      })
      setListo(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const firstError =
        e.response?.data?.errors
          ? Object.values(e.response.data.errors)[0]?.[0]
          : e.response?.data?.message
      setError(firstError ?? 'No se pudo restablecer la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="w-full max-w-md flex flex-col items-center gap-4 py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center shadow-inner">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Enlace inválido</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            El enlace de recuperación es incorrecto o está incompleto.
          </p>
        </div>
        <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition mt-1">
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  if (listo) {
    return (
      <div className="w-full max-w-md flex flex-col items-center gap-5 py-10 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-xl shadow-green-400/40">
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold text-gray-900">Contraseña actualizada</p>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          <button onClick={() => navigate('/login')}
            className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
            Ir al login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">

      <h2 className="auth-fade-1 text-2xl font-bold text-gray-900">Restablecer contraseña</h2>
      <p className="auth-fade-2 text-sm text-gray-500 mt-1 mb-8">
        Crea una nueva contraseña para <span className="font-semibold text-gray-700">{email}</span>.
      </p>

      <div className="auth-fade-3 mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nueva contraseña</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </div>
          <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
            placeholder="••••••••"
            className="auth-input w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 bg-white shadow-sm" />
        </div>
      </div>

      <div className="auth-fade-4 mb-4">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirmar contraseña</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </div>
          <input type={showPass ? 'text' : 'password'} value={passConf} onChange={e => setPassConf(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="••••••••"
            className="auth-input w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 bg-white shadow-sm" />
        </div>
      </div>

      <label className="auth-fade-4 flex items-center gap-2.5 mb-4 cursor-pointer select-none w-fit">
        <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)}
          className="accent-blue-600 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all" />
        <span className="text-xs font-semibold text-slate-400">Mostrar contraseñas</span>
      </label>

      <p className="auth-fade-4 text-[11px] text-slate-400 -mt-2 mb-4 ml-1">La contraseña debe tener más de 8 caracteres.</p>

      {error && (
        <div className="flex items-center gap-2.5 mb-5 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
          <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="text-red-500 text-xs">{error}</p>
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading}
        className="auth-fade-5 auth-shimmer-btn w-full text-white font-bold py-3.5 rounded-xl text-sm shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background:'linear-gradient(135deg,#1e3a6e 0%,#3d6db5 100%)', boxShadow:'0 8px 24px rgba(30,58,110,0.35)' }}>
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Guardando...
          </>
        ) : 'Restablecer contraseña'}
      </button>

    </div>
  )
}
