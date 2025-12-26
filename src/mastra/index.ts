import { Mastra } from '@mastra/core/mastra'
import { LibSQLStore } from '@mastra/libsql'
import { Memory } from '@mastra/memory'
import { workingMemorySchema } from './lib/types.js'

// LibSQL storage for persistence
export const storage = new LibSQLStore({
  url: 'file:mastra.db',
})

// Memory configuration with working memory schema
// This will be used by agents in Story 1.2
export const createAgentMemory = () => new Memory({
  storage,
  options: {
    lastMessages: 20,
    workingMemory: {
      enabled: true,
      schema: workingMemorySchema,
    },
  },
})

export const mastra = new Mastra({
  storage,
  // agents will be added in Story 1.2
})
