export function RolBadge({ rol }: { rol: string }) {
  if (rol === 'docente')
    return <span className="inline-flex items-center bg-violet-50 text-violet-700 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide">Docente</span>
  if (rol === 'admin')
    return <span className="inline-flex items-center bg-rose-50 text-rose-700 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide">Admin</span>
  return <span className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide">Estudiante</span>
}

export function EstadoBadge({ estado }: { estado: string }) {
  if (estado === 'pendiente')
    return (
      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Pendiente
      </span>
    )
  if (estado === 'rechazado')
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        Rechazado
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
      Activo
    </span>
  )
}
