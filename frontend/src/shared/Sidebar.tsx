import { useNavigate, useLocation } from 'react-router-dom'

type Role = 'admin' | 'docente' | 'estudiante'

interface MenuItem {
  label: string
  icon: string
  id: string
  path: string
}

const menus: Record<Role, MenuItem[]> = {
  admin: [
    { id: 'dashboard',  label: 'Dashboard',    path: '/dashboard/admin',               icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'usuarios',   label: 'Usuarios',     path: '/dashboard/admin/usuarios',      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'noticias',   label: 'Noticias',     path: '/dashboard/admin/noticias',      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { id: 'documentos', label: 'Documentos',   path: '/dashboard/admin/documentos',    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'config',     label: 'Configuración',path: '/dashboard/admin/configuracion', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ],
  docente: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard/docente',        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'perfil',    label: 'Mi Perfil',  path: '/dashboard/docente/perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ],
  estudiante: [
    { id: 'docentes',   label: 'Mis Docentes', path: '/dashboard/estudiante/docentes',   icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'documentos', label: 'Documentos',   path: '/dashboard/estudiante/documentos', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ],
}

const roleLabels: Record<Role, string> = {
  admin:      'Administrador',
  docente:    'Docente',
  estudiante: 'Estudiante',
}

const userInfo: Record<Role, { name: string; initials: string }> = {
  admin:      { name: 'Carlos Mendoza', initials: 'CM' },
  docente:    { name: 'Carlos Mendoza', initials: 'CM' },
  estudiante: { name: 'Juan García',    initials: 'JG' },
}

interface Props {
  role: Role
}

export function Sidebar({ role }: Props) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const items     = menus[role]
  const user      = userInfo[role]

  const isActive = (path: string) => {
    if (path === `/dashboard/${role}`) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="w-60 shrink-0 h-screen bg-blue-900 flex flex-col">

      {/* ── Logo ── */}
      <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 border border-blue-500/50 flex items-center justify-center text-white text-[10px] font-black tracking-tight shrink-0">
          CTI
        </div>
        <div className="min-w-0">
          <p className="text-white text-xs font-bold leading-tight">UNESUM</p>
          <p className="text-blue-400 text-[10px] leading-tight truncate">Tec. de la Información</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-0.5">
        <p className="px-1 text-[10px] font-semibold text-blue-400/50 uppercase tracking-[0.15em] mb-2">
          Navegación
        </p>

        {items.map(item => {
          const active = isActive(item.path)
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 py-2.5 text-sm font-medium transition-all duration-150 outline-none ${
                active
                  ? 'pl-[13px] pr-4 border-l-[3px] border-white bg-white/[0.11] text-white rounded-r-xl'
                  : 'px-4 text-blue-200/65 hover:bg-white/[0.06] hover:text-white rounded-xl'
              }`}
            >
              <svg
                className={`w-[18px] h-[18px] shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-55'}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* ── User card ── */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10">
        <div className="group flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all duration-150 cursor-default">
          <div className="w-8 h-8 rounded-lg bg-blue-700 border border-white/[0.12] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate leading-tight">{user.name}</p>
            <p className="text-blue-400 text-[10px] truncate leading-tight mt-0.5">{roleLabels[role]}</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            title="Cerrar sesión"
            className="shrink-0 p-1.5 rounded-lg text-blue-400/50 hover:text-white hover:bg-white/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

    </aside>
  )
}
