<?php

namespace Database\Seeders;

use App\Models\Noticia;
use App\Models\User;
use Illuminate\Database\Seeder;

class NoticiasSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@unesum.edu.ec')->first();

        $noticias = [
            [
                'titulo'             => 'Inicio del nuevo semestre académico 2026-I',
                'categoria'          => 'noticia',
                'estado'             => 'publicado',
                'fecha'              => '2026-03-01',
                'fecha_realizacion'  => null,
                'descripcion'        => "El nuevo semestre académico 2026-I arrancó oficialmente el 1 de marzo con la bienvenida a estudiantes de primer ingreso y la reincorporación de los estudiantes regulares de la carrera de Tecnologías de la Información.\n\nLas autoridades de la facultad destacaron los logros del ciclo anterior y presentaron las metas para este período, entre las que se incluyen la ampliación del laboratorio de redes, la apertura de un nuevo taller de desarrollo de software y el fortalecimiento del programa de tutorías académicas.\n\nSe recuerda a todos los estudiantes que el proceso de matrícula regular cierra el 15 de marzo. Los horarios actualizados ya se encuentran disponibles en el sistema académico.",
                'imagen'             => 'https://d5tnfl9agh5vb.cloudfront.net/uploads/2023/02/Recomendaciones-para-el-primer-diia-de-clases.jpg',
                'destacada'          => true,
            ],
            [
                'titulo'             => 'Congreso Internacional de Innovación Tecnológica UNESUM 2026',
                'categoria'          => 'congreso',
                'estado'             => 'publicado',
                'fecha'              => '2026-05-10',
                'fecha_realizacion'  => '2026-07-15',
                'descripcion'        => "La carrera de Tecnologías de la Información tiene el agrado de anunciar la realización del Congreso Internacional de Innovación Tecnológica UNESUM 2026, un espacio para el intercambio de conocimientos, experiencias y avances científicos entre profesionales, investigadores y estudiantes del área tecnológica.\n\nEste año el congreso contará con la participación de ponentes nacionales e internacionales de Ecuador, Colombia, Perú y España. Los ejes temáticos incluirán Inteligencia Artificial, Ciberseguridad, Desarrollo de Software, IoT y Transformación Digital.\n\nLas inscripciones están abiertas para asistentes y ponentes. Los trabajos de investigación deben enviarse antes del 30 de junio al correo congreso@unesum.edu.ec. Se otorgarán certificados de participación con un valor de 40 horas académicas.",
                'imagen'             => 'https://america-digital.com/mkt/2022/congreso-mexico/assets/img/slider/slide2.jpg',
                'destacada'          => false,
            ],
            [
                'titulo'             => 'Feria de Empleo Tech — Conecta con las mejores empresas del sector',
                'categoria'          => 'feria',
                'estado'             => 'publicado',
                'fecha'              => '2026-04-20',
                'fecha_realizacion'  => '2026-06-20',
                'descripcion'        => "El Centro de Vinculación con la Sociedad de UNESUM organiza la primera Feria de Empleo Tech del año, en la que participarán más de 20 empresas del sector tecnológico regional y nacional en busca de talento humano calificado.\n\nLos estudiantes de últimos semestres y egresados de la carrera de Tecnologías de la Información tendrán la oportunidad de presentar su hoja de vida, participar en entrevistas en vivo y conocer de primera mano las oportunidades laborales disponibles en áreas como desarrollo web, administración de redes, soporte técnico y ciencia de datos.\n\nSe recomienda a los participantes traer mínimo 5 copias de su currículum actualizado y portafolio de proyectos si disponen de uno. La entrada es libre y el evento se realizará en el auditorio principal del campus.",
                'imagen'             => 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
                'destacada'          => false,
            ],
            [
                'titulo'             => 'Taller de Ciberseguridad: Protección de Infraestructuras Críticas',
                'categoria'          => 'evento',
                'estado'             => 'publicado',
                'fecha'              => '2026-05-25',
                'fecha_realizacion'  => '2026-06-25',
                'descripcion'        => "El Departamento de Redes y Seguridad Informática invita a docentes y estudiantes a participar en el taller práctico de Ciberseguridad: Protección de Infraestructuras Críticas, dictado por el Ing. Roberto Salazar, especialista certificado en seguridad ofensiva y defensiva.\n\nEl taller tendrá una duración de 8 horas y abordará temas como análisis de vulnerabilidades, pentesting ético, configuración de firewalls y respuesta ante incidentes de seguridad. Se trabajará en el laboratorio de redes de la facultad con herramientas como Kali Linux, Metasploit y Wireshark.\n\nLos cupos son limitados a 30 participantes. Las inscripciones se realizan a través del sistema de registro académico hasta el 20 de junio. Al finalizar se entregará certificado de asistencia con 8 horas de capacitación.",
                'imagen'             => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
                'destacada'          => false,
            ],
            [
                'titulo'             => 'Aviso: Actualización del reglamento de prácticas preprofesionales',
                'categoria'          => 'aviso',
                'estado'             => 'publicado',
                'fecha'              => '2026-06-01',
                'fecha_realizacion'  => null,
                'descripcion'        => "Se comunica a todos los estudiantes de la carrera de Tecnologías de la Información que el reglamento de prácticas preprofesionales ha sido actualizado a partir del presente semestre académico.\n\nLos cambios más importantes incluyen: el incremento de horas mínimas requeridas de 240 a 320 horas, la obligatoriedad de presentar un informe mensual de actividades firmado por el tutor empresarial, y la posibilidad de realizar las prácticas en modalidad remota siempre que la empresa lo autorice formalmente.\n\nLos estudiantes que ya iniciaron sus prácticas bajo el reglamento anterior continuarán rigiéndose por dicho reglamento hasta su conclusión. Para mayor información, comunicarse con la coordinación de vinculación al correo vinculacion.ti@unesum.edu.ec.",
                'imagen'             => 'https://peru.unir.net/wp-content/uploads/sites/2/2024/11/Practicante-que-es-y-cual-es-su-funcion-principal.jpg',
                'destacada'          => false,
            ],
            [
                'titulo'             => 'Resultados del concurso de programación inter-semestral 2026',
                'categoria'          => 'noticia',
                'estado'             => 'publicado',
                'fecha'              => '2026-05-30',
                'fecha_realizacion'  => null,
                'descripcion'        => "Con gran satisfacción la carrera de Tecnologías de la Información anuncia los resultados del Concurso de Programación Inter-Semestral 2026, en el que participaron 48 estudiantes organizados en 16 equipos de tres integrantes.\n\nEl primer lugar fue obtenido por el equipo \"ByteForce\" conformado por los estudiantes Andrés Morales, Paola Cedeño y Luis Macías del sexto semestre, quienes resolvieron los 7 problemas propuestos en un tiempo récord de 3 horas 42 minutos. El segundo lugar correspondió a \"Algoritmos UNESUM\" y el tercero a \"DevStorm\".\n\nLos equipos ganadores recibirán reconocimiento académico, material tecnológico y representarán a la carrera en el concurso regional que se realizará en Guayaquil el próximo septiembre. Felicitaciones a todos los participantes por su esfuerzo y dedicación.",
                'imagen'             => 'https://valorydinero.com/wp-content/uploads/2023/10/Programacion-codigos-computadora.jpg',
                'destacada'          => false,
            ],
        ];

        foreach ($noticias as $data) {
            Noticia::updateOrCreate(
                ['titulo' => $data['titulo']],
                array_merge($data, ['user_id' => $admin->id])
            );
        }
    }
}
