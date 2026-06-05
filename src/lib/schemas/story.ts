import * as z from 'zod'

const opcionMultipleSchema = z.object({
  id: z.string().optional(),
  tipo: z.literal('opcion_multiple'),
  pregunta: z.string().min(5, 'La pregunta debe tener al menos 5 caracteres'),
  opciones: z.object({
    a: z.string().min(1, 'La opción A es obligatoria'),
    b: z.string().min(1, 'La opción B es obligatoria'),
    c: z.string().min(1, 'La opción C es obligatoria'),
    d: z.string().min(1, 'La opción D es obligatoria'),
  }),
  correcta: z.enum(['a', 'b', 'c', 'd'], {
    message: 'Debes seleccionar una respuesta correcta',
  }),
})

const abiertaSchema = z.object({
  id: z.string().optional(),
  tipo: z.literal('abierta'),
  pregunta: z.string().min(5, 'La pregunta debe tener al menos 5 caracteres'),
})

export const questionSchema = z.discriminatedUnion('tipo', [
  opcionMultipleSchema,
  abiertaSchema,
])

export type Question = z.infer<typeof questionSchema>

export const storySchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  content: z.string().min(20, 'El contenido debe tener al menos 20 caracteres'),
  questions: z.array(questionSchema).max(12, 'No puedes añadir más de 12 preguntas'),
})

export type StoryFormValues = z.infer<typeof storySchema>
