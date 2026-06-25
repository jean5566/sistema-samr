import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import api from '../../lib/api'

function Toast({ msg, visible, ok }: { msg: string; visible: boolean; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white text-sm font-bold px-5 py-4 rounded-[1.5rem] shadow-2xl transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
        {ok
          ? <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          : <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        }
      </span>
      {msg}
    </div>
  )
}

const inputCls = 'w-full px-5 py-2.5 rounded-full border border-slate-200 text-sm text-slate-900 bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm'
const labelCls = 'block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide ml-2'

export function EstudiantePerfil() {
  const { user, setUser } = useAuth()

  const [nombre,    setNombre]    = useState(user?.name  ?? '')
  const [correo,    setCorreo]    = useState(user?.email ?? '')
  const [passNueva, setPassNueva] = useState('')
  const [passConf,  setPassConf]  = useState('')
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState({ visible: false, msg: '', ok: true })

  function showToast(msg: string, ok = true) { setToast({ visible: true, msg, ok }) }
  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast(p => ({ ...p, visible: false })), 2800)
      return () => clearTimeout(t)
    }
  }, [toast.visible])

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-y-auto flex flex-col">
      <div className="px-8 py-6 shrink-0">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Mi Perfil</h1>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12">
        <div className="max-w-2xl mx-auto flex flex-col gap-5">

          {/* Avatar */}
          <div className="bg-white rounded-[2rem] border border-slate-100/60 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-3xl font-black shrink-0 shadow-lg shadow-blue-500/30">
              {iniciales || '?'}
            </div>
            <div className="text-center sm:text-left flex-1 mt-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">{user?.email}</p>
              <div className="inline-flex mt-4 items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wide">
                Estudiante
              </div>
            </div>
          </div>

          {/* Formulario */}
          <section className="bg-white rounded-[2rem] border border-slate-100/60 overflow-hidden shadow-sm flex flex-col group/card">
              <div className="px-8 py-6 border-b border-slate-100/80 bg-slate-50/30">
                <h2 className="text-base font-bold text-slate-900">Información personal</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Actualiza tu nombre, correo o contraseña.</p>
              </div>
              <div className="p-8 flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={labelCls}>Nombre completo</label>
                    <input value={nombre} onChange={e => setNombre(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Correo electrónico</label>
                    <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="border-t border-slate-100/80 pt-6 mt-2">
                  <p className="text-sm font-bold text-slate-800 mb-4">
                    Cambiar contraseña <span className="text-slate-400 font-medium">(opcional)</span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="flex justify-end pt-4">
                  <button onClick={guardar} disabled={saving}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold px-8 py-3 rounded-full transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-60 disabled:hover:shadow-none">
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </section>

        </div>
      </div>

      <Toast msg={toast.msg} visible={toast.visible} ok={toast.ok} />
    </div>
  )
}
