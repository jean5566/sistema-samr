import { useState, useMemo, useEffect } from 'react'
import api from '../../lib/api'

interface Usuario {
  id: number
  name: string
  email: string
  role: 'estudiante' | 'docente' | 'admin'
  estado: 'pendiente' | 'activo' | 'rechazado'
  created_at: string
}

const avatarColors: Record<string, string> = {
  estudiante: 'bg-blue-600',
  docente:    'bg-violet-600',
  admin:      'bg-rose-600',
}

function initials(name: string) {
  return name.split(' ').filter(w => w.length > 1).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function RolBadge({ rol }: { rol: string }) {
  if (rol === 'docente')
    return <span className="inline-flex items-center border border-violet-200 bg-violet-50 text-violet-700 rounded-full px-2.5 py-0.5 text-xs font-medium">Docente</span>
  if (rol === 'admin')
    return <span className="inline-flex items-center border border-rose-200 bg-rose-50 text-rose-700 rounded-full px-2.5 py-0.5 text-xs font-medium">Admin</span>
  return <span className="inline-flex items-center border border-blue-200 bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium">Estudiante</span>
}

function EstadoBadge({ estado }: { estado: string }) {
  if (estado === 'pendiente')
    return (
      <span className="inline-flex items-center gap-1 border border-amber-200 bg-amber-50 text-amber-700 rounded-full px-2.5 py-0.5 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Pendiente
      </span>
    )
  if (estado === 'rechazado')
    return <span className="inline-flex items-center gap-1 border border-red-200 bg-red-50 text-red-600 rounded-full px-2.5 py-0.5 text-xs font-medium">Rechazado</span>
  return <span className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs font-medium">Activo</span>
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:text-gray-400'
const labelCls = 'block text-sm font-medium text-gray-700 mb-2'

const emptyForm = { name: '', email: '', role: 'estudiante' as Usuario['role'], password: '' }

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative inline-flex w-9 h-5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        checked ? 'bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'
      }`}>
      <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

export function AdminUsuarios() {
  const [usuarios, setUsuarios]                     = useState<Usuario[]>([])
  const [loading, setLoading]                       = useState(true)
  const [error, setError]                           = useState<string | null>(null)
  const [search, setSearch]                         = useState('')
  const [filterRol, setFilterRol]                   = useState('')
  const [filterEstado, setFilterEstado]             = useState('')
  const [modalOpen, setModalOpen]                   = useState(false)
  const [editingId, setEditingId]                   = useState<number | null>(null)
  const [form, setForm]                             = useState(emptyForm)
  const [saving, setSaving]                         = useState(false)
  const [registroHabilitado, setRegistroHabilitado] = useState(false)
  const [togglingRegistro, setTogglingRegistro]     = useState(false)
  const [confirmDelete, setConfirmDelete]           = useState<Usuario | null>(null)
  const [deleting, setDeleting]                     = useState(false)
  const [modalError, setModalError]                 = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get<Usuario[]>('/users'),
      api.get<Record<string, string>>('/configuracion'),
    ])
      .then(([usersRes, configRes]) => {
        setUsuarios(usersRes.data)
        setRegistroHabilitado(configRes.data['registro_habilitado'] === '1')
      })
      .catch(() => setError('No se pudo cargar la lista de usuarios.'))
      .finally(() => setLoading(false))
  }, [])

  async function toggleRegistro(val: boolean) {
    setTogglingRegistro(true)
    try {
      await api.post('/configuracion', { clave: 'registro_habilitado', valor: val ? '1' : '0' })
      setRegistroHabilitado(val)
    } finally {
      setTogglingRegistro(false)
    }
  }

  const pendienteCount = useMemo(() => usuarios.filter(u => u.estado === 'pendiente').length, [usuarios])

  const filtered = useMemo(() =>
    usuarios.filter(u =>
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
       u.email.toLowerCase().includes(search.toLowerCase())) &&
      (filterRol    ? u.role   === filterRol    : true) &&
      (filterEstado ? u.estado === filterEstado : true)
    ), [usuarios, search, filterRol, filterEstado])

  function openNew() { setEditingId(null); setForm(emptyForm); setModalError(''); setModalOpen(true) }
  function openEdit(u: Usuario) {
    setEditingId(u.id)
    setForm({ name: u.name, email: u.email, role: u.role, password: '' })
    setModalError('')
    setModalOpen(true)
  }

  async function save() {
    if (!form.name || !form.email) { setModalError('Nombre y correo son obligatorios.'); return }
    setModalError('')
    setSaving(true)
    try {
      if (editingId !== null) {
        const payload: Record<string, string> = { name: form.name, email: form.email, role: form.role }
        if (form.password) payload.password = form.password
        const { data } = await api.put(`/users/${editingId}`, payload)
        setUsuarios(p => p.map(u => u.id === editingId
          ? { ...u, name: data.name, email: data.email, role: data.role }
          : u))
      } else {
        if (!form.password) { setModalError('La contraseña es obligatoria.'); setSaving(false); return }
        const { data } = await api.post<Usuario>('/users', { name: form.name, email: form.email, role: form.role, password: form.password })
        setUsuarios(p => [data, ...p])
      }
      setModalOpen(false)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const first = e.response?.data?.errors
        ? Object.values(e.response.data.errors)[0]?.[0]
        : e.response?.data?.message
      setModalError(first ?? 'Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  async function aprobar(id: number) {
    await api.post(`/users/${id}/aprobar`)
    setUsuarios(p => p.map(u => u.id === id ? { ...u, estado: 'activo' } : u))
  }

  async function rechazar(id: number) {
    await api.post(`/users/${id}/rechazar`)
    setUsuarios(p => p.map(u => u.id === id ? { ...u, estado: 'rechazado' } : u))
  }

  async function confirmAndDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await api.delete(`/users/${confirmDelete.id}`)
      setUsuarios(p => p.filter(u => u.id !== confirmDelete.id))
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Administración</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">
            Gestión de Usuarios
            {pendienteCount > 0 && (
              <span className="ml-2 inline-flex items-center bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendienteCount} pendiente{pendienteCount > 1 ? 's' : ''}
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50">
            <Toggle checked={registroHabilitado} onChange={toggleRegistro} disabled={togglingRegistro} />
            <span className="text-xs font-medium text-gray-600">Registro público</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${registroHabilitado ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
              {registroHabilitado ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* Banner de pendientes */}
        {pendienteCount > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                {pendienteCount} solicitud{pendienteCount > 1 ? 'es' : ''} de registro pendiente{pendienteCount > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">Revisa y aprueba o rechaza las nuevas cuentas.</p>
            </div>
            <button onClick={() => setFilterEstado('pendiente')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline transition">
              Ver pendientes
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
            <div className="relative w-56">
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
              <option value="">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="docente">Docente</option>
              <option value="estudiante">Estudiante</option>
            </select>

            <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="pendiente">Pendientes</option>
              <option value="rechazado">Rechazados</option>
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
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-400">Cargando usuarios...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-red-500">{error}</td></tr>
              ) : filtered.length === 0 ? (
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
                <tr key={u.id} className={`border-b border-gray-100 last:border-0 transition-colors ${
                  u.estado === 'pendiente' ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-blue-50/30'
                }`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColors[u.role] ?? 'bg-gray-500'} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                        {initials(u.name)}
                      </div>
                      <span className="font-semibold text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{u.email}</td>
                  <td className="px-5 py-4"><RolBadge rol={u.role} /></td>
                  <td className="px-5 py-4"><EstadoBadge estado={u.estado} /></td>
                  <td className="px-5 py-4 text-gray-400 text-xs tabular-nums">
                    {new Date(u.created_at).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {u.estado === 'pendiente' && (
                        <>
                          <button onClick={() => aprobar(u.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition" title="Aprobar">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Aprobar
                          </button>
                          <button onClick={() => rechazar(u.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition" title="Rechazar">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Rechazar
                          </button>
                        </>
                      )}
                      {u.estado !== 'pendiente' && (
                        <button onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      <button onClick={() => setConfirmDelete(u)}
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
            {filterEstado && (
              <button onClick={() => setFilterEstado('')} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition">
                Limpiar filtro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal confirmación eliminar */}
      {confirmDelete && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">¿Eliminar usuario?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Vas a eliminar a <span className="font-semibold text-gray-800">{confirmDelete.name}</span>.<br />
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting}
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={confirmAndDelete} disabled={deleting}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold transition shadow-sm flex items-center gap-2">
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Eliminando...
                  </>
                ) : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar/crear */}
      {modalOpen && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
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
              <div>
                <label className={labelCls}>Nombre completo</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre completo" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Correo electrónico</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="usuario@unesum.edu.ec" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Rol</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Usuario['role'] }))}
                    className={`${inputCls} select-styled`}>
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{editingId !== null ? 'Nueva contraseña' : 'Contraseña'}</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder={editingId !== null ? 'Dejar vacío para no cambiar' : 'Contraseña'}
                    className={inputCls} />
                </div>
              </div>
            </div>
            {modalError && (
              <div className="mx-6 mb-1 flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p className="text-red-500 text-xs">{modalError}</p>
              </div>
            )}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={save} disabled={saving}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition shadow-sm flex items-center gap-2">
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Guardando...
                  </>
                ) : (editingId !== null ? 'Guardar cambios' : 'Crear usuario')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
