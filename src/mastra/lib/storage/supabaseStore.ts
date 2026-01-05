import { PostgresStore } from '@mastra/pg'
import type { StorageResourceType } from '@mastra/core/storage'
import { v5 as uuidv5 } from 'uuid'
import { db } from '../../../db/index.js'
import { users, userPreferences } from '../../../db/schema.js'
import { eq } from 'drizzle-orm'

// Namespace UUID for generating deterministic UUIDs from resourceId strings
// Using a fixed namespace ensures "cli-user" always maps to the same UUID
const NAMESPACE_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8' // DNS namespace

/**
 * Converts a string resourceId to a deterministic UUID.
 * This allows string resourceIds like "cli-user" to map to UUID-based database tables.
 */
function resourceIdToUuid(resourceId: string): string {
  // If already a valid UUID, return as-is
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRegex.test(resourceId)) {
    return resourceId
  }
  // Generate deterministic UUID from string
  return uuidv5(resourceId, NAMESPACE_UUID)
}

export class SupabaseStore extends PostgresStore {
  private drizzle = db

  async getResourceById({ resourceId }: { resourceId: string }): Promise<StorageResourceType | null> {
    const uuid = resourceIdToUuid(resourceId)

    const result = await this.drizzle
      .select()
      .from(users)
      .leftJoin(userPreferences, eq(users.id, userPreferences.userId))
      .where(eq(users.id, uuid))

    if (!result.length) return null

    const row = result[0]
    return {
      id: resourceId, // Return original resourceId, not UUID
      workingMemory: JSON.stringify({
        default_city: row.users.location ?? undefined,
        user_name: row.users.username ?? undefined,
        preferred_units: row.user_preferences?.units ?? 'celsius',
      }),
      createdAt: row.users.createdAt,
      updatedAt: row.users.updatedAt,
    }
  }

  async saveResource({ resource }: { resource: StorageResourceType }): Promise<StorageResourceType> {
    const uuid = resourceIdToUuid(resource.id)
    const wm = JSON.parse(resource.workingMemory || '{}')

    await this.drizzle.transaction(async (tx) => {
      await tx.insert(users).values({
        id: uuid,
        username: wm.user_name ?? null,
        location: wm.default_city ?? null,
      }).onConflictDoNothing()

      await tx.insert(userPreferences).values({
        userId: uuid,
        units: wm.preferred_units ?? 'celsius',
      }).onConflictDoNothing()
    })

    // Pass original resource.id, not uuid, to preserve the original resourceId
    const saved = await this.getResourceById({ resourceId: resource.id })
    return saved!
  }

  async updateResource({
    resourceId,
    workingMemory,
  }: {
    resourceId: string
    workingMemory?: string
    metadata?: Record<string, unknown>
  }): Promise<StorageResourceType> {
    const uuid = resourceIdToUuid(resourceId)
    const wm = JSON.parse(workingMemory || '{}')

    await this.drizzle.transaction(async (tx) => {
      // Upsert user
      await tx.insert(users).values({
        id: uuid,
        username: wm.user_name ?? null,
        location: wm.default_city ?? null,
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          ...(wm.user_name !== undefined && { username: wm.user_name }),
          ...(wm.default_city !== undefined && { location: wm.default_city }),
          updatedAt: new Date(),
        },
      })

      // Upsert preferences
      await tx.insert(userPreferences).values({
        userId: uuid,
        units: wm.preferred_units ?? 'celsius',
      }).onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...(wm.preferred_units !== undefined && { units: wm.preferred_units }),
          updatedAt: new Date(),
        },
      })
    })

    // Pass original resourceId, not uuid, to preserve the original resourceId
    const updated = await this.getResourceById({ resourceId })
    return updated!
  }
}
