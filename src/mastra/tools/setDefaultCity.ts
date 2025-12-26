import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const setDefaultCity = createTool({
  id: 'setDefaultCity',
  description: 'Confirm setting the user\'s default city for weather queries. Call this tool when the user wants to set or change their default city. The agent should also update working memory with the new default_city value.',
  inputSchema: z.object({
    city: z.string().describe('The city name to set as the default (e.g., "London", "Tokyo", "New York")'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    city: z.string(),
  }),
  execute: async ({ context }) => {
    const { city } = context

    // Validate city name is not empty
    if (!city || city.trim().length === 0) {
      return {
        success: false,
        message: 'City name cannot be empty',
        city: '',
      }
    }

    // Return success - the agent will handle updating working memory
    // through its built-in working memory update capability
    return {
      success: true,
      message: `Default city set to ${city}`,
      city: city.trim(),
    }
  },
})
