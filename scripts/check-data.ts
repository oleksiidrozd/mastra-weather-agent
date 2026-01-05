import 'dotenv/config'
import { db } from '../src/db/index.js'
import { users, userPreferences, threads, messages } from '../src/db/schema.js'

async function main() {
  console.log('=== Users ===')
  const usersData = await db.select().from(users)
  console.log(usersData)

  console.log('\n=== User Preferences ===')
  const prefsData = await db.select().from(userPreferences)
  console.log(prefsData)

  console.log('\n=== Threads ===')
  const threadsData = await db.select().from(threads)
  console.log(threadsData)

  console.log('\n=== Messages ===')
  const messagesData = await db.select().from(messages)
  console.log(messagesData)

  process.exit(0)
}

main().catch(console.error)
