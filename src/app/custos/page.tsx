'use client'

import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import {
  Zap, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Info, Sparkles, Plus, Download, RefreshCw, ChevronUp,
  ChevronDown, Fuel, DollarSign, Gauge, Trophy, Brain,
  X, Lightbulb,
} from 'lucide-react'
import { mockVehicles, mockDrivers } from '@/lib/mock-data'
import {
  mockFuelRecords, monthlyCostTrend, vehicleEfficiencyData,
  driverRanking, type FuelRecord,
} from '@/lib/mock-fuel'
import { aiAnalysis, type AIInsight } from '@/lib/ai-engine'
import { cn } from '@/lib/utils'

/* ─── helpers ─────────────────────────────────────────────── */
function fmt(n: number, dec = 0) {
  return n.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function fmtBRL(n: number) {
  return `R$ ${fmt(n, 2).replace('.', '#').replace(/\./g, '.').replace('#', ',')}`
}

const INSIGHT_CONFIG: Record<string, { bg: string; border: string; icon: React.ElementType; iconColor: string; badge: string; badgeBg: string }> = {
  alert:      { bg: 'bg-red-950/40', border: 'border-red-500/30', icon: AlertTriangle, iconColor: 'text-red-400', badge: 'Alerta', badgeBg: 'bg-red-500/20 text-red-300' },
  warning:    { bg: 'bg-amber-950/40', border: 'border-amber-500/30', icon: Zap, iconColor: 'text-amber-400', badge: 'Atenção', badgeBg: 'bg-amber-500/20 text-amber-300' },
  success:    { bg: 'bg-emerald-950/40', border: 'border-emerald-500/30', icon: CheckCircle2, iconColor: 'text-emerald-400', badge: 'Destaque', badgeBg: 'bg-emerald-500/20 text-emerald-300' },
  info:       { bg: 'bg-blue-950/40', border: 'border-blue-500/30', icon: Lightbulb, iconColor: 'text-blue-400', badge: 'Insight', badgeBg: 'bg-blue-500/20 text-blue-300' },
  prediction: { bg: 'bg-purple-950/40', border: 'border-purple-500/30', icon: Brain, iconColor: 'text-purple-400', badge: 'Previsão IA', badgeBg: 'bg-purple-500/20 text-purple-300' },
}

/* ─── Score ring ───────────────────────────────────────────── */
function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label: string }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e2d4a" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill={color} fontSize={size === 80 ? 18 : 22} fontWeight={700}>
          {score}
        </text>
      </svg>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

