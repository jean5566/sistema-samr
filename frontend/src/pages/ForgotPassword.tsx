import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

const DOMINIO_CORREO = '@unesum.edu.ec'

export function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit() {
    if (!email) { setError('Ingresa tu correo institucional.'); return }
    if (!email.toLowerCase().endsWith(DOMINIO_CORREO)) {
      setError(`El correo debe pertenecer al dominio ${DOMINIO_CORREO}`)
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/forgot-password', { email })
      setEnviado(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message ?? 'No se pudo enviar el correo de recuperación.')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div className="w-full max-w-md flex flex-col items-center gap-5 py-10 text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-400/40">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold text-gray-900">Revisa tu correo</p>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
            Enviamos las instrucciones para restablecer tu contraseña a <span className="font-semibold text-gray-700">{email}</span>.
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
    )
  }

  return (
    <div className="w-full max-w-md">

      <h2 className="auth-fade-1 text-2xl font-bold text-gray-900">¿Olvidaste tu contraseña?</h2>
      <p className="auth-fade-2 text-sm text-gray-500 mt-1 mb-8">
        Ingresa tu correo institucional y te enviaremos un enlace para restablecerla.
      </p>

      <div className="auth-fade-3 mb-6">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Correo institucional</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="usuario@unesum.edu.ec"
            className="auth-input w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 bg-white shadow-sm" />
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

      <button onClick={handleSubmit} disabled={loading}
        className="auth-fade-5 auth-shimmer-btn w-full text-white font-bold py-3.5 rounded-xl text-sm shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background:'linear-gradient(135deg,#1e3a6e 0%,#3d6db5 100%)', boxShadow:'0 8px 24px rgba(30,58,110,0.35)' }}>
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Enviando...
          </>
        ) : 'Enviar enlace de recuperación'}
      </button>

      <div className="auth-fade-6 flex flex-col items-center gap-1.5 mt-6">
        <p className="text-gray-400 text-xs">
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition">Volver al login</Link>
        </p>
      </div>

    </div>
  )
}
