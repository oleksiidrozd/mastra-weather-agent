import { Mastra } from '@mastra/core/mastra'
import { storage, createAgentMemory } from './lib/memory.js'
import { weatherAgent } from './agents/weatherAgent.js'

// Re-export for external use
export { storage, createAgentMemory }

export const mastra = new Mastra({
  storage,
  agents: { weatherAgent },
  bundler: {
    externals: ['chokidar'],
  },
})
