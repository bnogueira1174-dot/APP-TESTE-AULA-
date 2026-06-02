'use client'

import { useState } from 'react'
import {
  Search, Star, Trophy, AlertTriangle, Video, Upload,
  Play, Clock, MapPin, Gauge, Route, ChevronDown, ChevronUp,
  Phone, Mail, X, BookOpen,
} from 'lucide-react'
import { mockDrivers, mockTrips } from '@/lib/mock-data'
import type { Driver } from '@/types'
import { getStatusColor, getStatusLabel, cn } from '@/lib/utils'

const SCORE_COLORS = {
  excellent: 'text-emerald-600',
  good: 'text-blue-600',
  regular: 'text-amber-600',
  poor: 'text-red-600',
}

function scoreLabel(score: number) {
  if (score >= 90) return { label: 'Excelente', color: SCORE_COLORS.excellent, bg: 'bg-emerald-50' }
  if (score >= 75) return { label: 'Bom', color: SCORE_COLORS.good, bg: 'bg-blue-50' }
  if (score >= 60) return { label: 'Regular', color: SCORE_COLORS.regular, bg: 'bg-amber-50' }
  return { label: 'Crítico', color: SCORE_COLORS.poor, bg: 'bg-red-50' }
}

const mockVideos = [
  { id: 'vid1', driverId: 'd1', title: 'Treinamento Direção Defensiva', duration: '32:15', date: '2026-05-10', type: 'training', thumb: '' },
  { id: 'vid2', driverId: 'd1', title: 'Evento Direção Distraída — 15:45', duration: '01:20', date: '2026-05-20', type: 'event', thumb: '' },
  { id: 'vid3', driverId: 'd2', title: 'Treinamento Manuseio de Cargas', duration: '45:00', date: '2026-04-28', type: 'training', thumb: '' },
  { id: 'vid4', driverId: 'd2', title: 'Evento Aceleração Brusca — 09:13', duration: '00:45', date: '2026-05-20', type: 'event', thumb: '' },
  { id: 'vid5', driverId: 'd3', title: 'Treinamento Normas de Segurança', duration: '28:40', date: '2026-05-15', type: 'training', thumb: '' },
]

