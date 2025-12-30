import { describe, it, expect } from 'vitest'
import { getEnvironment, defaultConfig } from '../../../../src/mastra/agents/templates/index.js'

describe('P0: identity.njk template', () => {
  const env = getEnvironment()

  describe('AC #1: Identity section structure', () => {
    it('should contain IDENTITY section with configurable values', () => {
      const result = env.render('identity.njk', defaultConfig)

      expect(result).toContain('## IDENTITY')
      expect(result).toContain('- Name: Sunny')
      expect(result).toContain('- Role: weather information specialist')
      expect(result).toContain('- Personality: Cheerful, conversational, weather-obsessed')
    })

    it('should contain GREETING RESPONSES section', () => {
      const result = env.render('identity.njk', defaultConfig)

      expect(result).toContain('## GREETING RESPONSES')
    })
  })

  describe('AC #2: Variable substitution', () => {
    it('should substitute agentName throughout', () => {
      const result = env.render('identity.njk', {
        ...defaultConfig,
        agentName: 'TestBot',
      })

      expect(result).toContain('You are TestBot')
      expect(result).toContain('- Name: TestBot')
      expect(result).toContain("I'm TestBot")
      expect(result).not.toContain('{{ agentName }}')
    })

    it('should substitute agentRole', () => {
      const result = env.render('identity.njk', {
        ...defaultConfig,
        agentRole: 'severe weather analyst',
      })

      expect(result).toContain('- Role: severe weather analyst')
    })

    it('should substitute personality', () => {
      const result = env.render('identity.njk', {
        ...defaultConfig,
        personality: 'Serious, detail-oriented, safety-focused',
      })

      expect(result).toContain('- Personality: Serious, detail-oriented, safety-focused')
    })
  })

  describe('AC #3: Custom greetings', () => {
    it('should render custom greetings when provided', () => {
      const result = env.render('identity.njk', {
        ...defaultConfig,
        greetings: ['Ahoy! Weather report coming right up!', 'Greetings, weather enthusiast!'],
      })

      expect(result).toContain('Ahoy! Weather report coming right up!')
      expect(result).toContain('Greetings, weather enthusiast!')
      // Should not contain default greetings
      expect(result).not.toContain("I'm Sunny, your personal weather assistant")
    })
  })

  describe('AC #4: Default greetings', () => {
    it('should use default greetings when none provided', () => {
      const result = env.render('identity.njk', defaultConfig)

      expect(result).toContain("I'm Sunny, your personal weather assistant")
      expect(result).toContain('Ready to help you plan for the weather today')
    })

    it('should include agentName in default greetings', () => {
      const result = env.render('identity.njk', {
        ...defaultConfig,
        agentName: 'Stormy',
      })

      expect(result).toContain("I'm Stormy, your personal weather assistant")
    })
  })

  describe('AC #5: Output structure matches original', () => {
    it('should maintain the persona introduction', () => {
      const result = env.render('identity.njk', defaultConfig)

      expect(result).toContain('friendly and enthusiastic weather assistant')
      expect(result).toContain('warm, helpful, and occasionally witty')
    })

    it('should instruct when to respond warmly', () => {
      const result = env.render('identity.njk', defaultConfig)

      expect(result).toContain('When users greet you, respond warmly')
    })
  })
})
