import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Role = 'admin' | 'docente' | 'estudiante'

const roleOptions = [
  { id: 'admin' as Role, label: 'Admin', icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z' },
  { id: 'docente' as Role, label: 'Docente', icon: 'M20 17a2 2 0 002-2V4a2 2 0 00-2-2H9.46c.35.61.54 1.3.54 2h10v11h-9v2h9zM15 7a2 2 0 00-2-2H4a2 2 0 00-2 2v13l4-4h9a2 2 0 002-2V7z' },
  { id: 'estudiante' as Role, label: 'Estudiante', icon: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z' },
]

const destinos: Record<Role, string> = {
  admin:      '/dashboard/admin',
  docente:    '/dashboard/docente/perfil',
  estudiante: '/dashboard/estudiante/docentes',
}

export function Login() {
  const navigate = useNavigate()
  const [role, setRole]       = useState<Role | null>(null)
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]     = useState('')

  function login() {
    if (!role) { setError('Selecciona tu tipo de usuario para continuar.'); return }
    setError('')
    navigate(destinos[role])
  }

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-40 -right-24 w-[30rem] h-[30rem] rounded-full bg-white/5 pointer-events-none" />

      <button onClick={() => navigate('/')}
        className="absolute top-5 left-5 z-20 flex items-center gap-2 text-white/70 hover:text-white transition text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al inicio
      </button>

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-8 mx-4">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="CTI UNESUM" className="h-16 w-16 object-contain rounded-full bg-blue-50 p-1 shadow mb-3" />
          <h1 className="text-blue-900 text-xl font-bold">Tecnologías de la Información</h1>
          <p className="text-gray-400 text-xs mt-0.5">Universidad Estatal del Sur de Manabí</p>
        </div>

        <div className="border-t border-gray-100 mb-6" />

        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Soy...</p>
          <div className="grid grid-cols-3 gap-2">
            {roleOptions.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)}
                className={`flex flex-col items-center gap-2 py-3.5 rounded-2xl border-2 transition-all text-xs font-bold ${
                  role === r.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-100 hover:border-blue-400 hover:bg-blue-50 text-gray-400 hover:text-blue-700'
                }`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d={r.icon} />
                </svg>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Correo institucional</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="usuario@unesum.edu.ec"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-300" />
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-500">Contraseña</label>
            <a href="#" className="text-xs text-blue-600 hover:text-blue-800 transition">¿Olvidaste tu contraseña?</a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>
            <input type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()} placeholder="••••••••"
              className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-300" />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-500 transition">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center mb-4 bg-red-50 py-2 px-3 rounded-xl border border-red-100">{error}</p>
        )}

        <button onClick={login}
          className="w-full bg-blue-800 hover:bg-blue-900 active:scale-95 text-white font-bold py-3 rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg">
          Ingresar
        </button>

        <p className="text-center text-gray-400 text-xs mt-5">
          ¿Problemas?{' '}
          <a href="mailto:soporte@unesum.edu.ec" className="text-blue-600 hover:text-blue-800 font-semibold transition">Contacta soporte</a>
        </p>
      </div>
    </div>
  )
}
