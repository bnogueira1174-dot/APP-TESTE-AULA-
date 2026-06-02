import { mockFuelRecords, driverRanking } from './mock-fuel'
import { mockVehicles, mockDrivers, mockNotifications } from './mock-data'

export type InsightType = 'alert' | 'warning' | 'info' | 'success' | 'prediction'

export interface AIInsight {
  id: string
  type: InsightType
  title: string
  description: string
  metric?: string
  metricLabel?: string
  impact?: string
  vehicleId?: string
  driverId?: string
  confidence: number // 0–100
  timestamp: string
}

export interface AIAnalysis {
  overallScore: number
  economyScore: number
  safetyScore: number
  potentialSavings: number
  potentialSavingsPct: number
  insights: AIInsight[]
  fleetAvgKmL: number
  bestDriver: string
  worstDriver: string
  anomalyCount: number
}

function calcFleetAvgKmL(): number {
  const records = mockFuelRecords.filter((r) => r.kmPerLiter !== null)
  return records.reduce((s, r) => s + (r.kmPerLiter ?? 0), 0) / records.length
}

function calcPotentialSavings(): { value: number; pct: number } {
  // If all drivers matched fleet best performer (Kauã, 3.30 km/L)
  const bestKmL = 3.30
  const avgKmL = calcFleetAvgKmL()
  const avgCostPerL = 6.18
  // Monthly consumption estimate: 8760 liters
  const monthlyLiters = 8760
  const currentCost = monthlyLiters * avgCostPerL
  const optimizedKm = monthlyLiters * bestKmL
  const currentKm = monthlyLiters * avgKmL
  const savedLiters = (optimizedKm - currentKm) / bestKmL
  const saved = savedLiters * avgCostPerL
  return { value: saved, pct: (saved / currentCost) * 100 }
}

export function generateAIAnalysis(): AIAnalysis {
  const fleetAvgKmL = calcFleetAvgKmL()
  const savings = calcPotentialSavings()
  const highEvents = mockNotifications.filter((n) => n.priority === 'high' && !n.read).length
  const now = new Date().toISOString()

  const insights: AIInsight[] = [
    {
      id: 'ai-1',
      type: 'alert',
      title: 'Consumo Anômalo Detectado',
      description:
        'Veículo TTD7I46 apresentou consumo médio de 2.81 km/L nos últimos 30 dias, 17.4% abaixo do esperado (3.4 km/L). Padrão consistente com condução agressiva e motor em marcha lenta excessiva.',
      metric: '-17.4%',
      metricLabel: 'abaixo do esperado',
      impact: 'R$ 890/mês de custo adicional',
      vehicleId: 'v2',
      driverId: 'd2',
      confidence: 94,
      timestamp: now,
    },
    {
      id: 'ai-2',
      type: 'warning',
      title: 'Padrão Agressivo de Aceleração',
      description:
        'João Santos registrou 5 eventos de aceleração brusca e 2 frenagens abruptas nos últimos 7 dias. Este comportamento aumenta o consumo em até 22% e reduz a vida útil dos pneus.',
      metric: '5 eventos',
      metricLabel: 'nos últimos 7 dias',
      impact: '+22% no consumo estimado',
      driverId: 'd2',
      confidence: 91,
      timestamp: now,
    },
    {
      id: 'ai-3',
      type: 'prediction',
      title: 'Previsão de Consumo — Próxima Semana',
      description:
        'Com base nos padrões atuais de condução e rotas programadas, o consumo estimado para a próxima semana é de 2.180 litros, gerando um custo estimado de R$ 13.472. Redução possível de 8% com ajuste de rotas.',
      metric: '2.180 L',
      metricLabel: 'consumo previsto',
      impact: 'Economia potencial: R$ 1.078',
      confidence: 87,
      timestamp: now,
    },
    {
      id: 'ai-4',
      type: 'success',
      title: 'Motorista em Destaque',
      description:
        'Fernando Vieira manteve eficiência de 3.30 km/L nos últimos 3 abastecimentos, superando a média da frota em 9.6%. Zero eventos de condução agressiva. Candidato ideal para mentor da equipe.',
      metric: '3.30 km/L',
      metricLabel: 'eficiência mantida',
      impact: 'Economia de R$ 187/mês vs média',
      driverId: 'd3',
      confidence: 98,
      timestamp: now,
    },
    {
      id: 'ai-5',
      type: 'info',
      title: 'Potencial de Economia Identificado',
      description:
        `Se todos os motoristas atingissem a eficiência de Fernando Vieira (3.30 km/L), a frota economizaria R$ ${savings.value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} por mês — redução de ${savings.pct.toFixed(1)}% no custo de combustível. Recomendado: programa de treinamento de eco-driving.`,
      metric: `R$ ${(savings.value / 1000).toFixed(1)}k`,
      metricLabel: 'economia mensal possível',
      impact: `${savings.pct.toFixed(1)}% de redução no custo`,
      confidence: 85,
      timestamp: now,
    },
    {
      id: 'ai-6',
      type: 'warning',
      title: 'LTH7E27 — Eficiência em Queda',
      description:
        'Veículo LTH7E27 apresenta consumo 7.1% abaixo do esperado. Combinado com o status de manutenção preventiva atrasada, há risco de falha mecânica nos próximos 15–30 dias. Revisão urgente recomendada.',
      metric: '-7.1%',
      metricLabel: 'eficiência vs esperado',
      impact: 'Risco de parada não-planejada',
      vehicleId: 'v5',
      confidence: 79,
      timestamp: now,
    },
    {
      id: 'ai-7',
      type: 'info',
      title: 'Horário de Pico Identificado',
      description:
        'Análise de telemetria mostra que abastecimentos entre 11h–14h têm custo médio 4.2% maior que abastecimentos no período 07h–09h. Sugerido ajuste no planejamento de rotas para otimização de abastecimento.',
      metric: '-4.2%',
      metricLabel: 'redução possível por horário',
      impact: 'Economia de R$ 234/mês',
      confidence: 73,
      timestamp: now,
    },
  ]

  return {
    overallScore: 74,
    economyScore: 71,
    safetyScore: 78,
    potentialSavings: savings.value,
    potentialSavingsPct: savings.pct,
    insights,
    fleetAvgKmL: parseFloat(fleetAvgKmL.toFixed(2)),
    bestDriver: 'Fernando Vieira',
    worstDriver: 'João Santos',
    anomalyCount: 3,
  }
}

export const aiAnalysis = generateAIAnalysis()
