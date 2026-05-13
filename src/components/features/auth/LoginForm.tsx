'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { login } from '@/app/(auth)/login/actions'
import { Loader2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (values: LoginFormValues) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', values.email)
      formData.append('password', values.password)

      const result = await login(null, formData)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.fields) {
        toast.error('Revisa los datos ingresados')
      } else {
        // La acción `login` normalmente redirige automáticamente si tiene éxito
        // pero mostramos el toast por si tarda un poco en cargar.
        toast.success('¡Sesión iniciada correctamente!')
      }
    })
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-indigo-100">
      <div className="flex flex-col items-center mb-8 text-indigo-600">
        <BookOpen size={48} className="mb-4" />
        <h2 className="text-3xl font-extrabold text-gray-900">Escuela en Casa</h2>
        <p className="text-gray-500 mt-2">Inicia sesión en tu cuenta</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            {...register('email')}
            id="email"
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none text-gray-900"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            {...register('password')}
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none text-gray-900"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Iniciando sesión...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>
    </div>
  )
}
