export const ErrorCodes = {
  CITY_NOT_FOUND: 'CITY_NOT_FOUND',
  API_KEY_INVALID: 'API_KEY_INVALID',
  API_UNAVAILABLE: 'API_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]
