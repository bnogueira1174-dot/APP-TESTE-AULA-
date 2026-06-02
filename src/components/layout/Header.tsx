'use client'

import { Bell, Search, Menu, Sun, Moon, ChevronDown } from 'lucide-react'
import { mockNotifications } from '@/lib/mock-data'
import { useTheme } from '@/contexts/ThemeContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { useState } from 'react'
import Link from 'next/link'

const unread = mockNotifications.filter((n) => !n.read).length

export default function Header() {
  const { theme, toggle, isDark } = useTheme()
  const { toggleMobile } = useSidebar()
  const [showNotif, setShowNotif] = useState(false)

  return (
    <header className="h-14 bg-white dark:bg-[#0f1a2e] border-b border-slate-200 dark:border-[#1e2d4a] flex items-center px-4 gap-3 shrink-0 z-20 transition-colors duration-200">
      {/* Mobile hamburger */}
      <button
        onClick={toggleMobile}
        className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar veículo, motorista..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
          title={isDark ? 'Modo claro' : 'Modo escuro'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <Bell size={18} className="text-slate-500 dark:text-slate-400" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#0f1a2e] rounded-xl shadow-2xl border border-slate-200 dark:border-[#1e2d4a] z-50">
              <div className="p-4 border-b border-slate-100 dark:border-[#1e2d4a]">
                <p className="font-semibold text-slate-800 dark:text-slate-100">Notificações</p>
                <p className="text-xs text-slate-500">{unread} não lidas</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {mockNotifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 font-medium line-clamp-2">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.vehiclePlate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center">
                <Link href="/notificacoes" onClick={() => setShowNotif(false)} className="text-sm text-blue-600 font-medium hover:underline">
                  Ver todas
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <button className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-tight">Admin</p>
            <p className="text-xs text-slate-400 leading-tight">Administrador</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
        </button>
      </div>
    </header>
  )
}
