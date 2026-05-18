'use client'

import { useState, useTransition } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { storySchema, StoryFormValues } from '@/lib/schemas/story'
import { createStory } from '@/app/(dashboard)/admin/cuentos/nuevo/actions'
import { updateStory } from '@/app/(dashboard)/admin/cuentos/editar/[id]/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react'

// Tiptap
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

interface StoryFormProps {
  initialData?: StoryFormValues & { image_url?: string | null }
  storyId?: string
}

export function StoryForm({ initialData, storyId }: StoryFormProps = {}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues: initialData || {
      title: '',
      content: '',
      questions: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Escribe el contenido del cuento aquí...',
      }),
    ],
    content: initialData?.content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      let html = editor.getHTML()
      if (html === '<p></p>') html = ''
      setValue('content', html, { shouldValidate: true })
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = (values: StoryFormValues) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('title', values.title)
      
      // Obtenemos el HTML de los valores ya validados
      formData.append('content', values.content)
      
      // Añadimos las preguntas serializadas
      formData.append('questions', JSON.stringify(values.questions))
      
      if (imageFile) {
        formData.append('image', imageFile)
      }

      toast.loading(storyId ? 'Actualizando cuento...' : 'Guardando cuento y subiendo imagen...', { id: 'save-story' })
      
      let result;
      if (storyId) {
        formData.append('id', storyId)
        result = await updateStory(formData)
      } else {
        result = await createStory(formData)
      }

      if (result?.error) {
        toast.error(result.error, { id: 'save-story' })
      } else if (result?.fields) {
        toast.error('Revisa los campos del formulario', { id: 'save-story' })
      } else {
        toast.success(storyId ? '¡Cuento actualizado correctamente!' : '¡Cuento guardado correctamente!', { id: 'save-story' })
        router.push('/admin')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto pb-20">
      
      {/* 1. Información Básica */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Información del Cuento</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              {...register('title')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="El misterio del bosque..."
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido (Historia)</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
              <EditorContent editor={editor} />
            </div>
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Usa el editor para escribir o pegar tu historia.</p>
          </div>
        </div>
      </section>

      {/* 2. Portada */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Imagen de Portada</h2>
        
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-10 h-10 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Haz clic para subir</span> o arrastra un archivo</p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG (MAX. 2MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          
          {imagePreview && (
            <div className="w-40 h-40 relative rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* 3. Cuestionario */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-xl font-bold text-gray-800">Cuestionario</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{fields.length} / 12 Preguntas</span>
        </div>
        
        {errors.questions?.root && (
          <p className="text-red-500 text-sm mb-4">{errors.questions.root.message}</p>
        )}

        <div className="space-y-6">
          {fields.map((field, index) => {
            const questionType = watch(`questions.${index}.tipo`)

            return (
              <div key={field.id} className="p-5 border border-indigo-100 bg-indigo-50/30 rounded-xl relative group">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar pregunta"
                >
                  <Trash2 size={20} />
                </button>

                <div className="mb-4 pr-8">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs mr-2">
                    {index + 1}
                  </span>
                  <select
                    {...register(`questions.${index}.tipo`)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2 outline-none font-medium"
                  >
                    <option value="opcion_multiple">Opción Múltiple</option>
                    <option value="abierta">Pregunta Abierta</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta</label>
                    <input
                      {...register(`questions.${index}.pregunta`)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Escribe la pregunta..."
                    />
                    {errors.questions?.[index]?.pregunta && (
                      <p className="text-red-500 text-xs mt-1">{errors.questions[index]?.pregunta?.message}</p>
                    )}
                  </div>

                  {questionType === 'opcion_multiple' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-200">
                      {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                        <div key={opt} className="flex items-center gap-3">
                          <input
                            type="radio"
                            {...register(`questions.${index}.correcta`)}
                            value={opt}
                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <div className="flex-1 flex items-center">
                            <span className="w-8 text-center font-bold text-gray-400 uppercase">{opt})</span>
                            <input
                              {...register(`questions.${index}.opciones.${opt}`)}
                              className="w-full px-3 py-1.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                              placeholder={`Opción ${opt.toUpperCase()}`}
                            />
                          </div>
                        </div>
                      ))}
                      {errors.questions?.[index] && 'correcta' in (errors.questions[index] || {}) && (
                        <p className="text-red-500 text-xs mt-1 md:col-span-2">
                          {/* @ts-ignore */}
                          {errors.questions[index]?.correcta?.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {fields.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500">Aún no has agregado ninguna pregunta.</p>
            </div>
          )}

          {fields.length < 12 && (
            <button
              type="button"
              onClick={() => append({ id: crypto.randomUUID(), tipo: 'opcion_multiple', pregunta: '', opciones: { a: '', b: '', c: '', d: '' }, correcta: 'a' })}
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-indigo-200 border-dashed rounded-xl text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
            >
              <Plus size={20} />
              Añadir Pregunta
            </button>
          )}
        </div>
      </section>

      {/* Acciones */}
      <div className="flex justify-end gap-4 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200 z-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-2.5 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center shadow-md"
        >
          {isPending && <Loader2 className="animate-spin mr-2" size={18} />}
          {isPending ? 'Guardando...' : 'Guardar Cuento'}
        </button>
      </div>

    </form>
  )
}
