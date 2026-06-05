export function SobreCarrera() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Sobre la Carrera</h1>
        <p className="text-gray-500 mb-8">Tecnologías de la Información — UNESUM</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Misión</h2>
          <p className="text-gray-600 leading-relaxed">
            Formar profesionales competentes en Tecnologías de la Información, con sólidos conocimientos científicos, técnicos y humanísticos, capaces de diseñar, implementar y gestionar soluciones tecnológicas innovadoras que contribuyan al desarrollo sostenible de la sociedad.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Visión</h2>
          <p className="text-gray-600 leading-relaxed">
            Ser una carrera de referencia regional en la formación de talento humano en Tecnologías de la Información, reconocida por la calidad académica, la investigación aplicada y la vinculación con la comunidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Duración', value: '8 semestres', icon: '📚' },
            { title: 'Modalidad', value: 'Presencial', icon: '🏫' },
            { title: 'Título', value: 'Ingeniero en TI', icon: '🎓' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{item.title}</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
