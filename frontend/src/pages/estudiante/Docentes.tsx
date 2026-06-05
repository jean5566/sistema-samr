const docentes = [
  { nombre: 'Dr. Carlos Mendoza',   materia: 'Prog. Orientada a Objetos', email: 'c.mendoza@unesum.edu.ec',   horario: 'Lun–Mié 08:00–10:00', color: 'bg-blue-500' },
  { nombre: 'Mg. Ana Torres',       materia: 'Redes y Comunicaciones',    email: 'a.torres@unesum.edu.ec',    horario: 'Mar–Jue 14:00–16:00', color: 'bg-violet-500' },
  { nombre: 'Mg. Patricia Cedeño',  materia: 'Bases de Datos I',          email: 'p.cedeno@unesum.edu.ec',   horario: 'Vie 08:00–12:00',     color: 'bg-emerald-500' },
]

export function EstudianteDocentes() {
  return (
    <>
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Estudiante</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Mis Docentes</h1>
        </div>
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">JG</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <p className="text-xs text-gray-400 mb-5">Docentes asignados para el período <span className="font-semibold text-gray-600">2026-I</span></p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {docentes.map(d => (
            <div key={d.email} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-16 ${d.color} flex items-center justify-center`}>
                <span className="text-white text-3xl font-bold">{d.nombre.split(' ').slice(-2).map(w => w[0]).join('')}</span>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold text-gray-900">{d.nombre}</h3>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">{d.materia}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    <a href={`mailto:${d.email}`} className="hover:text-blue-600 transition truncate">{d.email}</a>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {d.horario}
                  </div>
                </div>
                <a href={`mailto:${d.email}`}
                  className="mt-4 w-full block text-center text-xs font-semibold text-blue-600 border border-blue-200 rounded-md py-1.5 hover:bg-blue-50 transition">
                  Enviar mensaje
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
