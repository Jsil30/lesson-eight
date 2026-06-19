export interface MonthMetric {
  month: string
  year: number
  facility: string
  revenue: number
  attendance: number
  newMembers: number
  membershipAvgMonths: number
  groupClasses: number
  individualSessions: number
  dropIns: number
  workoutsLogged: number
  nutritionRevenue: number
  privateTrainingRevenue: number
  gearRevenue: number
  supplementsRevenue: number
}

/** Cohesive chart color palette (indigo / teal / violet family). */
export const palette = {
  primary: '#6366f1',
  primarySoft: 'rgba(99, 102, 241, 0.55)',
  secondary: '#2dd4bf',
  secondarySoft: 'rgba(45, 212, 191, 0.18)',
  accent: '#a78bfa',
  accentSoft: 'rgba(167, 139, 250, 0.18)',
  grid: 'rgba(148, 163, 184, 0.12)',
  ticks: '#94a3b8',
}
