import 'dotenv/config'
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

function isNewSessionCommand(inputText: string): boolean {
  const normalized = inputText.toLowerCase().trim()
  return NEW_SESSION_COMMANDS.includes(normalized)
}

async function main() {
  const rl = readline.createInterface({ input, output })

  console.log('Weather Agent CLI')
  console.log('Type "exit" or "quit" to leave, "new session" to reset conversation')
  console.log('')

  const cleanup = () => {
    console.log('\nGoodbye!')
    rl.close()
    process.exit(0)
  }

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', cleanup)

  while (true) {
    let userInput: string
    try {
      userInput = await rl.question('You: ')
    } catch (error) {
      // Handle Ctrl+C during readline (AbortError)
      if (error instanceof Error && error.name === 'AbortError') {
        cleanup()
      }
      throw error
    }

    const trimmed = userInput.trim()

    // Handle empty input
    if (!trimmed) {
      console.log('Agent: I didn\'t see a message there. What would you like to know about the weather?')
      continue
    }

    const lowerTrimmed = trimmed.toLowerCase()

    if (lowerTrimmed === 'exit' || lowerTrimmed === 'quit') {
      console.log('Goodbye!')
      rl.close()
      break
    }

    if (isNewSessionCommand(trimmed)) {
      threadId = randomUUID()
      console.log('')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('  New session started!')
      console.log('  Conversation cleared, preferences saved.')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('')

      // Trigger a greeting from the agent
      try {
        process.stdout.write('Agent: ')
        const result = await weatherAgent.stream('Hello', {
          threadId,
          resourceId: RESOURCE_ID,
          maxSteps: 5,
        })
        for await (const chunk of result.textStream) {
          process.stdout.write(chunk)
        }
        console.log('')
      } catch {
        console.log('Ready to help with weather!')
      }

      continue
    }

    try {
      process.stdout.write('Agent: ')

      const result = await weatherAgent.stream(trimmed, {
        threadId,
        resourceId: RESOURCE_ID,
        maxSteps: 5,
      })

      for await (const chunk of result.textStream) {
        process.stdout.write(chunk)
      }

      console.log('') // newline after response
    } catch (error) {
      // Handle errors gracefully - don't crash
      console.error('\nSorry, I encountered an issue. Please try again!')
      if (process.env.DEBUG) {
        console.error('Debug:', error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }
}

main().catch((error) => {
  // Suppress AbortError from being printed on exit
  if (error instanceof Error && error.name === 'AbortError') {
    process.exit(0)
  }
  console.error(error)
})
