import { useEffect, useState, useCallback } from 'react'
import api from '../../lib/api'

interface Pregunta {
  id: number
  enunciado: string
  opciones: string[]
  nivel: 'S' | 'A' | 'M' | 'R'
}

interface Resultado {
  puntaje: number
  total: number
  resultado: Record<string, { correcta: number; respondida: number | null; acertada: boolean }>
}

const nivelColors: Record<string, string> = {
  S: 'bg-rose-100 text-rose-700',
  A: 'bg-amber-100 text-amber-700',
  M: 'bg-blue-100 text-blue-700',
  R: 'bg-teal-100 text-teal-700',
}

const nivelNombres: Record<string, string> = {
  S: 'Sustitución',
  A: 'Aumento',
  M: 'Modificación',
  R: 'Redefinición',
}

const TOTAL_PREGUNTAS = 5

function mezclar<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function EstudianteEvaluacionSAMR() {
  const [pool, setPool]             = useState<Pregunta[]>([])
  const [mostradas, setMostradas]   = useState<Pregunta[]>([])
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})
  const [sugerencias, setSugerencias] = useState<Record<number, { texto: string; motivo: string; abierta: boolean; enviada: boolean }>>({})
  const [cargando, setCargando]     = useState(true)
  const [enviando, setEnviando]     = useState(false)
  const [resultado, setResultado]   = useState<Resultado | null>(null)
  const [preguntasConDetalle, setPreguntasConDetalle] = useState<Pregunta[]>([])

  useEffect(() => {
    api.get('/samr/preguntas').then(res => {
      const mezcladas = mezclar<Pregunta>(res.data)
      setPool(mezcladas)
      setMostradas(mezcladas.slice(0, TOTAL_PREGUNTAS))
    }).finally(() => setCargando(false))
  }, [])

  const disponibles = useCallback(() => {
    const mostradosIds = new Set(mostradas.map(p => p.id))
    return pool.filter(p => !mostradosIds.has(p.id))
  }, [pool, mostradas])

  function cambiarPregunta(index: number) {
    const libres = disponibles()
    if (libres.length === 0) return

    const nueva = libres[Math.floor(Math.random() * libres.length)]
    const anterior = mostradas[index]

    setMostradas(prev => {
      const copia = [...prev]
      copia[index] = nueva
      return copia
    })

    setRespuestas(prev => {
      const copia = { ...prev }
      delete copia[anterior.id]
      return copia
    })

    setSugerencias(prev => {
      const copia = { ...prev }
      delete copia[anterior.id]
      return copia
    })
  }

  function seleccionarRespuesta(preguntaId: number, opcionIndex: number) {
    setRespuestas(prev => ({ ...prev, [preguntaId]: opcionIndex }))
  }

  function toggleSugerencia(preguntaId: number) {
    setSugerencias(prev => ({
      ...prev,
      [preguntaId]: {
        texto: prev[preguntaId]?.texto ?? '',
        motivo: prev[preguntaId]?.motivo ?? '',
        abierta: !prev[preguntaId]?.abierta,
        enviada: prev[preguntaId]?.enviada ?? false,
      }
    }))
  }

  function actualizarSugerencia(preguntaId: number, campo: 'texto' | 'motivo', valor: string) {
    setSugerencias(prev => ({
      ...prev,
      [preguntaId]: { ...prev[preguntaId], [campo]: valor }
    }))
  }

  async function enviarSugerencia(preguntaId: number) {
    const sug = sugerencias[preguntaId]
    if (!sug?.texto.trim()) return
    try {
      await api.post('/samr/sugerencias', {
        pregunta_id: preguntaId,
        sugerencia: sug.texto,
        motivo: sug.motivo || null,
      })
      setSugerencias(prev => ({
        ...prev,
        [preguntaId]: { ...prev[preguntaId], enviada: true, abierta: false }
      }))
    } catch {
      // silencioso
    }
  }

  async function enviarEvaluacion() {
    if (mostradas.some(p => respuestas[p.id] === undefined)) return
    setEnviando(true)
    try {
      const res = await api.post('/samr/evaluaciones', {
        preguntas_ids: mostradas.map(p => p.id),
        respuestas: Object.fromEntries(
          Object.entries(respuestas).map(([k, v]) => [k, v])
        ),
      })
      setPreguntasConDetalle([...mostradas])
      setResultado(res.data)
    } catch {
      // silencioso
    } finally {
      setEnviando(false)
    }
  }

  function reiniciar() {
    const mezcladas = mezclar<Pregunta>(pool)
    setMostradas(mezcladas.slice(0, TOTAL_PREGUNTAS))
    setRespuestas({})
    setSugerencias({})
    setResultado(null)
    setPreguntasConDetalle([])
  }

  const respondidas = mostradas.filter(p => respuestas[p.id] !== undefined).length
  const todasRespondidas = respondidas === mostradas.length

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen text-slate-900 font-sans overflow-y-auto flex flex-col">

      {/* Topbar */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 shrink-0">
        <h1 className="text-lg sm:text-[28px] font-bold text-slate-900 tracking-tight">Evaluación SAMR</h1>
        <p className="text-slate-500 text-sm mt-1">
          Responde las preguntas sobre el modelo SAMR. Puedes cambiar o mejorar cualquier pregunta.
        </p>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12 w-full max-w-3xl mx-auto space-y-6">

        {/* Resultado */}
        {resultado && (
          <div className={`rounded-[2rem] p-8 border ${resultado.puntaje >= resultado.total * 0.6 ? 'bg-teal-50 border-teal-100' : 'bg-rose-50 border-rose-100'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${resultado.puntaje >= resultado.total * 0.6 ? 'bg-teal-200 text-teal-700' : 'bg-rose-200 text-rose-700'}`}>
                {resultado.puntaje}/{resultado.total}
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">
                  {resultado.puntaje >= resultado.total * 0.8
                    ? '¡Excelente resultado!'
                    : resultado.puntaje >= resultado.total * 0.6
                    ? 'Buen trabajo'
                    : 'Sigue repasando'}
                </p>
                <p className="text-sm text-slate-500">
                  Acertaste {resultado.puntaje} de {resultado.total} preguntas
                  &nbsp;({Math.round((resultado.puntaje / resultado.total) * 100)}%)
                </p>
              </div>
            </div>

            {/* Detalle de respuestas */}
            <div className="space-y-3">
              {preguntasConDetalle.map(p => {
                const det = resultado.resultado[p.id]
                if (!det) return null
                return (
                  <div key={p.id} className={`rounded-2xl border px-4 py-3 ${det.acertada ? 'bg-teal-50 border-teal-100' : 'bg-rose-50 border-rose-100'}`}>
                    <p className="text-sm font-semibold text-slate-800 mb-1">{p.enunciado}</p>
                    {det.acertada ? (
                      <p className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Correcto: {p.opciones[det.correcta]}
                      </p>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Tu respuesta: {det.respondida !== null ? p.opciones[det.respondida] : 'Sin responder'}
                        </p>
                        <p className="text-xs text-teal-600 font-semibold">
                          Respuesta correcta: {p.opciones[det.correcta]}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={reiniciar}
              className="mt-6 w-full py-3 bg-slate-800 text-white text-sm font-bold rounded-2xl hover:bg-slate-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Preguntas */}
        {!resultado && (
          <>
            {/* Progreso */}
            <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1.5">
                  <span>Progreso</span>
                  <span>{respondidas}/{mostradas.length} respondidas</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-300 rounded-full transition-all duration-300"
                    style={{ width: `${(respondidas / mostradas.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cards de preguntas */}
            {mostradas.map((pregunta, index) => {
              const sug = sugerencias[pregunta.id]
              const seleccionada = respuestas[pregunta.id]
              const puedesCambiar = disponibles().length > 0

              return (
                <div key={pregunta.id} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">

                  {/* Header */}
                  <div className="px-6 pt-5 pb-4 border-b border-slate-50 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600 shrink-0">
                        {index + 1}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${nivelColors[pregunta.nivel]}`}>
                        {nivelNombres[pregunta.nivel]}
                      </span>
                    </div>
                    <button
                      onClick={() => cambiarPregunta(index)}
                      disabled={!puedesCambiar}
                      title={puedesCambiar ? 'Cambiar esta pregunta por otra' : 'No hay más preguntas disponibles'}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Cambiar pregunta
                    </button>
                  </div>

                  {/* Enunciado y opciones */}
                  <div className="px-6 py-5">
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed mb-4">{pregunta.enunciado}</p>
                    <div className="space-y-2">
                      {pregunta.opciones.map((opcion, oi) => {
                        const activa = seleccionada === oi
                        return (
                          <button
                            key={oi}
                            onClick={() => seleccionarRespuesta(pregunta.id, oi)}
                            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 ${
                              activa
                                ? 'bg-blue-50 border-blue-200 text-blue-800'
                                : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              activa ? 'border-blue-400 bg-blue-400' : 'border-slate-300'
                            }`}>
                              {activa && (
                                <span className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </span>
                            {opcion}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Sugerir mejora */}
                  <div className="px-6 pb-5">
                    {!sug?.enviada ? (
                      <>
                        <button
                          onClick={() => toggleSugerencia(pregunta.id)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          {sug?.abierta ? 'Cancelar sugerencia' : '¿Mejorarías esta pregunta?'}
                        </button>

                        {sug?.abierta && (
                          <div className="mt-3 space-y-2">
                            <textarea
                              value={sug.texto}
                              onChange={e => actualizarSugerencia(pregunta.id, 'texto', e.target.value)}
                              placeholder="Escribe cómo mejorarías la pregunta o sus opciones..."
                              rows={3}
                              className="w-full text-sm text-slate-700 placeholder-slate-300 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-blue-300 focus:bg-white transition-colors"
                            />
                            <textarea
                              value={sug.motivo}
                              onChange={e => actualizarSugerencia(pregunta.id, 'motivo', e.target.value)}
                              placeholder="¿Por qué la mejorarías así? (opcional)"
                              rows={2}
                              className="w-full text-sm text-slate-700 placeholder-slate-300 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-blue-300 focus:bg-white transition-colors"
                            />
                            <button
                              onClick={() => enviarSugerencia(pregunta.id)}
                              disabled={!sug.texto.trim()}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              Enviar sugerencia
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Sugerencia enviada, gracias por tu aporte
                      </p>
                    )}
                  </div>

                </div>
              )
            })}

            {/* Enviar */}
            <button
              onClick={enviarEvaluacion}
              disabled={!todasRespondidas || enviando}
              className="w-full py-4 bg-slate-800 text-white text-sm font-bold rounded-2xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {enviando
                ? 'Enviando...'
                : todasRespondidas
                ? 'Enviar evaluación'
                : `Responde ${mostradas.length - respondidas} pregunta${mostradas.length - respondidas !== 1 ? 's' : ''} más para continuar`}
            </button>
          </>
        )}

      </div>
    </div>
  )
}
