'use client'

import { useState } from 'react'
import {
  Search, Filter, Truck, MapPin, Clock, Gauge, Fuel,
  Route, ChevronRight, Download,
} from 'lucide-react'
import { mockTrips, mockVehicles, mockDrivers } from '@/lib/mock-data'
import { getStatusColor, getStatusLabel, cn } from '@/lib/utils'

export default function TrajetosPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = mockTrips.filter((t) => {
    const matchSearch =
      t.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName.toLowerCase().includes(search.toLowerCase()) ||
      t.startLocation.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalKm = mockTrips.reduce((s, t) => s + t.distance, 0)
  const totalFuel = mockTrips.reduce((s, t) => s + t.fuelConsumed, 0)
  const avgSpeed = (mockTrips.reduce((s, t) => s + t.avgSpeed, 0) / mockTrips.length).toFixed(0)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trajetos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{mockTrips.length} trajetos registrados</p>
        </div>
        <button className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Download size={14} />
          Exportar
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total percorrido', value: `${totalKm.toFixed(0)} km`, icon: Route, color: 'text-blue-600 bg-blue-50' },
          { label: 'Combustível total', value: `${totalFuel.toFixed(0)} L`, icon: Fuel, color: 'text-amber-600 bg-amber-50' },
          { label: 'Velocidade média', value: `${avgSpeed} km/h`, icon: Gauge, color: 'text-emerald-600 bg-emerald-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.color.split(' ')[1])}>
              <s.icon size={20} className={s.color.split(' ')[0]} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por veículo, motorista..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'in-progress', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                statusFilter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              {s === 'all' ? 'Todos' : getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((trip) => (
          <div key={trip.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl shrink-0">
                  <Truck size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold text-slate-900 font-mono">{trip.vehiclePlate}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(trip.status))}>
                      {getStatusLabel(trip.status)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">{trip.driverName}</p>
                  <div className="flex items-start gap-1 mt-1.5">
                    <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">{trip.startLocation}</p>
                      {trip.endLocation && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <ChevronRight size={10} /> {trip.endLocation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { icon: Route, label: 'Distância', value: `${trip.distance.toFixed(1)} km` },
                  { icon: Clock, label: 'Duração', value: `${Math.floor(trip.duration / 60)}h ${trip.duration % 60}min` },
                  { icon: Gauge, label: 'Vel. média', value: `${trip.avgSpeed} km/h` },
                  { icon: Fuel, label: 'Combustível', value: `${trip.fuelConsumed.toFixed(1)} L` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-lg px-3 py-2">
                    <Icon size={13} className="text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
              <p className="text-xs text-slate-400">
                Início: {new Date(trip.startTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                {trip.endTime && (
                  <> · Fim: {new Date(trip.endTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</>
                )}
              </p>
              <a
                href="/rastreamento"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Ver no mapa <ChevronRight size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
