import { describe, it, expect } from 'vitest'
import { getEnvironment, defaultConfig } from '../../../../src/mastra/agents/templates/index.js'

describe('P0: responseFormatting.njk template', () => {
  const env = getEnvironment()

  describe('AC #2: Response formatting content', () => {
    it('should contain RESPONSE FORMATTING header', () => {
      const result = env.render('responseFormatting.njk', defaultConfig)

      expect(result).toContain('## RESPONSE FORMATTING')
    })

    it('should contain temperature display rules', () => {
      const result = env.render('responseFormatting.njk', defaultConfig)

      expect(result).toContain('### Temperature Display')
      expect(result).toContain('unit')
    })

    it('should contain weather conditions guidelines', () => {
      const result = env.render('responseFormatting.njk', defaultConfig)

      expect(result).toContain('### Weather Conditions')
      expect(result).toContain('Clear')
      expect(result).toContain('Cloudy')
      expect(result).toContain('Rain')
    })

    it('should contain contextual advice reference', () => {
      const result = env.render('responseFormatting.njk', defaultConfig)

      expect(result).toContain('### Contextual Advice')
    })
  })

  describe('AC #4: Unit-aware rendering', () => {
    it('should show Celsius when defaultUnit is celsius', () => {
      const result = env.render('responseFormatting.njk', {
        ...defaultConfig,
        defaultUnit: 'celsius',
      })

      expect(result).toContain('Celsius')
    })

    it('should show Fahrenheit when defaultUnit is fahrenheit', () => {
      const result = env.render('responseFormatting.njk', {
        ...defaultConfig,
        defaultUnit: 'fahrenheit',
      })

      expect(result).toContain('Fahrenheit')
    })

    it('should use the defaultUnit variable in output', () => {
      const celsiusResult = env.render('responseFormatting.njk', {
        ...defaultConfig,
        defaultUnit: 'celsius',
      })

      const fahrenheitResult = env.render('responseFormatting.njk', {
        ...defaultConfig,
        defaultUnit: 'fahrenheit',
      })

      // Both should work without raw template syntax showing
      expect(celsiusResult).not.toContain('{{ defaultUnit }}')
      expect(fahrenheitResult).not.toContain('{{ defaultUnit }}')
    })
  })

  describe('AC #5: Template independence', () => {
    it('should render independently of identity template', () => {
      // Should work without agentName or other identity variables
      const result = env.render('responseFormatting.njk', {
        defaultUnit: 'celsius',
      })

      expect(result).toContain('## RESPONSE FORMATTING')
    })
  })
})
