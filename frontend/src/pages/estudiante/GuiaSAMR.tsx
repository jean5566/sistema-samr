export function EstudianteGuiaSAMR() {
  const niveles = [
    {
      letra: 'S',
      nombre: 'Sustitución',
      ingles: 'Substitution',
      headerBg: 'bg-rose-50',
      headerBorder: 'border-rose-100',
      circleBg: 'bg-rose-200',
      circleText: 'text-rose-700',
      colorLight: 'bg-rose-50',
      colorBorder: 'border-rose-100',
      colorText: 'text-rose-600',
      colorBadge: 'bg-rose-100 text-rose-600',
      dotBg: 'bg-rose-300',
      barColor: 'bg-rose-300',
      descripcion:
        'La tecnología reemplaza a una herramienta o proceso tradicional sin ningún cambio funcional. Es el nivel más básico: se hace lo mismo de siempre, pero usando un dispositivo digital.',
      ejemplo: 'Escribir un apunte en un documento Word en lugar de un cuaderno físico.',
      enEstaWeb: [
        'Leer documentos académicos en formato PDF en lugar de impresiones físicas.',
        'Ver la información de contacto de docentes en pantalla en vez de en un directorio impreso.',
      ],
      icono: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4',
    },
    {
      letra: 'A',
      nombre: 'Aumento',
      ingles: 'Augmentation',
      headerBg: 'bg-amber-50',
      headerBorder: 'border-amber-100',
      circleBg: 'bg-amber-200',
      circleText: 'text-amber-700',
      colorLight: 'bg-amber-50',
      colorBorder: 'border-amber-100',
      colorText: 'text-amber-600',
      colorBadge: 'bg-amber-100 text-amber-600',
      dotBg: 'bg-amber-300',
      barColor: 'bg-amber-300',
      descripcion:
        'La tecnología sigue sustituyendo la herramienta tradicional, pero ahora añade una mejora funcional que antes no era posible. El proceso gana en velocidad, comodidad o precisión.',
      ejemplo: 'Un documento Word con corrector ortográfico automático mejora la escritura a mano.',
      enEstaWeb: [
        'Buscar y filtrar docentes por nombre en tiempo real, algo imposible con un directorio físico.',
        'Descargar documentos académicos desde cualquier lugar y en cualquier momento.',
        'Ver el historial de tus archivos subidos sin necesidad de revisarlos uno a uno físicamente.',
      ],
      icono: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    },
    {
      letra: 'M',
      nombre: 'Modificación',
      ingles: 'Modification',
      headerBg: 'bg-blue-50',
      headerBorder: 'border-blue-100',
      circleBg: 'bg-blue-200',
      circleText: 'text-blue-700',
      colorLight: 'bg-blue-50',
      colorBorder: 'border-blue-100',
      colorText: 'text-blue-600',
      colorBadge: 'bg-blue-100 text-blue-600',
      dotBg: 'bg-blue-300',
      barColor: 'bg-blue-300',
      descripcion:
        'La tecnología permite rediseñar de forma significativa la tarea. Ya no solo se hace lo mismo más rápido, sino que la forma de trabajar cambia y se vuelve más rica e interactiva.',
      ejemplo: 'Colaborar en un documento compartido en línea donde varios estudiantes editan a la vez.',
      enEstaWeb: [
        'El administrador publica noticias y todos los estudiantes las ven al instante, sin esperar boletines impresos.',
        'Los estudiantes pueden subir sus propios archivos al sistema y gestionarlos desde su perfil personal.',
        'El sistema centraliza la gestión de usuarios, noticias y documentos en un solo panel, transformando la administración académica.',
      ],
      icono: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    },
    {
      letra: 'R',
      nombre: 'Redefinición',
      ingles: 'Redefinition',
      headerBg: 'bg-teal-50',
      headerBorder: 'border-teal-100',
      circleBg: 'bg-teal-200',
      circleText: 'text-teal-700',
      colorLight: 'bg-teal-50',
      colorBorder: 'border-teal-100',
      colorText: 'text-teal-600',
      colorBadge: 'bg-teal-100 text-teal-600',
      dotBg: 'bg-teal-300',
      barColor: 'bg-teal-300',
      descripcion:
        'La tecnología hace posible crear tareas completamente nuevas que antes eran impensables. Es el nivel más alto de integración tecnológica: se transforman los procesos educativos de raíz.',
      ejemplo: 'Realizar una clase virtual en vivo con estudiantes de distintos países simultáneamente.',
      enEstaWeb: [
        'Los estudiantes acceden a un espacio académico digital personalizado con su propio perfil, archivos y datos en tiempo real.',
        'Los docentes tienen un panel propio donde gestionan su información pública visible para todos los estudiantes.',
        'La plataforma conecta en un único entorno a administradores, docentes y estudiantes, algo imposible con procesos manuales.',
      ],
      icono: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    },
  ]

  return (
    <div className="min-h-screen text-slate-900 font-sans overflow-y-auto flex flex-col">

      {/* Topbar */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 shrink-0">
        <h1 className="text-lg sm:text-[28px] font-bold text-slate-900 tracking-tight">Guía del Modelo SAMR</h1>
        <p className="text-slate-500 text-sm mt-1">Entiende cómo esta plataforma integra tecnología en tu educación</p>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12 w-full max-w-5xl mx-auto space-y-8">

        {/* ¿Qué es SAMR? */}
        <div className="bg-blue-50 border border-blue-100 rounded-[2rem] px-5 py-5 sm:px-8 sm:py-8 shadow-sm">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Modelo pedagógico</p>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-blue-900 mb-2 sm:mb-3">¿Qué es el Modelo SAMR?</h2>
              <p className="text-blue-700 text-sm leading-relaxed">
                El modelo <span className="text-blue-900 font-bold">SAMR</span> fue creado por el Dr. Ruben Puentedura y describe
                cuatro niveles de integración de la tecnología digital en los procesos educativos.
                Sus siglas corresponden a <span className="text-blue-900 font-bold">Sustitución, Aumento, Modificación y Redefinición</span>.
                Cada nivel representa una forma más profunda de usar la tecnología para mejorar el aprendizaje.
              </p>
              <p className="text-blue-700 text-sm leading-relaxed mt-3">
                Los dos primeros niveles (<span className="text-blue-900 font-semibold">S y A</span>) se enfocan en
                <span className="text-blue-900 font-semibold"> mejorar</span> lo que ya existe.
                Los dos últimos (<span className="text-blue-900 font-semibold">M y R</span>) buscan
                <span className="text-blue-900 font-semibold"> transformar</span> por completo la forma de aprender y enseñar.
              </p>
            </div>
          </div>
        </div>

        {/* Barra de niveles */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 sm:p-8">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Los 4 niveles del modelo</h3>
          <p className="text-slate-500 text-xs sm:text-sm mb-4 sm:mb-6">De la simple sustitución a la transformación total del aprendizaje</p>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {niveles.map((n) => (
              <div
                key={n.letra}
                className={`flex-1 ${n.colorLight} ${n.colorBorder} border rounded-2xl p-4 flex flex-col items-center text-center`}
              >
                <div className={`w-10 h-10 rounded-xl ${n.circleBg} flex items-center justify-center ${n.circleText} font-black text-lg mb-3`}>
                  {n.letra}
                </div>
                <p className={`text-xs font-bold uppercase tracking-wide ${n.colorText}`}>{n.nombre}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{n.ingles}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between px-2">
            <span className="text-xs text-slate-400 font-semibold">Mejora →</span>
            <span className="text-xs text-slate-400 font-semibold">→ Transformación</span>
          </div>
          <div className="mt-1 h-1 rounded-full bg-gradient-to-r from-rose-200 via-amber-200 via-blue-200 to-teal-200" />
        </div>

        {/* Cada nivel en detalle */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-slate-900 px-1">Cada nivel en detalle</h3>

          {niveles.map((n, i) => (
            <div key={n.letra} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              {/* Header del nivel */}
              <div className={`${n.headerBg} ${n.headerBorder} border-b px-5 py-4 sm:px-8 sm:py-5 flex items-center gap-3 sm:gap-4`}>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${n.circleBg} flex items-center justify-center ${n.circleText} font-black text-xl sm:text-2xl shrink-0`}>
                  {n.letra}
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Nivel {i + 1}</p>
                  <h4 className={`${n.circleText} text-xl font-black tracking-tight`}>{n.nombre}</h4>
                  <p className="text-slate-400 text-xs">{n.ingles}</p>
                </div>
                <div className="ml-auto">
                  <svg className={`w-8 h-8 ${n.colorText} opacity-30`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={n.icono} />
                  </svg>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="px-8 py-6 space-y-5">
                {/* Descripción */}
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">¿En qué consiste?</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{n.descripcion}</p>
                </div>

                {/* Ejemplo general */}
                <div className={`${n.colorLight} ${n.colorBorder} border rounded-xl px-4 py-3 flex items-start gap-3`}>
                  <svg className={`w-4 h-4 mt-0.5 ${n.colorText} shrink-0`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <p className={`text-xs font-bold ${n.colorText} mb-0.5`}>Ejemplo general</p>
                    <p className="text-xs text-slate-600">{n.ejemplo}</p>
                  </div>
                </div>

                {/* Uso en esta web */}
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 ${n.colorBadge} text-xs font-bold px-2 py-0.5 rounded-full`}>
                      Esta plataforma
                    </span>
                    ¿Cómo aplica este nivel aquí?
                  </p>
                  <ul className="space-y-2">
                    {n.enEstaWeb.map((punto, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full ${n.dotBg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{punto}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ¿Por qué usamos SAMR? */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">¿Por qué esta plataforma usa el modelo SAMR?</h3>
              <p className="text-slate-500 text-sm">La razón detrás de cada decisión tecnológica en este sistema</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              El <span className="font-semibold text-slate-800">Sistema SAMR</span> de la carrera de Tecnologías de la
              Información de la <span className="font-semibold text-slate-800">UNESUM</span> fue diseñado tomando como
              referencia el modelo pedagógico SAMR para asegurar que la tecnología no se usa solo por usarla, sino para
              generar un impacto real en el proceso educativo.
            </p>
            <p>
              En lugar de simplemente digitalizar papeles, esta plataforma busca llegar a los niveles de
              <span className="font-semibold text-blue-600"> Modificación</span> y
              <span className="font-semibold text-teal-600"> Redefinición</span>: conectar estudiantes, docentes y
              administración en un único entorno digital que antes no existía, hacer que la información fluya sin
              barreras físicas y dar a cada usuario herramientas personalizadas según su rol.
            </p>
            <p>
              Como estudiante, esto significa que puedes acceder a tus documentos académicos, conocer a tus docentes,
              subir tus trabajos y gestionar tu perfil desde cualquier dispositivo con internet, en cualquier
              momento. Eso es tecnología al servicio de tu aprendizaje.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Acceso universal', desc: 'Desde cualquier dispositivo y lugar', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9', bg: 'bg-slate-50', icon_color: 'text-slate-500' },
              { label: 'Información en tiempo real', desc: 'Datos actualizados al instante', icon: 'M13 10V3L4 14h7v7l9-11h-7z', bg: 'bg-slate-50', icon_color: 'text-slate-500' },
              { label: 'Roles diferenciados', desc: 'Cada usuario tiene su espacio propio', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', bg: 'bg-slate-50', icon_color: 'text-slate-500' },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} border border-slate-100 rounded-2xl p-4 flex flex-col items-start gap-2`}>
                <svg className={`w-5 h-5 ${item.icon_color}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <p className="text-sm font-bold text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
