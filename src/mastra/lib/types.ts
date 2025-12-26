import { z } from 'zod'

export const workingMemorySchema = z.object({
  default_city: z.string().optional(),
  preferred_units: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  user_name: z.string().optional()
})

export type WorkingMemory = z.infer<typeof workingMemorySchema>
