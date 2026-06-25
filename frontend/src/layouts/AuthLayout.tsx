import { Outlet, useLocation, useNavigate } from 'react-router-dom'

export function AuthLayout() {
  const navigate  = useNavigate()
  const location  = useLocation()

  return (
    <div className="h-screen w-full flex overflow-hidden">

      {/* ── Panel izquierdo fijo ── */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0f1f45 0%,#1e3a6e 50%,#2a4d8f 100%)' }}>

        {/* Fondo Logo / Marca de agua (Girado en la esquina superior derecha hacia la izquierda) */}
        <div className="absolute -top-40 -right-50 w-[800px] h-[800px] pointer-events-none opacity-[0.12] mix-blend-screen invert grayscale bg-no-repeat bg-contain bg-center transform -rotate-25"
          style={{ backgroundImage: 'url("/logo.png")' }} />

        {/* Contenido */}
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <h1 className="auth-fade-1 text-white text-3xl font-bold leading-tight">
            Tecnologías de<br />la Información
          </h1>
          <p className="auth-fade-2 text-blue-200 text-sm mt-3 leading-relaxed">
            Universidad Estatal del<br />Sur de Manabí — UNESUM
          </p>

          <div className="auth-fade-3 mt-10 flex flex-col gap-3 w-full max-w-xs">
            {[
              { icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z', text: 'Gestión académica integral' },
              { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', text: 'Documentos y recursos' },
              { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', text: 'Directorio de docentes' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.07] rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <span className="text-blue-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Volver al inicio */}
        <button onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-white/50 hover:text-white transition text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </button>
      </div>

      {/* ── Panel derecho — cambia por ruta ── */}
      <div
        key={location.pathname}
        className="auth-card-enter w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-10 overflow-y-auto relative">

        {/* Volver — solo mobile */}
        <button onClick={() => navigate('/')}
          className="lg:hidden absolute top-5 left-5 flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <Outlet />
      </div>
    </div>
  )
}
