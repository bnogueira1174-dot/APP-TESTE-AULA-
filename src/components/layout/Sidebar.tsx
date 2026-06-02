'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Map, Truck, Users, Bell, Video,
  Settings, Route, LogOut, ChevronLeft, ChevronRight,
  Activity, DollarSign, X,
} from 'lucide-react'
import { useState } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/rastreamento', label: 'Mapa / Rastreamento', icon: Map },
  { href: '/trajetos', label: 'Trajetos', icon: Route },
  { href: '/custos', label: 'Central de Custos IA', icon: DollarSign },
  { href: '/veiculos', label: 'Veículos', icon: Truck },
  { href: '/motoristas', label: 'Motoristas / Vídeos', icon: Video },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/notificacoes', label: 'Notificações', icon: Bell },
]

const bottomItems = [
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

function SidebarContent({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-[#0a1628] text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 shrink-0">
          <Activity size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-base leading-tight text-white">FleetTrack</p>
            <p className="text-xs text-slate-400 leading-tight">Gestão de Frota</p>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-white/8 hover:text-white'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
              {/* Badge for Custos */}
              {!collapsed && href === '/custos' && (
                <span className="ml-auto text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-full">
                  IA
                </span>
              )}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                  {label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 py-3 px-2 space-y-0.5">
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/8 hover:text-white transition-all"
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        ))}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-all">
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin Sistema</p>
              <p className="text-xs text-slate-500 truncate">admin@frota.com.br</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { mobileOpen, closeMobile } = useSidebar()

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-full transition-all duration-300 shrink-0 relative',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent collapsed={collapsed} />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0a1628] border border-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobile}
          />
          {/* Drawer */}
          <aside className="relative w-72 h-full flex flex-col shadow-2xl">
            <SidebarContent collapsed={false} onClose={closeMobile} />
          </aside>
        </div>
      )}
    </>
  )
}
