import { describe, it, expect } from 'vitest'
import { buildInstructions } from '../../../../src/mastra/agents/templates/index.js'

describe('P0: main.njk integration', () => {
  describe('AC #1: Template structure and includes', () => {
    it('should render complete instructions with opening', () => {
      const result = buildInstructions()

      expect(result).toContain('You are Sunny')
      expect(result).toContain('friendly and enthusiastic weather assistant')
    })

    it('should include all section templates in correct order', () => {
      const result = buildInstructions()

      // Check all major sections are included
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

    it('should include sections in logical order', () => {
      const result = buildInstructions()

      // Verify order by checking positions
      const identityPos = result.indexOf('## IDENTITY')
      const capabilitiesPos = result.indexOf('## CAPABILITIES')
      const responseFormattingPos = result.indexOf('## RESPONSE FORMATTING')
      const errorHandlingPos = result.indexOf('## ERROR HANDLING')
      const conversationContextPos = result.indexOf('## CONVERSATION CONTEXT')
      const intentClassificationPos = result.indexOf('## INTENT CLASSIFICATION')
      const preferenceManagementPos = result.indexOf('## PREFERENCE MANAGEMENT')
      const toolUsagePos = result.indexOf('## TOOL USAGE')
      const weatherAdvicePos = result.indexOf('## CONTEXTUAL WEATHER ADVICE')

      expect(identityPos).toBeLessThan(capabilitiesPos)
      expect(capabilitiesPos).toBeLessThan(responseFormattingPos)
      expect(responseFormattingPos).toBeLessThan(errorHandlingPos)
      expect(errorHandlingPos).toBeLessThan(conversationContextPos)
      expect(conversationContextPos).toBeLessThan(intentClassificationPos)
      expect(intentClassificationPos).toBeLessThan(preferenceManagementPos)
      expect(preferenceManagementPos).toBeLessThan(toolUsagePos)
      expect(toolUsagePos).toBeLessThan(weatherAdvicePos)
    })
  })

  describe('AC #2: Content completeness', () => {
    it('should produce output of substantial length', () => {
      const result = buildInstructions()

      // Full instructions should be quite long
      expect(result.length).toBeGreaterThan(5000)
    })

    it('should include key content from each template', () => {
      const result = buildInstructions()

      // Identity
      expect(result).toContain('Sunny')
      expect(result).toContain('weather information specialist')

      // Capabilities
      expect(result).toContain('current weather information')
      expect(result).toContain('temperature units')

      // Response formatting
      expect(result).toContain('Temperature Display')
      expect(result).toContain('Weather Conditions')

      // Error handling
      expect(result).toContain('City not found')
      expect(result).toContain('API unavailable')

      // Conversation context
      expect(result).toContain('OFF-TOPIC HANDLING')
      expect(result).toContain('UNCLEAR INPUT HANDLING')

      // Intent classification
      expect(result).toContain('Weather Query')
      expect(result).toContain('Preference Update')
      expect(result).toContain('NEVER ASSUME')

      // Preference management
      expect(result).toContain('DEFAULT CITY MANAGEMENT')
      expect(result).toContain('UNIT PREFERENCE MANAGEMENT')

      // Weather handling
      expect(result).toContain('getCurrentWeather')
      expect(result).toContain('convertTemperature')

      // Weather advice
      expect(result).toContain('Freezing')
      expect(result).toContain('umbrella')
    })
  })

  describe('AC #3: Template modularity', () => {
    it('should include identity template content', () => {
      const result = buildInstructions()

      expect(result).toContain('## IDENTITY')
      expect(result).toContain('Name:')
      expect(result).toContain('Role:')
    })

    it('should include weather advice template content', () => {
      const result = buildInstructions()

      expect(result).toContain('## CONTEXTUAL WEATHER ADVICE')
      expect(result).toContain('PRECIPITATION ADVICE')
      expect(result).toContain('SPECIAL CONDITIONS')
    })
  })

  describe('AC #4: Section separation', () => {
    it('should have proper section headers', () => {
      const result = buildInstructions()

      // Count ## headers (major sections)
      const sectionHeaders = result.match(/## [A-Z]/g)
      expect(sectionHeaders).not.toBeNull()
      expect(sectionHeaders!.length).toBeGreaterThanOrEqual(9)
    })
  })

  describe('AC #5: Variable inheritance', () => {
    it('should substitute agentName throughout all templates', () => {
      const result = buildInstructions({ agentName: 'CloudBot' })

      // Should appear in opening
      expect(result).toContain('You are CloudBot')

      // Should appear in identity
      expect(result).toContain('Name: CloudBot')

      // Should appear in greetings
      expect(result).toContain("I'm CloudBot")

      // Default agent name should not appear (but "Sunny" appears in "Clear/Sunny" weather condition)
      expect(result).not.toContain('Name: Sunny')
    })

    it('should substitute defaultUnit in weather advice', () => {
      const celsiusResult = buildInstructions({ defaultUnit: 'celsius' })
      const fahrenheitResult = buildInstructions({ defaultUnit: 'fahrenheit' })

      // Celsius should show Celsius ranges
      expect(celsiusResult).toContain('Below 0°C')
      expect(celsiusResult).toContain('0°C to 10°C')

      // Fahrenheit should show Fahrenheit ranges
      expect(fahrenheitResult).toContain('Below 32°F')
      expect(fahrenheitResult).toContain('32°F to 50°F')
    })

    it('should pass all config values to included templates', () => {
      const result = buildInstructions({
        agentName: 'TestBot',
        agentRole: 'test assistant',
        personality: 'Very testy',
        defaultUnit: 'fahrenheit',
      })

      expect(result).toContain('TestBot')
      expect(result).toContain('test assistant')
      expect(result).toContain('Very testy')
      expect(result).toContain('Below 32°F')
    })
  })

  describe('Custom config options', () => {
    it('should include custom greetings when provided', () => {
      const result = buildInstructions({
        greetings: ['Yo!', 'Wassup weather fans!'],
      })

      expect(result).toContain('Yo!')
      expect(result).toContain('Wassup weather fans!')
    })

    it('should include custom ambiguous cities when provided', () => {
      const result = buildInstructions({
        ambiguousCities: ['Melbourne', 'Perth'],
      })

      expect(result).toContain('Melbourne')
      expect(result).toContain('Perth')
    })
  })

  describe('Default config rendering', () => {
    it('should render successfully with no config', () => {
      const result = buildInstructions()

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should use default values when no config provided', () => {
      const result = buildInstructions()

      expect(result).toContain('Sunny')
      expect(result).toContain('weather information specialist')
      expect(result).toContain('Cheerful')
      expect(result).toContain('Below 0°C') // Default is celsius
    })
  })
})
