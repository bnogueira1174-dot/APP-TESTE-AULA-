export interface FuelRecord {
  id: string
  vehicleId: string
  vehiclePlate: string
  driverId: string | null
  driverName: string | null
  date: string
  liters: number
  pricePerLiter: number
  totalCost: number
  odometer: number
  kmSinceLast: number | null
  kmPerLiter: number | null
  station: string
}

export const mockFuelRecords: FuelRecord[] = []

export const monthlyCostTrend: { month: string; custo: number; litros: number; media: number }[] = []

export const vehicleEfficiencyData: { vehicle: string; real: number; esperado: number; economia: number }[] = []

export const driverRanking: { driverId: string; name: string; score: number; kmPerLiter: number; costPerKm: number; events: number; trend: string }[] = []
