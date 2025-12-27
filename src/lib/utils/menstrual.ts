/**
 * Menstrual Cycle Utilities
 * Functions for calculating period predictions and fertile windows
 */

export interface PeriodPrediction {
  nextPeriod: Date
  fertileStart: Date
  fertileEnd: Date
  confidence: number
}

export interface CyclePhase {
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
  dayInCycle: number
  daysUntilNextPeriod: number
}

/**
 * Predict next period date based on last period and average cycle length
 */
export function predictNextPeriod(
  lastPeriodDate: Date,
  avgCycleLength: number = 28
): PeriodPrediction {
  const nextPeriod = new Date(lastPeriodDate)
  nextPeriod.setDate(nextPeriod.getDate() + avgCycleLength)
  
  // Fertile window is typically 6 days: 5 days before ovulation + ovulation day
  // Ovulation usually occurs 14 days before next period
  const fertileStart = new Date(nextPeriod)
  fertileStart.setDate(fertileStart.getDate() - 16) // Ovulation day - 2
  
  const fertileEnd = new Date(nextPeriod)
  fertileEnd.setDate(fertileEnd.getDate() - 12) // Ovulation day + 2
  
  // Confidence based on cycle regularity (simplified)
  const confidence = avgCycleLength >= 26 && avgCycleLength <= 30 ? 0.85 : 0.70
  
  return {
    nextPeriod,
    fertileStart,
    fertileEnd,
    confidence
  }
}

/**
 * Calculate fertile window from next period date
 */
export function calculateFertileWindow(nextPeriod: Date): { start: Date; end: Date } {
  const fertileStart = new Date(nextPeriod)
  fertileStart.setDate(fertileStart.getDate() - 16)
  
  const fertileEnd = new Date(nextPeriod)
  fertileEnd.setDate(fertileEnd.getDate() - 12)
  
  return { start: fertileStart, end: fertileEnd }
}

/**
 * Get current cycle phase
 */
export function getCyclePhase(
  currentDate: Date,
  lastPeriodDate: Date,
  avgCycleLength: number = 28
): CyclePhase {
  const daysSincePeriod = Math.floor(
    (currentDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  const dayInCycle = (daysSincePeriod % avgCycleLength) + 1
  
  let phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
  
  if (dayInCycle <= 5) {
    phase = 'menstrual'
  } else if (dayInCycle <= 13) {
    phase = 'follicular'
  } else if (dayInCycle <= 15) {
    phase = 'ovulation'
  } else {
    phase = 'luteal'
  }
  
  const daysUntilNextPeriod = avgCycleLength - dayInCycle
  
  return {
    phase,
    dayInCycle,
    daysUntilNextPeriod
  }
}

/**
 * Calculate average cycle length from historical data
 */
export function calculateAverageCycleLength(periodDates: Date[]): number {
  if (periodDates.length < 2) return 28 // Default
  
  const cycles: number[] = []
  
  for (let i = 1; i < periodDates.length; i++) {
    const days = Math.floor(
      (periodDates[i].getTime() - periodDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    )
    if (days >= 21 && days <= 35) { // Valid cycle range
      cycles.push(days)
    }
  }
  
  if (cycles.length === 0) return 28
  
  const sum = cycles.reduce((a, b) => a + b, 0)
  return Math.round(sum / cycles.length)
}

