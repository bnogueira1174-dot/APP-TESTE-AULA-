'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Vehicle } from '@/types'
import { getStatusLabel } from '@/lib/utils'

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const statusColors: Record<string, string> = {
  active: '#10b981',
  alert: '#ef4444',
  maintenance: '#f59e0b',
  inactive: '#94a3b8',
}

function createVehicleIcon(status: string, speed: number, heading: number) {
  const color = statusColors[status] ?? '#64748b'
  const isMoving = speed > 0
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        ${isMoving ? `<div style="position:absolute;width:44px;height:44px;border-radius:50%;background:${color}28;animation:fping 1.5s ease infinite;"></div>` : ''}
        <div style="
          width:34px;height:34px;border-radius:50%;
          background:white;border:3px solid ${color};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 3px 10px rgba(0,0,0,0.3);
          position:relative;z-index:1;
        ">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" style="transform:rotate(${heading}deg)">
            <path d="M12 2l-4 18 4-4 4 4z"/>
          </svg>
        </div>
      </div>
      <style>@keyframes fping{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.2);opacity:0}}</style>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  })
}

// Predefined round-trip route endpoints in Curitiba for up to 5 vehicles.
// Each entry: [startLat, startLng, endLat, endLng]
// Routes are ~5 km one-way (→ ~10 km round trip via OSRM).
const ROUTE_ENDPOINTS: [number, number, number, number][] = [
  // v0-slot: Centro → Água Verde
  [-25.4296, -49.2714, -25.4510, -49.2880],
  // v1-slot: Portão → CIC
  [-25.4640, -49.2850, -25.4810, -49.3100],
  // v2-slot: Boa Vista → Ahú
  [-25.3970, -49.2750, -25.4200, -49.2700],
  // v3-slot: Batel → Rebouças
  [-25.4420, -49.2895, -25.4370, -49.2630],
  // v4-slot: Cajuru → Capão da Imbuia
  [-25.4220, -49.2350, -25.4440, -49.2380],
]

// Fetch a driving route from OSRM public API and return [lat, lng] pairs
async function fetchOSRMRoute(
  start: [number, number],
  end: [number, number]
): Promise<[number, number][]> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${start[1]},${start[0]};${end[1]},${end[0]}` +
      `?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (data.routes?.[0]?.geometry?.coordinates) {
      // GeoJSON returns [lng, lat] — flip to [lat, lng] for Leaflet
      return data.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      )
    }
  } catch {
    // Network error or OSRM down — return straight line fallback
  }
  return [start, end]
}

// Utility: heading in degrees between two points
function calcHeading(from: [number, number], to: [number, number]): number {
  const dLng = to[1] - from[1]
  const dLat = to[0] - from[0]
  return ((Math.atan2(dLng, -dLat) * 180) / Math.PI + 360) % 360
}

// Utility: haversine distance in km
function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLng = ((b[1] - a[1]) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

const TICK_S = 0.5 // 500 ms tick
const SPEED_KMH = 45 // average urban truck speed

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1 })
  }, [center, map])
  return null
}

interface VehicleSim {
  lat: number
  lng: number
  speed: number
  heading: number
  segIdx: number
  segProg: number
}

interface Props {
  vehicles: Vehicle[]
  onVehicleClick?: (vehicle: Vehicle) => void
  selectedVehicleId?: string | null
}

