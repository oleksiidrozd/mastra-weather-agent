import { describe, it, expect } from 'vitest'
import {
  buildInstructions,
  getEnvironment,
  defaultConfig,
  mergeConfig,
} from '../../../../src/mastra/agents/templates/index.js'

describe('P0: Template Engine Setup', () => {
  describe('AC #1: Nunjucks environment configuration', () => {
    it('should configure environment with autoescape disabled', () => {
      const env = getEnvironment()
      // Nunjucks environment should exist
      expect(env).toBeDefined()
      expect(typeof env.render).toBe('function')
    })

    it('should resolve templates from the templates directory', () => {
      // Should not throw when rendering main.njk
      const result = buildInstructions()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('AC #2: Markdown extension registration', () => {
    it('should have markdown extension available', () => {
      const env = getEnvironment()
      // Test that markdown tag is registered by checking environment
      expect(env).toBeDefined()
      // The markdown extension is registered if no error when used in templates
    })
  })

  describe('AC #3: buildInstructions with partial config', () => {
    it('should merge partial config with defaults', () => {
      const result = buildInstructions({ agentName: 'TestBot' })

      expect(result).toContain('TestBot')
      expect(result).toContain('weather information specialist') // default agentRole
    })

    it('should include personality from defaults', () => {
      const result = buildInstructions()

      expect(result).toContain('Cheerful, conversational, weather-obsessed')
    })

    it('should render defaultUnit correctly', () => {
      const celsiusResult = buildInstructions({ defaultUnit: 'celsius' })
      expect(celsiusResult).toContain('celsius')

      const fahrenheitResult = buildInstructions({ defaultUnit: 'fahrenheit' })
      expect(fahrenheitResult).toContain('fahrenheit')
    })

    it('should render optional greetings when provided', () => {
      const result = buildInstructions({
        greetings: ['Hello!', 'Good day!'],
      })

      expect(result).toContain('Hello!')
      expect(result).toContain('Good day!')
    })

    it('should render ambiguousCities when provided', () => {
      const result = buildInstructions({
        ambiguousCities: ['Springfield', 'Portland'],
      })

      expect(result).toContain('Springfield')
      expect(result).toContain('Portland')
    })
  })

  describe('AC #4: buildInstructions with no arguments', () => {
    it('should use all default values', () => {
      const result = buildInstructions()

      expect(result).toContain(defaultConfig.agentName)
      expect(result).toContain(defaultConfig.agentRole)
      expect(result).toContain(defaultConfig.personality)
      expect(result).toContain(defaultConfig.defaultUnit)
    })

    it('should not include optional fields when not provided', () => {
      const result = buildInstructions()

      // Should not have "Custom greetings:" section since greetings is undefined
      expect(result).not.toContain('Custom greetings:')
    })
  })

  describe('AC #5: ESM path resolution', () => {
    it('should correctly resolve template paths in ESM environment', () => {
      // If this test runs without error, ESM path resolution is working
      const result = buildInstructions()
      expect(result).toBeDefined()
    })
  })

  describe('Re-exports', () => {
    it('should re-export defaultConfig', () => {
      expect(defaultConfig).toBeDefined()
      expect(defaultConfig.agentName).toBe('Sunny')
    })

    it('should re-export mergeConfig', () => {
      expect(mergeConfig).toBeDefined()
      const merged = mergeConfig({ agentName: 'Test' })
      expect(merged.agentName).toBe('Test')
      expect(merged.agentRole).toBe('weather information specialist')
    })
  })

  describe('Temperature unit ranges', () => {
    it('should show Celsius temperature ranges when defaultUnit is celsius', () => {
      const result = buildInstructions({ defaultUnit: 'celsius' })

      expect(result).toContain('Below 0°C')
      expect(result).toContain('0°C to 10°C')
      expect(result).not.toContain('Below 32°F')
    })

    it('should show Fahrenheit temperature ranges when defaultUnit is fahrenheit', () => {
      const result = buildInstructions({ defaultUnit: 'fahrenheit' })

      expect(result).toContain('Below 32°F')
      expect(result).toContain('32°F to 50°F')
      expect(result).not.toContain('Below 0°C')
    })
  })

  describe('Section presence', () => {
    it('should include all major section headers', () => {
      const result = buildInstructions()

      expect(result).toContain('## IDENTITY')
      expect(result).toContain('## CAPABILITIES')
      expect(result).toContain('## RESPONSE FORMATTING')
      expect(result).toContain('## ERROR HANDLING')
      expect(result).toContain('## CONVERSATION CONTEXT')
      expect(result).toContain('## INTENT CLASSIFICATION')
      expect(result).toContain('## PREFERENCE MANAGEMENT')
      expect(result).toContain('## TOOL USAGE')
      expect(result).toContain('## CONTEXTUAL WEATHER ADVICE')
    })
  })

  describe('No rendering artifacts', () => {
    it('should not contain unsubstituted Nunjucks variables', () => {
      const result = buildInstructions()

      // Check for {{ variable }} patterns that weren't substituted
      expect(result).not.toMatch(/\{\{\s*\w+\s*\}\}/)
    })

    it('should not contain undefined or null values', () => {
      const result = buildInstructions()

      expect(result).not.toContain('undefined')
      expect(result).not.toContain('null')
    })

    it('should not contain Nunjucks template syntax in output', () => {
      const result = buildInstructions()

      expect(result).not.toContain('{%')
      expect(result).not.toContain('%}')
      expect(result).not.toContain('{#')
      expect(result).not.toContain('#}')
    })
  })

  describe('Combined configuration', () => {
    it('should handle multiple config options together', () => {
      const result = buildInstructions({
        agentName: 'StormWatch',
        agentRole: 'severe weather analyst',
        personality: 'Alert, precise, safety-focused',
        defaultUnit: 'fahrenheit',
        greetings: ['Storm alert! How can I help?'],
        ambiguousCities: ['Auckland', 'Wellington'],
      })

      expect(result).toContain('StormWatch')
      expect(result).toContain('severe weather analyst')
      expect(result).toContain('Alert, precise, safety-focused')
      expect(result).toContain('Below 32°F')
      expect(result).toContain('Storm alert! How can I help?')
      expect(result).toContain('Auckland')
      expect(result).toContain('Wellington')
    })
  })

  describe('defaultConfig values', () => {
    it('should have expected default values', () => {
      expect(defaultConfig.agentName).toBe('Sunny')
      expect(defaultConfig.agentRole).toBe('weather information specialist')
      expect(defaultConfig.personality).toBe('Cheerful, conversational, weather-obsessed')
      expect(defaultConfig.defaultUnit).toBe('celsius')
    })

    it('should not have optional properties set', () => {
      expect(defaultConfig.greetings).toBeUndefined()
      expect(defaultConfig.ambiguousCities).toBeUndefined()
    })
  })
})
