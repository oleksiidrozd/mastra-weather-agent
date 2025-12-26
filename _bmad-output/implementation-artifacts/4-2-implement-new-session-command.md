# Story 4.2: Implement New Session Command

Status: done

## Story

As a **user**,
I want **to start a fresh conversation session**,
So that **I can begin a new interaction without previous context**.

## Acceptance Criteria

1. **Given** I have an ongoing conversation with history
   **When** I type "new session" or "start over"
   **Then** a new thread ID is generated (FR18)
   **And** the conversation history is cleared
   **And** the agent greets me as if starting fresh

2. **Given** I start a new session
   **When** I continue chatting
   **Then** the agent does not reference previous conversation context
   **And** my saved preferences (default city, units) are still available

3. **Given** I start a new session
   **When** the agent greets me
   **Then** it uses my saved name if available (personalized greeting)
   **And** maintains its persona

4. **Given** the CLI is running
   **When** I type variations like "reset", "clear", "fresh start"
   **Then** these are also recognized as new session commands

5. **Given** I accidentally type "new session"
   **When** I want to undo
   **Then** there's no undo - but that's okay because preferences are preserved

## Tasks / Subtasks

- [x] Task 1: Implement new session command in CLI (AC: #1, #2)
  - [x] Added `isNewSessionCommand()` function with array of variations
  - [x] Generate new UUID for threadId on command
  - [x] Keep resourceId the same (preserve working memory)
  - [x] Display visual confirmation with separator lines

- [x] Task 2: Add session reset variations (AC: #4)
  - [x] Added: "new session", "start over", "reset", "clear", "fresh start", "new chat", "restart"
  - [x] All trigger same behavior via `isNewSessionCommand()`

- [x] Task 3: Add post-reset greeting (AC: #1, #3)
  - [x] After reset, automatically sends "Hello" to agent to trigger greeting
  - [x] Agent uses working memory for personalized greeting with name and default city
  - [x] Added NEW SESSION GREETING section to agent instructions

- [x] Task 4: Test new session flow (AC: #1-5)
  - [x] "new session" → Visual feedback + "Welcome back, Sam! Shall I check the weather in Kyiv?" ✓
  - [x] "reset" → Same behavior ✓
  - [x] Preferences preserved (name: Sam, city: Kyiv) ✓
  - [x] Personalized greeting works ✓

## Dev Notes

### Dependencies on Previous Stories

**Story 1.2 Required:**
- CLI with readline loop
- Thread ID and resource ID management

**Story 3.3 Required:**
- Working memory persistence understanding
- User name for personalized greeting

### How Session Management Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Memory Architecture                       │
├─────────────────────────────────────────────────────────────┤
│  Working Memory (resourceId: "cli-user")                     │
│  ├── default_city: "London"     ← PRESERVED on new session   │
│  ├── preferred_units: "celsius" ← PRESERVED on new session   │
│  └── user_name: "Oleksii"       ← PRESERVED on new session   │
├─────────────────────────────────────────────────────────────┤
│  Conversation History (threadId: uuid-123)                   │
│  ├── Message 1: "What's the weather?"   ← CLEARED            │
│  └── Message 2: "Thanks!"               ← CLEARED            │
└─────────────────────────────────────────────────────────────┘

After "new session":
- threadId: uuid-456 (NEW)
- resourceId: "cli-user" (SAME)
- Working memory: PRESERVED
- Conversation history: FRESH
```

### CLI Implementation

**Update `src/cli/index.ts`:**

```typescript
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { randomUUID } from 'node:crypto'
import { weatherAgent } from '../mastra/agents/weatherAgent.js'

const RESOURCE_ID = 'cli-user'
let threadId = randomUUID()

// Commands that trigger a new session
const NEW_SESSION_COMMANDS = [
  'new session',
  'start over',
  'reset',
  'clear',
  'fresh start',
  'new chat',
  'restart',
]

function isNewSessionCommand(input: string): boolean {
  const normalized = input.toLowerCase().trim()
  return NEW_SESSION_COMMANDS.includes(normalized)
}

async function main() {
  const rl = readline.createInterface({ input, output })

  console.log('Weather Agent CLI')
  console.log('Commands: "exit"/"quit" to leave, "new session" to reset conversation')
  console.log('')

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\nGoodbye!')
    rl.close()
    process.exit(0)
  })

  while (true) {
    const userInput = await rl.question('You: ')
    const trimmed = userInput.trim()

    // Handle empty input
    if (!trimmed) {
      continue
    }

    const lowerTrimmed = trimmed.toLowerCase()

    // Exit commands
    if (lowerTrimmed === 'exit' || lowerTrimmed === 'quit' || lowerTrimmed === 'bye') {
      console.log('Goodbye!')
      rl.close()
      break
    }

    // New session commands
    if (isNewSessionCommand(trimmed)) {
      threadId = randomUUID()
      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('  New session started!')
      console.log('  Conversation cleared, preferences saved.')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('')

      // Optionally, trigger a greeting from the agent
      try {
        process.stdout.write('Agent: ')
        const result = await weatherAgent.stream('Hello', {
          threadId,
          resourceId: RESOURCE_ID,
        })
        for await (const chunk of result.textStream) {
          process.stdout.write(chunk)
        }
        console.log('\n')
      } catch (error) {
        console.log('Ready to help with weather!\n')
      }

      continue
    }

    // Regular message - send to agent
    try {
      process.stdout.write('Agent: ')

      const result = await weatherAgent.stream(trimmed, {
        threadId,
        resourceId: RESOURCE_ID,
      })

      for await (const chunk of result.textStream) {
        process.stdout.write(chunk)
      }

      console.log('')
    } catch (error) {
      console.error('\nSorry, I encountered an issue. Please try again!')
    }
  }
}

main().catch(console.error)
```

### Command Variations

| User Input | Action |
|------------|--------|
| `new session` | Reset session |
| `start over` | Reset session |
| `reset` | Reset session |
| `clear` | Reset session |
| `fresh start` | Reset session |
| `new chat` | Reset session |
| `restart` | Reset session |

### Agent Instructions for New Session Greeting

**Add to `src/mastra/agents/weatherAgent.ts` instructions:**

```typescript
## NEW SESSION GREETING

When a new session starts (user types "new session" or similar) and then says "Hello":

1. Check working memory for user_name
2. If returning user with name:
   - "Welcome back, [name]! Starting fresh. What weather would you like to know about?"
   - "Hey [name]! New session, same great weather info. What can I help with?"
3. If no name saved:
   - "Fresh start! I'm Sunny, your weather assistant. What city would you like weather for?"
   - "New session started! Ready to help with weather info. Where shall we check?"

Note: Working memory (name, default city, units) persists across sessions.
Only conversation history is cleared.
```

### Visual Feedback

When session resets, provide clear visual feedback:

```
You: new session

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  New session started!
  Conversation cleared, preferences saved.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Agent: Welcome back, Oleksii! Starting fresh. What weather would you like to know about?
```

### Testing Scenarios

**Basic New Session:**
```
1. Chat with agent about weather
2. Type "new session"
3. Expected: Session reset message, fresh greeting
4. Ask about previous topic
5. Expected: Agent has no memory of previous conversation
```

**Preferences Preserved:**
```
1. Set default city to Tokyo
2. Set units to Fahrenheit
3. Type "new session"
4. Ask "What's the weather?"
5. Expected: Uses Tokyo, shows Fahrenheit (preferences preserved)
```

**Personalized Greeting:**
```
1. Tell agent "My name is Alex"
2. Type "new session"
3. Expected: Greeting includes "Alex"
```

**Command Variations:**
```
Test each: "new session", "start over", "reset", "clear", "fresh start"
Expected: All trigger session reset
```

**Context Cleared:**
```
1. Ask "What's the weather in Paris?"
2. Agent responds with 15°C
3. Type "new session"
4. Ask "What's that in Fahrenheit?"
5. Expected: Agent asks which temperature (no context of 15°C)
```

### File Structure

```
src/cli/index.ts  # Modify: add new session command handling
src/mastra/agents/weatherAgent.ts  # Modify: new session greeting instructions
```

### Edge Cases

**Accidental Reset:**
- No undo mechanism
- But preferences are preserved, so impact is minimal
- Only conversation context is lost

**Multiple Resets:**
- Each reset generates new threadId
- Old conversations remain in database but orphaned
- No cleanup needed for demo purposes

**Reset During Streaming:**
- User might type "new session" while agent is responding
- readline will queue the input
- Handle gracefully after stream completes

### References

- [Source: _bmad-output/prd.md#FR18 - Start new conversation session]
- [Source: _bmad-output/prd.md#FR20 - Greet returning users by name]
- [Source: _bmad-output/architecture.md#Session/Thread Management]
- [Source: Story 1.2 - CLI implementation]
- [Source: Story 3.3 - Memory persistence model]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Added session reset command handling** with:
   - `NEW_SESSION_COMMANDS` array with 7 variations
   - `isNewSessionCommand()` helper function for matching
   - Visual feedback with separator lines on reset
2. **Auto-greeting after reset**: CLI automatically sends "Hello" to agent after session reset, triggering personalized greeting
3. **Added NEW SESSION GREETING section** to agent instructions explaining preserved preferences and greeting behavior
4. **Tested successfully**:
   - "new session" → "Welcome back, Sam! Shall I check the weather in Kyiv?"
   - "reset" → Same behavior (variation works)
   - Preferences (name, default city) preserved across session reset

### File List

- [x] `src/cli/index.ts` - Modified (new session command handling with variations, visual feedback, auto-greeting)
- [x] `src/mastra/agents/weatherAgent.ts` - Modified (NEW SESSION GREETING instructions)
