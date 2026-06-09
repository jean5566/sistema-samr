import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import api from '../../lib/api'

function Toast({ msg, visible, ok }: { msg: string; visible: boolean; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
        {ok
          ? <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          : <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        }
      </span>
      {msg}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1.5'

export function EstudiantePerfil() {
  const { user, setUser } = useAuth()

  const [nombre,    setNombre]    = useState(user?.name  ?? '')
  const [correo,    setCorreo]    = useState(user?.email ?? '')
  const [passNueva, setPassNueva] = useState('')
  const [passConf,  setPassConf]  = useState('')
  const [saving,    setSaving]    = useState(false)
  const [editEnabled, setEditEnabled] = useState<boolean | null>(null)
  const [toast,     setToast]     = useState({ visible: false, msg: '', ok: true })

  function showToast(msg: string, ok = true) { setToast({ visible: true, msg, ok }) }
  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast(p => ({ ...p, visible: false })), 2800)
      return () => clearTimeout(t)
    }
  }, [toast.visible])

  useEffect(() => {
    api.get('/configuracion')
      .then(res => setEditEnabled(res.data.estudiantes_editar_perfil === '1'))
      .catch(() => setEditEnabled(false))
  }, [])

  async function guardar() {
    if (passNueva && passNueva !== passConf) {
      showToast('Las contraseñas no coinciden.', false)
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, string> = { name: nombre, email: correo }
      if (passNueva) payload.password = passNueva
      const { data } = await api.put('/estudiante/perfil', payload)
      setUser({ ...user!, name: data.name, email: data.email })
      showToast('Perfil actualizado correctamente')
      setPassNueva(''); setPassConf('')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'No se pudieron guardar los cambios.'
      showToast(msg, false)
    } finally {
      setSaving(false)
    }
  }

  const iniciales = (user?.name ?? '')
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 shrink-0">
        <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Estudiante</p>
        <h1 className="text-base font-semibold text-gray-900 mt-0.5">Mi Perfil</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-xl flex flex-col gap-5">

          {/* Avatar */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {iniciales || '?'}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className="inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Estudiante</span>
            </div>
          </div>

          {/* Loading */}
          {editEnabled === null && (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          )}

          {/* Edición deshabilitada */}
          {editEnabled === false && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.193 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Edición no habilitada</p>
                <p className="text-xs text-amber-600 mt-1 leading-relaxed">Tu docente aún no ha habilitado la edición de perfil. Si necesitas actualizar tus datos, consulta con el área académica.</p>
              </div>
            </div>
          )}

          {/* Formulario */}
          {editEnabled === true && (
            <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Información personal</h2>
                <p className="text-xs text-gray-400 mt-0.5">Actualiza tu nombre, correo o contraseña.</p>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nombre completo</label>
                    <input value={nombre} onChange={e => setNombre(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Correo electrónico</label>
                    <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500 mb-3">
                    Cambiar contraseña <span className="text-gray-400 font-normal">(opcional)</span>
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Nueva contraseña</label>
                      <input type="password" value={passNueva} onChange={e => setPassNueva(e.target.value)}
                        placeholder="••••••••" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Confirmar contraseña</label>
                      <input type="password" value={passConf} onChange={e => setPassConf(e.target.value)}
                        placeholder="••••••••" className={inputCls} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={guardar} disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition disabled:opacity-60">
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>

      <Toast msg={toast.msg} visible={toast.visible} ok={toast.ok} />
    </>
  )
}
