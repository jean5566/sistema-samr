import { useNavigate } from 'react-router-dom'

const materias = [
  { nombre: 'Programación Orientada a Objetos', codigo: 'TI-301', semestre: '3ro', alumnos: 28, color: 'bg-blue-500' },
  { nombre: 'Bases de Datos I',                 codigo: 'TI-302', semestre: '3ro', alumnos: 31, color: 'bg-violet-500' },
  { nombre: 'Redes y Comunicaciones',           codigo: 'TI-401', semestre: '4to', alumnos: 25, color: 'bg-emerald-500' },
]

const agenda = [
  { hora: '08:00', titulo: 'POO — Aula 12',        tipo: 'Clase' },
  { hora: '10:00', titulo: 'Entrega de notas 3ro', tipo: 'Administrativo' },
  { hora: '14:00', titulo: 'BD I — Laboratorio',   tipo: 'Clase' },
  { hora: '16:30', titulo: 'Reunión de carrera',   tipo: 'Reunión' },
]

const tipoColor: Record<string, string> = {
  Clase:          'bg-blue-100 text-blue-700',
  Administrativo: 'bg-amber-100 text-amber-700',
  Reunión:        'bg-violet-100 text-violet-700',
}

export function DocenteDashboard() {
  const navigate = useNavigate()

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Docente</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Panel principal</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Bienvenida */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl px-6 py-5 text-white mb-6 flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">Bienvenido de vuelta</p>
            <h2 className="text-lg font-bold mt-0.5">Dr. Carlos Mendoza</h2>
            <p className="text-blue-200 text-xs mt-1">Período 2026-I · 3 materias activas</p>
          </div>
          <button onClick={() => navigate('/dashboard/docente/perfil')}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
            Ver perfil
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Materias',  value: '3',  icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'Alumnos',   value: '84', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Evaluaciones pendientes', value: '2', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                <svg className={`w-5 h-5 ${s.color}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-4">
          {/* Mis materias */}
          <div className="col-span-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Mis materias</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {materias.map(m => (
                <div key={m.codigo} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">
                  <div className={`w-9 h-9 rounded-lg ${m.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {m.nombre.split(' ').slice(0, 2).map(w => w[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{m.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.codigo} · {m.semestre} semestre</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{m.alumnos} alumnos</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div className="col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Agenda de hoy</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {agenda.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <span className="text-xs font-bold text-gray-400 w-10 shrink-0 pt-0.5">{a.hora}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{a.titulo}</p>
                    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 ${tipoColor[a.tipo]}`}>{a.tipo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
