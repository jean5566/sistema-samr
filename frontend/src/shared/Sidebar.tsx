import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

type Role = 'admin' | 'docente' | 'estudiante'

interface MenuItem {
  label: string
  icon: string
  id: string
  path: string
}

const menus: Record<Role, MenuItem[]> = {
  admin: [
    { id: 'dashboard',  label: 'Dashboard',     path: '/dashboard/admin',               icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'usuarios',   label: 'Usuarios',      path: '/dashboard/admin/usuarios',      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'noticias',   label: 'Noticias',      path: '/dashboard/admin/noticias',      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
    { id: 'documentos', label: 'Documentos',    path: '/dashboard/admin/documentos',    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'config',     label: 'Configuración', path: '/dashboard/admin/configuracion', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ],
  docente: [
    { id: 'dashboard',     label: 'Dashboard',      path: '/dashboard/docente',               icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'perfil',        label: 'Mi Perfil',       path: '/dashboard/docente/perfil',        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'configuracion', label: 'Configuración',   path: '/dashboard/docente/configuracion', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ],
  estudiante: [
    { id: 'dashboard',       label: 'Dashboard',       path: '/dashboard/estudiante',                icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'docentes',        label: 'Mis Docentes',    path: '/dashboard/estudiante/docentes',       icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'documentos',      label: 'Documentos',      path: '/dashboard/estudiante/documentos',     icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'mis-archivos',    label: 'Mis Archivos',    path: '/dashboard/estudiante/mis-archivos',   icon: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z' },
    { id: 'perfil',          label: 'Mi Perfil',       path: '/dashboard/estudiante/perfil',         icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'guia-samr',       label: 'Guía SAMR',       path: '/dashboard/estudiante/guia-samr',      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'evaluacion-samr', label: 'Evaluación SAMR', path: '/dashboard/estudiante/evaluacion-samr', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  ],
}

const roleLabels: Record<Role, string> = {
  admin:      'Administrador',
  docente:    'Docente',
  estudiante: 'Estudiante',
}

interface Props {
  role: Role
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ role, isOpen, onClose }: Props) {
  const navigate      = useNavigate()
  const location      = useLocation()
  const { user, logout } = useAuth()
  const items         = menus[role]

  const displayName = role === 'docente'
    ? (user?.docente?.nombre ?? user?.name ?? '')
    : (user?.name ?? '')

  const initials = displayName
    .split(' ')
    .filter((w: string) => w.length > 2)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('')

  const fotoUrl = role === 'docente' ? (user?.docente?.foto_url ?? null) : null

  const isActive = (path: string) => {
    if (path === `/dashboard/${role}`) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function handleNav(path: string) {
    navigate(path)
    onClose()
  }

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-60 shrink-0 h-screen bg-blue-900 flex flex-col
      transition-transform duration-200 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:relative lg:translate-x-0 lg:z-auto
    `}>

      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 border border-blue-500/50 flex items-center justify-center text-white text-[10px] font-black tracking-tight shrink-0">
          CTI
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-xs font-bold leading-tight">UNESUM</p>
          <p className="text-blue-400 text-[10px] leading-tight truncate">Tec. de la Información</p>
        </div>
        {/* Cerrar en móvil */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-0.5">
        <p className="px-1 text-[10px] font-semibold text-blue-400/50 uppercase tracking-[0.15em] mb-2">
          Navegación
        </p>

        {items.map(item => {
          const active = isActive(item.path)
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.path)}
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

      {/* User card */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-blue-700 border border-white/[0.12] overflow-hidden flex items-center justify-center text-white text-xs font-bold shrink-0">
            {fotoUrl
              ? <img src={fotoUrl} alt={displayName} className="w-full h-full object-cover" />
              : initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{displayName}</p>
            <p className="text-blue-400 text-[10px] truncate leading-tight mt-0.5">{roleLabels[role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-blue-300 hover:text-white hover:bg-white/10 transition-all duration-150 text-xs font-semibold border border-white/10 hover:border-white/20"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>

    </aside>
  )
}
