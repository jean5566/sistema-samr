import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import api from '../../lib/api'

interface DocenteData {
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
const textareaCls = 'w-full px-5 py-3.5 rounded-[1.5rem] border border-slate-200 text-sm text-slate-900 bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm resize-none'
const labelCls = 'block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide ml-2'

const STORAGE_URL = 'http://127.0.0.1:8000/storage/'

function comprimirImagen(file: File, maxPx = 250, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas vacío')), 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function DocentePerfil() {
  const { user, setUser } = useAuth()

  const [docente,  setDocente]  = useState<DocenteData | null>(null)
  const [nombre,   setNombre]   = useState('')
  const [correo,   setCorreo]   = useState('')
  const [telefono, setTelefono] = useState('')
  const [titulo,   setTitulo]   = useState('')
  const [area,     setArea]     = useState('')
  const [bio,      setBio]      = useState('')
  const [foto,     setFoto]     = useState<string | null>(null)
  const [fetching, setFetching] = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState({ visible: false, msg: '', ok: true })

  const fileInputRef = useRef<HTMLInputElement>(null)

  function showToast(msg: string, ok = true) { setToast({ visible: true, msg, ok }) }
  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast(p => ({ ...p, visible: false })), 2800)
      return () => clearTimeout(t)
    }
  }, [toast.visible])

  // Siempre carga datos frescos del servidor al montar
  useEffect(() => {
    api.get('/me').then(({ data }) => {
      const d: DocenteData | null = data.docente
      setDocente(d)
      if (d) {
        setNombre(d.nombre)
        setCorreo(d.email)
        setTelefono(d.telefono ?? '')
        setTitulo(d.titulo ?? '')
        setArea(d.area ?? '')
        setBio(d.bio ?? '')
        setFoto(d.foto_url ?? null)
      }
      setUser(data)
    }).catch(() => {}).finally(() => setFetching(false))
  }, [])

  async function guardar() {
    if (!docente) return
    setSaving(true)
    try {
      const { data } = await api.put(`/docentes/${docente.id}`, {
        nombre, email: correo, telefono, titulo, area, bio,
      })
      setDocente(data)
      setUser({ ...user!, docente: data })
      showToast('Perfil actualizado correctamente')
    } catch {
      showToast('No se pudieron guardar los cambios.', false)
    } finally {
      setSaving(false)
    }
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !docente) return
    setFoto(URL.createObjectURL(file))
    try {
      const blob = await comprimirImagen(file)
      const form = new FormData()
      form.append('foto', blob, 'foto.jpg')
      const { data } = await api.post(`/docentes/${docente.id}/foto`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setFoto(data.foto_url)
      const updated = { ...docente, foto: data.foto, foto_url: data.foto_url }
      setDocente(updated)
      setUser({ ...user!, docente: updated })
      showToast('Foto actualizada correctamente')
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.foto?.[0]
        ?? err?.response?.data?.message
        ?? 'No se pudo subir la foto.'
      showToast(msg, false)
    }
  }

  const iniciales = nombre
    .split(' ')
    .filter(w => /^[A-ZÁÉÍÓÚÑ]/i.test(w) && w.length > 2)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-y-auto flex flex-col">
      <div className="px-8 py-6 shrink-0">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Mi Perfil</h1>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12">
        {fetching && (
          <div className="flex items-center gap-3 text-sm font-bold text-slate-500 py-12 justify-center">
            <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Cargando perfil...
          </div>
        )}
        {!fetching && !docente && (
          <div className="py-12 flex flex-col items-center text-center">
            <p className="text-lg font-bold text-slate-500">No se encontró el perfil de docente.</p>
          </div>
        )}
        <div className="max-w-4xl mx-auto flex flex-col gap-5" style={{ display: fetching || !docente ? 'none' : undefined }}>

          {/* Avatar + nombre */}
          <div className="bg-white rounded-[2rem] border border-slate-100/60 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-sm">
            <div className="relative shrink-0 group">
              <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-4xl font-black overflow-hidden shadow-lg shadow-blue-500/30">
                {foto
                  ? <img src={foto} alt="Foto de perfil" className="w-full h-full object-cover" />
                  : iniciales}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-[2rem] bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
                title="Cambiar foto"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{nombre}</h2>
              <p className="text-lg font-medium text-slate-500 mt-1">{titulo}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wide">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {area}
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-4 uppercase tracking-wider">Haz clic en la foto para cambiarla</p>
            </div>
          </div>

          {/* Datos personales */}
          <section className="bg-white rounded-[2rem] border border-slate-100/60 overflow-hidden shadow-sm flex flex-col group/card">
            <div className="px-8 py-6 border-b border-slate-100/80 bg-slate-50/30">
              <h2 className="text-base font-bold text-slate-900">Información personal</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Completa los datos de tu perfil público.</p>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Nombre completo</label>
                  <input value={nombre} onChange={e => setNombre(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Correo institucional</label>
                  <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input value={telefono} onChange={e => setTelefono(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Área de especialidad</label>
                  <input value={area} onChange={e => setArea(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Título académico</label>
                <input value={titulo} onChange={e => setTitulo(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Biografía</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className={textareaCls} />
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100/80 mt-2">
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
