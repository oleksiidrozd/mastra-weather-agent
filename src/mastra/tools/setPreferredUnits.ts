import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const setPreferredUnits = createTool({
  id: 'setPreferredUnits',
  description: 'Set the user\'s preferred temperature units for weather display. Choose between Celsius (°C) or Fahrenheit (°F). The agent should also update working memory with the new preferred_units value.',
  inputSchema: z.object({
    units: z.enum(['celsius', 'fahrenheit']).describe('Temperature unit preference: "celsius" or "fahrenheit"'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    units: z.enum(['celsius', 'fahrenheit']),
    unitSymbol: z.string(),
  }),
  execute: async ({ context }) => {
    const { units } = context

    const unitSymbol = units === 'fahrenheit' ? '°F' : '°C'

    return {
      success: true,
      message: `Temperature units set to ${units} (${unitSymbol})`,
      units,
      unitSymbol,
    }
  },
})
