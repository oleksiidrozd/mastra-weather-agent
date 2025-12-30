import { Agent } from '@mastra/core/agent'
import { createAgentMemory } from '../lib/memory.js'
import { getCurrentWeather, setDefaultCity, setPreferredUnits, convertTemperature } from '../tools/index.js'
import { buildInstructions } from './templates/index.js'

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  model: 'google/gemini-2.5-flash',
  instructions: buildInstructions({
    agentName: 'Sunny',
    defaultUnit: 'celsius',
  }),
  memory: createAgentMemory(),
  tools: {
    getCurrentWeather,
    setDefaultCity,
    setPreferredUnits,
    convertTemperature,
  },
})
