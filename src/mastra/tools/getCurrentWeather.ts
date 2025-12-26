import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { fetchWeather } from '../lib/weatherApi.js'
import { ErrorCodes } from '../lib/errorCodes.js'

export const getCurrentWeather = createTool({
  id: 'getCurrentWeather',
  description: 'Get the current weather for a specified city. Returns temperature, conditions, humidity, and more.',
  inputSchema: z.object({
    city: z.string().describe('The city name to get weather for (e.g., "Paris", "Tokyo", "New York")'),
  }),
  outputSchema: z.union([
    z.object({
      success: z.literal(true),
      data: z.object({
        city: z.string(),
        country: z.string(),
        temperature: z.number(),
        feelsLike: z.number(),
        humidity: z.number(),
        conditions: z.string(),
        description: z.string(),
        windSpeed: z.number(),
        icon: z.string(),
      }),
    }),
    z.object({
      success: z.literal(false),
      errorCode: z.enum([
        ErrorCodes.CITY_NOT_FOUND,
        ErrorCodes.API_KEY_INVALID,
        ErrorCodes.API_UNAVAILABLE,
        ErrorCodes.RATE_LIMITED,
      ]),
    }),
  ]),
  execute: async ({ context }) => {
    const { city } = context
    return fetchWeather(city)
  },
})
