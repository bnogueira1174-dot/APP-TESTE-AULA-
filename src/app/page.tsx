'use client'

import {
  Truck,
  Users,
  Fuel,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import Link from 'next/link'
import {
  mockVehicles,
  mockDrivers,
  mockNotifications,
  mockTrips,
  consumptionChartData,
  monthlyKpiData,
} from '@/lib/mock-data'
import { getStatusColor, getStatusLabel, getNotificationLabel, timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

const activeVehicles = mockVehicles.filter((v) => v.status === 'active').length
const onlineDrivers = mockDrivers.filter((d) => d.status === 'on-trip' || d.status === 'online').length
const unreadAlerts = mockNotifications.filter((n) => !n.read).length
const avgConsumption = (mockVehicles.reduce((s, v) => s + v.avgConsumption, 0) / mockVehicles.length).toFixed(1)

const fleetStatusData = [
  { name: 'Ativos', value: mockVehicles.filter((v) => v.status === 'active').length, color: '#10b981' },
  { name: 'Manutenção', value: mockVehicles.filter((v) => v.status === 'maintenance').length, color: '#f59e0b' },
  { name: 'Alerta', value: mockVehicles.filter((v) => v.status === 'alert').length, color: '#ef4444' },
  { name: 'Inativos', value: mockVehicles.filter((v) => v.status === 'inactive').length, color: '#94a3b8' },
]

const statCards = [
  {
    title: 'Veículos Ativos',
    value: `${activeVehicles}/${mockVehicles.length}`,
    sub: '80% da frota em operação',
    icon: Truck,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    trend: +5,
  },
  {
    title: 'Motoristas Online',
    value: `${onlineDrivers}`,
    sub: `${onlineDrivers} em viagem agora`,
    icon: Users,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    trend: +2,
  },
  {
    title: 'Consumo Médio',
    value: `${avgConsumption} km/L`,
    sub: 'Média da semana atual',
    icon: Fuel,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    trend: -3,
  },
  {
    title: 'Alertas Ativos',
    value: `${unreadAlerts}`,
    sub: 'Requerem atenção',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    trend: -1,
  },
  {
    title: 'Custo Mensal',
    value: 'R$ 85.400',
    sub: 'Mai/2026 — +5.3%',
    icon: DollarSign,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    trend: +5.3,
  },
]

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visão geral da frota em tempo real</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <Activity size={14} className="text-emerald-500 animate-pulse" />
          <span>Atualizado agora</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('p-2 rounded-lg', card.bg)}>
                  <Icon size={18} className={card.color} />
                </div>
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    card.trend > 0 ? 'text-emerald-600' : 'text-red-500'
                  )}
                >
                  {card.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(card.trend)}%
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500 mt-1">{card.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consumption chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-slate-900">Consumo de Combustível</h2>
              <p className="text-xs text-slate-500">Litros/dia — últimos 7 dias</p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">Esta semana</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={consumptionChartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(v) => [`${v} L`, 'Consumo']}
              />
              <Area
                type="monotone"
                dataKey="consumo"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#colorConsumo)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet status pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="mb-5">
            <h2 className="font-semibold text-slate-900">Status da Frota</h2>
            <p className="text-xs text-slate-500">{mockVehicles.length} veículos cadastrados</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={fleetStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {fleetStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {fleetStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI bar chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-slate-900">KPIs Mensais</h2>
            <p className="text-xs text-slate-500">Quilometragem total por mês</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyKpiData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(v) => [`${Number(v).toLocaleString('pt-BR')} km`, 'Km rodados']}
            />
            <Bar dataKey="km" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent notifications */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Alertas Recentes</h2>
            <Link href="/notificacoes" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {mockNotifications.slice(0, 5).map((n) => (
              <div key={n.id} className={cn('flex items-start gap-3 p-3 rounded-lg', !n.read ? 'bg-blue-50/50' : 'hover:bg-slate-50')}>
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full mt-2 shrink-0',
                  n.priority === 'high' ? 'bg-red-500' : n.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-medium truncate">{getNotificationLabel(n.type)}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{n.vehiclePlate}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{timeAgo(n.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent trips */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Últimos Trajetos</h2>
            <Link href="/trajetos" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {mockTrips.slice(0, 4).map((trip) => (
              <div key={trip.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                  <Truck size={14} className="text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800">{trip.vehiclePlate}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(trip.status))}>
                      {getStatusLabel(trip.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-500 truncate">{trip.startLocation}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {Math.floor(trip.duration / 60)}h {trip.duration % 60}min
                    </span>
                    <span>{trip.distance.toFixed(1)} km</span>
                    <span>{trip.driverName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
