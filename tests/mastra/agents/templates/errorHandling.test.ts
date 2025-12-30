import { describe, it, expect } from 'vitest'
import { getEnvironment, defaultConfig } from '../../../../src/mastra/agents/templates/index.js'

describe('P0: errorHandling.njk template', () => {
  const env = getEnvironment()

  describe('AC #1: Error handling content', () => {
    it('should contain ERROR HANDLING header', () => {
      const result = env.render('errorHandling.njk', defaultConfig)

      expect(result).toContain('## ERROR HANDLING')
    })

    it('should include city not found error pattern', () => {
      const result = env.render('errorHandling.njk', defaultConfig)

      expect(result).toContain('City not found')
    })

    it('should include API unavailable error pattern', () => {
      const result = env.render('errorHandling.njk', defaultConfig)

      expect(result).toContain('API unavailable')
    })

    it('should include rate limited error pattern', () => {
      const result = env.render('errorHandling.njk', defaultConfig)

      expect(result).toContain('Rate limited')
    })

    it('should include missing API key error pattern', () => {
      const result = env.render('errorHandling.njk', defaultConfig)

      expect(result).toContain('Missing API key')
    })

    it('should include rule to never expose technical details', () => {
      const result = env.render('errorHandling.njk', defaultConfig)

      expect(result).toContain('NEVER expose technical error codes')
    })
  })

  describe('AC #3: Agent name substitution', () => {
    it('should substitute agentName in error handling principles', () => {
      const result = env.render('errorHandling.njk', {
        ...defaultConfig,
        agentName: 'Stormy',
      })

      expect(result).toContain('Stormy')
    })

    it('should use default agentName when using defaultConfig', () => {
      const result = env.render('errorHandling.njk', defaultConfig)

      expect(result).toContain('Sunny')
    })
  })

  describe('AC #5: Template independence', () => {
    it('should render with only required variables', () => {
      const result = env.render('errorHandling.njk', {
        agentName: 'TestBot',
      })

      expect(result).toContain('## ERROR HANDLING')
    })
  })
})
