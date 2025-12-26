import { Memory } from '@mastra/memory'
import { LibSQLStore } from '@mastra/libsql'
import { workingMemorySchema } from './types.js'

// LibSQL storage for persistence
export const storage = new LibSQLStore({
  url: 'file:mastra.db',
})

// Memory configuration with working memory schema
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
