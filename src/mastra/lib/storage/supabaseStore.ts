import { PostgresStore } from '@mastra/pg'
import type { StorageResourceType, StorageGetMessagesArg } from '@mastra/core/storage'
import type { StorageThreadType } from '@mastra/core/memory'
import type { MastraMessageV2 } from '@mastra/core/agent'
import { v5 as uuidv5 } from 'uuid'
import { db } from '../../../db/index.js'
import { users, userPreferences, threads, messages } from '../../../db/schema.js'
import { eq, desc } from 'drizzle-orm'

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

  // Thread methods
  async getThreadById({ threadId }: { threadId: string }): Promise<StorageThreadType | null> {
    const result = await this.drizzle
      .select()
      .from(threads)
      .where(eq(threads.id, threadId))

    if (!result.length) return null

    const row = result[0]
    return {
      id: row.id,
      resourceId: row.resourceId,
      title: row.title ?? undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async getThreadsByResourceId({ resourceId }: { resourceId: string }): Promise<StorageThreadType[]> {
    const result = await this.drizzle
      .select()
      .from(threads)
      .where(eq(threads.resourceId, resourceId))
      .orderBy(desc(threads.createdAt))

    return result.map(row => ({
      id: row.id,
      resourceId: row.resourceId,
      title: row.title ?? undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  }

  async saveThread({ thread }: { thread: StorageThreadType }): Promise<StorageThreadType> {
    await this.drizzle.insert(threads).values({
      id: thread.id,
      resourceId: thread.resourceId,
      title: thread.title ?? null,
      metadata: thread.metadata ?? null,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }).onConflictDoUpdate({
      target: threads.id,
      set: {
        resourceId: thread.resourceId,
        title: thread.title ?? null,
        metadata: thread.metadata ?? null,
        updatedAt: thread.updatedAt,
      },
    })

    return thread
  }

  async updateThread({ id, title, metadata }: {
    id: string
    title: string
    metadata: Record<string, unknown>
  }): Promise<StorageThreadType> {
    await this.drizzle
      .update(threads)
      .set({ title, metadata, updatedAt: new Date() })
      .where(eq(threads.id, id))

    const updated = await this.getThreadById({ threadId: id })
    return updated!
  }

  async deleteThread({ threadId }: { threadId: string }): Promise<void> {
    await this.drizzle.delete(threads).where(eq(threads.id, threadId))
  }

  // Message methods (V2 format only)
  // @ts-expect-error - We only support V2 format, ignoring V1 overload
  async getMessages({ threadId, selectBy }: StorageGetMessagesArg): Promise<MastraMessageV2[]> {
    const limit = typeof selectBy?.last === 'number' ? selectBy.last : 40

    const result = await this.drizzle
      .select()
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)

    // Return in chronological order
    return result.reverse().map(row => ({
      id: row.id,
      role: row.role as 'user' | 'assistant' | 'system',
      createdAt: row.createdAt,
      threadId: row.threadId,
      resourceId: row.resourceId ?? undefined,
      content: JSON.parse(row.content),
    }))
  }

  // @ts-expect-error - We only support V2 format, ignoring V1 overload
  async saveMessages({ messages: msgs }: { messages: MastraMessageV2[] }): Promise<MastraMessageV2[]> {
    if (msgs.length === 0) return []

    const threadId = msgs[0]?.threadId
    if (!threadId) throw new Error('threadId is required')

    await this.drizzle.insert(messages).values(
      msgs.map(msg => ({
        id: msg.id,
        threadId,
        content: JSON.stringify(msg.content),
        role: msg.role,
        resourceId: msg.resourceId ?? null,
        createdAt: msg.createdAt,
      }))
    ).onConflictDoUpdate({
      target: messages.id,
      set: {
        content: msgs[0] ? JSON.stringify(msgs[0].content) : '',
        role: msgs[0]?.role ?? 'user',
      },
    })

    // Update thread's updatedAt
    await this.drizzle
      .update(threads)
      .set({ updatedAt: new Date() })
      .where(eq(threads.id, threadId))

    return msgs
  }

  async deleteMessages(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return

    for (const id of messageIds) {
      await this.drizzle.delete(messages).where(eq(messages.id, id))
    }
  }
}
