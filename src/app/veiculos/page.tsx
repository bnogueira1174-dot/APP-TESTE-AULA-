'use client'

import { useState } from 'react'
import {
  Plus, Search, Edit, Trash2, Upload, X, Fuel, Gauge, Truck, Wrench,
  ChevronLeft, ChevronRight, Camera, Check,
} from 'lucide-react'
import { mockVehicles, mockDrivers } from '@/lib/mock-data'
import type { Vehicle, FuelType, VehicleStatus } from '@/types'
import { getStatusColor, getStatusLabel, cn } from '@/lib/utils'

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'gasoline', label: 'Gasolina' },
  { value: 'flex', label: 'Flex' },
  { value: 'electric', label: 'Elétrico' },
]

const STATUS_OPTIONS: { value: VehicleStatus; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'alert', label: 'Alerta' },
]

const PER_PAGE = 6

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; vehicle?: Vehicle } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Vehicle>>({})
  const [view, setView] = useState<'grid' | 'table'>('grid')

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function openAdd() {
    setForm({ fuelType: 'diesel', status: 'active', currentFuelLevel: 100, year: 2024, tankCapacity: 300 })
    setModal({ mode: 'add' })
  }

  function openEdit(v: Vehicle) {
    setForm({ ...v })
    setModal({ mode: 'edit', vehicle: v })
  }

  function save() {
    if (modal?.mode === 'add') {
      const nv: Vehicle = {
        id: `v${Date.now()}`,
        plate: form.plate ?? '',
        model: form.model ?? '',
        brand: form.brand ?? '',
        year: form.year ?? 2024,
        fuelType: form.fuelType ?? 'diesel',
        avgConsumption: form.avgConsumption ?? 3.0,
        tankCapacity: form.tankCapacity ?? 300,
        currentFuelLevel: form.currentFuelLevel ?? 100,
        driverId: form.driverId ?? null,
        status: form.status ?? 'active',
        lat: -25.4284,
        lng: -49.2733,
        speed: 0,
        heading: 0,
        odometer: form.odometer ?? 0,
        lastUpdate: new Date().toISOString(),
      }
      setVehicles([...vehicles, nv])
    } else if (modal?.vehicle) {
      setVehicles(vehicles.map((v) => (v.id === modal.vehicle!.id ? { ...v, ...form } as Vehicle : v)))
    }
    setModal(null)
  }

  function del() {
    if (deleteId) {
      setVehicles(vehicles.filter((v) => v.id !== deleteId))
      setDeleteId(null)
    }
  }

  const getDriver = (id: string | null) =>
    id ? mockDrivers.find((d) => d.id === id) : null

  const fuelColor = (level: number) =>
    level < 25 ? 'text-red-600' : level < 50 ? 'text-amber-600' : 'text-emerald-600'

  const statusBgMap: Record<VehicleStatus, string> = {
    active: 'border-emerald-200 bg-emerald-50/30',
    alert: 'border-red-200 bg-red-50/30',
    maintenance: 'border-amber-200 bg-amber-50/30',
    inactive: 'border-slate-200 bg-slate-50/30',
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Veículos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{vehicles.length} veículos na frota</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Novo Veículo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {STATUS_OPTIONS.map((s) => {
          const count = vehicles.filter((v) => v.status === s.value).length
          return (
            <div key={s.value} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Filters + view toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar placa, marca, modelo..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex gap-2">
          {['all', ...STATUS_OPTIONS.map((s) => s.value)].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                statusFilter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              {s === 'all' ? 'Todos' : STATUS_OPTIONS.find((x) => x.value === s)?.label}
            </button>
          ))}
        </div>
        <div className="flex border border-slate-200 rounded-lg overflow-hidden ml-auto">
          {(['grid', 'table'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-2 text-xs font-medium transition-colors',
                view === v ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              {v === 'grid' ? '⊞ Cards' : '≡ Tabela'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((v) => {
            const driver = getDriver(v.driverId)
            return (
              <div
                key={v.id}
                className={cn('bg-white rounded-xl border-2 p-5 hover:shadow-md transition-all', statusBgMap[v.status])}
              >
                {/* Photo placeholder */}
                <div className="relative mb-4">
                  <div className="w-full h-36 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                    <Truck size={40} className="text-slate-300" />
                  </div>
                  <span className={cn('absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(v.status))}>
                    {getStatusLabel(v.status)}
                  </span>
                </div>

                {/* Info */}
                <div className="mb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{v.plate}</h3>
                      <p className="text-sm text-slate-500">{v.brand} {v.model}</p>
                      <p className="text-xs text-slate-400">{v.year} · {getStatusLabel(v.fuelType)}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <Gauge size={14} className="text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Consumo</p>
                    <p className="text-sm font-bold text-slate-900">{v.avgConsumption} km/L</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <Fuel size={14} className={cn('mx-auto mb-1', fuelColor(v.currentFuelLevel))} />
                    <p className="text-xs text-slate-500">Combustível</p>
                    <p className={cn('text-sm font-bold', fuelColor(v.currentFuelLevel))}>{v.currentFuelLevel}%</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <Wrench size={14} className="text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Hodômetro</p>
                    <p className="text-sm font-bold text-slate-900">{(v.odometer / 1000).toFixed(0)}k km</p>
                  </div>
                </div>

                {/* Driver */}
                <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    {driver ? driver.name.charAt(0) : '?'}
                  </div>
                  <div className="text-xs">
                    <p className="font-medium text-slate-700">{driver?.name ?? 'Sem motorista'}</p>
                    {driver && <p className="text-slate-400">CNH {driver.licenseCategory}</p>}
                  </div>
                </div>

                {/* Fuel bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Nível de combustível</span>
                    <span>{v.currentFuelLevel}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', v.currentFuelLevel < 25 ? 'bg-red-500' : v.currentFuelLevel < 50 ? 'bg-amber-500' : 'bg-emerald-500')}
                      style={{ width: `${v.currentFuelLevel}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(v)}
                    className="flex-1 py-2 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteId(v.id)}
                    className="p-2 text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg hover:border-red-200 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table view */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Placa', 'Modelo', 'Ano', 'Combustível', 'Consumo', 'Nível', 'Hodômetro', 'Motorista', 'Status', 'Ações'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paged.map((v) => {
                  const driver = getDriver(v.driverId)
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 text-sm">{v.plate}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{v.brand} {v.model}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{v.year}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{getStatusLabel(v.fuelType)}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{v.avgConsumption} km/L</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', v.currentFuelLevel < 25 ? 'bg-red-500' : v.currentFuelLevel < 50 ? 'bg-amber-500' : 'bg-emerald-500')}
                              style={{ width: `${v.currentFuelLevel}%` }}
                            />
                          </div>
                          <span className={cn('text-xs font-medium', fuelColor(v.currentFuelLevel))}>{v.currentFuelLevel}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{v.odometer.toLocaleString()} km</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{driver?.name ?? '—'}</td>
                      <td className="px-5 py-4">
                        <span className={cn('text-xs px-2 py-1 rounded-full font-medium', getStatusColor(v.status))}>
                          {getStatusLabel(v.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(v)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => setDeleteId(v.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">{filtered.length} veículos</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-slate-700 font-medium">{page} / {Math.max(1, totalPages)}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-900">
                {modal.mode === 'add' ? 'Novo Veículo' : `Editar ${modal.vehicle?.plate}`}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Photo upload */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                <Camera size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Clique para fazer upload da foto do veículo</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG até 5MB</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Placa</label>
                  <input
                    value={form.plate ?? ''}
                    onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                    placeholder="ABC1D23"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Marca</label>
                  <input
                    value={form.brand ?? ''}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="VW/MAN, Mercedes-Benz..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Modelo</label>
                  <input
                    value={form.model ?? ''}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="26.260 Crm 6x2 4p"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Ano</label>
                  <input
                    type="number"
                    value={form.year ?? 2024}
                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Combustível</label>
                  <select
                    value={form.fuelType ?? 'diesel'}
                    onChange={(e) => setForm({ ...form, fuelType: e.target.value as FuelType })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {FUEL_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Consumo médio (km/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.avgConsumption ?? 3.0}
                    onChange={(e) => setForm({ ...form, avgConsumption: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Cap. do tanque (L)</label>
                  <input
                    type="number"
                    value={form.tankCapacity ?? 300}
                    onChange={(e) => setForm({ ...form, tankCapacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Motorista vinculado</label>
                  <select
                    value={form.driverId ?? ''}
                    onChange={(e) => setForm({ ...form, driverId: e.target.value || null })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="">Sem motorista</option>
                    {mockDrivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Status</label>
                  <select
                    value={form.status ?? 'active'}
                    onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={save} className="ml-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                {modal.mode === 'add' ? 'Cadastrar veículo' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">Remover veículo?</h3>
            <p className="text-sm text-slate-500 text-center mt-1 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
              <button onClick={del} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
