import { useNavigate } from 'react-router-dom'

export function Navbar() {
  const navigate = useNavigate()

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <button
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src="/logo.png" alt="CTI UNESUM" className="h-12 w-12 object-contain" />
            <div className="leading-tight">
              <div className="font-bold text-base text-blue-900">Tecnologías</div>
              <div className="text-sm text-blue-500">de la Información</div>
            </div>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-transparent hover:bg-blue-50 active:scale-95 text-blue-900 border border-blue-900/30 hover:border-blue-900 text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
            Iniciar sesión
          </button>
        </div>
      </nav>
      <nav className="bg-blue-800 text-white text-sm fixed top-16 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 h-9">
          <button onClick={() => navigate('/')}          className="hover:text-blue-200 transition">Inicio</button>
          <button onClick={() => navigate('/sobre')}     className="hover:text-blue-200 transition">Sobre la Carrera</button>
          <button onClick={() => navigate('/docentes')}  className="hover:text-blue-200 transition">Docentes</button>
          <button onClick={() => navigate('/noticias')}  className="hover:text-blue-200 transition">Noticias</button>
        </div>
      </nav>
    </>
  )
}
