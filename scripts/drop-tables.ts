import 'dotenv/config'
import { db } from '../src/db/index.js'
import { sql } from 'drizzle-orm'

async function main() {
  console.log('Dropping all tables in weather schema...')

  // Drop tables in order (respecting foreign keys)
  await db.execute(sql`DROP TABLE IF EXISTS weather.messages CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS weather.threads CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS weather.user_preferences CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS weather.users CASCADE`)

  console.log('All tables dropped.')

  // Verify
  const result = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'weather'
    ORDER BY table_name
  `)
  console.log('Remaining tables:', result.rows)

  process.exit(0)
}

main().catch(console.error)
