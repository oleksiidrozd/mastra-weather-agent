import { describe, it, expect } from 'vitest'
import {
  WeatherAgentConfig,
  defaultConfig,
  PartialWeatherAgentConfig,
  mergeConfig,
} from '../../../../src/mastra/agents/templates/types.js'

describe('P0: Template Configuration Types', () => {
  describe('AC #1: WeatherAgentConfig interface', () => {
    it('should have all required properties in defaultConfig', () => {
      expect(defaultConfig.agentName).toBe('Sunny')
      expect(defaultConfig.agentRole).toBe('weather information specialist')
      expect(defaultConfig.personality).toBe('Cheerful, conversational, weather-obsessed')
      expect(defaultConfig.defaultUnit).toBe('celsius')
    })

    it('should allow optional properties to be undefined', () => {
      expect(defaultConfig.greetings).toBeUndefined()
      expect(defaultConfig.ambiguousCities).toBeUndefined()
    })

    it('should only allow valid unit values', () => {
      // Type-level test - these should compile
      const celsiusConfig: WeatherAgentConfig = { ...defaultConfig, defaultUnit: 'celsius' }
      const fahrenheitConfig: WeatherAgentConfig = { ...defaultConfig, defaultUnit: 'fahrenheit' }

      expect(celsiusConfig.defaultUnit).toBe('celsius')
      expect(fahrenheitConfig.defaultUnit).toBe('fahrenheit')
    })
  })

  describe('AC #2: defaultConfig export', () => {
    it('should satisfy WeatherAgentConfig interface', () => {
      const config: WeatherAgentConfig = defaultConfig
      expect(config).toBeDefined()
      expect(typeof config.agentName).toBe('string')
      expect(typeof config.agentRole).toBe('string')
      expect(typeof config.personality).toBe('string')
      expect(['celsius', 'fahrenheit']).toContain(config.defaultUnit)
    })
  })

  describe('AC #3: Partial config merging', () => {
    it('should merge partial config with defaults', () => {
      const partial: PartialWeatherAgentConfig = { agentName: 'Stormy' }
      const merged = mergeConfig(partial)

      expect(merged.agentName).toBe('Stormy')
      expect(merged.agentRole).toBe('weather information specialist')
      expect(merged.personality).toBe('Cheerful, conversational, weather-obsessed')
      expect(merged.defaultUnit).toBe('celsius')
    })

    it('should override multiple properties', () => {
      const partial: PartialWeatherAgentConfig = {
        agentName: 'Frosty',
        defaultUnit: 'fahrenheit',
        greetings: ['Hello!', 'Hi there!'],
      }
      const merged = mergeConfig(partial)

      expect(merged.agentName).toBe('Frosty')
      expect(merged.defaultUnit).toBe('fahrenheit')
      expect(merged.greetings).toEqual(['Hello!', 'Hi there!'])
      expect(merged.agentRole).toBe('weather information specialist')
    })

    it('should return defaults when no partial provided', () => {
      const merged = mergeConfig()

      expect(merged).toEqual(defaultConfig)
    })

    it('should return defaults when undefined provided', () => {
      const merged = mergeConfig(undefined)

      expect(merged).toEqual(defaultConfig)
    })
  })

  describe('AC #4: TypeScript strict mode compatibility', () => {
    it('should create valid config with all required fields', () => {
      const config: WeatherAgentConfig = {
        agentName: 'Test',
        agentRole: 'test role',
        personality: 'test personality',
        defaultUnit: 'celsius',
      }

      expect(config.agentName).toBe('Test')
    })

    it('should allow optional fields to be set', () => {
      const config: WeatherAgentConfig = {
        ...defaultConfig,
        greetings: ['Good morning!'],
        ambiguousCities: ['Springfield', 'Portland'],
      }

      expect(config.greetings).toEqual(['Good morning!'])
      expect(config.ambiguousCities).toEqual(['Springfield', 'Portland'])
    })
  })

  describe('AC #5: Config extension', () => {
    it('should support conditional rendering based on optional properties', () => {
      const configWithGreetings: WeatherAgentConfig = {
        ...defaultConfig,
        greetings: ['Hello!'],
      }

      const configWithoutGreetings: WeatherAgentConfig = { ...defaultConfig }

      // Simulating template conditional logic
      const hasGreetings = configWithGreetings.greetings !== undefined
      const hasNoGreetings = configWithoutGreetings.greetings === undefined

      expect(hasGreetings).toBe(true)
      expect(hasNoGreetings).toBe(true)
    })
  })
})
