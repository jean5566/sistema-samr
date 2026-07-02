<?php

namespace Database\Seeders;

use App\Models\PreguntaSamr;
use Illuminate\Database\Seeder;

class PreguntasSamrSeeder extends Seeder
{
    public function run(): void
    {
        $preguntas = [
            [
                'enunciado'          => '¿Qué significa la letra "S" en el modelo SAMR?',
                'opciones'           => ['Sustitución', 'Síntesis', 'Simplificación', 'Selección'],
                'respuesta_correcta' => 0,
                'nivel'              => 'S',
            ],
            [
                'enunciado'          => 'En el nivel de Sustitución, ¿qué ocurre con la tarea educativa?',
                'opciones'           => ['Se transforma completamente', 'Se mejora con nuevas funciones', 'Se realiza igual pero con tecnología', 'Se crea una tarea totalmente nueva'],
                'respuesta_correcta' => 2,
                'nivel'              => 'S',
            ],
            [
                'enunciado'          => '¿Cuál es el nivel más alto dentro del modelo SAMR?',
                'opciones'           => ['Aumento', 'Modificación', 'Sustitución', 'Redefinición'],
                'respuesta_correcta' => 3,
                'nivel'              => 'R',
            ],
            [
                'enunciado'          => '¿Quién creó el modelo SAMR?',
                'opciones'           => ['Jean Piaget', 'Ruben Puentedura', 'Howard Gardner', 'John Dewey'],
                'respuesta_correcta' => 1,
                'nivel'              => 'S',
            ],
            [
                'enunciado'          => 'Un estudiante escribe sus apuntes en un documento Word en lugar de un cuaderno, sin usar ninguna función nueva. ¿En qué nivel SAMR está?',
                'opciones'           => ['Aumento', 'Sustitución', 'Modificación', 'Redefinición'],
                'respuesta_correcta' => 1,
                'nivel'              => 'S',
            ],
            [
                'enunciado'          => '¿Cuáles son los dos niveles del modelo SAMR orientados a MEJORAR el aprendizaje?',
                'opciones'           => ['Redefinición y Modificación', 'Sustitución y Redefinición', 'Sustitución y Aumento', 'Aumento y Modificación'],
                'respuesta_correcta' => 2,
                'nivel'              => 'A',
            ],
            [
                'enunciado'          => '¿Qué añade el nivel de Aumento respecto al nivel de Sustitución?',
                'opciones'           => ['Crea tareas completamente nuevas', 'Una mejora funcional sobre la herramienta anterior', 'Elimina la tarea original', 'Rediseña todo el proceso educativo'],
                'respuesta_correcta' => 1,
                'nivel'              => 'A',
            ],
            [
                'enunciado'          => '¿Qué caracteriza principalmente al nivel de Redefinición en el modelo SAMR?',
                'opciones'           => ['Mejorar tareas que ya existían', 'Crear tareas completamente nuevas que antes eran imposibles', 'Reemplazar herramientas físicas por digitales', 'Modificar levemente las tareas existentes'],
                'respuesta_correcta' => 1,
                'nivel'              => 'R',
            ],
            [
                'enunciado'          => 'En esta plataforma, el hecho de que el administrador publique noticias y todos los estudiantes las vean al instante corresponde al nivel:',
                'opciones'           => ['Sustitución', 'Aumento', 'Modificación', 'Redefinición'],
                'respuesta_correcta' => 2,
                'nivel'              => 'M',
            ],
            [
                'enunciado'          => '¿Qué significa la letra "A" en el modelo SAMR?',
                'opciones'           => ['Automatización', 'Aprendizaje', 'Aumento', 'Adaptación'],
                'respuesta_correcta' => 2,
                'nivel'              => 'A',
            ],
            [
                'enunciado'          => '¿Cuáles son los dos niveles del modelo SAMR que buscan TRANSFORMAR el proceso educativo?',
                'opciones'           => ['Sustitución y Aumento', 'Aumento y Modificación', 'Sustitución y Redefinición', 'Modificación y Redefinición'],
                'respuesta_correcta' => 3,
                'nivel'              => 'R',
            ],
            [
                'enunciado'          => 'Un docente realiza una clase en vivo con estudiantes de otros países a través de videoconferencia para un proyecto colaborativo. ¿Qué nivel SAMR representa?',
                'opciones'           => ['Sustitución', 'Aumento', 'Modificación', 'Redefinición'],
                'respuesta_correcta' => 3,
                'nivel'              => 'R',
            ],
            [
                'enunciado'          => 'En esta plataforma, poder subir tus archivos personales y gestionarlos desde cualquier dispositivo en cualquier momento representa el nivel de:',
                'opciones'           => ['Sustitución', 'Aumento', 'Modificación', 'Redefinición'],
                'respuesta_correcta' => 2,
                'nivel'              => 'M',
            ],
            [
                'enunciado'          => '¿Qué hace la tecnología en el nivel de Aumento del modelo SAMR?',
                'opciones'           => ['Crea tareas nuevas e imposibles antes', 'Reemplaza herramientas sin ningún cambio', 'Añade una mejora funcional a la tarea', 'Rediseña completamente la tarea educativa'],
                'respuesta_correcta' => 2,
                'nivel'              => 'A',
            ],
            [
                'enunciado'          => 'El modelo SAMR se centra principalmente en:',
                'opciones'           => ['Reducir los costos educativos', 'Integrar la tecnología digital en los procesos educativos', 'Reemplazar a los docentes con inteligencia artificial', 'Automatizar la entrega de calificaciones'],
                'respuesta_correcta' => 1,
                'nivel'              => 'S',
            ],
            [
                'enunciado'          => '¿Qué ocurre en el nivel de Modificación del modelo SAMR?',
                'opciones'           => ['Se reemplaza una herramienta física sin cambios', 'Se añade una pequeña mejora funcional', 'La tecnología permite rediseñar significativamente la tarea', 'Se crean tareas antes impensables'],
                'respuesta_correcta' => 2,
                'nivel'              => 'M',
            ],
            [
                'enunciado'          => 'Poder buscar y filtrar docentes por nombre en tiempo real en esta plataforma corresponde al nivel SAMR de:',
                'opciones'           => ['Sustitución', 'Aumento', 'Modificación', 'Redefinición'],
                'respuesta_correcta' => 1,
                'nivel'              => 'A',
            ],
            [
                'enunciado'          => '¿Qué significa la letra "M" en el modelo SAMR?',
                'opciones'           => ['Mejora', 'Modificación', 'Método', 'Multimedia'],
                'respuesta_correcta' => 1,
                'nivel'              => 'M',
            ],
            [
                'enunciado'          => '¿Qué significa la letra "R" en el modelo SAMR?',
                'opciones'           => ['Revisión', 'Reflexión', 'Redefinición', 'Resultado'],
                'respuesta_correcta' => 2,
                'nivel'              => 'R',
            ],
            [
                'enunciado'          => 'Que estudiantes, docentes y administradores tengan paneles digitales personalizados en un único sistema conectado representa el nivel de:',
                'opciones'           => ['Sustitución', 'Aumento', 'Modificación', 'Redefinición'],
                'respuesta_correcta' => 3,
                'nivel'              => 'R',
            ],
        ];

        foreach ($preguntas as $p) {
            PreguntaSamr::firstOrCreate(
                ['enunciado' => $p['enunciado']],
                $p
            );
        }
    }
}
