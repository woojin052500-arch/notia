export type PlanType = 'mini' | 'starter' | 'basic' | 'professional' | 'premium'

export interface PlanLimits {
  name: string
  maxStudents: number
  hasAiReport: boolean
  hasAiAdvancedReport: boolean
  hasAiCounseling: boolean
  hasAiMarketing: boolean
  hasEmotionFiltering: boolean
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  mini: {
    name: 'Mini',
    maxStudents: 10,
    hasAiReport: false,
    hasAiAdvancedReport: false,
    hasAiCounseling: false,
    hasAiMarketing: false,
    hasEmotionFiltering: false
  },
  starter: {
    name: 'Starter',
    maxStudents: 30,
    hasAiReport: true,
    hasAiAdvancedReport: false,
    hasAiCounseling: false,
    hasAiMarketing: false,
    hasEmotionFiltering: false
  },
  basic: {
    name: 'Basic',
    maxStudents: 70,
    hasAiReport: true,
    hasAiAdvancedReport: true,
    hasAiCounseling: true,
    hasAiMarketing: false,
    hasEmotionFiltering: false
  },
  professional: {
    name: 'Professional',
    maxStudents: 150,
    hasAiReport: true,
    hasAiAdvancedReport: true,
    hasAiCounseling: true,
    hasAiMarketing: true,
    hasEmotionFiltering: false
  },
  premium: {
    name: 'Premium',
    maxStudents: 9999, // Unlimited
    hasAiReport: true,
    hasAiAdvancedReport: true,
    hasAiCounseling: true,
    hasAiMarketing: true,
    hasEmotionFiltering: true
  }
}

export function getPlanLimits(planType: string | null | undefined): PlanLimits {
  const type = (planType?.toLowerCase() || 'starter') as PlanType
  return PLAN_LIMITS[type] || PLAN_LIMITS.starter
}
