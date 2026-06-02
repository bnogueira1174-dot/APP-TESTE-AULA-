export type VehicleStatus = 'active' | 'inactive' | 'maintenance' | 'alert'
export type FuelType = 'diesel' | 'gasoline' | 'flex' | 'electric'
export type DriverStatus = 'online' | 'offline' | 'on-trip'
export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer'
export type NotificationPriority = 'high' | 'medium' | 'low'
export type NotificationType =
  | 'speed'
  | 'maintenance'
  | 'fuel'
  | 'harsh-brake'
  | 'harsh-acceleration'
  | 'geofence'
  | 'idle-engine'
  | 'disconnection'

export interface Vehicle {
  id: string
  plate: string
  model: string
  brand: string
  year: number
  fuelType: FuelType
  avgConsumption: number
  tankCapacity: number
  currentFuelLevel: number
  driverId: string | null
  status: VehicleStatus
  lat: number
  lng: number
  speed: number
  heading: number
  odometer: number
  lastUpdate: string
  photo?: string
}

export interface Driver {
  id: string
  name: string
  email: string
  phone: string
  license: string
  licenseCategory: string
  licenseExpiry: string
  status: DriverStatus
  score: number
  totalTrips: number
  totalDistance: number
  vehicleId: string | null
  avatar?: string
  hireDate: string
  events: { date: string; type: string; description: string }[]
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: 'active' | 'inactive'
  permissions: string[]
  createdAt: string
  avatar?: string
  lastLogin?: string
}

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  message: string
  vehicleId: string
  vehiclePlate: string
  driverId?: string
  driverName?: string
  timestamp: string
  read: boolean
  location?: string
  value?: number
  unit?: string
}

export interface Trip {
  id: string
  vehicleId: string
  vehiclePlate: string
  driverId: string
  driverName: string
  startTime: string
  endTime?: string
  startLocation: string
  endLocation?: string
  distance: number
  duration: number
  avgSpeed: number
  maxSpeed: number
  fuelConsumed: number
  status: 'in-progress' | 'completed' | 'cancelled'
}

export interface Waypoint {
  lat: number
  lng: number
}
