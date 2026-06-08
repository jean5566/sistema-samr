import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import api from '../../lib/api'

const STORAGE_URL = 'http://127.0.0.1:8000/storage/'

function comprimirImagen(file: File, maxPx = 800, quality = 0.82): Promise<Blob> {
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
  const docente = user?.docente

  const [nombre,   setNombre]   = useState('')
  const [correo,   setCorreo]   = useState('')
  const [telefono, setTelefono] = useState('')
  const [titulo,   setTitulo]   = useState('')
  const [area,     setArea]     = useState('')
  const [bio,      setBio]      = useState('')
  const [foto,     setFoto]     = useState<string | null>(null)
  const [saved,    setSaved]    = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!docente) return
    setNombre(docente.nombre)
    setCorreo(docente.email)
    setTelefono(docente.telefono ?? '')
    setTitulo(docente.titulo)
    setArea(docente.area)
    setBio(docente.bio ?? '')
    setFoto(docente.foto_url ?? null)
  }, [docente])

  async function guardar() {
    if (!docente) return
    setSaving(true)
    setError('')
    try {
      const { data } = await api.put(`/docentes/${docente.id}`, {
        nombre,
        email:    correo,
        telefono,
        titulo,
        area,
        bio,
      })
      setUser({ ...user!, docente: data })
      setSaved(true)
      setTimeout(() => setSaved(false), 2600)
    } catch {
      setError('No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !docente) return
    setFoto(URL.createObjectURL(file))
    setError('')
    try {
      const blob = await comprimirImagen(file)
      const form = new FormData()
      form.append('foto', blob, 'foto.jpg')
      const { data } = await api.post(`/docentes/${docente.id}/foto`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setFoto(data.foto_url)
      setUser({ ...user!, docente: { ...docente, foto: data.foto, foto_url: data.foto_url } })
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.foto?.[0]
        ?? err?.response?.data?.message
        ?? 'No se pudo subir la foto.'
      setError(msg)
    }
  }

  const iniciales = nombre
    .split(' ')
    .filter(w => /^[A-ZÁÉÍÓÚÑ]/i.test(w) && w.length > 2)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Docente</p>
          <h1 className="text-base font-semibold text-gray-900 mt-0.5">Mi Perfil</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl flex flex-col gap-5">

          {/* Avatar + nombre */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-5">
            <div className="relative shrink-0 group">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {foto
                  ? <img src={foto} alt="Foto de perfil" className="w-full h-full object-cover" />
                  : iniciales}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                title="Cambiar foto"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
            <div>
              <h2 className="text-lg font-bold text-gray-900">{nombre}</h2>
              <p className="text-sm text-gray-400">{titulo}</p>
              <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{area}</span>
              <p className="text-[11px] text-gray-400 mt-2">Haz clic en la foto para cambiarla</p>
            </div>
          </div>

          {/* Datos personales */}
          <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Información personal</h2>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre completo</label>
                  <input value={nombre} onChange={e => setNombre(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Correo institucional</label>
                  <input type="email" value={correo} onChange={e => setCorreo(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Teléfono</label>
                  <input value={telefono} onChange={e => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Área de especialidad</label>
                  <input value={area} onChange={e => setArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Título académico</label>
                <input value={titulo} onChange={e => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Biografía</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none" />
              </div>
              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">{error}</p>
              )}
              <div className="flex items-center justify-between">
                {saved && (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Cambios guardados
                  </span>
                )}
                <div className="ml-auto">
                  <button onClick={guardar} disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition disabled:opacity-60">
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
