/**
 * Pregnancy Utilities
 * Functions for calculating pregnancy weeks and related information
 */

export interface PregnancyWeekInfo {
  week: number
  title: string
  titleHindi: string
  description: string
  descriptionHindi: string
  nutritionTip: string
  nutritionTipHindi: string
  warningSigns: string[]
  warningSignsHindi: string[]
}

/**
 * Calculate current pregnancy week from expected delivery date
 */
export function calculatePregnancyWeek(expectedDeliveryDate: Date): number {
  const today = new Date()
  const daysDiff = Math.floor(
    (expectedDeliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  // Pregnancy is typically 40 weeks (280 days)
  const weeksRemaining = Math.ceil(daysDiff / 7)
  const currentWeek = 40 - weeksRemaining
  
  // Clamp between 1 and 42 weeks
  return Math.max(1, Math.min(42, currentWeek))
}

/**
 * Calculate expected delivery date from last menstrual period
 */
export function calculateEDDFromLMP(lastMenstrualPeriod: Date): Date {
  const edd = new Date(lastMenstrualPeriod)
  edd.setDate(edd.getDate() + 280) // 40 weeks = 280 days
  return edd
}

/**
 * Get pregnancy stage from week number
 */
export function getPregnancyStage(week: number): 'first_trimester' | 'second_trimester' | 'third_trimester' {
  if (week <= 12) return 'first_trimester'
  if (week <= 27) return 'second_trimester'
  return 'third_trimester'
}

/**
 * Get week information (simplified - full data in constants file)
 */
export function getWeekInfo(weekNumber: number): Partial<PregnancyWeekInfo> {
  const trimester = getPregnancyStage(weekNumber)
  
  return {
    week: weekNumber,
    title: `Week ${weekNumber}`,
    titleHindi: `${weekNumber} सप्ताह`,
    description: `You are in your ${trimester.replace('_', ' ')}`,
    descriptionHindi: `आप ${trimester === 'first_trimester' ? 'पहली' : trimester === 'second_trimester' ? 'दूसरी' : 'तीसरी'} तिमाही में हैं`,
    nutritionTip: 'Eat iron-rich foods daily',
    nutritionTipHindi: 'रोज़ आयरन युक्त भोजन खाएं',
    warningSigns: ['Heavy bleeding', 'Severe pain'],
    warningSignsHindi: ['भारी रक्तस्राव', 'तेज़ दर्द']
  }
}

/**
 * Get danger signs for specific week
 */
export function getDangerSignsForWeek(week: number): string[] {
  const signs: string[] = []
  
  if (week <= 12) {
    signs.push('Heavy bleeding', 'Severe cramping', 'Fainting')
  } else if (week <= 27) {
    signs.push('No fetal movement', 'Severe headache', 'Vision problems', 'Swelling')
  } else {
    signs.push('Decreased fetal movement', 'Severe pain', 'Water breaking', 'Heavy bleeding')
  }
  
  return signs
}

/**
 * Calculate days until delivery
 */
export function daysUntilDelivery(edd: Date): number {
  const today = new Date()
  const diff = edd.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

