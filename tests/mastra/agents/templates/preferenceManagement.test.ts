import { describe, it, expect } from 'vitest'
import { getEnvironment, defaultConfig } from '../../../../src/mastra/agents/templates/index.js'

describe('P0: preferenceManagement.njk template', () => {
  const env = getEnvironment()

  describe('AC #1: Default city management', () => {
    it('should contain DEFAULT CITY MANAGEMENT header', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('## DEFAULT CITY MANAGEMENT')
    })

    it('should include setting patterns', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('Set my default city to')
      expect(result).toContain('I live in')
      expect(result).toContain('Save [city] as my default')
    })

    it('should include when NOT to set default', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('DO NOT set default city when')
      expect(result).toContain('this is a query, not a preference')
    })
  })

  describe('AC #1: Unit preference management', () => {
    it('should contain UNIT PREFERENCE MANAGEMENT header', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('## UNIT PREFERENCE MANAGEMENT')
    })

    it('should include Fahrenheit indicators', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('Fahrenheit indicators')
      expect(result).toContain('I prefer Fahrenheit')
      expect(result).toContain('American units')
    })

    it('should include Celsius indicators', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('Celsius indicators')
      expect(result).toContain('I prefer Celsius')
      expect(result).toContain('Metric')
    })

    it('should include confirmation messages', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('Fahrenheit confirmations')
      expect(result).toContain('Celsius confirmations')
    })
  })

  describe('AC #1: User name management', () => {
    it('should contain USER NAME MANAGEMENT header', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('## USER NAME MANAGEMENT')
    })

    it('should include name recognition patterns', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('My name is [name]')
      expect(result).toContain('Call me [name]')
    })

    it('should include name usage guidelines', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('Using Name in Responses')
      expect(result).toContain('not every time')
      expect(result).toContain('natural and not repetitive')
    })
  })

  describe('AC #1: Session greeting rules', () => {
    it('should contain SESSION GREETING RULES header', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('## SESSION GREETING RULES')
    })

    it('should include returning user greeting', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('Returning User Greeting')
      expect(result).toContain('Welcome back')
    })

    it('should include new session greeting', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('New Session Greeting')
      expect(result).toContain('working memory (name, preferences) is preserved')
    })

    it('should include new user greeting', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('New User Greeting')
      expect(result).toContain('first-time user')
    })
  })

  describe('AC #2: Preference operations', () => {
    it('should explain set operations for each preference type', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('Setting Default City')
      expect(result).toContain('Setting Unit Preference')
      expect(result).toContain('Storing User Name')
    })

    it('should explain update operations', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('When Updating Default City')
      expect(result).toContain('Switching Units')
    })
  })

  describe('AC #3: Agent name substitution', () => {
    it('should substitute agentName in greetings', () => {
      const result = env.render('preferenceManagement.njk', {
        ...defaultConfig,
        agentName: 'Stormy',
      })

      expect(result).toContain("I'm Stormy")
    })

    it('should use default agentName (Sunny) with defaultConfig', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain("I'm Sunny")
    })

    it('should substitute agentName in multiple places', () => {
      const result = env.render('preferenceManagement.njk', {
        ...defaultConfig,
        agentName: 'Cloudy',
      })

      const matches = result.match(/Cloudy/g)
      expect(matches).not.toBeNull()
      expect(matches!.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('AC #4: Working memory usage', () => {
    it('should explain working memory schema', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('Working Memory Schema')
      expect(result).toContain('default_city')
      expect(result).toContain('preferred_units')
      expect(result).toContain('user_name')
    })

    it('should explain working memory usage for personalization', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('working memory')
      expect(result).toContain('persist across conversation sessions')
    })
  })

  describe('AC #5: Multi-preference handling', () => {
    it('should contain MULTI-PREFERENCE HANDLING section', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('## MULTI-PREFERENCE HANDLING')
    })

    it('should include examples of multiple preferences', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('I live in Tokyo and prefer Fahrenheit')
      expect(result).toContain('My name is Alex')
    })
  })

  describe('AC #5: Confirmation messages', () => {
    it('should contain CONFIRMATION MESSAGES section', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('## CONFIRMATION MESSAGES')
    })

    it('should include confirmation patterns for all preference types', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('Default city')
      expect(result).toContain('Units')
      expect(result).toContain('Name')
    })
  })

  describe('Template structure', () => {
    it('should have all major sections', () => {
      const result = env.render('preferenceManagement.njk', defaultConfig)

      expect(result).toContain('## PREFERENCE MANAGEMENT')
      expect(result).toContain('## DEFAULT CITY MANAGEMENT')
      expect(result).toContain('## UNIT PREFERENCE MANAGEMENT')
      expect(result).toContain('## USER NAME MANAGEMENT')
      expect(result).toContain('## SESSION GREETING RULES')
      expect(result).toContain('## MULTI-PREFERENCE HANDLING')
      expect(result).toContain('## CONFIRMATION MESSAGES')
    })
  })

  describe('Template independence', () => {
    it('should render with only required variables', () => {
      const result = env.render('preferenceManagement.njk', {
        agentName: 'TestBot',
      })

      expect(result).toContain('## PREFERENCE MANAGEMENT')
      expect(result).toContain("I'm TestBot")
    })
  })
})
