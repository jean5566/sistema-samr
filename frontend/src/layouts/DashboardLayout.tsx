import { Outlet } from 'react-router-dom'
import { Sidebar } from '../shared/Sidebar'

interface Props {
  role: 'admin' | 'docente' | 'estudiante'
}

export function DashboardLayout({ role }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
