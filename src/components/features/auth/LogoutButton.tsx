'use client'

import { useTransition } from 'react'
import { logout } from '@/app/(auth)/login/actions'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="flex items-center gap-2 bg-white text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
    >
      <LogOut size={18} />
      {isPending ? 'Saliendo...' : 'Cerrar Sesión'}
    </button>
  )
}
