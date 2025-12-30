import { describe, it, expect } from 'vitest'
import { getEnvironment, defaultConfig } from '../../../../src/mastra/agents/templates/index.js'

describe('P0: weatherHandling.njk template', () => {
  const env = getEnvironment()

  describe('AC #1: Tool usage rules', () => {
    it('should contain TOOL USAGE header', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('## TOOL USAGE')
    })

    it('should include getCurrentWeather tool', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('getCurrentWeather')
      expect(result).toContain('Fetch current weather for a city')
    })

    it('should include setDefaultCity tool', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('setDefaultCity')
      expect(result).toContain("Save user's default city preference")
    })

    it('should include setPreferredUnits tool', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('setPreferredUnits')
      expect(result).toContain("Save user's temperature unit preference")
    })

    it('should include convertTemperature tool', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('convertTemperature')
      expect(result).toContain('Convert between Celsius and Fahrenheit')
    })
  })

  describe('AC #1: Weather query handling', () => {
    it('should contain WEATHER QUERY HANDLING header', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('## WEATHER QUERY HANDLING')
    })

    it('should include city specified handling', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('City Specified')
      expect(result).toContain('Weather in Tokyo')
    })

    it('should include no city specified handling', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('No City Specified')
      expect(result).toContain('Check working memory for default_city')
    })

    it('should include never change default implicitly rule', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('Never Change Default Implicitly')
      expect(result).toContain('does NOT update the default')
    })
  })

  describe('AC #1: Temperature formatting', () => {
    it('should contain TEMPERATURE FORMATTING header', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('## TEMPERATURE FORMATTING')
    })

    it('should include unit display rules', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('preferred_units')
      expect(result).toContain('°C')
      expect(result).toContain('°F')
    })

    it('should include conversion formula', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('°F = (°C × 9/5) + 32')
    })
  })

  describe('AC #1, #5: Temperature conversion', () => {
    it('should contain TEMPERATURE CONVERSION header', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('## TEMPERATURE CONVERSION')
    })

    it('should include explicit conversion patterns', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('Explicit conversions')
      expect(result).toContain('Convert 32°F to Celsius')
      expect(result).toContain('What is 25°C in Fahrenheit')
    })

    it('should include contextual conversion patterns', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('Contextual conversions')
      expect(result).toContain("What's that in Fahrenheit?")
      expect(result).toContain('Convert that')
    })

    it('should include parsing rules', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('Parsing Temperature Input')
      expect(result).toContain('Temperature value')
      expect(result).toContain('Source unit')
    })

    it('should include fun facts for special values', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('Fun Facts for Special Values')
      expect(result).toContain('-40')
    })
  })

  describe('AC #1: Feels-like temperature', () => {
    it('should contain FEELS-LIKE TEMPERATURE header', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('## FEELS-LIKE TEMPERATURE')
    })

    it('should include when to show feels-like', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('more than 2 degrees')
      expect(result).toContain('humidity')
      expect(result).toContain('wind chill')
    })
  })

  describe('AC #1: Weather response format', () => {
    it('should contain WEATHER RESPONSE FORMAT header', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('## WEATHER RESPONSE FORMAT')
    })

    it('should include response structure items', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('Temperature')
      expect(result).toContain('Weather conditions')
      expect(result).toContain('Humidity')
      expect(result).toContain('Wind speed')
    })
  })

  describe('AC #2, #3: Ambiguous location handling', () => {
    it('should contain AMBIGUOUS LOCATION HANDLING header', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('## AMBIGUOUS LOCATION HANDLING')
    })

    it('should show default ambiguous cities when none provided', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('Common Ambiguous Cities')
      expect(result).toContain('Springfield')
      expect(result).toContain('Portland')
      expect(result).toContain('Birmingham')
    })

    it('should use custom ambiguous cities when provided', () => {
      const result = env.render('weatherHandling.njk', {
        ...defaultConfig,
        ambiguousCities: ['Melbourne', 'Perth', 'Newcastle'],
      })

      expect(result).toContain('Known Ambiguous Cities')
      expect(result).toContain('Melbourne')
      expect(result).toContain('Perth')
      expect(result).toContain('Newcastle')
      expect(result).not.toContain('Springfield')
    })

    it('should include clarification pattern', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('Clarification Pattern')
      expect(result).toContain('several places called')
    })

    it('should include dont over-disambiguate rule', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain("Don't Over-Disambiguate")
      expect(result).toContain('Major world cities')
    })
  })

  describe('AC #4: Tool usage clarity', () => {
    it('should explain when to use each tool', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      // Each tool should have a "When to use" description
      expect(result).toContain('When to use:')
    })

    it('should include input and output for tools', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('Input:')
      expect(result).toContain('Output:')
    })
  })

  describe('Template structure', () => {
    it('should have all major sections', () => {
      const result = env.render('weatherHandling.njk', defaultConfig)

      expect(result).toContain('## TOOL USAGE')
      expect(result).toContain('## WEATHER QUERY HANDLING')
      expect(result).toContain('## TEMPERATURE FORMATTING')
      expect(result).toContain('## TEMPERATURE CONVERSION')
      expect(result).toContain('## FEELS-LIKE TEMPERATURE')
      expect(result).toContain('## WEATHER RESPONSE FORMAT')
      expect(result).toContain('## AMBIGUOUS LOCATION HANDLING')
    })
  })

  describe('Template independence', () => {
    it('should render with minimal config', () => {
      const result = env.render('weatherHandling.njk', {})

      expect(result).toContain('## TOOL USAGE')
      expect(result).toContain('## WEATHER QUERY HANDLING')
    })

    it('should render without ambiguousCities', () => {
      const result = env.render('weatherHandling.njk', {
        agentName: 'TestBot',
      })

      expect(result).toContain('Common Ambiguous Cities')
      expect(result).toContain('Springfield')
    })
  })
})
