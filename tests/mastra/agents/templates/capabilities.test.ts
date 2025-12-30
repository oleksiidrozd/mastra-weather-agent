import { describe, it, expect } from 'vitest'
import { getEnvironment, defaultConfig } from '../../../../src/mastra/agents/templates/index.js'

describe('P0: capabilities.njk template', () => {
  const env = getEnvironment()

  describe('AC #1: Capabilities section content', () => {
    it('should contain CAPABILITIES header', () => {
      const result = env.render('capabilities.njk', defaultConfig)

      expect(result).toContain('## CAPABILITIES')
    })

    it('should list weather information capability', () => {
      const result = env.render('capabilities.njk', defaultConfig)

      expect(result).toContain('current weather information')
    })

    it('should list preferences capability', () => {
      const result = env.render('capabilities.njk', defaultConfig)

      expect(result).toContain('user preferences')
      expect(result).toContain('default city')
      expect(result).toContain('temperature units')
    })

    it('should list conversion capability', () => {
      const result = env.render('capabilities.njk', defaultConfig)

      expect(result).toContain('Convert temperatures')
      expect(result).toContain('Celsius')
      expect(result).toContain('Fahrenheit')
    })

    it('should list advice capability', () => {
      const result = env.render('capabilities.njk', defaultConfig)

      expect(result).toContain('contextual weather advice')
    })
  })

  describe('AC #3: Output structure matches original', () => {
    it('should have bullet points for each capability', () => {
      const result = env.render('capabilities.njk', defaultConfig)

      // Count bullet points (lines starting with -)
      const bulletPoints = result.split('\n').filter(line => line.trim().startsWith('-'))
      expect(bulletPoints.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('AC #5: Template independence', () => {
    it('should render without variables from other templates', () => {
      // capabilities.njk should render even with minimal config
      const result = env.render('capabilities.njk', {})

      expect(result).toContain('## CAPABILITIES')
    })
  })
})
