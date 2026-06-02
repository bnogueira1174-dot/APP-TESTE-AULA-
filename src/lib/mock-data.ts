import type { Vehicle, Driver, User, Notification, Trip } from '@/types'

export const mockVehicles: Vehicle[] = []

export const mockDrivers: Driver[] = []

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Admin Sistema',
    email: 'admin@frota.com.br',
    phone: '(41) 3333-0001',
    role: 'admin',
    status: 'active',
    permissions: ['all'],
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
]

export const mockNotifications: Notification[] = []

export const mockTrips: Trip[] = []

export const consumptionChartData: { day: string; consumo: number; custo: number }[] = []

export const speedChartData: { hour: string; avg: number; max: number }[] = []

export const monthlyKpiData: { month: string; km: number; custo: number }[] = []
