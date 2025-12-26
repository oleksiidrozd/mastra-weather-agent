import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const convertTemperature = createTool({
  id: 'convertTemperature',
  description: 'Convert a temperature between Celsius and Fahrenheit. Use this when the user wants to know a temperature in a different unit.',
  inputSchema: z.object({
    temperature: z.number().describe('The temperature value to convert'),
    fromUnit: z.enum(['celsius', 'fahrenheit']).describe('The unit to convert from'),
    toUnit: z.enum(['celsius', 'fahrenheit']).describe('The unit to convert to'),
  }),
  outputSchema: z.object({
    originalValue: z.number(),
    originalUnit: z.enum(['celsius', 'fahrenheit']),
    convertedValue: z.number(),
    convertedUnit: z.enum(['celsius', 'fahrenheit']),
    formatted: z.string(),
  }),
  execute: async ({ context }) => {
    const { temperature, fromUnit, toUnit } = context

    let convertedValue: number

    if (fromUnit === toUnit) {
      convertedValue = temperature
    } else if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
      // C to F: (C × 9/5) + 32
      convertedValue = Math.round((temperature * 9 / 5) + 32)
    } else {
      // F to C: (F - 32) × 5/9
      convertedValue = Math.round((temperature - 32) * 5 / 9)
    }

    const fromSymbol = fromUnit === 'celsius' ? '°C' : '°F'
    const toSymbol = toUnit === 'celsius' ? '°C' : '°F'

    return {
      originalValue: temperature,
      originalUnit: fromUnit,
      convertedValue,
      convertedUnit: toUnit,
      formatted: `${temperature}${fromSymbol} is ${convertedValue}${toSymbol}`,
    }
  },
})
