import { Memory } from '@mastra/memory'
import { SupabaseStore } from './storage/index.js'
import { workingMemorySchema } from './types.js'

// Validate environment variable
if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error(
    'SUPABASE_DATABASE_URL environment variable is required. ' +
    'Please set it to your Supabase PostgreSQL connection string.'
  )
}

// Supabase storage for persistence
export const storage = new SupabaseStore({
  connectionString: process.env.SUPABASE_DATABASE_URL,
})

// Memory configuration with working memory schema
// scope: 'resource' ensures preferences persist across sessions (threads)
export const createAgentMemory = () => new Memory({
  storage,
  options: {
    lastMessages: 20,
    workingMemory: {
      enabled: true,
      schema: workingMemorySchema,
      scope: 'resource',
    },
  },
})
