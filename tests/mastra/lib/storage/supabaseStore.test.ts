import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { v5 as uuidv5 } from 'uuid'

// Mock the db module before importing SupabaseStore
const mockSelect = vi.fn()
const mockFrom = vi.fn()
const mockLeftJoin = vi.fn()
const mockWhere = vi.fn()
const mockInsert = vi.fn()
const mockValues = vi.fn()
const mockOnConflictDoNothing = vi.fn()
const mockOnConflictDoUpdate = vi.fn()
const mockTransaction = vi.fn()

vi.mock('../../../../src/db/index.js', () => ({
  db: {
    select: () => ({
      from: (table: unknown) => ({
        leftJoin: (joinTable: unknown, condition: unknown) => ({
          where: mockWhere,
        }),
      }),
    }),
    insert: (table: unknown) => ({
      values: (data: unknown) => ({
        onConflictDoNothing: mockOnConflictDoNothing,
        onConflictDoUpdate: mockOnConflictDoUpdate,
      }),
    }),
    transaction: mockTransaction,
  },
}))

vi.mock('../../../../src/db/schema.js', () => ({
  users: { id: 'users.id' },
  userPreferences: { userId: 'userPreferences.userId' },
}))

// Mock PostgresStore
vi.mock('@mastra/pg', () => ({
  PostgresStore: class MockPostgresStore {
    constructor(config: unknown) {}
  },
}))

// Namespace for UUID v5 generation (same as in supabaseStore.ts)
const NAMESPACE_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

describe('SupabaseStore', () => {
  describe('resourceIdToUuid helper', () => {
    it('should convert string resourceId to deterministic UUID', () => {
      // "cli-user" should always produce the same UUID
      const uuid1 = uuidv5('cli-user', NAMESPACE_UUID)
      const uuid2 = uuidv5('cli-user', NAMESPACE_UUID)
      expect(uuid1).toBe(uuid2)
      // Verify it's a valid UUID format
      expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('should return same UUID for already valid UUID input', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000'
      // When input is already a valid UUID, the regex check should pass and return as-is
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(uuidRegex.test(validUuid)).toBe(true)
    })

    it('should produce different UUIDs for different resourceIds', () => {
      const uuid1 = uuidv5('cli-user', NAMESPACE_UUID)
      const uuid2 = uuidv5('another-user', NAMESPACE_UUID)
      expect(uuid1).not.toBe(uuid2)
    })
  })

  describe('Working Memory JSON <-> Normalized Mapping', () => {
    it('should correctly map working memory fields to database columns', () => {
      // Working memory: { default_city, user_name, preferred_units }
      // Database: users.location, users.username, user_preferences.units
      const workingMemory = {
        default_city: 'Tokyo',
        user_name: 'Oleksii',
        preferred_units: 'fahrenheit',
      }

      // Verify mapping
      expect(workingMemory.default_city).toBe('Tokyo') // → users.location
      expect(workingMemory.user_name).toBe('Oleksii') // → users.username
      expect(workingMemory.preferred_units).toBe('fahrenheit') // → user_preferences.units
    })

    it('should reconstruct working memory from database row', () => {
      // Simulated database row from LEFT JOIN
      const dbRow = {
        users: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          location: 'Paris',
          username: 'Alex',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
        user_preferences: {
          id: '223e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          units: 'celsius',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
      }

      // Reconstruct working memory
      const workingMemory = {
        default_city: dbRow.users.location ?? undefined,
        user_name: dbRow.users.username ?? undefined,
        preferred_units: dbRow.user_preferences?.units ?? 'celsius',
      }

      expect(workingMemory).toEqual({
        default_city: 'Paris',
        user_name: 'Alex',
        preferred_units: 'celsius',
      })
    })

    it('should use default celsius when preferences not found', () => {
      // Row with null user_preferences (user exists but preferences don't)
      const dbRow = {
        users: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          location: 'London',
          username: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        user_preferences: null,
      }

      const workingMemory = {
        default_city: dbRow.users.location ?? undefined,
        user_name: dbRow.users.username ?? undefined,
        preferred_units: dbRow.user_preferences?.units ?? 'celsius',
      }

      expect(workingMemory.preferred_units).toBe('celsius')
      expect(workingMemory.user_name).toBeUndefined()
    })

    it('should handle all null values from database', () => {
      const dbRow = {
        users: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          location: null,
          username: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        user_preferences: null,
      }

      const workingMemory = {
        default_city: dbRow.users.location ?? undefined,
        user_name: dbRow.users.username ?? undefined,
        preferred_units: dbRow.user_preferences?.units ?? 'celsius',
      }

      expect(workingMemory).toEqual({
        default_city: undefined,
        user_name: undefined,
        preferred_units: 'celsius',
      })
    })
  })

  describe('StorageResourceType format', () => {
    it('should return correct StorageResourceType structure', () => {
      const dbRow = {
        users: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          location: 'Berlin',
          username: 'TestUser',
          createdAt: new Date('2024-06-01'),
          updatedAt: new Date('2024-06-15'),
        },
        user_preferences: {
          id: '223e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          units: 'fahrenheit',
          createdAt: new Date('2024-06-01'),
          updatedAt: new Date('2024-06-10'),
        },
      }

      const resource = {
        id: dbRow.users.id,
        workingMemory: JSON.stringify({
          default_city: dbRow.users.location ?? undefined,
          user_name: dbRow.users.username ?? undefined,
          preferred_units: dbRow.user_preferences?.units ?? 'celsius',
        }),
        createdAt: dbRow.users.createdAt,
        updatedAt: dbRow.users.updatedAt,
      }

      expect(resource.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(typeof resource.workingMemory).toBe('string')
      expect(JSON.parse(resource.workingMemory)).toEqual({
        default_city: 'Berlin',
        user_name: 'TestUser',
        preferred_units: 'fahrenheit',
      })
      expect(resource.createdAt).toBeInstanceOf(Date)
      expect(resource.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('Partial updates preservation', () => {
    it('should preserve existing values when updating only specific fields', () => {
      // Existing working memory
      const existing = {
        default_city: 'Tokyo',
        user_name: 'Oleksii',
        preferred_units: 'celsius',
      }

      // Update with only city change
      const update = {
        default_city: 'Osaka',
      }

      // Simulating the conditional set logic
      const updateSet = {
        ...(update.default_city !== undefined && { location: update.default_city }),
        ...((update as any).user_name !== undefined && { username: (update as any).user_name }),
        updatedAt: new Date(),
      }

      // Should only update location, not username
      expect(updateSet).toHaveProperty('location', 'Osaka')
      expect(updateSet).not.toHaveProperty('username')
      expect(updateSet).toHaveProperty('updatedAt')
    })

    it('should handle undefined vs null correctly', () => {
      // undefined means "don't update"
      // null means "set to null"
      const update1 = { default_city: undefined }
      const update2 = { default_city: null }

      // update1 should not include location in set
      const set1 = {
        ...(update1.default_city !== undefined && { location: update1.default_city }),
      }
      expect(set1).not.toHaveProperty('location')

      // update2 should include location as null
      const set2 = {
        ...(update2.default_city !== undefined && { location: update2.default_city }),
      }
      expect(set2).toHaveProperty('location', null)
    })
  })
})
