import { describe, it, expect } from 'vitest'
import { getEnvironment, defaultConfig } from '../../../../src/mastra/agents/templates/index.js'

describe('P0: intentClassification.njk template', () => {
  const env = getEnvironment()

  describe('AC #1: Intent categories', () => {
    it('should contain INTENT CLASSIFICATION header', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('## INTENT CLASSIFICATION')
    })

    it('should list all intent categories', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('Weather Query')
      expect(result).toContain('Preference Update')
      expect(result).toContain('Temperature Conversion')
      expect(result).toContain('Greeting')
      expect(result).toContain('Off-Topic')
      expect(result).toContain('Unclear')
      expect(result).toContain('Ambiguous')
    })
  })

  describe('AC #1: Weather query indicators', () => {
    it('should include weather query patterns', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('WEATHER QUERY INDICATORS')
      expect(result).toContain("What's the weather in")
      expect(result).toContain('Is it raining')
    })

    it('should include contextual query examples', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('What about [city]?')
      expect(result).toContain('Traveling context')
    })
  })

  describe('AC #1: Preference update indicators', () => {
    it('should include preference update patterns', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('PREFERENCE UPDATE INDICATORS')
      expect(result).toContain('Set my default city')
      expect(result).toContain('I live in')
    })

    it('should include unit preference patterns', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('I prefer')
      expect(result).toContain('Switch to')
    })

    it('should include name sharing patterns', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('My name is')
      expect(result).toContain('Call me')
    })
  })

  describe('AC #1: Disambiguation rules', () => {
    it('should include disambiguation section', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('DISAMBIGUATION RULES')
    })

    it('should explain ambiguous city name handling', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('Ambiguous')
      expect(result).toContain('city name alone')
    })

    it('should include "I\'m in [city]" disambiguation', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain("I'm in [city]")
    })
  })

  describe('AC #1: Multi-preference handling', () => {
    it('should include multi-preference section', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('MULTI-PREFERENCE HANDLING')
    })

    it('should include example of multiple preferences', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('I live in Tokyo and prefer Fahrenheit')
    })
  })

  describe('AC #1: Tricky cases', () => {
    it('should include tricky cases section', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('TRICKY CASES')
    })

    it('should include weather at home example', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('weather at home')
    })
  })

  describe('AC #1: Never assume rules', () => {
    it('should include NEVER ASSUME section', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('NEVER ASSUME')
    })

    it('should list what not to assume', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('DO NOT guess')
      expect(result).toContain('clarifying question')
    })
  })

  describe('AC #1: Ambiguous location handling', () => {
    it('should include ambiguous location section', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('AMBIGUOUS LOCATION HANDLING')
    })

    it('should list known ambiguous cities', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('Springfield')
      expect(result).toContain('Portland')
      expect(result).toContain('London')
    })
  })

  describe('AC #1: Informal language understanding', () => {
    it('should include informal language section', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('INFORMAL LANGUAGE UNDERSTANDING')
    })

    it('should include casual expressions', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      expect(result).toContain('Do I need a jacket')
      expect(result).toContain('Umbrella weather')
    })
  })

  describe('AC #2: Maintainability', () => {
    it('should use clear section headers', () => {
      const result = env.render('intentClassification.njk', defaultConfig)

      // Count major sections (### headers)
      const sections = result.match(/### /g)
      expect(sections).not.toBeNull()
      expect(sections!.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('AC #5: Template independence', () => {
    it('should render without any config variables', () => {
      // intentClassification.njk is largely static
      const result = env.render('intentClassification.njk', {})

      expect(result).toContain('## INTENT CLASSIFICATION')
    })
  })
})
