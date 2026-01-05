import 'dotenv/config'
import { db } from '../src/db/index.js'
import { sql } from 'drizzle-orm'
import { readFileSync } from 'fs'

async function main() {
  const migrationSql = readFileSync('./drizzle/0000_typical_virginia_dare.sql', 'utf-8')

  // Split by statement breakpoint and execute each statement
  const statements = migrationSql.split('--> statement-breakpoint')

  for (const statement of statements) {
    const trimmed = statement.trim()
    if (!trimmed) continue

    console.log('Executing:', trimmed.substring(0, 80) + '...')
    try {
      await db.execute(sql.raw(trimmed))
      console.log('✓ Success')
    } catch (error: any) {
      // Ignore "already exists" errors
      if (error?.cause?.code === '42P06' || error?.message?.includes('already exists')) {
        console.log('⚠ Already exists, skipping')
      } else {
        throw error
      }
    }
  }

  console.log('\nMigration complete!')
  process.exit(0)
}

main().catch(console.error)
