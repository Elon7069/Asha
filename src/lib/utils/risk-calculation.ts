/**
 * Risk Calculation Utilities
 * Functions for calculating health risk scores for beneficiaries
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface RiskAssessment {
  score: number
  level: RiskLevel
  color: string
  reasons: string[]
}

export interface UserProfile {
  is_high_risk?: boolean
  anemia_status?: 'none' | 'mild' | 'moderate' | 'severe' | 'unknown'
  previous_complications?: string | null
  current_pregnancy_week?: number | null
  last_hemoglobin_level?: number | null
}

export interface HealthLog {
  is_red_flag?: boolean
  symptom_severity?: 'mild' | 'moderate' | 'severe'
  ai_risk_score?: number
  created_at: string
}

export interface Visit {
  completed_date: string | null
  referral_made?: boolean
}

/**
 * Calculate risk score for a beneficiary
 */
export function calculateRiskScore(
  profile: UserProfile,
  recentLogs: HealthLog[] = [],
  visits: Visit[] = []
): RiskAssessment {
  let score = 0
  const reasons: string[] = []
  
  // Pregnancy risk factors
  if (profile.is_high_risk) {
    score += 30
    reasons.push('High risk pregnancy')
  }
  
  if (profile.anemia_status === 'severe') {
    score += 25
    reasons.push('Severe anemia')
  } else if (profile.anemia_status === 'moderate') {
    score += 15
    reasons.push('Moderate anemia')
  }
  
  if (profile.previous_complications) {
    score += 20
    reasons.push('Previous complications')
  }
  
  // Low hemoglobin
  if (profile.last_hemoglobin_level && profile.last_hemoglobin_level < 8) {
    score += 25
    reasons.push('Very low hemoglobin')
  } else if (profile.last_hemoglobin_level && profile.last_hemoglobin_level < 10) {
    score += 15
    reasons.push('Low hemoglobin')
  }
  
  // Recent health logs with red flags
  const recentRedFlags = recentLogs.filter(log => log.is_red_flag).length
  score += recentRedFlags * 15
  if (recentRedFlags > 0) {
    reasons.push(`${recentRedFlags} red flag(s) in recent logs`)
  }
  
  // Severe symptoms
  const severeSymptoms = recentLogs.filter(
    log => log.symptom_severity === 'severe'
  ).length
  score += severeSymptoms * 10
  if (severeSymptoms > 0) {
    reasons.push(`${severeSymptoms} severe symptom(s) reported`)
  }
  
  // Missed checkups
  const lastVisitDate = visits[0]?.completed_date
  if (lastVisitDate) {
    const daysSinceLastVisit = Math.floor(
      (new Date().getTime() - new Date(lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceLastVisit > 60) {
      score += 40
      reasons.push('No visit in over 60 days')
    } else if (daysSinceLastVisit > 30) {
      score += 20
      reasons.push('No visit in over 30 days')
    }
  } else {
    score += 30
    reasons.push('No visits recorded')
  }
  
  // AI risk score from logs
  const aiScores = recentLogs
    .filter(log => log.ai_risk_score)
    .map(log => log.ai_risk_score!)
  
  if (aiScores.length > 0) {
    const avgAIScore = aiScores.reduce((a, b) => a + b, 0) / aiScores.length
    score += Math.round(avgAIScore * 0.3) // 30% weight
  }
  
  // Cap at 100
  score = Math.min(score, 100)
  
  return {
    score,
    level: getRiskLevel(score),
    color: getRiskColor(getRiskLevel(score)),
    reasons
  }
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

/**
 * Get color for risk level
 */
export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return '#EF4444' // Red
    case 'high':
      return '#F97316' // Orange
    case 'medium':
      return '#F59E0B' // Amber
    case 'low':
      return '#10B981' // Green
  }
}

/**
 * Get risk badge class name
 */
export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'medium':
      return 'bg-amber-100 text-amber-800 border-amber-300'
    case 'low':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
}

