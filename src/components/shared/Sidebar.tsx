'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Users,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { logout } from '@/app/(auth)/login/actions'

interface SidebarProps {
  role: string
  userEmail: string
}

const SIDEBAR_KEY = 'sidebar_collapsed'

export function Sidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hidratar desde localStorage sólo en cliente
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY)
    if (saved !== null) setCollapsed(saved === 'true')
    setMounted(true)
  }, [])

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      localStorage.setItem(SIDEBAR_KEY, String(!prev))
      return !prev
    })
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const navItems = [
    {
      label: 'Lenguaje',
      icon: <BookOpen size={20} />,
      roles: ['admin', 'estudiante', 'padre'],
      children: [
        {
          label: 'Historias',
          href: '/admin',
          icon: <BookOpen size={16} />,
          roles: ['admin', 'estudiante', 'padre'],
        },
      ],
    },
  ]

  const adminItems = [
    {
      label: 'Usuarios',
      href: '/admin/usuarios',
      icon: <Users size={20} />,
      roles: ['admin'],
    },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <GraduationCap size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-white text-base whitespace-nowrap overflow-hidden"
            >
              Escuela en Casa
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Sección Lenguaje */}
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => (
            <div key={item.label}>
              <button
                onClick={() => !collapsed && setLanguageOpen((o) => !o)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all ${collapsed ? 'justify-center' : 'justify-between'}`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0">{item.icon}</span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {!collapsed && (
                  <span className="flex-shrink-0">
                    {languageOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                )}
              </button>

              {/* Submenú */}
              <AnimatePresence>
                {!collapsed && languageOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-4 mt-1 space-y-1"
                  >
                    {item.children
                      .filter((c) => c.roles.includes(role))
                      .map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive(child.href)
                              ? 'bg-white text-indigo-700 font-semibold shadow-sm'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {child.icon}
                          {child.label}
                        </Link>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapsed submenu: solo iconos */}
              {collapsed && (
                <div className="mt-1 space-y-1">
                  {item.children
                    .filter((c) => c.roles.includes(role))
                    .map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        title={child.label}
                        className={`flex justify-center items-center p-2.5 rounded-lg transition-all ${
                          isActive(child.href)
                            ? 'bg-white text-indigo-700'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {child.icon}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}

        {/* Items de Admin */}
        {adminItems
          .filter((item) => item.roles.includes(role))
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive(item.href)
                  ? 'bg-white text-indigo-700 font-semibold shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
      </nav>

      {/* Footer: usuario + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        {!collapsed && (
          <div className="mb-3 px-3">
            <p className="text-xs text-white/50 truncate">{userEmail}</p>
            <p className="text-xs text-white/70 font-medium capitalize">{role}</p>
          </div>
        )}
        <form action={logout}>
          <button
            type="submit"
            title="Cerrar sesión"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm whitespace-nowrap overflow-hidden"
                >
                  Cerrar sesión
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </form>
      </div>
    </div>
  )

  // Render skeleton antes de hidratar para evitar flash
  if (!mounted) {
    return (
      <aside className="hidden md:flex w-60 flex-shrink-0 bg-indigo-700 min-h-screen flex-col" />
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-shrink-0 bg-gradient-to-b from-indigo-700 to-indigo-900 min-h-screen flex-col relative overflow-hidden shadow-xl"
      >
        {/* Botón colapsar */}
        <button
          onClick={toggleCollapse}
          className="absolute top-4 -right-3 z-10 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-indigo-700 hover:bg-indigo-50 transition-colors"
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <PanelLeftOpen size={12} /> : <PanelLeftClose size={12} />}
        </button>

        <SidebarContent />
      </motion.aside>

      {/* Mobile: Top bar con hamburguesa */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-indigo-700 to-indigo-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <GraduationCap size={20} className="text-white" />
          <span className="font-bold text-white text-sm">Escuela en Casa</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white p-1"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 shadow-2xl flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
                aria-label="Cerrar menú"
              >
                <X size={22} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