/* ─── Insight card ─────────────────────────────────────────── */
function InsightCard({ insight, onDismiss }: { insight: AIInsight; onDismiss: () => void }) {
  const cfg = INSIGHT_CONFIG[insight.type]
  const Icon = cfg.icon
  return (
    <div className={cn('relative rounded-xl border p-4 transition-all', cfg.bg, cfg.border)}>
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X size={12} />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="shrink-0 mt-0.5">
          <Icon size={16} className={cfg.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', cfg.badgeBg)}>
              {cfg.badge}
            </span>
            {insight.confidence >= 85 && (
              <span className="text-[10px] text-slate-500">
                {insight.confidence}% confiança
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-white mb-1">{insight.title}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
          {insight.metric && (
            <div className="mt-2 flex items-center gap-2">
              <span className={cn('text-sm font-bold', cfg.iconColor)}>{insight.metric}</span>
              <span className="text-xs text-slate-500">{insight.metricLabel}</span>
            </div>
          )}
          {insight.impact && (
            <p className="mt-1 text-xs text-slate-400 italic">{insight.impact}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Fuel Register Modal ──────────────────────────────────── */
function FuelModal({ onClose, onSave }: { onClose: () => void; onSave: (r: Partial<FuelRecord>) => void }) {
  const [form, setForm] = useState({
    vehicleId: '', driverId: '', date: new Date().toISOString().slice(0, 16),
    liters: '', pricePerLiter: '', odometer: '', station: '',
  })

  const totalCost = parseFloat(form.liters || '0') * parseFloat(form.pricePerLiter || '0')

  function submit() {
    if (!form.vehicleId || !form.liters || !form.pricePerLiter) return
    const v = mockVehicles.find(x => x.id === form.vehicleId)
    const d = mockDrivers.find(x => x.id === form.driverId)
    onSave({
      vehicleId: form.vehicleId,
      vehiclePlate: v?.plate ?? '',
      driverId: form.driverId || null,
      driverName: d?.name ?? null,
      date: form.date,
      liters: parseFloat(form.liters),
      pricePerLiter: parseFloat(form.pricePerLiter),
      totalCost,
      odometer: parseInt(form.odometer || '0'),
      station: form.station,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1a2e] border border-[#1e2d4a] rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-[#1e2d4a]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Fuel size={16} className="text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-white">Registrar Abastecimento</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Veículo *</label>
              <select
                value={form.vehicleId}
                onChange={e => setForm({ ...form, vehicleId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#162035] border border-[#1e2d4a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="">Selecione...</option>
                {mockVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.plate} — {v.brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Motorista</label>
              <select
                value={form.driverId}
                onChange={e => setForm({ ...form, driverId: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#162035] border border-[#1e2d4a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="">Sem motorista</option>
                {mockDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Data/hora *</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#162035] border border-[#1e2d4a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Posto</label>
              <input
                type="text"
                value={form.station}
                onChange={e => setForm({ ...form, station: e.target.value })}
                placeholder="Ex: Shell — Batel"
                className="w-full px-3 py-2 text-sm bg-[#162035] border border-[#1e2d4a] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Litros *</label>
              <input
                type="number"
                step="0.1"
                value={form.liters}
                onChange={e => setForm({ ...form, liters: e.target.value })}
                placeholder="0.0"
                className="w-full px-3 py-2 text-sm bg-[#162035] border border-[#1e2d4a] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Preço/litro (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={form.pricePerLiter}
                onChange={e => setForm({ ...form, pricePerLiter: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm bg-[#162035] border border-[#1e2d4a] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-400 mb-1 block">Hodômetro (km)</label>
              <input
                type="number"
                value={form.odometer}
                onChange={e => setForm({ ...form, odometer: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 text-sm bg-[#162035] border border-[#1e2d4a] rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          {totalCost > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-400 font-medium">Total do abastecimento</p>
                <p className="text-xl font-bold text-white mt-0.5">R$ {totalCost.toFixed(2).replace('.', ',')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Litros</p>
                <p className="text-base font-bold text-slate-300">{parseFloat(form.liters || '0').toFixed(1)} L</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 p-6 border-t border-[#1e2d4a]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!form.vehicleId || !form.liters || !form.pricePerLiter}
            className="ml-auto flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={14} />
            Registrar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function CustosPage() {
  const [records, setRecords] = useState<FuelRecord[]>(mockFuelRecords)
  const [insights, setInsights] = useState(aiAnalysis.insights)
  const [showModal, setShowModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)

  const totalCostMonth = records
    .filter(r => new Date(r.date) >= new Date(Date.now() - 30 * 86400000))
    .reduce((s, r) => s + r.totalCost, 0)

  const totalLitersMonth = records
    .filter(r => new Date(r.date) >= new Date(Date.now() - 30 * 86400000))
    .reduce((s, r) => s + r.liters, 0)

  const avgKmL = records.reduce((s, r) => s + (r.kmPerLiter ?? 0), 0) /
    records.filter(r => r.kmPerLiter).length

  const costPerKm = totalCostMonth / (avgKmL * totalLitersMonth || 1)

  function addRecord(data: Partial<FuelRecord>) {
    const newRecord: FuelRecord = {
      id: `f${Date.now()}`,
      vehicleId: data.vehicleId ?? '',
      vehiclePlate: data.vehiclePlate ?? '',
      driverId: data.driverId ?? null,
      driverName: data.driverName ?? null,
      date: data.date ?? new Date().toISOString(),
      liters: data.liters ?? 0,
      pricePerLiter: data.pricePerLiter ?? 0,
      totalCost: data.totalCost ?? 0,
      odometer: data.odometer ?? 0,
      kmSinceLast: null,
      kmPerLiter: null,
      station: data.station ?? '',
    }
    setRecords([newRecord, ...records])
  }

  function simulateRefresh() {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1800)
  }

  const trendColor = (v: number, expected: number) =>
    v >= expected ? 'text-emerald-400' : v >= expected * 0.9 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="min-h-full bg-[#070d1a] text-slate-100">
      {/* ── Header ── */}
      <div className="border-b border-[#1e2d4a] bg-[#0a1220] px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl">
              <Brain size={22} className="text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">Central de Custos</h1>
                <span className="text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
                  IA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Análise inteligente de custos operacionais · Atualizado agora
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-400">Live</span>
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={simulateRefresh}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#1e2d4a] hover:border-blue-500/40 text-slate-400 hover:text-white text-xs rounded-lg transition-all"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
              {isRefreshing ? 'Analisando...' : 'Atualizar IA'}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-[#1e2d4a] text-slate-400 hover:text-white text-xs rounded-lg transition-all">
              <Download size={13} />
              Exportar
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20"
            >
              <Plus size={15} />
              Abastecimento
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          {[
            {
              label: 'Custo Total (30 dias)',
              value: `R$ ${fmt(totalCostMonth / 1000, 1)}k`,
              sub: `${fmt(totalLitersMonth)} litros abastecidos`,
              icon: DollarSign,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10 border-blue-500/20',
              trend: null,
            },
            {
              label: 'Eficiência Média',
              value: `${avgKmL.toFixed(2)} km/L`,
              sub: 'Média da frota atual',
              icon: Gauge,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
              trend: avgKmL >= 3.0 ? '+' : '-',
            },
            {
              label: 'Custo por km',
              value: `R$ ${costPerKm.toFixed(2)}`,
              sub: 'Diesel a R$ 6,19/L',
              icon: TrendingUp,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10 border-amber-500/20',
              trend: null,
            },
            {
              label: 'Score Geral IA',
              value: `${aiAnalysis.overallScore}/100`,
              sub: 'Economia + Segurança',
              icon: Brain,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10 border-purple-500/20',
              trend: null,
            },
            {
              label: 'Economia Potencial',
              value: `R$ ${fmt(aiAnalysis.potentialSavings / 1000, 1)}k/mês`,
              sub: `${aiAnalysis.potentialSavingsPct.toFixed(1)}% de redução possível`,
              icon: Sparkles,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
              trend: '+',
            },
          ].map(card => (
            <div key={card.label} className={cn('rounded-xl border p-4', card.bg)}>
              <div className="flex items-center gap-2 mb-3">
                <card.icon size={15} className={card.color} />
                <p className="text-xs text-slate-400 truncate">{card.label}</p>
              </div>
              <p className="text-xl md:text-2xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Score rings ── */}
        <div className="bg-[#0f1a2e] border border-[#1e2d4a] rounded-xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={15} className="text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Score de Performance da Frota</h2>
              </div>
              <p className="text-xs text-slate-500">Calculado por IA com base em consumo, eventos e histórico</p>
            </div>
            <div className="flex items-center gap-6 md:gap-8">
              <ScoreRing score={aiAnalysis.overallScore} size={80} label="Geral" />
              <ScoreRing score={aiAnalysis.economyScore} size={80} label="Economia" />
              <ScoreRing score={aiAnalysis.safetyScore} size={80} label="Segurança" />
            </div>
          </div>
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cost trend */}
          <div className="bg-[#0f1a2e] border border-[#1e2d4a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-white">Tendência de Custos</h2>
                <p className="text-xs text-slate-500 mt-0.5">Custo mensal de combustível (R$)</p>
              </div>
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-full">
                6 meses
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyCostTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCusto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f1a2e', border: '1px solid #1e2d4a', borderRadius: 8, color: '#e2e8f0' }}
                  formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, 'Custo']}
                />
                <Area type="monotone" dataKey="custo" stroke="#3b82f6" strokeWidth={2} fill="url(#gradCusto)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Efficiency by vehicle */}
          <div className="bg-[#0f1a2e] border border-[#1e2d4a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-white">Eficiência por Veículo</h2>
                <p className="text-xs text-slate-500 mt-0.5">km/L real vs esperado</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-blue-400"><span className="w-3 h-1 bg-blue-500 rounded inline-block" />Real</span>
                <span className="flex items-center gap-1 text-slate-500"><span className="w-3 h-1 bg-slate-600 rounded inline-block" />Esperado</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vehicleEfficiencyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
                <XAxis dataKey="vehicle" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[2, 3.8]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f1a2e', border: '1px solid #1e2d4a', borderRadius: 8, color: '#e2e8f0' }}
                  formatter={(v) => [`${Number(v).toFixed(2)} km/L`, '']}
                />
                <Bar dataKey="real" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="esperado" fill="#334155" radius={[3, 3, 0, 0]} />
                <ReferenceLine y={avgKmL} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Média', fill: '#f59e0b', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Main content: Insights + Ranking ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* AI Insights */}
          <div className="xl:col-span-3 bg-[#0f1a2e] border border-[#1e2d4a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Brain size={16} className="text-purple-400" />
                  <h2 className="text-sm font-semibold text-white">Insights Gerados por IA</h2>
                </div>
                <span className="flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-500/20">
                  <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
                  Analisando
                </span>
              </div>
              <span className="text-xs text-slate-500">{insights.length} insights</span>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {insights.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onDismiss={() => setInsights(insights.filter(i => i.id !== insight.id))}
                />
              ))}
              {insights.length === 0 && (
                <div className="text-center py-10">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Todos os insights revisados</p>
                </div>
              )}
            </div>
          </div>

          {/* Driver ranking */}
          <div className="xl:col-span-2 bg-[#0f1a2e] border border-[#1e2d4a] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Ranking de Eficiência</h2>
            </div>
            <div className="space-y-3">
              {driverRanking.map((d, i) => {
                const scoreColor = d.score >= 80 ? 'text-emerald-400' : d.score >= 65 ? 'text-amber-400' : 'text-red-400'
                const scoreBar = d.score >= 80 ? 'bg-emerald-500' : d.score >= 65 ? 'bg-amber-500' : 'bg-red-500'
                return (
                  <div key={d.driverId} className="flex items-center gap-3 p-3 rounded-xl bg-[#162035] border border-[#1e2d4a] hover:border-blue-500/30 transition-all">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      i === 0 ? 'bg-amber-500/20 text-amber-400' :
                      i === 1 ? 'bg-slate-500/20 text-slate-400' :
                      i === 2 ? 'bg-orange-700/20 text-orange-500' :
                      'bg-[#1e2d4a] text-slate-500'
                    )}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-white truncate">{d.name}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          {d.trend === 'up' ? (
                            <ChevronUp size={12} className="text-emerald-400" />
                          ) : d.trend === 'down' ? (
                            <ChevronDown size={12} className="text-red-400" />
                          ) : null}
                          <span className={cn('text-sm font-bold', scoreColor)}>{d.score}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-[#1e2d4a] rounded-full overflow-hidden mb-1.5">
                        <div className={cn('h-full rounded-full transition-all', scoreBar)} style={{ width: `${d.score}%` }} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{d.kmPerLiter.toFixed(2)} km/L</span>
                        <span>R$ {d.costPerKm.toFixed(2)}/km</span>
                        {d.events > 0 && (
                          <span className="text-amber-500">{d.events} eventos</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Economy potential summary */}
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-xs font-semibold text-emerald-400 mb-1">💡 Economia potencial identificada</p>
              <p className="text-xs text-slate-400">
                Se João Santos atingir o nível de Fernando Vieira, a economia estimada é de{' '}
                <span className="text-emerald-400 font-medium">R$ 890/mês</span> só com o veículo TTD7I46.
              </p>
            </div>
          </div>
        </div>

        {/* ── Fuel log table ── */}
        <div className="bg-[#0f1a2e] border border-[#1e2d4a] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#1e2d4a]">
            <div className="flex items-center gap-2">
              <Fuel size={16} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Histórico de Abastecimentos</h2>
            </div>
            <span className="text-xs text-slate-500">{records.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2d4a]">
                  {['Data', 'Veículo', 'Motorista', 'Litros', 'R$/L', 'Total', 'km/L', 'Eficiência', 'Posto'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d4a]">
                {records.slice(0, 15).map(r => {
                  const v = mockVehicles.find(x => x.id === r.vehicleId)
                  const expected = v?.avgConsumption ?? 3.0
                  const efficiency = r.kmPerLiter ? (r.kmPerLiter / expected) * 100 : null
                  return (
                    <tr key={r.id} className="hover:bg-[#162035] transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-white font-mono">{r.vehiclePlate}</td>
                      <td className="px-4 py-3 text-xs text-slate-300 whitespace-nowrap">{r.driverName ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{r.liters.toFixed(0)} L</td>
                      <td className="px-4 py-3 text-xs text-slate-300">R$ {r.pricePerLiter.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-white">R$ {r.totalCost.toFixed(2).replace('.', ',')}</td>
                      <td className="px-4 py-3 text-xs">
                        {r.kmPerLiter ? (
                          <span className={trendColor(r.kmPerLiter, expected)}>
                            {r.kmPerLiter.toFixed(2)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {efficiency !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[#1e2d4a] rounded-full overflow-hidden">
                              <div
                                className={cn('h-full rounded-full', efficiency >= 100 ? 'bg-emerald-500' : efficiency >= 90 ? 'bg-amber-500' : 'bg-red-500')}
                                style={{ width: `${Math.min(efficiency, 120)}%` }}
                              />
                            </div>
                            <span className={cn('text-xs font-medium', efficiency >= 100 ? 'text-emerald-400' : efficiency >= 90 ? 'text-amber-400' : 'text-red-400')}>
                              {efficiency.toFixed(0)}%
                            </span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap truncate max-w-32">{r.station}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <FuelModal onClose={() => setShowModal(false)} onSave={addRecord} />
      )}
    </div>
  )
}
