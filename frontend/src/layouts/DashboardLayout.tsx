import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../shared/Sidebar'

interface Props {
  role: 'admin' | 'docente' | 'estudiante'
}

export function DashboardLayout({ role }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar móvil */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-blue-900 border-b border-white/10 shrink-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-7 h-7 rounded-lg bg-blue-600 border border-blue-500/50 flex items-center justify-center text-white text-[10px] font-black shrink-0">
            CTI
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold leading-tight">UNESUM</p>
            <p className="text-blue-400 text-[9px] leading-tight truncate">Tec. de la Información</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
