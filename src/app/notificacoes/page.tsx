'use client'

import { useState } from 'react'
import {
  Bell, BellOff, Filter, Settings, CheckCheck, Trash2,
  ChevronRight, AlertTriangle, Wrench, Fuel, StopCircle,
  Zap, MapPin, Power, Radio, Clock,
} from 'lucide-react'
import { mockNotifications } from '@/lib/mock-data'
import type { Notification, NotificationType } from '@/types'
import { getNotificationLabel, getPriorityColor, timeAgo, cn } from '@/lib/utils'

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  speed: Zap,
  maintenance: Wrench,
  fuel: Fuel,
  'harsh-brake': StopCircle,
  'harsh-acceleration': Zap,
  geofence: MapPin,
  'idle-engine': Power,
  disconnection: Radio,
}

const TYPE_FILTERS: { value: string; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'Todos', icon: Bell },
  { value: 'speed', label: 'Velocidade', icon: Zap },
  { value: 'maintenance', label: 'Manutenção', icon: Wrench },
  { value: 'fuel', label: 'Combustível', icon: Fuel },
  { value: 'harsh-brake', label: 'Frenagem', icon: StopCircle },
  { value: 'harsh-acceleration', label: 'Aceleração', icon: Zap },
  { value: 'geofence', label: 'Cerca Virtual', icon: MapPin },
  { value: 'idle-engine', label: 'Motor Ocioso', icon: Power },
]

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [selected, setSelected] = useState<Notification | null>(null)

  const filtered = notifications.filter((n) => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false
    if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false
    if (showUnreadOnly && n.read) return false
    return true
  })

  const unread = notifications.filter((n) => !n.read).length

  function markRead(id: string) {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  function markAllRead() {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  function deleteNotif(id: string) {
    setNotifications(notifications.filter((n) => n.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  function handleSelect(n: Notification) {
    setSelected(n)
    if (!n.read) markRead(n.id)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel */}
      <div className="w-96 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-900">Notificações</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {unread > 0 ? <span className="text-blue-600 font-medium">{unread} não lidas</span> : 'Tudo lido'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  showUnreadOnly ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'
                )}
                title="Apenas não lidas"
              >
                {showUnreadOnly ? <Bell size={16} /> : <BellOff size={16} />}
              </button>
              <button
                onClick={markAllRead}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                title="Marcar todas como lidas"
              >
                <CheckCheck size={16} />
              </button>
            </div>
          </div>

          {/* Type filter */}
          <div className="flex gap-1.5 flex-wrap">
            {['all', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                  priorityFilter === p
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-slate-500 border-slate-200 hover:border-slate-300 bg-white'
                )}
              >
                {p === 'all' ? 'Todas prioridades' : PRIORITY_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Type tabs (scrollable) */}
        <div className="flex gap-1 px-3 py-2 border-b border-slate-100 overflow-x-auto shrink-0">
          {TYPE_FILTERS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0',
                typeFilter === value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              )}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <BellOff size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-600">Nenhuma notificação</p>
              <p className="text-xs text-slate-400 mt-1">Ajuste os filtros para ver mais resultados</p>
            </div>
          ) : (
            filtered.map((n) => {
              const Icon = TYPE_ICONS[n.type] ?? Bell
              const isSelected = selected?.id === n.id
              return (
                <button
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  className={cn(
                    'w-full text-left px-4 py-3.5 border-b border-slate-50 transition-all hover:bg-slate-50 relative',
                    isSelected ? 'bg-blue-50' : !n.read ? 'bg-white' : 'bg-white'
                  )}
                >
                  {!n.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-r" />
                  )}
                  <div className="flex items-start gap-3 pl-2">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      n.priority === 'high' ? 'bg-red-100' : n.priority === 'medium' ? 'bg-amber-100' : 'bg-emerald-100'
                    )}>
                      <Icon size={15} className={
                        n.priority === 'high' ? 'text-red-600' : n.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-semibold text-slate-700 truncate">{getNotificationLabel(n.type)}</span>
                        <span className="text-xs text-slate-400 shrink-0">{timeAgo(n.timestamp)}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {n.vehiclePlate}
                        </span>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded border font-medium',
                          getPriorityColor(n.priority)
                        )}>
                          {PRIORITY_LABELS[n.priority]}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">{filtered.length} de {notifications.length} notificações</p>
          <button
            onClick={() => setNotifications([])}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={11} />
            Limpar tudo
          </button>
        </div>
      </div>

      {/* Right detail */}
      <div className="flex-1 overflow-y-auto bg-slate-100">
        {!selected ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-4">
              <Bell size={32} className="text-slate-200" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Selecione uma notificação</h3>
            <p className="text-sm text-slate-400 mt-1">Clique em um alerta para ver os detalhes</p>
          </div>
        ) : (
          <div className="p-6 max-w-2xl">
            {/* Detail card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Header */}
              <div className={cn(
                'p-6',
                selected.priority === 'high' ? 'bg-red-50' : selected.priority === 'medium' ? 'bg-amber-50' : 'bg-emerald-50'
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      selected.priority === 'high' ? 'bg-red-100' : selected.priority === 'medium' ? 'bg-amber-100' : 'bg-emerald-100'
                    )}>
                      {(() => { const Icon = TYPE_ICONS[selected.type] ?? Bell; return <Icon size={22} className={selected.priority === 'high' ? 'text-red-600' : selected.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'} /> })()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{getNotificationLabel(selected.type)}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border font-semibold', getPriorityColor(selected.priority))}>
                          Prioridade {PRIORITY_LABELS[selected.priority]}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock size={11} />
                          {timeAgo(selected.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteNotif(selected.id)} className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Descrição</p>
                  <p className="text-base text-slate-800">{selected.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Veículo</p>
                    <p className="text-lg font-bold text-slate-900 font-mono">{selected.vehiclePlate}</p>
                  </div>
                  {selected.driverName && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Motorista</p>
                      <p className="text-base font-semibold text-slate-900">{selected.driverName}</p>
                    </div>
                  )}
                  {selected.value !== undefined && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Valor Registrado</p>
                      <p className="text-lg font-bold text-slate-900">{selected.value} {selected.unit}</p>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Data/Hora</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(selected.timestamp).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(selected.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {selected.location && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-700 mb-0.5">Localização</p>
                      <p className="text-sm text-slate-700">{selected.location}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <a
                    href="/rastreamento"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Ver no Mapa
                    <ChevronRight size={14} />
                  </a>
                  <button
                    onClick={() => markRead(selected.id)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    <CheckCheck size={14} />
                    Marcar como lida
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
