'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Search, Filter, Layers, Navigation, Truck, Gauge, Fuel, User, AlertCircle } from 'lucide-react'
import { mockVehicles, mockDrivers } from '@/lib/mock-data'
import type { Vehicle } from '@/types'
import { getStatusColor, getStatusLabel, cn } from '@/lib/utils'

const FleetMap = dynamic(() => import('@/components/map/FleetMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Carregando mapa...</p>
      </div>
    </div>
  ),
})

function getDriver(driverId: string | null) {
  return driverId ? mockDrivers.find((d) => d.id === driverId) ?? null : null
}

export default function RastreamentoPage() {
  const [selected, setSelected] = useState<Vehicle | null>(null)
  const [search, setSearch] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)

  const filtered = mockVehicles.filter(
    (v) =>
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase())
  )

  const getDriver = (driverId: string | null) =>
    driverId ? mockDrivers.find((d) => d.id === driverId) : null

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden z-10">
          {/* Header */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900">Mapa / Rastreamento</h2>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
                {mockVehicles.filter((v) => v.status === 'active').length} ativos
              </span>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar veículo..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Vehicle list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((v) => {
              const driver = getDriver(v.driverId)
              const isSelected = selected?.id === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => setSelected(isSelected ? null : v)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-slate-50 transition-all hover:bg-slate-50',
                    isSelected ? 'bg-blue-50 border-blue-100' : ''
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{v.plate}</span>
                        <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', getStatusColor(v.status))}>
                          {getStatusLabel(v.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{v.brand} {v.model}</p>
                      {driver && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <User size={10} /> {driver.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">{v.speed} km/h</p>
                      <p className={cn('text-xs font-medium', v.currentFuelLevel < 25 ? 'text-red-500' : 'text-slate-400')}>
                        ⛽ {v.currentFuelLevel}%
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Summary */}
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-slate-900">{mockVehicles.length}</p>
                <p className="text-xs text-slate-500">Veículos</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600">{mockVehicles.filter(v => v.status === 'active').length}</p>
                <p className="text-xs text-slate-500">Ativos</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">{mockVehicles.filter(v => v.status === 'alert' || v.status === 'maintenance').length}</p>
                <p className="text-xs text-slate-500">Alertas</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map controls */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all"
          >
            <Layers size={14} />
            {showSidebar ? 'Ocultar lista' : 'Ver lista'}
          </button>
        </div>

        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-2 text-xs text-slate-600 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Tempo real
          </div>
        </div>

        <FleetMap
          vehicles={mockVehicles}
          onVehicleClick={setSelected}
          selectedVehicleId={selected?.id}
        />

        {/* Selected vehicle panel */}
        {selected && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">{selected.plate}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(selected.status))}>
                      {getStatusLabel(selected.status)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{selected.brand} {selected.model} · {selected.year}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-slate-700 text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {[
                  { icon: Gauge, label: 'Velocidade', value: `${selected.speed} km/h`, alert: selected.speed > 80 },
                  { icon: Fuel, label: 'Combustível', value: `${selected.currentFuelLevel}%`, alert: selected.currentFuelLevel < 25 },
                  { icon: Navigation, label: 'Odômetro', value: `${selected.odometer.toLocaleString()} km`, alert: false },
                  { icon: User, label: 'Motorista', value: getDriver(selected.driverId)?.name ?? 'Sem motorista', alert: !selected.driverId },
                ].map(({ icon: Icon, label, value, alert }) => (
                  <div key={label} className={cn('p-3 rounded-lg text-center', alert ? 'bg-red-50' : 'bg-slate-50')}>
                    <Icon size={16} className={cn('mx-auto mb-1', alert ? 'text-red-500' : 'text-slate-400')} />
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className={cn('text-sm font-bold mt-0.5', alert ? 'text-red-600' : 'text-slate-900')}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
