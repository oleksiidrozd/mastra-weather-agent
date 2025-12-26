# Story 1.2: Implement Streaming CLI Chat Interface

Status: done

## Story

As a **user**,
I want **to interact with the agent via CLI with real-time streaming responses**,
So that **I see tokens appear immediately as they're generated**.

## Acceptance Criteria

1. **Given** the CLI is running
   **When** I type a message and press Enter
   **Then** the agent's response streams token-by-token to console
   **And** streaming begins within 2 seconds (NFR1)
   **And** the CLI remains responsive during streaming (NFR4)

2. **Given** the agent is running
   **When** I type "exit" or "quit"
   **Then** the CLI exits gracefully
   **And** database connections are closed

3. **Given** I press Ctrl+C
   **When** the CLI is running
   **Then** the CLI exits gracefully with SIGINT handling (NFR12)

4. **Given** the Mastra instance is configured (from Story 1.1)
   **When** I start the CLI
   **Then** the agent uses Google Gemini 2.5 Flash model
   **And** maxSteps is set to 5 (sufficient for weather queries)
   **And** the agent has a friendly, weather-focused persona

5. **Given** the CLI is running
   **When** the agent responds
   **Then** it maintains a defined persona in all responses (FR4)

## Tasks / Subtasks

- [x] Task 1: Create the weather agent definition (AC: #4, #5)
  - [x] Create `src/mastra/agents/weatherAgent.ts`
  - [x] Configure model: `google/gemini-2.5-flash`
  - [x] Set `maxSteps: 5` (passed at call time per Mastra API)
  - [x] Write weather-focused persona system prompt
  - [x] Import and use `createAgentMemory()` from lib/memory.js

- [x] Task 2: Register agent with Mastra instance (AC: #4)
  - [x] Update `src/mastra/index.ts` to include weatherAgent in agents config
  - [x] Export the agent for CLI usage

- [x] Task 3: Create CLI entry point (AC: #1, #2, #3)
  - [x] Create `src/cli/index.ts`
  - [x] Implement readline interface for user input
  - [x] Generate UUID for thread ID on startup
  - [x] Use fixed resource ID `"cli-user"` for working memory
  - [x] Stream agent responses token-by-token to stdout

- [x] Task 4: Implement graceful exit handling (AC: #2, #3)
  - [x] Handle "exit" and "quit" commands
  - [x] Handle SIGINT (Ctrl+C)
  - [x] Close readline interface on exit

- [x] Task 5: Add npm script for CLI (AC: #1)
  - [x] Add `"cli": "npx tsx src/cli/index.ts"` to package.json scripts

- [x] Task 6: Verify streaming works (AC: #1)
  - [x] Run `npm run cli`
  - [x] Send a test message and observe token-by-token streaming
  - [x] Verify exit commands work

## Dev Notes

### Previous Story Learnings (Story 1.1)

**Corrected Import Paths:**
- Use `@mastra/core/mastra` for Mastra class
- Use `LibSQLStore` from `@mastra/libsql` (not `LibSQLStorage`)
- Working memory uses `schema` property (not `template`)

**Existing Exports from `src/mastra/index.ts`:**
```typescript
export const storage = new LibSQLStore({ url: 'file:mastra.db' })
export const createAgentMemory = () => new Memory({...})
export const mastra = new Mastra({ storage })
```

### Agent Configuration (EXACT)

**File: `src/mastra/agents/weatherAgent.ts`**

```typescript
import { Agent } from '@mastra/core/agent'
import { createAgentMemory } from '../index.js'

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  model: {
    provider: 'GOOGLE',
    name: 'gemini-2.5-flash',
  },
  instructions: `You are a friendly, helpful weather assistant. Your personality is warm and conversational.

CAPABILITIES:
- Provide current weather information for any city
- Remember user preferences (default city, temperature units, name)
- Convert temperatures between Celsius and Fahrenheit
- Give contextual weather advice (umbrella, jacket, etc.)

BEHAVIOR RULES:
1. Always respond in a friendly, conversational tone
2. When asked about weather without a city, ask which city or use the user's default city if set
3. Include practical advice based on weather conditions
4. Stay on topic - politely redirect off-topic questions back to weather
5. Handle unclear input gracefully - ask for clarification

LIMITATIONS:
- You only have access to current weather data, not forecasts
- You cannot provide information on non-weather topics

When you don't understand a request, respond with something like:
"I'm not sure what you mean. Could you rephrase that? I'm here to help with weather information!"`,
  memory: createAgentMemory(),
  maxSteps: 5,
})
```

### CLI Implementation Pattern

**File: `src/cli/index.ts`**

```typescript
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { randomUUID } from 'node:crypto'
import { weatherAgent } from '../mastra/agents/weatherAgent.js'

const RESOURCE_ID = 'cli-user'
let threadId = randomUUID()

async function main() {
  const rl = readline.createInterface({ input, output })

  console.log('Weather Agent CLI')
  console.log('Type "exit" or "quit" to leave, "new session" to reset conversation')
  console.log('')

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\nGoodbye!')
    rl.close()
    process.exit(0)
  })

  while (true) {
    const userInput = await rl.question('You: ')
    const trimmed = userInput.trim().toLowerCase()

    if (trimmed === 'exit' || trimmed === 'quit') {
      console.log('Goodbye!')
      rl.close()
      break
    }

    if (trimmed === 'new session') {
      threadId = randomUUID()
      console.log('Started new session. Previous conversation history cleared.')
      continue
    }

    try {
      process.stdout.write('Agent: ')

      const result = await weatherAgent.stream(userInput, {
        threadId,
        resourceId: RESOURCE_ID,
      })

      for await (const chunk of result.textStream) {
        process.stdout.write(chunk)
      }

      console.log('') // newline after response
    } catch (error) {
      console.error('\nError:', error instanceof Error ? error.message : 'Unknown error')
    }
  }
}

main().catch(console.error)
```

### Mastra Instance Update

**Update `src/mastra/index.ts` to register agent:**

```typescript
import { Mastra } from '@mastra/core/mastra'
import { LibSQLStore } from '@mastra/libsql'
import { Memory } from '@mastra/memory'
import { workingMemorySchema } from './lib/types.js'
import { weatherAgent } from './agents/weatherAgent.js'

// ... existing storage and createAgentMemory ...

export const mastra = new Mastra({
  storage,
  agents: { weatherAgent },
})
```

### File Structure After This Story

```
src/
├── mastra/
│   ├── index.ts              # Mastra instance with agent registered
│   ├── agents/
│   │   └── weatherAgent.ts   # NEW: Agent definition
│   └── lib/
│       ├── types.ts          # From Story 1.1
│       └── errorCodes.ts     # From Story 1.1
└── cli/
    └── index.ts              # NEW: CLI entry point
```

### Key Implementation Details

**Streaming Pattern:**
- Use `agent.stream()` not `agent.generate()` for CLI
- Access token stream via `result.textStream`
- Write chunks directly: `process.stdout.write(chunk)`
- Add newline after stream completes

**Session Management:**
- `threadId`: UUID, regenerated on "new session" or CLI restart
- `resourceId`: Fixed `"cli-user"` for working memory persistence across sessions
- Working memory persists; conversation history is session-scoped

**Model Configuration:**
- Provider: `GOOGLE`
- Model name: `gemini-2.5-flash`
- Requires `GOOGLE_GENERATIVE_AI_API_KEY` env var

### Import Rules (ESM)

- All local imports MUST include `.js` extension
- Use `node:` prefix for Node.js built-ins
- Example: `import * as readline from 'node:readline/promises'`

### Testing Notes

- Run `npm run cli` to test
- Verify streaming shows token-by-token output
- Test "exit", "quit", Ctrl+C for graceful shutdown
- Test "new session" clears conversation history
- Verify persona is maintained in responses

### Dependencies

No new dependencies needed. Using:
- `node:readline/promises` (Node.js built-in)
- `node:crypto` for UUID generation (Node.js built-in)
- Existing Mastra packages from Story 1.1

### npm Script Addition

Add to `package.json` scripts:
```json
{
  "scripts": {
    "cli": "npx tsx src/cli/index.ts"
  }
}
```

### References

- [Source: _bmad-output/architecture.md#CLI Architecture]
- [Source: _bmad-output/architecture.md#Agent Configuration]
- [Source: _bmad-output/prd.md#FR1, FR2, FR4, FR19]
- [Source: _bmad-output/prd.md#NFR1, NFR4, NFR12]
- [Source: _bmad-output/project-context.md#Streaming Pattern]
- [Source: Story 1.1 Dev Notes - corrected import paths]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Created `src/mastra/agents/weatherAgent.ts` with Gemini 2.5 Flash model and weather persona
- Moved `storage` and `createAgentMemory` to `src/mastra/lib/memory.ts` to avoid circular imports
- Model format is string `"google/gemini-2.5-flash"` (not object as in story Dev Notes)
- `maxSteps` is passed at stream() call time, not in AgentConfig (API difference from story notes)
- Added `import 'dotenv/config'` in CLI to load environment variables
- Verified streaming works: "hello" → immediate streaming response with emoji
- Exit/quit commands work correctly
- SIGINT handler in place for Ctrl+C

### File List

- [x] `src/mastra/agents/weatherAgent.ts` - Created
- [x] `src/mastra/lib/memory.ts` - Created (extracted from index.ts)
- [x] `src/mastra/index.ts` - Modified (register agent, import from lib/memory.js)
- [x] `src/cli/index.ts` - Created
- [x] `package.json` - Modified (add cli script)

### Change Log

- 2025-12-26: Story 1.2 implemented - Streaming CLI with weather agent