export default function MotoristasPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Driver | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'trips' | 'videos'>('profile')
  const [expandEvents, setExpandEvents] = useState(false)

  const filtered = mockDrivers.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const driverTrips = selected ? mockTrips.filter((t) => t.driverId === selected.id) : []
  const driverVideos = selected ? mockVideos.filter((v) => v.driverId === selected.id) : []

  const avg = (arr: Driver[], key: keyof Driver) =>
    arr.reduce((s, d) => s + (d[key] as number), 0) / arr.length

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Driver list */}
      <div className="w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 mb-3">Motoristas / Vídeos</h2>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar motorista..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'on-trip', 'online', 'offline'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'flex-1 py-1 text-xs rounded-full font-medium border transition-all',
                  statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-500 border-slate-200 hover:border-slate-300'
                )}
              >
                {s === 'all' ? 'Todos' : s === 'on-trip' ? 'Viagem' : s === 'online' ? 'Online' : 'Offline'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((d) => {
            const score = scoreLabel(d.score)
            return (
              <button
                key={d.id}
                onClick={() => { setSelected(d); setActiveTab('profile') }}
                className={cn(
                  'w-full text-left px-4 py-3.5 border-b border-slate-50 transition-all hover:bg-slate-50',
                  selected?.id === d.id ? 'bg-blue-50 border-blue-100' : ''
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {d.name.charAt(0)}
                    </div>
                    <div className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white',
                      d.status === 'on-trip' ? 'bg-blue-500' : d.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{d.name}</p>
                    <p className="text-xs text-slate-500">{getStatusLabel(d.status)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn('text-sm font-bold', score.color)}>{d.score}</p>
                    <p className="text-xs text-slate-400">score</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Fleet score summary */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs font-medium text-slate-600 mb-2">Score médio da frota</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${avg(mockDrivers, 'score')}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-900">{avg(mockDrivers, 'score').toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Right: Detail panel */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Selecione um motorista</h3>
            <p className="text-sm text-slate-400 mt-1">Clique em um motorista para ver o perfil completo</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Driver header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
                  {selected.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selected.name}</h2>
                      <p className="text-sm text-slate-500 mt-0.5">CNH categoria {selected.licenseCategory} · Nº {selected.license}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Validade: {selected.licenseExpiry} · Admitido em {selected.hireDate}</p>
                    </div>
                    <span className={cn('text-sm px-3 py-1 rounded-full font-medium', getStatusColor(selected.status))}>
                      {getStatusLabel(selected.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      {selected.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      {selected.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-slate-800">Score de Direção</span>
                  </div>
                  <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold', scoreLabel(selected.score).bg, scoreLabel(selected.score).color)}>
                    <Trophy size={14} />
                    {selected.score} — {scoreLabel(selected.score).label}
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', selected.score >= 90 ? 'bg-emerald-500' : selected.score >= 75 ? 'bg-blue-500' : selected.score >= 60 ? 'bg-amber-500' : 'bg-red-500')}
                    style={{ width: `${selected.score}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Viagens', value: selected.totalTrips },
                    { label: 'Km rodados', value: `${(selected.totalDistance / 1000).toFixed(0)}k` },
                    { label: 'Eventos', value: selected.events.length },
                    { label: 'Vídeos', value: mockVideos.filter((v) => v.driverId === selected.id).length },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4">
              {(['profile', 'trips', 'videos'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  )}
                >
                  {tab === 'profile' ? 'Eventos' : tab === 'trips' ? 'Histórico de Viagens' : 'Vídeos'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-5">
              {activeTab === 'profile' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Eventos de Direção</h3>
                    {selected.events.length > 0 && (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">{selected.events.length} eventos</span>
                    )}
                  </div>
                  {selected.events.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Trophy size={22} className="text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">Nenhum evento registrado</p>
                      <p className="text-xs text-slate-400 mt-1">Ótima performance!</p>
                    </div>
                  ) : (
                    selected.events.map((ev, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{ev.description}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{ev.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'trips' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900 mb-4">Histórico de Viagens</h3>
                  {driverTrips.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">Nenhuma viagem encontrada</p>
                  ) : driverTrips.map((trip) => (
                    <div key={trip.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900 text-sm">{trip.vehiclePlate}</span>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full', getStatusColor(trip.status))}>
                              {getStatusLabel(trip.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                            <MapPin size={10} />
                            <span className="truncate">{trip.startLocation}</span>
                            {trip.endLocation && <><span>→</span><span className="truncate">{trip.endLocation}</span></>}
                          </div>
                          <div className="grid grid-cols-4 gap-3">
                            {[
                              { icon: Route, label: `${trip.distance.toFixed(1)} km` },
                              { icon: Clock, label: `${Math.floor(trip.duration / 60)}h ${trip.duration % 60}min` },
                              { icon: Gauge, label: `${trip.avgSpeed} km/h` },
                            ].map(({ icon: Icon, label }) => (
                              <div key={label} className="flex items-center gap-1 text-xs text-slate-600">
                                <Icon size={12} className="text-slate-400" />
                                {label}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-500">{trip.startTime.slice(0, 10)}</p>
                          <p className="text-xs text-amber-600 font-medium mt-1">{trip.fuelConsumed.toFixed(1)} L</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Central de Vídeos</h3>
                    <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                      <Upload size={13} />
                      Upload de vídeo
                      <input type="file" accept="video/*" className="hidden" />
                    </label>
                  </div>

                  {driverVideos.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
                      <Video size={32} className="text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">Nenhum vídeo enviado</p>
                      <p className="text-xs text-slate-300 mt-1">Faça upload de vídeos de treinamento ou eventos</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {driverVideos.map((vid) => (
                        <div key={vid.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                          <div className="w-20 h-14 bg-slate-900 rounded-lg flex items-center justify-center relative shrink-0 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                            <div className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center cursor-pointer transition-colors z-10">
                              <Play size={14} className="text-white ml-0.5" fill="white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-800 truncate">{vid.title}</p>
                              <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
                                vid.type === 'event' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                              )}>
                                {vid.type === 'event' ? 'Evento' : 'Treinamento'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span className="flex items-center gap-1"><Clock size={10} />{vid.duration}</span>
                              <span>{vid.date}</span>
                            </div>
                          </div>
                          <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100">
                            <Play size={14} fill="currentColor" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
