import 'dotenv/config'
import { db } from '../src/db/index.js'
import { sql } from 'drizzle-orm'

async function main() {
  // Check if schema exists
  const schemaResult = await db.execute(sql`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name = 'weather'
  `)
  console.log('Schema exists:', schemaResult.rows)

  // Check all tables
  const tablesResult = await db.execute(sql`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema = 'weather'
    ORDER BY table_name
  `)
  console.log('Tables:', tablesResult.rows)

  // Check table columns for threads
  const threadsColumnsResult = await db.execute(sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'weather' AND table_name = 'threads'
    ORDER BY ordinal_position
  `)
  console.log('Threads columns:', threadsColumnsResult.rows)

  process.exit(0)
}

main().catch(console.error)
