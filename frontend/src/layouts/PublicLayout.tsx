import { Outlet } from 'react-router-dom'
import { Navbar } from '../shared/Navbar'

export function PublicLayout() {
  return (
    <>
      <Navbar />
      <div className="pt-16 sm:pt-[100px] font-sans">
        <Outlet />
      </div>
    </>
  )
}
