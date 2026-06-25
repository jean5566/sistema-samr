import { useEffect, useRef, useState } from 'react'
import api from '../../lib/api'

interface Archivo {
  id: number
  nombre: string
  carpeta_id: number | null
  archivo_nombre: string
  archivo_tamanio: number | null
  created_at: string
}

interface Carpeta {
  id: number
  nombre: string
  parent_id: number | null
  archivos_count: number
}

const extStyle: Record<string, { bg: string; text: string }> = {
  pdf:  { bg: 'bg-red-100',     text: 'text-red-600'     },
  docx: { bg: 'bg-blue-100',    text: 'text-blue-600'    },
  doc:  { bg: 'bg-blue-100',    text: 'text-blue-600'    },
  xlsx: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  xls:  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  jpg:  { bg: 'bg-amber-100',   text: 'text-amber-600'   },
  jpeg: { bg: 'bg-amber-100',   text: 'text-amber-600'   },
  png:  { bg: 'bg-amber-100',   text: 'text-amber-600'   },
}

function getExt(nombre: string) {
  return nombre.split('.').pop()?.toLowerCase() ?? 'archivo'
}

function formatBytes(b: number | null) {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function formatFecha(raw: string) {
  return new Date(raw).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

const inputCls = 'w-full px-5 py-2.5 rounded-full border border-slate-200 text-sm text-slate-900 bg-white hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 shadow-sm'

export function EstudianteMisArchivos() {
  const [ruta, setRuta]               = useState<Carpeta[]>([]) // breadcrumb, vacío = raíz
  const [carpetas, setCarpetas]       = useState<Carpeta[]>([])
  const [archivos, setArchivos]       = useState<Archivo[]>([])
  const [loading, setLoading]         = useState(true)
  const [nombre, setNombre]           = useState('')
  const [file, setFile]               = useState<File | null>(null)
  const [subiendo, setSubiendo]       = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [borrandoId, setBorrandoId]   = useState<number | null>(null)
  const [descargandoId, setDescargandoId] = useState<number | null>(null)
  const [nuevaCarpeta, setNuevaCarpeta]   = useState(false)
  const [nombreCarpeta, setNombreCarpeta] = useState('')
  const [creandoCarpeta, setCreandoCarpeta] = useState(false)
  const [carpetaMenu, setCarpetaMenu] = useState<number | null>(null)
  const [renombrando, setRenombrando] = useState<Carpeta | null>(null)
  const [nombreEdit, setNombreEdit]   = useState('')
  const [moviendo, setMoviendo]       = useState<Archivo | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const carpetaActual = ruta.length ? ruta[ruta.length - 1] : null

  function cargar() {
    setLoading(true)
    const idActual = carpetaActual?.id
    Promise.all([
      api.get<Carpeta[]>('/mis-carpetas', { params: { parent_id: idActual } }),
      api.get<Archivo[]>('/mis-archivos', { params: { carpeta_id: idActual } }),
    ]).then(([c, a]) => {
      setCarpetas(c.data)
      setArchivos(a.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [carpetaActual?.id])

  function handleFile(f: File | null) {
    setFile(f)
    if (f && !nombre.trim()) setNombre(f.name.replace(/\.[^/.]+$/, ''))
  }

  async function subir() {
    if (!file) { setError('Debes seleccionar un archivo.'); return }
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }

    setSubiendo(true); setError(null)
    try {
      const fd = new FormData()
      fd.append('nombre', nombre)
      fd.append('archivo', file)
      if (carpetaActual) fd.append('carpeta_id', String(carpetaActual.id))
      const { data } = await api.post<Archivo>('/mis-archivos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setArchivos(prev => [data, ...prev])
      setNombre('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (e: any) {
      const errs = e?.response?.data?.errors
      setError(errs ? Object.values(errs).flat().join(' ') : (e?.response?.data?.message ?? 'Error al subir el archivo.'))
    } finally {
      setSubiendo(false)
    }
  }

  async function descargar(a: Archivo) {
    setDescargandoId(a.id)
    try {
      const res = await api.get(`/mis-archivos/${a.id}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const link = document.createElement('a')
      link.href = url
      link.download = a.archivo_nombre
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('No se pudo descargar el archivo.')
    } finally {
      setDescargandoId(null)
    }
  }

  async function eliminar(id: number) {
    setBorrandoId(id)
    try {
      await api.delete(`/mis-archivos/${id}`)
      setArchivos(prev => prev.filter(a => a.id !== id))
    } catch {
      setError('No se pudo eliminar el archivo.')
    } finally {
      setBorrandoId(null)
    }
  }

  async function crearCarpeta() {
    if (!nombreCarpeta.trim()) return
    setCreandoCarpeta(true)
    try {
      const { data } = await api.post<Carpeta>('/mis-carpetas', {
        nombre: nombreCarpeta,
        parent_id: carpetaActual?.id ?? null,
      })
      setCarpetas(prev => [...prev, { ...data, archivos_count: 0 }].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      setNombreCarpeta('')
      setNuevaCarpeta(false)
    } catch {
      setError('No se pudo crear la carpeta.')
    } finally {
      setCreandoCarpeta(false)
    }
  }

  async function renombrarCarpeta() {
    if (!renombrando || !nombreEdit.trim()) return
    try {
      const { data } = await api.put<Carpeta>(`/mis-carpetas/${renombrando.id}`, { nombre: nombreEdit })
      setCarpetas(prev => prev.map(c => c.id === data.id ? data : c))
      setRenombrando(null)
    } catch {
      setError('No se pudo renombrar la carpeta.')
    }
  }

  async function eliminarCarpeta(c: Carpeta) {
    if (!confirm(`¿Eliminar la carpeta "${c.nombre}" y todo su contenido?`)) return
    try {
      await api.delete(`/mis-carpetas/${c.id}`)
      setCarpetas(prev => prev.filter(x => x.id !== c.id))
    } catch {
      setError('No se pudo eliminar la carpeta.')
    }
  }

  async function moverArchivo(carpetaId: number | null) {
    if (!moviendo) return
    try {
      await api.put(`/mis-archivos/${moviendo.id}`, { carpeta_id: carpetaId })
      setArchivos(prev => prev.filter(a => a.id !== moviendo.id))
      setMoviendo(null)
    } catch {
      setError('No se pudo mover el archivo.')
    }
  }

  function entrarCarpeta(c: Carpeta) {
    setRuta(prev => [...prev, c])
  }

  function irA(idx: number) {
    setRuta(prev => prev.slice(0, idx + 1))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-y-auto flex flex-col">
      <div className="px-8 py-6 shrink-0">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Mis Archivos</h1>
        <p className="text-sm font-medium text-slate-400 mt-1">Almacenamiento privado, solo tú puedes ver y descargar estos archivos.</p>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-5">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 flex-wrap text-sm font-bold">
            <button onClick={() => setRuta([])} className={`px-2 py-1 rounded-lg transition-colors ${ruta.length === 0 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
              Mis Archivos
            </button>
            {ruta.map((c, i) => (
              <span key={c.id} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                <button onClick={() => irA(i)} className={`px-2 py-1 rounded-lg transition-colors ${i === ruta.length - 1 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}>
                  {c.nombre}
                </button>
              </span>
            ))}
          </div>

          {/* Subir archivo + nueva carpeta */}
          <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide ml-2">Nombre del archivo</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Cédula escaneada"
                  className={inputCls} />
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide ml-2">Archivo</label>
                <input ref={fileRef} type="file" onChange={e => handleFile(e.target.files?.[0] ?? null)}
                  className="block w-full sm:w-56 text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors" />
              </div>
              <button onClick={subir} disabled={subiendo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-60 disabled:shadow-none shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-8-4V4m0 0L8 8m4-4l4 4" />
                </svg>
                {subiendo ? 'Subiendo...' : 'Subir'}
              </button>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              {!nuevaCarpeta ? (
                <button onClick={() => setNuevaCarpeta(true)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V8a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  Nueva carpeta
                </button>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <input value={nombreCarpeta} onChange={e => setNombreCarpeta(e.target.value)}
                    placeholder="Nombre de la carpeta" autoFocus
                    onKeyDown={e => e.key === 'Enter' && crearCarpeta()}
                    className={inputCls} />
                  <button onClick={crearCarpeta} disabled={creandoCarpeta}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all disabled:opacity-60 shrink-0">
                    Crear
                  </button>
                  <button onClick={() => { setNuevaCarpeta(false); setNombreCarpeta('') }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-full transition-all shrink-0">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
          {error && <p className="text-red-600 text-sm font-bold ml-2">{error}</p>}

          {/* Carpetas */}
          {!loading && carpetas.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {carpetas.map(c => (
                <div key={c.id} className="relative bg-white rounded-2xl border border-slate-100/60 p-4 flex items-center gap-3 hover:border-slate-200 hover:shadow-sm transition-all group">
                  <button onClick={() => entrarCarpeta(c)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-slate-800 truncate block">{c.nombre}</span>
                      <span className="text-xs font-medium text-slate-400">{c.archivos_count} archivo{c.archivos_count === 1 ? '' : 's'}</span>
                    </div>
                  </button>
                  <button onClick={() => setCarpetaMenu(carpetaMenu === c.id ? null : c.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
                    </svg>
                  </button>
                  {carpetaMenu === c.id && (
                    <div className="absolute right-3 top-12 z-10 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 w-36">
                      <button onClick={() => { setRenombrando(c); setNombreEdit(c.nombre); setCarpetaMenu(null) }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Renombrar</button>
                      <button onClick={() => { eliminarCarpeta(c); setCarpetaMenu(null) }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Eliminar</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Archivos */}
          <div className="bg-white rounded-[2rem] border border-slate-100/60 overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100/80">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Archivo</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Tamaño</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {loading ? (
                    <tr><td colSpan={4} className="py-16 text-center text-sm font-bold text-slate-400">Cargando archivos...</td></tr>
                  ) : archivos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100/60 shadow-sm">
                          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-slate-500 font-bold">No hay archivos en esta carpeta.</p>
                      </td>
                    </tr>
                  ) : archivos.map(a => {
                    const ext = getExt(a.archivo_nombre)
                    const es  = extStyle[ext] ?? { bg: 'bg-slate-100', text: 'text-slate-600' }
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm border border-white ${es.bg} ${es.text}`}>{ext}</span>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{a.nombre}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500 hidden lg:table-cell">{formatBytes(a.archivo_tamanio)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500 hidden lg:table-cell">{formatFecha(a.created_at)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button onClick={() => setMoviendo(a)}
                              title="Mover a carpeta"
                              className="inline-flex items-center justify-center text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white p-2 rounded-full transition-all shadow-sm border border-amber-100 hover:border-amber-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                              </svg>
                            </button>
                            <button onClick={() => descargar(a)} disabled={descargandoId === a.id}
                              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-full transition-all shadow-sm border border-blue-100 hover:border-blue-600 disabled:opacity-50">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              {descargandoId === a.id ? 'Descargando...' : 'Descargar'}
                            </button>
                            <button onClick={() => eliminar(a.id)} disabled={borrandoId === a.id}
                              className="inline-flex items-center justify-center text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white p-2 rounded-full transition-all shadow-sm border border-red-100 hover:border-red-600 disabled:opacity-50">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {!loading && archivos.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100/80 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{archivos.length} archivo{archivos.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal renombrar carpeta */}
      {renombrando && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setRenombrando(null)}>
          <div className="bg-white rounded-[2rem] shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-4">Renombrar carpeta</h3>
            <input value={nombreEdit} onChange={e => setNombreEdit(e.target.value)} autoFocus
              onKeyDown={e => e.key === 'Enter' && renombrarCarpeta()}
              className={inputCls} />
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setRenombrando(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-full transition-all">Cancelar</button>
              <button onClick={renombrarCarpeta} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal mover archivo */}
      {moviendo && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setMoviendo(null)}>
          <div className="bg-white rounded-[2rem] shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-1">Mover "{moviendo.nombre}"</h3>
            <p className="text-xs font-medium text-slate-400 mb-4">Selecciona el destino</p>
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              <button onClick={() => moverArchivo(null)}
                className="text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Raíz (Mis Archivos)
              </button>
              {carpetas.filter(c => c.id !== moviendo.carpeta_id).map(c => (
                <button key={c.id} onClick={() => moverArchivo(c.id)}
                  className="text-left px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                  {c.nombre}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setMoviendo(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-full transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
