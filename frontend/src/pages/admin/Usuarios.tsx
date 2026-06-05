import { useState, useMemo } from 'react'

interface Usuario {
  id: number
  nombres: string
  apellidos: string
  correo: string
  rol: 'estudiante' | 'docente'
  estado: 'activo' | 'inactivo'
  ingreso: string
}

const initialUsuarios: Usuario[] = [
  { id: 1, nombres: 'Ana',     apellidos: 'Torres',   correo: 'a.torres@unesum.edu.ec',   rol: 'estudiante', estado: 'activo',   ingreso: '2026-01-10' },
  { id: 2, nombres: 'Luis',    apellidos: 'Pérez',    correo: 'l.perez@unesum.edu.ec',    rol: 'estudiante', estado: 'activo',   ingreso: '2026-01-10' },
  { id: 3, nombres: 'María',   apellidos: 'García',   correo: 'm.garcia@unesum.edu.ec',   rol: 'docente',    estado: 'activo',   ingreso: '2024-03-05' },
  { id: 4, nombres: 'Carlos',  apellidos: 'Ramírez',  correo: 'c.ramirez@unesum.edu.ec',  rol: 'docente',    estado: 'activo',   ingreso: '2023-08-15' },
  { id: 5, nombres: 'Sofía',   apellidos: 'Mendoza',  correo: 's.mendoza@unesum.edu.ec',  rol: 'estudiante', estado: 'inactivo', ingreso: '2025-09-01' },
  { id: 6, nombres: 'Pedro',   apellidos: 'Torres',   correo: 'p.torres@unesum.edu.ec',   rol: 'docente',    estado: 'activo',   ingreso: '2022-02-20' },
  { id: 7, nombres: 'Valeria', apellidos: 'Castillo', correo: 'v.castillo@unesum.edu.ec', rol: 'estudiante', estado: 'activo',   ingreso: '2026-01-10' },
  { id: 8, nombres: 'Diego',   apellidos: 'Mora',     correo: 'd.mora@unesum.edu.ec',     rol: 'estudiante', estado: 'activo',   ingreso: '2025-09-01' },
]

const emptyForm = { nombres: '', apellidos: '', correo: '', rol: 'estudiante' as Usuario['rol'], estado: 'activo' as Usuario['estado'] }

const avatarColors: Record<Usuario['rol'], string> = {
  estudiante: 'bg-blue-600',
  docente:    'bg-violet-600',
}

function initials(n: string, a: string) { return `${n[0] ?? ''}${a[0] ?? ''}`.toUpperCase() }

function RolBadge({ rol }: { rol: Usuario['rol'] }) {
  return rol === 'docente'
    ? <span className="inline-flex items-center border border-violet-200 bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">Docente</span>
    : <span className="inline-flex items-center border border-blue-200 bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium">Estudiante</span>
}

function EstadoBadge({ estado }: { estado: Usuario['estado'] }) {
  return estado === 'activo'
    ? <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Activo
      </span>
    : <span className="inline-flex items-center gap-1.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-full px-2.5 py-0.5 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />Inactivo
      </span>
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-2'

export function AdminUsuarios() {
  const [usuarios, setUsuarios]             = useState<Usuario[]>(initialUsuarios)
  const [search, setSearch]                 = useState('')
  const [filterRol, setFilterRol]           = useState('')
  const [filterEstado, setFilterEstado]     = useState('')
  const [modalOpen, setModalOpen]           = useState(false)
  const [editingId, setEditingId]           = useState<number | null>(null)
  const [form, setForm]                     = useState(emptyForm)

  const filtered = useMemo(() =>
    usuarios.filter(u =>
      (`${u.nombres} ${u.apellidos}`.toLowerCase().includes(search.toLowerCase()) ||
       u.correo.toLowerCase().includes(search.toLowerCase())) &&
      (filterRol    ? u.rol    === filterRol    : true) &&
      (filterEstado ? u.estado === filterEstado : true)
    ), [usuarios, search, filterRol, filterEstado])

  function openNew()  { setEditingId(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(id: number) {
    const u = usuarios.find(x => x.id === id)!
    setEditingId(id)
    setForm({ nombres: u.nombres, apellidos: u.apellidos, correo: u.correo, rol: u.rol, estado: u.estado })
    setModalOpen(true)
  }
  function save() {
    if (!form.nombres || !form.apellidos || !form.correo) return
    if (editingId !== null) {
      setUsuarios(p => p.map(u => u.id === editingId ? { ...u, ...form } : u))
    } else {
      setUsuarios(p => [{ id: Date.now(), ...form, ingreso: new Date().toISOString().slice(0, 10) }, ...p])
    }
    setModalOpen(false)
  }

  return (
    <>
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Administración</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Gestión de Usuarios</h1>
        </div>
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">CM</div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Toolbar inside card */}
          <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar usuario..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-400" />
            </div>

            <select value={filterRol} onChange={e => setFilterRol(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition select-styled">
              <option value="">Todos los roles</option>
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
            </select>

            <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition select-styled">
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>

            <button onClick={openNew}
              className="ml-auto inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo usuario
            </button>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Usuario', 'Correo electrónico', 'Rol', 'Estado', 'Ingreso', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-400 text-sm font-medium">No se encontraron usuarios</p>
                    <p className="text-gray-300 text-xs mt-1">Intenta ajustar los filtros</p>
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColors[u.rol]} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                        {initials(u.nombres, u.apellidos)}
                      </div>
                      <span className="font-semibold text-gray-900">{u.nombres} {u.apellidos}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{u.correo}</td>
                  <td className="px-5 py-4"><RolBadge rol={u.rol} /></td>
                  <td className="px-5 py-4"><EstadoBadge estado={u.estado} /></td>
                  <td className="px-5 py-4 text-gray-400 text-xs tabular-nums">
                    {new Date(u.ingreso + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setUsuarios(p => p.filter(x => x.id !== u.id))}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Eliminar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Mostrando <span className="font-semibold text-gray-600">{filtered.length}</span> de <span className="font-semibold text-gray-600">{usuarios.length}</span> usuarios
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{editingId !== null ? 'Editar usuario' : 'Nuevo usuario'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Completa los datos del usuario</p>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombres</label>
                  <input value={form.nombres} onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))}
                    placeholder="Nombres" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Apellidos</label>
                  <input value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                    placeholder="Apellidos" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Correo institucional</label>
                <input type="email" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
                  placeholder="usuario@unesum.edu.ec" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Rol</label>
                  <select value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value as Usuario['rol'] }))} className={`${inputCls} select-styled`}>
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Estado</label>
                  <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as Usuario['estado'] }))} className={`${inputCls} select-styled`}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={save}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm">
                {editingId !== null ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
