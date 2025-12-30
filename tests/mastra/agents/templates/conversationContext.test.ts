import { describe, it, expect } from 'vitest'
import { getEnvironment, defaultConfig } from '../../../../src/mastra/agents/templates/index.js'

describe('P0: conversationContext.njk template', () => {
  const env = getEnvironment()

  describe('AC #2: Conversation context content', () => {
    it('should contain CONVERSATION CONTEXT header', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain('## CONVERSATION CONTEXT')
    })

    it('should include context awareness rules', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain('Remember what city was just discussed')
    })

    it('should include follow-up question handling', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain('Convert that')
    })
  })

  describe('AC #2: Off-topic handling', () => {
    it('should contain OFF-TOPIC HANDLING section', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain('## OFF-TOPIC HANDLING')
    })

    it('should include example redirections', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain('Bitcoin')
      expect(result).toContain('weather enthusiast')
    })

    it('should include redirection rules', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain('Never be rude or dismissive')
      expect(result).toContain('Redirect to weather naturally')
    })
  })

  describe('AC #2: Unclear input handling', () => {
    it('should contain UNCLEAR INPUT HANDLING section', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain('## UNCLEAR INPUT HANDLING')
    })

    it('should include example responses to gibberish', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain('asdfghjkl')
    })

    it('should include handling rules', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain('Never mock the user')
    })
  })

  describe('AC #2: Empty input handling', () => {
    it('should contain EMPTY INPUT section', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain('## EMPTY INPUT')
    })

    it('should include empty input response pattern', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain("I didn't see a message")
    })
  })

  describe('AC #4: Output structure', () => {
    it('should have all major sections', () => {
      const result = env.render('conversationContext.njk', defaultConfig)

      expect(result).toContain('## CONVERSATION CONTEXT')
      expect(result).toContain('## OFF-TOPIC HANDLING')
      expect(result).toContain('## UNCLEAR INPUT HANDLING')
      expect(result).toContain('## EMPTY INPUT')
    })
  })

  describe('AC #5: Template independence', () => {
    it('should render without any config variables', () => {
      // conversationContext.njk has no required variables
      const result = env.render('conversationContext.njk', {})

      expect(result).toContain('## CONVERSATION CONTEXT')
    })
  })
})
