import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Inicio',           path: '/' },
    { label: 'Sobre la Carrera', path: '/sobre' },
    { label: 'Docentes',         path: '/docentes' },
    { label: 'Noticias',         path: '/noticias' },
  ]

  function go(path: string) {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <>
      {/* Barra principal */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <button className="flex items-center gap-2 cursor-pointer" onClick={() => go('/')}>
            <img src="/logo.png" alt="CTI UNESUM" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
            <div className="leading-tight">
              <div className="font-bold text-sm sm:text-base text-blue-900">Tecnologías</div>
              <div className="text-xs sm:text-sm text-blue-500">de la Información</div>
            </div>
          </button>

          {/* Botones desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => go('/login')}
              className="inline-flex items-center gap-2 bg-transparent hover:bg-blue-50 text-blue-900 border border-blue-900/30 hover:border-blue-900 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
              Iniciar sesión
            </button>
            <button
              onClick={() => go('/registro')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Registrarse
            </button>
          </div>

          {/* Hamburguesa móvil */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="sm:hidden p-2 rounded-lg text-blue-900 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Sub-nav de links (desktop) */}
      <nav className="hidden sm:block bg-blue-800 text-white text-sm fixed top-16 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-6 h-9">
          {navLinks.map(l => (
            <button key={l.path} onClick={() => go(l.path)} className="hover:text-blue-200 transition">
              {l.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Menú desplegable móvil */}
      {menuOpen && (
        <div className="sm:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-lg">
          <div className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map(l => (
              <button
                key={l.path}
                onClick={() => go(l.path)}
                className="text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {l.label}
              </button>
            ))}
            <div className="border-t border-slate-100 mt-2 pt-2 flex flex-col gap-2">
              <button
                onClick={() => go('/login')}
                className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-blue-900 border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => go('/registro')}
                className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
