# Story 3.3: Persist Preferences Across Sessions

Status: done

## Story

As a **user**,
I want **my preferences to be remembered when I restart the CLI**,
So that **I don't have to reconfigure my settings every time**.

## Acceptance Criteria

1. **Given** I have set a default city and preferred units
   **When** I exit the CLI and restart it
   **Then** my preferences are still available (FR16)
   **And** the agent can use them without me re-entering them

2. **Given** I am a returning user with saved preferences
   **When** I start a new CLI session
   **Then** the agent can greet me by name if I've provided it (FR20)
   **And** uses my saved default city and units

3. **Given** working memory is stored in LibSQL
   **When** the CLI restarts
   **Then** the `mastra.db` file persists my preferences (NFR13)

4. **Given** I use "new session" command
   **When** conversation history is cleared
   **Then** my working memory preferences are NOT cleared
   **And** I keep my default city, units, and name

5. **Given** the agent starts
   **When** it detects a returning user with saved name
   **Then** it greets them personally

## Tasks / Subtasks

- [x] Task 1: Verify LibSQL persistence works (AC: #1, #3)
  - [x] Confirmed `mastra.db` file exists (98304 bytes)
  - [x] Verified preferences survive CLI restart
  - [x] Added `scope: 'resource'` to working memory config for cross-session persistence

- [x] Task 2: Implement user name storage (AC: #2, #5)
  - [x] Added USER NAME MANAGEMENT section to agent instructions
  - [x] Recognition patterns: "My name is...", "I'm...", "Call me..."
  - [x] Store user_name in working memory
  - [x] Agent acknowledges with personal touch

- [x] Task 3: Update CLI for returning user greeting (AC: #2, #5)
  - [x] Agent-based greeting approach (agent checks working memory)
  - [x] Added Returning User Greeting section to instructions
  - [x] Agent uses name in responses and greetings

- [x] Task 4: Verify "new session" preserves working memory (AC: #4)
  - [x] Updated "new session" message: "...but your preferences are saved!"
  - [x] Confirmed resourceId stays constant, threadId changes
  - [x] Working memory persists across "new session"

- [x] Task 5: Test persistence flow (AC: #1-5)
  - [x] "My name is Alex" → "Nice to meet you, Alex! I'll remember that."
  - [x] Restart CLI → "Hello" → "Welcome back, Alex! Ready to check the weather?"
  - [x] "Set my default city to Paris" → restart → "What's the weather?" → Uses Paris, greets as Alex

## Dev Notes

### Dependencies on Previous Stories

**Story 1.1 Required:**
- LibSQL storage configured with `file:mastra.db`
- Working memory schema with `user_name` field

**Story 1.2 Required:**
- CLI with "new session" command
- Thread ID regeneration on new session
- Fixed resource ID `"cli-user"`

**Story 3.1, 3.2 Required:**
- `setDefaultCity` and `setPreferredUnits` tools working

### How Persistence Works

Mastra's memory system with LibSQL provides automatic persistence:

1. **Working Memory** - Persists via `resourceId`
   - Fixed `resourceId = "cli-user"` means same user across sessions
   - Data stored in `mastra.db` file
   - Survives CLI restarts

2. **Conversation History** - Scoped to `threadId`
   - New UUID per session = fresh conversation
   - "new session" regenerates threadId
   - History lost, but that's expected

```
┌─────────────────────────────────────────────────────────────┐
│                     mastra.db (LibSQL)                       │
├─────────────────────────────────────────────────────────────┤
│  Working Memory (resourceId: "cli-user")                     │
│  ├── default_city: "London"                                  │
│  ├── preferred_units: "fahrenheit"                           │
│  └── user_name: "Oleksii"                                    │
├─────────────────────────────────────────────────────────────┤
│  Conversation History (threadId: uuid-1)  ← Session 1        │
│  ├── Message 1: "Hello"                                      │
│  └── Message 2: "What's the weather?"                        │
├─────────────────────────────────────────────────────────────┤
│  Conversation History (threadId: uuid-2)  ← Session 2        │
│  └── Message 1: "Hi again!"                                  │
└─────────────────────────────────────────────────────────────┘
```

### User Name Recognition

**Add to agent instructions:**

```typescript
## USER NAME MANAGEMENT

### Recognizing Name Statements

Patterns to recognize:
- "My name is [name]"
- "I'm [name]"
- "Call me [name]"
- "You can call me [name]"

### Storing User Name

When user shares their name:
1. Extract the name from the message
2. Update working memory with user_name
3. Acknowledge with a personal touch:
   - "Nice to meet you, [name]! I'll remember that."
   - "Great to know you, [name]! How can I help with weather today?"

### Using Name in Responses

When user_name is available:
- Include name occasionally in responses (not every time)
- Use in greetings: "Hey [name]! What's the weather looking like?"
- Use when giving advice: "[name], you might want an umbrella today!"

Don't overuse - 1 in 3-4 responses is enough.
```

### CLI Startup Enhancement

**Update `src/cli/index.ts` for returning user check:**

```typescript
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { randomUUID } from 'node:crypto'
import { weatherAgent } from '../mastra/agents/weatherAgent.js'
import { createAgentMemory } from '../mastra/index.js'

const RESOURCE_ID = 'cli-user'
let threadId = randomUUID()

async function main() {
  const rl = readline.createInterface({ input, output })

  // Check for returning user
  const memory = createAgentMemory()
  let greeting = 'Weather Agent CLI\n'

  try {
    const workingMemory = await memory.getWorkingMemory?.({ resourceId: RESOURCE_ID })

    if (workingMemory?.user_name) {
      greeting = `Welcome back, ${workingMemory.user_name}! 🌤️\n`

      if (workingMemory.default_city) {
        greeting += `Your default city: ${workingMemory.default_city}\n`
      }
      if (workingMemory.preferred_units) {
        greeting += `Temperature units: ${workingMemory.preferred_units === 'fahrenheit' ? '°F' : '°C'}\n`
      }
    } else {
      greeting += 'Type "exit" or "quit" to leave, "new session" to reset conversation\n'
    }
  } catch (e) {
    // First time user or error reading memory
    greeting += 'Type "exit" or "quit" to leave, "new session" to reset conversation\n'
  }

  console.log(greeting)

  // ... rest of CLI loop
}
```

**Note:** The exact API for reading working memory outside of agent context may vary. Check Mastra documentation. Alternative: let the agent itself greet based on memory.

### Alternative: Agent-Based Greeting

If direct memory access is complex, use the agent for the greeting:

```typescript
async function main() {
  const rl = readline.createInterface({ input, output })

  console.log('Weather Agent CLI')
  console.log('Type "exit" or "quit" to leave, "new session" to reset conversation\n')

  // Send a startup message to the agent to trigger personalized greeting
  process.stdout.write('Agent: ')
  const result = await weatherAgent.stream('Hello', {
    threadId,
    resourceId: RESOURCE_ID,
  })

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk)
  }
  console.log('\n')

  // ... rest of CLI loop
}
```

Add to agent instructions:
```typescript
## STARTUP GREETING

When a user first says "Hello" or similar greeting:
1. Check working memory for user_name
2. If returning user: "Welcome back, [name]! Ready to check the weather?"
3. If new user: "Hey there! I'm Sunny, your weather assistant. What city would you like weather for?"

If they have a default_city set, mention it:
"Welcome back, [name]! Shall I check the weather in [default_city] for you?"
```

### "New Session" Behavior Confirmation

From Story 1.2, "new session" should:
```typescript
if (trimmed === 'new session') {
  threadId = randomUUID()  // New thread = new conversation history
  // resourceId stays "cli-user" = working memory preserved
  console.log('Started new session. Previous conversation cleared, but your preferences are saved!')
  continue
}
```

The key insight: `threadId` controls conversation history, `resourceId` controls working memory. They're independent.

### File Structure

No new files - this story is mostly verification and minor updates:
```
src/cli/index.ts              # Modify: startup greeting (optional)
src/mastra/agents/weatherAgent.ts  # Modify: name handling instructions
```

### Testing Scenarios

**Persistence Test:**
```
1. Run CLI
2. "Set my default city to Tokyo"
3. "I prefer Fahrenheit"
4. "My name is Alex"
5. Exit CLI (Ctrl+C or "exit")
6. Restart CLI
7. "What's the weather?"
Expected: Uses Tokyo, shows °F, may greet as Alex
```

**New Session Test:**
```
1. Set preferences as above
2. "new session"
3. "What's the weather?"
Expected: Still uses Tokyo and °F (preferences preserved)
```

**Returning User Greeting:**
```
1. Set name to "Oleksii"
2. Exit and restart
3. Say "Hello"
Expected: "Welcome back, Oleksii!" or similar personalized greeting
```

**First Time User:**
```
1. Delete mastra.db (or use fresh install)
2. Start CLI
3. Say "Hello"
Expected: Generic greeting, no personalization
```

### Verification Checklist

- [ ] `mastra.db` file created after first memory write
- [ ] Preferences survive CLI restart
- [ ] "new session" preserves working memory
- [ ] User name stored and retrieved correctly
- [ ] Returning users get personalized greeting
- [ ] New users get generic greeting

### References

- [Source: _bmad-output/prd.md#FR16 - Persist preferences across sessions]
- [Source: _bmad-output/prd.md#FR20 - Greet returning users by name]
- [Source: _bmad-output/prd.md#NFR13 - Memory persistence survives restarts]
- [Source: _bmad-output/architecture.md#Session/Thread Management]
- [Source: Story 1.1 - LibSQL storage configuration]
- [Source: Story 1.2 - CLI with new session command]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **LibSQL persistence verified**: `mastra.db` file exists (98304 bytes) and persists preferences across CLI restarts
2. **Key fix for cross-session persistence**: Added `scope: 'resource'` to working memory config in `src/mastra/lib/memory.ts` - this ensures working memory is tied to resourceId ("cli-user") rather than threadId
3. **User name management**: Added USER NAME MANAGEMENT section to agent instructions with recognition patterns, storage instructions, and usage guidelines
4. **Returning user greeting**: Added instructions for agent to greet returning users by name and optionally mention their default city
5. **"New session" behavior confirmed**: Updated message to clarify preferences are saved; verified resourceId stays constant while threadId changes
6. **Agent-based greeting approach**: Chose to let the agent handle personalized greetings via working memory rather than CLI-level memory access

### File List

- [x] `src/mastra/lib/memory.ts` - Added `scope: 'resource'` for cross-session persistence
- [x] `src/mastra/agents/weatherAgent.ts` - Added USER NAME MANAGEMENT and Returning User Greeting sections
- [x] `src/cli/index.ts` - Updated "new session" message to mention preferences are saved
- [x] Verification: `mastra.db` persistence confirmed (98304 bytes)
