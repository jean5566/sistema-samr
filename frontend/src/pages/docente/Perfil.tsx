import { useState } from 'react'

export function DocentePerfil() {
  const [nombre,     setNombre]     = useState('Dr. Carlos Mendoza')
  const [correo,     setCorreo]     = useState('c.mendoza@unesum.edu.ec')
  const [telefono,   setTelefono]   = useState('+593 99 123 4567')
  const [titulo,     setTitulo]     = useState('Doctor en Ciencias Informáticas')
  const [area,       setArea]       = useState('Inteligencia Artificial')
  const [bio,        setBio]        = useState('Docente investigador con 12 años de experiencia en el área de Inteligencia Artificial y Machine Learning. Coordinador del grupo de investigación en IA Educativa de la UNESUM.')
  const [saved,      setSaved]      = useState(false)

  function guardar() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2600)
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Docente</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Mi Perfil</h1>
        </div>
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">CM</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl flex flex-col gap-5">

          {/* Avatar + nombre */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              CM
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{nombre}</h2>
              <p className="text-sm text-gray-400">{titulo}</p>
              <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{area}</span>
            </div>
          </div>

          {/* Datos personales */}
          <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Información personal</h2>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre completo</label>
                  <input value={nombre} onChange={e => setNombre(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Correo institucional</label>
                  <input type="email" value={correo} onChange={e => setCorreo(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Teléfono</label>
                  <input value={telefono} onChange={e => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Área de especialidad</label>
                  <input value={area} onChange={e => setArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Título académico</label>
                <input value={titulo} onChange={e => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Biografía</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none" />
              </div>
              <div className="flex items-center justify-between">
                {saved && (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Cambios guardados
                  </span>
                )}
                <div className="ml-auto">
                  <button onClick={guardar} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition">
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Materias actuales */}
          <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Materias a cargo — 2026-I</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { nombre: 'Programación Orientada a Objetos', codigo: 'TI-301', alumnos: 28 },
                { nombre: 'Bases de Datos I',                 codigo: 'TI-302', alumnos: 31 },
                { nombre: 'Redes y Comunicaciones',           codigo: 'TI-401', alumnos: 25 },
              ].map(m => (
                <div key={m.codigo} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.codigo}</p>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{m.alumnos} alumnos</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
