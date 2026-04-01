export const AI_PATTERNS = {
  DOCTOR_RECOMMENDATION: 'ai.doctor-recommendation.request',
  SPECIALTY_SUGGESTION: 'ai.specialty-suggestion.request',
} as const;

export type AiPattern = (typeof AI_PATTERNS)[keyof typeof AI_PATTERNS];
