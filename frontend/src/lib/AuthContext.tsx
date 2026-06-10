import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import api from './api'

interface Docente {
  id: number
  nombre: string
  titulo: string | null
  area: string | null
  email: string
  telefono: string | null
  bio: string | null
  foto: string | null
  foto_url: string | null
  permite_edicion_estudiantes: boolean
}

interface AuthUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'docente' | 'estudiante'
  docente: Docente | null
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  setUser: (u: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }

    api.get('/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string): Promise<AuthUser> {
    const { data } = await api.post('/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  async function logout() {
    await api.post('/logout').catch(() => {})
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  function handleSetUser(u: AuthUser) {
    setUser(u)
    localStorage.setItem('user', JSON.stringify(u))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
