import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.15 })

export function TopProgress() {
  const { pathname } = useLocation()

  useEffect(() => {
    NProgress.start()
    const t = setTimeout(() => NProgress.done(), 350)
    return () => { clearTimeout(t); NProgress.done() }
  }, [pathname])

  return null
}
