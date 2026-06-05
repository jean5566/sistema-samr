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
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="border border-gray-400 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50 transition"
            >
              Iniciar Sesión
            </button>
            <button className="bg-blue-800 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-900 transition">
              Registrarse
            </button>
          </div>
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
