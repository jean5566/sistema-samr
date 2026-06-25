import { useState, useMemo, useEffect } from 'react'
import api from '../../lib/api'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { Toggle } from '../../components/ui/Toggle'
import { RolBadge, EstadoBadge } from '../../components/ui/Badges'

interface Usuario {
  id: number
  name: string
  email: string
  role: 'estudiante' | 'docente' | 'admin'
  estado: 'pendiente' | 'activo' | 'rechazado'
  created_at: string
}

// Colores web limpios (azules, violetas, rosas)
const avatarColors: Record<string, string> = {
  estudiante: 'bg-blue-100 text-blue-700',
  docente: 'bg-violet-100 text-violet-700',
  admin: 'bg-rose-100 text-rose-700',
}

function initials(name: string) {
  return name.split(' ').filter(w => w.length > 1).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

const inputCls = 'w-full px-5 py-2.5 rounded-full border border-slate-200 text-sm text-slate-900 bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm'
const labelCls = 'block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide ml-2'

const emptyForm = { name: '', email: '', role: 'estudiante' as Usuario['role'], password: '' }

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterRol, setFilterRol] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [registroHabilitado, setRegistroHabilitado] = useState(false)
  const [togglingRegistro, setTogglingRegistro] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Usuario | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [modalError, setModalError] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

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
      (filterRol ? u.role === filterRol : true) &&
      (filterEstado ? u.estado === filterEstado : true)
    ), [usuarios, search, filterRol, filterEstado])

  useEffect(() => { setPage(1) }, [search, filterRol, filterEstado])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginaActual = Math.min(page, totalPages)
  const paginated = useMemo(() =>
    filtered.slice((paginaActual - 1) * PER_PAGE, paginaActual * PER_PAGE),
    [filtered, paginaActual])

  const paginas = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const set = new Set([1, 2, totalPages - 1, totalPages, paginaActual - 1, paginaActual, paginaActual + 1])
    return [...set].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  }, [totalPages, paginaActual])

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-y-auto flex flex-col">
      {/* Topbar */}
      <div className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Gestión de Usuarios
            {pendienteCount > 0 && (
              <span className="inline-flex items-center bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                {pendienteCount} pendiente{pendienteCount > 1 ? 's' : ''}
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-200 bg-white shadow-sm">
            <Toggle checked={registroHabilitado} onChange={toggleRegistro} disabled={togglingRegistro} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Registro público</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${registroHabilitado ? 'text-blue-600' : 'text-slate-400'}`}>
                {registroHabilitado ? 'Habilitado' : 'Deshabilitado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12 w-full max-w-[1400px] mx-auto">
        
        {/* Banner de pendientes */}
        {pendienteCount > 0 && (
          <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-[24px] px-6 py-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  {pendienteCount} solicitud{pendienteCount > 1 ? 'es' : ''} de registro pendiente{pendienteCount > 1 ? 's' : ''}
                </p>
                <p className="text-xs font-medium text-amber-700 mt-0.5">Hay nuevos usuarios esperando aprobación para acceder al sistema.</p>
              </div>
            </div>
            <button onClick={() => setFilterEstado('pendiente')}
              className="px-5 py-2 bg-white hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-full transition-colors shadow-sm border border-amber-200">
              Revisar pendientes
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="relative w-64">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className={inputCls} />
          </div>

          <div className="flex items-center gap-3">
            <CustomSelect
              value={filterRol}
              onChange={setFilterRol}
              placeholder="Roles"
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'docente', label: 'Docente' },
                { value: 'estudiante', label: 'Estudiante' }
              ]}
              buttonClassName="px-4 py-2.5 rounded-full border border-slate-200 bg-white shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none transition-all min-w-[140px]"
            />

            <CustomSelect
              value={filterEstado}
              onChange={setFilterEstado}
              placeholder="Estado"
              options={[
                { value: 'activo', label: 'Activos' },
                { value: 'pendiente', label: 'Pendientes' },
                { value: 'rechazado', label: 'Rechazados' }
              ]}
              buttonClassName="px-4 py-2.5 rounded-full border border-slate-200 bg-white shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none transition-all min-w-[140px]"
            />
          </div>

          <button onClick={openNew}
            className="ml-auto inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md hover:shadow-lg text-sm font-bold px-6 py-2.5 rounded-full transition-all">
            Nuevo Usuario
          </button>
        </div>

        {/* Table */}
        <div className="w-full">
          <table className="w-full text-sm border-collapse" style={{ borderSpacing: 0 }}>
            <thead>
              <tr className="bg-slate-200/60">
                {['Usuario', 'Correo', 'Rol', 'Ingreso', 'Estado', 'Acciones'].map((h, i, arr) => (
                  <th key={h} className={`px-6 py-4 text-left text-xs font-bold text-slate-700 ${i === 0 ? 'rounded-l-[20px]' : ''} ${i === arr.length - 1 ? 'rounded-r-[20px]' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-slate-500">Cargando usuarios...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-red-500">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <p className="text-slate-500 text-sm font-medium">No se encontraron usuarios</p>
                  </td>
                </tr>
              ) : paginated.map(u => (
                <tr key={u.id} className="group border-b border-slate-200/80 hover:bg-white transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[u.role] ?? 'bg-slate-100 text-slate-700'}`}>
                        {initials(u.name)}
                      </div>
                      <span className="font-semibold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4"><RolBadge rol={u.role} /></td>
                  <td className="px-6 py-4 text-slate-600 text-xs font-semibold">
                    {new Date(u.created_at).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4"><EstadoBadge estado={u.estado} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {u.estado === 'pendiente' && (
                        <>
                          <button onClick={() => aprobar(u.id)}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Aprobar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button onClick={() => rechazar(u.id)}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Rechazar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                      {u.estado !== 'pendiente' && (
                        <button onClick={() => openEdit(u)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      <button onClick={() => setConfirmDelete(u)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer / Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={paginaActual === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition disabled:opacity-40 disabled:hover:bg-transparent">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                {paginas.map((p, i) => (
                  <span key={p} className="flex items-center gap-2">
                    {i > 0 && p - paginas[i - 1] > 1 && (
                      <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm font-semibold">...</span>
                    )}
                    <button onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition ${
                        p === paginaActual ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200 font-semibold'
                      }`}>
                      {p}
                    </button>
                  </span>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={paginaActual === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition disabled:opacity-40 disabled:hover:bg-transparent">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmación eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden p-8 border border-slate-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Eliminar usuario</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Estás a punto de eliminar a <span className="font-bold text-slate-800">{confirmDelete.name}</span>.<br />
                  Esta acción es permanente.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <button onClick={confirmAndDelete} disabled={deleting}
                className="w-full px-5 py-3 rounded-full bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 text-sm font-bold transition-all flex items-center justify-center gap-2">
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button onClick={() => setConfirmDelete(null)} disabled={deleting}
                className="w-full px-5 py-3 rounded-full border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar/crear */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{editingId !== null ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-8 py-6 flex flex-col gap-6">
              <div>
                <label className={labelCls}>Nombre completo</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Correo electrónico</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Rol del sistema</label>
                  <CustomSelect
                    value={form.role}
                    onChange={v => setForm(f => ({ ...f, role: v as Usuario['role'] }))}
                    placeholder="Seleccionar rol"
                    allowEmpty={false}
                    options={[
                      { value: 'estudiante', label: 'Estudiante' },
                      { value: 'docente', label: 'Docente' },
                      { value: 'admin', label: 'Administrador' }
                    ]}
                    buttonClassName={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>{editingId !== null ? 'Nueva contraseña' : 'Contraseña'}</label>
                  <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputCls} placeholder={editingId !== null ? '(Opcional)' : ''} />
                </div>
              </div>
            </div>

            {modalError && (
              <div className="mx-8 mb-4 flex items-start gap-3 bg-red-50 rounded-[20px] px-5 py-4">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                <p className="text-red-600 text-sm font-bold">{modalError}</p>
              </div>
            )}

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
              <button onClick={save} disabled={saving}
                className="w-full px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                {saving ? 'Guardando...' : (editingId !== null ? 'Guardar cambios' : 'Crear usuario')}
              </button>
              <button onClick={() => setModalOpen(false)}
                className="w-full px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
