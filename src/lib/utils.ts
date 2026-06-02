import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export function formatDistance(km: number) {
  return km >= 1 ? `${km.toFixed(1)} km` : `${(km * 1000).toFixed(0)} m`
}

export function formatFuel(liters: number) {
  return `${liters.toFixed(1)} L`
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    active: 'text-emerald-600 bg-emerald-50',
    'on-trip': 'text-blue-600 bg-blue-50',
    online: 'text-emerald-600 bg-emerald-50',
    offline: 'text-slate-500 bg-slate-100',
    inactive: 'text-slate-500 bg-slate-100',
    maintenance: 'text-amber-600 bg-amber-50',
    alert: 'text-red-600 bg-red-50',
    completed: 'text-emerald-600 bg-emerald-50',
    'in-progress': 'text-blue-600 bg-blue-50',
    cancelled: 'text-red-600 bg-red-50',
  }
  return map[status] ?? 'text-slate-500 bg-slate-100'
}

export function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    active: 'Ativo',
    'on-trip': 'Em viagem',
    online: 'Online',
    offline: 'Offline',
    inactive: 'Inativo',
    maintenance: 'Manutenção',
    alert: 'Alerta',
    completed: 'Concluído',
    'in-progress': 'Em andamento',
    cancelled: 'Cancelado',
    admin: 'Administrador',
    manager: 'Gerente',
    operator: 'Operador',
    viewer: 'Visualizador',
    diesel: 'Diesel',
    gasoline: 'Gasolina',
    flex: 'Flex',
    electric: 'Elétrico',
  }
  return map[status] ?? status
}

export function getPriorityColor(priority: string) {
  const map: Record<string, string> = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  }
  return map[priority] ?? 'text-slate-500 bg-slate-100'
}

export function getNotificationIcon(type: string) {
  const map: Record<string, string> = {
    speed: '⚡',
    maintenance: '🔧',
    fuel: '⛽',
    'harsh-brake': '🛑',
    'harsh-acceleration': '🚀',
    geofence: '📍',
    'idle-engine': '🔌',
    disconnection: '📡',
  }
  return map[type] ?? '🔔'
}

export function getNotificationLabel(type: string) {
  const map: Record<string, string> = {
    speed: 'Excesso de Velocidade',
    maintenance: 'Manutenção Preventiva',
    fuel: 'Combustível Baixo',
    'harsh-brake': 'Frenagem Brusca',
    'harsh-acceleration': 'Aceleração Excessiva',
    geofence: 'Cerca Virtual',
    'idle-engine': 'Motor Ocioso',
    disconnection: 'Desconexão',
  }
  return map[type] ?? type
}