export default function FleetMap({ vehicles, onVehicleClick, selectedVehicleId }: Props) {
  const [liveVehicles, setLiveVehicles] = useState(vehicles)
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null)
  // Loaded road-following routes per vehicle id
  const routesRef = useRef<Record<string, [number, number][]>>({})
  // Segment lengths cache
  const segLenRef = useRef<Record<string, number[]>>({})
  // Per-vehicle simulation state
  const simRef = useRef<Record<string, VehicleSim>>({})
  // Track which routes have been requested
  const fetchedRef = useRef<Set<string>>(new Set())

  // Fetch OSRM routes for active vehicles
  useEffect(() => {
    vehicles.forEach((v, idx) => {
      if (v.status !== 'active') return
      if (fetchedRef.current.has(v.id)) return
      fetchedRef.current.add(v.id)

      const endpoints = ROUTE_ENDPOINTS[idx % ROUTE_ENDPOINTS.length]
      const start: [number, number] = [endpoints[0], endpoints[1]]
      const end: [number, number] = [endpoints[2], endpoints[3]]

      // Build round-trip: A → B then B → A
      Promise.all([
        fetchOSRMRoute(start, end),
        fetchOSRMRoute(end, start),
      ]).then(([there, back]) => {
        const full = [...there, ...back]
        routesRef.current[v.id] = full

        // Pre-compute segment lengths
        segLenRef.current[v.id] = full
          .slice(0, -1)
          .map((pos, i) => haversine(pos, full[i + 1]))

        // Initialise simulation state at a random point along route
        const startSeg = Math.floor(Math.random() * (full.length - 1))
        simRef.current[v.id] = {
          lat: full[startSeg][0],
          lng: full[startSeg][1],
          speed: SPEED_KMH,
          heading: calcHeading(full[startSeg], full[startSeg + 1] ?? full[0]),
          segIdx: startSeg,
          segProg: 0,
        }
      })
    })
  }, [vehicles])

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVehicles((prev) =>
        prev.map((v) => {
          if (v.status !== 'active') return v
          const route = routesRef.current[v.id]
          const segLens = segLenRef.current[v.id]
          const st = simRef.current[v.id]
          if (!route || !segLens || !st || route.length < 2) return v

          // Realistic speed: vary ±8 km/h around average
          const spd = Math.max(15, Math.min(70, SPEED_KMH + (Math.random() * 16 - 8)))
          const distKm = (spd / 3600) * TICK_S
          const segLen = segLens[st.segIdx] || 0.00001
          const delta = distKm / segLen

          let prog = st.segProg + delta
          let seg = st.segIdx
          const total = route.length - 1

          while (prog >= 1 && total > 0) {
            prog -= 1
            seg = (seg + 1) % total
          }

          const from = route[seg]
          const to = route[seg + 1] ?? route[0]
          const lat = from[0] + (to[0] - from[0]) * prog
          const lng = from[1] + (to[1] - from[1]) * prog
          const heading = calcHeading(from, to)

          simRef.current[v.id] = { lat, lng, speed: Math.round(spd), heading, segIdx: seg, segProg: prog }
          return { ...v, lat, lng, speed: Math.round(spd), heading }
        })
      )
    }, TICK_S * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedVehicleId) {
      const v = liveVehicles.find((v) => v.id === selectedVehicleId)
      if (v) setFlyTo([v.lat, v.lng])
    }
  }, [selectedVehicleId, liveVehicles])

  if (liveVehicles.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-[#070d1a] text-slate-400 gap-3">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5h-2"/>
          <circle cx="7" cy="19" r="2"/><circle cx="15" cy="19" r="2"/>
          <path d="M7 17h8"/>
        </svg>
        <p className="text-sm font-medium">Nenhum veículo cadastrado</p>
        <p className="text-xs">Adicione veículos para visualizar no mapa</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={[-25.4296, -49.2733]}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={flyTo} />

      {liveVehicles.map((v) => {
        const route = routesRef.current[v.id]
        return (
          <div key={v.id}>
            {route && route.length > 1 && v.status === 'active' && (
              <Polyline
                positions={route}
                pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.3, dashArray: '8 5' }}
              />
            )}
            <Marker
              position={[v.lat, v.lng]}
              icon={createVehicleIcon(v.status, v.speed, v.heading ?? 0)}
              eventHandlers={{ click: () => onVehicleClick?.(v) }}
            >
              <Popup>
                <div style={{ minWidth: 210, fontFamily: 'system-ui, sans-serif' }}>
                  <div style={{ background: '#0f1729', color: 'white', margin: '-12px -16px 12px', padding: '10px 16px', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 14 }}>{v.plate}</strong>
                    <span style={{ fontSize: 11, background: statusColors[v.status] + '33', color: statusColors[v.status], padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                      {getStatusLabel(v.status)}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>{v.brand} {v.model}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: 6 }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>VELOCIDADE</p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{v.speed} km/h</p>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: 6 }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>COMBUSTÍVEL</p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: v.currentFuelLevel < 25 ? '#ef4444' : '#0f172a' }}>{v.currentFuelLevel}%</p>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: 6 }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>ODÔMETRO</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{v.odometer.toLocaleString()} km</p>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: 6 }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>MOTORISTA</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{v.driverId ? 'Vinculado' : '—'}</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        )
      })}
    </MapContainer>
  )
}
