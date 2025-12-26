import { ErrorCodes, type ErrorCode } from './errorCodes.js'

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

export interface WeatherData {
  city: string
  country: string
  temperature: number
  feelsLike: number
  humidity: number
  conditions: string
  description: string
  windSpeed: number
  icon: string
}

export type WeatherApiResult =
  | { success: true; data: WeatherData }
  | { success: false; errorCode: ErrorCode }

export async function fetchWeather(city: string): Promise<WeatherApiResult> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!apiKey) {
    return { success: false, errorCode: ErrorCodes.API_KEY_INVALID }
  }

  const url = new URL(API_BASE_URL)
  url.searchParams.set('q', city)
  url.searchParams.set('appid', apiKey)
  url.searchParams.set('units', 'metric')

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url.toString(), {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      switch (response.status) {
        case 401:
          return { success: false, errorCode: ErrorCodes.API_KEY_INVALID }
        case 404:
          return { success: false, errorCode: ErrorCodes.CITY_NOT_FOUND }
        case 429:
          return { success: false, errorCode: ErrorCodes.RATE_LIMITED }
        default:
          return { success: false, errorCode: ErrorCodes.API_UNAVAILABLE }
      }
    }

    const data = await response.json()

    return {
      success: true,
      data: {
        city: data.name,
        country: data.sys?.country ?? '',
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        conditions: data.weather[0]?.main ?? 'Unknown',
        description: data.weather[0]?.description ?? '',
        windSpeed: Math.round(data.wind?.speed ?? 0),
        icon: data.weather[0]?.icon ?? '',
      },
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, errorCode: ErrorCodes.API_UNAVAILABLE }
    }
    return { success: false, errorCode: ErrorCodes.API_UNAVAILABLE }
  }
}
