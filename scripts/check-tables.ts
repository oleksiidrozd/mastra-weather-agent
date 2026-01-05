import 'dotenv/config'
import { db } from '../src/db/index.js'
import { sql } from 'drizzle-orm'

async function main() {
  const result = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'weather'
    ORDER BY table_name
  `)
  console.log('Tables in weather schema:')
  console.log(result.rows)
  process.exit(0)
}

main().catch(console.error)
