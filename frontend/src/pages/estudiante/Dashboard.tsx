import { useNavigate } from 'react-router-dom'

const materias = [
  { nombre: 'Prog. Orientada a Objetos', codigo: 'TI-301', nota: 8.5,  color: 'bg-blue-500' },
  { nombre: 'Bases de Datos I',          codigo: 'TI-302', nota: 9.0,  color: 'bg-violet-500' },
  { nombre: 'Redes y Comunicaciones',    codigo: 'TI-401', nota: 7.8,  color: 'bg-emerald-500' },
  { nombre: 'Cálculo Diferencial',       codigo: 'MAT-201', nota: 6.5, color: 'bg-amber-500' },
]

function notaColor(nota: number) {
  if (nota >= 8.5) return 'text-emerald-600 bg-emerald-50'
  if (nota >= 7)   return 'text-blue-600 bg-blue-50'
  return 'text-amber-600 bg-amber-50'
}

export function EstudianteDashboard() {
  const navigate = useNavigate()
  const prom = (materias.reduce((a, m) => a + m.nota, 0) / materias.length).toFixed(2)

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Estudiante</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Panel principal</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl px-6 py-5 text-white mb-6 flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">Bienvenido</p>
            <h2 className="text-lg font-bold mt-0.5">Juan García Pincay</h2>
            <p className="text-blue-200 text-xs mt-1">3er Semestre · Período 2026-I</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs">Promedio general</p>
            <p className="text-3xl font-bold">{prom}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Materias', value: '4',  icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Documentos disponibles', value: '12', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Docentes asignados', value: '3', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

        {/* Calificaciones */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Calificaciones actuales</h2>
            <button onClick={() => navigate('/dashboard/estudiante/documentos')}
              className="text-xs text-blue-600 font-semibold hover:underline">Ver documentos</button>
          </div>
          <div className="divide-y divide-gray-100">
            {materias.map(m => (
              <div key={m.codigo} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">
                <div className={`w-9 h-9 rounded-lg ${m.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {m.codigo.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{m.nombre}</p>
                  <p className="text-xs text-gray-400">{m.codigo}</p>
                </div>
                <div className={`text-sm font-bold px-2.5 py-1 rounded-lg ${notaColor(m.nota)}`}>
                  {m.nota.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/dashboard/estudiante/docentes')}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-200 transition text-left">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Mis docentes</p>
              <p className="text-xs text-gray-400">Ver información de contacto</p>
            </div>
          </button>
          <button onClick={() => navigate('/dashboard/estudiante/documentos')}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:bg-blue-50 hover:border-blue-200 transition text-left">
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Documentos</p>
              <p className="text-xs text-gray-400">Reglamentos y formularios</p>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}
