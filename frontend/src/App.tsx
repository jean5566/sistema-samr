import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ScrollToTop } from './shared/ScrollToTop'
import { TopProgress } from './shared/TopProgress'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Registro } from './pages/Registro'
import { SobreCarrera } from './pages/SobreCarrera'
import { DocentesPage } from './pages/Docentes'
import { NoticiasPage } from './pages/Noticias'
import { NoticiaDetallePage } from './pages/NoticiaDetalle'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminUsuarios } from './pages/admin/Usuarios'
import { AdminNoticias } from './pages/admin/Noticias'
import { AdminDocumentos } from './pages/admin/Documentos'
import { AdminConfiguracion } from './pages/admin/Configuracion'
import { DocenteDashboard } from './pages/docente/Dashboard'
import { DocentePerfil } from './pages/docente/Perfil'
import { DocenteConfiguracion } from './pages/docente/Configuracion'
import { EstudianteDashboard } from './pages/estudiante/Dashboard'
import { EstudianteDocentes } from './pages/estudiante/Docentes'
import { EstudianteDocumentos } from './pages/estudiante/Documentos'

function ProtectedRoute({ role, children }: { role: string; children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="/sobre" element={<SobreCarrera />} />
        <Route path="/docentes" element={<DocentesPage />} />
        <Route path="/noticias" element={<NoticiasPage />} />
        <Route path="/noticias/:id" element={<NoticiaDetallePage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>

      <Route path="/dashboard/admin" element={
        <ProtectedRoute role="admin"><DashboardLayout role="admin" /></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="noticias" element={<AdminNoticias />} />
        <Route path="documentos" element={<AdminDocumentos />} />
        <Route path="configuracion" element={<AdminConfiguracion />} />
      </Route>

      <Route path="/dashboard/docente" element={
        <ProtectedRoute role="docente"><DashboardLayout role="docente" /></ProtectedRoute>
      }>
        <Route index element={<DocenteDashboard />} />
        <Route path="perfil" element={<DocentePerfil />} />
        <Route path="configuracion" element={<DocenteConfiguracion />} />
      </Route>

      <Route path="/dashboard/estudiante" element={
        <ProtectedRoute role="estudiante"><DashboardLayout role="estudiante" /></ProtectedRoute>
      }>
        <Route index element={<EstudianteDashboard />} />
        <Route path="docentes" element={<EstudianteDocentes />} />
        <Route path="documentos" element={<EstudianteDocumentos />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <TopProgress />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
